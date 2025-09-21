import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketQueryDto } from './dto/ticket-query.dto';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketsRepository: Repository<Ticket>,
    private queueService: QueueService,
  ) {}

  async create(createTicketDto: CreateTicketDto): Promise<Ticket> {
    const ticket = this.ticketsRepository.create({
      ...createTicketDto,
      status: 'OPEN',
    });

    const savedTicket = await this.ticketsRepository.save(ticket);

    // Enqueue jobs after creating ticket
    await this.queueService.addNotifyJob(savedTicket.id);
    await this.queueService.addSlaJob(savedTicket.id);

    return savedTicket;
  }

  async findAll(query: TicketQueryDto): Promise<{ tickets: Ticket[]; total: number }> {
    const { page = 1, pageSize = 10, sortBy = 'created_at', sortOrder = 'DESC', status, priority, search } = query;

    const options: FindManyOptions<Ticket> = {
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { [sortBy]: sortOrder },
    };

    // Build where conditions
    const whereConditions: any = {};
    
    if (status) {
      whereConditions.status = status;
    }
    
    if (priority) {
      whereConditions.priority = priority;
    }

    if (search) {
      options.where = [
        { ...whereConditions, title: Like(`%${search}%`) },
        { ...whereConditions, description: Like(`%${search}%`) },
      ];
    } else {
      options.where = whereConditions;
    }

    const [tickets, total] = await this.ticketsRepository.findAndCount(options);

    return { tickets, total };
  }

  async findOne(id: string): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findOne({ where: { id } });
    
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }

    return ticket;
  }

  async update(id: string, updateTicketDto: UpdateTicketDto): Promise<Ticket> {
    const ticket = await this.findOne(id);

    // If status is being updated to RESOLVED, remove SLA job
    if (updateTicketDto.status === 'RESOLVED') {
      await this.queueService.removeSlaJob(id);
    }

    Object.assign(ticket, updateTicketDto);
    return this.ticketsRepository.save(ticket);
  }

  async remove(id: string): Promise<void> {
    const ticket = await this.findOne(id);
    await this.ticketsRepository.remove(ticket);
  }

  async getOverallStats(): Promise<{
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
  }> {
    const [total, open, inProgress, resolved] = await Promise.all([
      this.ticketsRepository.count(),
      this.ticketsRepository.count({ where: { status: 'OPEN' } }),
      this.ticketsRepository.count({ where: { status: 'IN_PROGRESS' } }),
      this.ticketsRepository.count({ where: { status: 'RESOLVED' } }),
    ]);

    return {
      total,
      open,
      inProgress,
      resolved,
    };
  }
}
