import { Controller, Get, Delete, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { QueueJob } from './entities/queue-job.entity';

class QueueQueryDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 10;
}

@Controller('queue')
export class QueueController {
  constructor(
    @InjectQueue('notify') private notifyQueue: Queue,
    @InjectQueue('sla') private slaQueue: Queue,
    @InjectRepository(QueueJob)
    private queueJobRepository: Repository<QueueJob>,
  ) {}

  @Get()
  async getJobs(@Query() query: QueueQueryDto) {
    const { page = 1, pageSize = 10, status } = query;
    
    const queryBuilder = this.queueJobRepository.createQueryBuilder('job');
    
    if (status) {
      queryBuilder.where('job.status = :status', { status });
    }
    
    const [jobs, total] = await queryBuilder
      .orderBy('job.created_at', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return {
      jobs,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }


  @Delete('clear')
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearCompletedJobs() {
    // Clear completed and delayed jobs from the database
    await this.queueJobRepository.delete({ status: 'completed' });
    await this.queueJobRepository.delete({ status: 'delayed' });
  }
}
