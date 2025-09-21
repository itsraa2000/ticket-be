import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueueJob } from '../entities/queue-job.entity';

@Processor('notify')
@Injectable()
export class NotifyProcessor extends WorkerHost {
  private readonly logger = new Logger(NotifyProcessor.name);

  constructor(
    @InjectRepository(QueueJob)
    private queueJobRepository: Repository<QueueJob>,
  ) {
    super();
  }

  async process(job: Job<{ ticketId: string }>): Promise<void> {
    const { ticketId } = job.data;
    
    this.logger.log(`Processing notification for ticket ${ticketId}`);
    
    try {
      // Update job status to active in database
      await this.queueJobRepository.update(
        { job_id: `notify:${ticketId}` },
        { 
          status: 'active',
          attempts: job.attemptsMade + 1,
          updated_at: new Date()
        }
      );

      this.logger.log(`Mock notification sent for ticket ${ticketId}`);
      
      await this.queueJobRepository.update(
        { job_id: `notify:${ticketId}` },
        { 
          status: 'completed',
          updated_at: new Date(),
          completed_at: new Date()
        }
      );
      
      this.logger.log(`Notification job completed for ticket ${ticketId}`);
      
    } catch (error) {
      await this.queueJobRepository.update(
        { job_id: `notify:${ticketId}` },
        { 
          status: 'failed',
          error_message: error.message,
          updated_at: new Date()
        }
      );
      
      this.logger.error(`Notification job failed for ticket ${ticketId}:`, error);
      throw error;
    }
  }
}
