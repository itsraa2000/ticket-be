import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from '../../tickets/entities/ticket.entity';
import { QueueJob } from '../entities/queue-job.entity';

@Processor('sla')
@Injectable()
export class SlaProcessor extends WorkerHost {
  private readonly logger = new Logger(SlaProcessor.name);

  constructor(
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
    @InjectRepository(QueueJob)
    private queueJobRepository: Repository<QueueJob>,
  ) {
    super();
  }

  async process(job: Job<{ ticketId: string }>): Promise<void> {
    const { ticketId } = job.data;
    
    this.logger.log(`Processing SLA check for ticket ${ticketId}`);
    
    try {
      const ticket = await this.ticketRepository.findOne({ where: { id: ticketId } });
      
      if (!ticket) {
        this.logger.warn(`Ticket ${ticketId} not found for SLA check`);
        return;
      }

      if (ticket.status === 'RESOLVED') {
        this.logger.log(`Ticket ${ticketId} already resolved, SLA check not needed`);
        return;
      }

      if (ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS') {
        this.logger.warn(`SLA VIOLATION: Ticket ${ticketId} not resolved within 15 minutes`);
        
        await this.queueJobRepository.update(
          { job_id: `sla:${ticketId}` },
          { 
            status: 'delayed',
            updated_at: new Date(),
            completed_at: new Date()
          }
        );
        
        this.logger.log(`SLA violation alert sent for ticket ${ticketId}`);
      }
      
    } catch (error) {
      this.logger.error(`Error processing SLA check for ticket ${ticketId}:`, error);
      throw error;
    }
    
    this.logger.log(`SLA check completed for ticket ${ticketId}`);
  }
}
