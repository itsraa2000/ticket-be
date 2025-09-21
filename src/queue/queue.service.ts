import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueueJob } from './entities/queue-job.entity';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('notify') private notifyQueue: Queue,
    @InjectQueue('sla') private slaQueue: Queue,
    @InjectRepository(QueueJob)
    private queueJobRepository: Repository<QueueJob>,
  ) {}

  async addNotifyJob(ticketId: string): Promise<void> {
    // Add job to Redis queue
    const job = await this.notifyQueue.add(
      'notify',
      { ticketId },
      {
        jobId: `notify:${ticketId}`,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 10,
        removeOnFail: 5,
      },
    );
    
    // Track notify job in database with status = waiting
    const queueJob = this.queueJobRepository.create({
      job_id: `notify:${ticketId}`,
      job_type: 'TicketNotifyJob',
      ticket_id: ticketId,
      status: 'waiting',
      attempts: 0,
      max_attempts: 3,
      delay_until: null, // No delay for notify jobs
      data: JSON.stringify({ ticketId }),
    });
    
    await this.queueJobRepository.save(queueJob);
  }

  async addSlaJob(ticketId: string): Promise<void> {
    // Add job to Redis queue
    const job = await this.slaQueue.add(
      'sla',
      { ticketId },
      {
        jobId: `sla:${ticketId}`,
        delay: 15 * 60 * 1000, // 15 minutes delay
        removeOnComplete: 10,
        removeOnFail: 5,
      },
    );
    
    // Track SLA job in database with status = waiting
    const queueJob = this.queueJobRepository.create({
      job_id: `sla:${ticketId}`,
      job_type: 'TicketSlaJob',
      ticket_id: ticketId,
      status: 'waiting',
      attempts: 0,
      max_attempts: 1,
      delay_until: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
      data: JSON.stringify({ ticketId }),
    });
    
    await this.queueJobRepository.save(queueJob);
  }

  async removeSlaJob(ticketId: string): Promise<void> {
    try {
      const jobId = `sla:${ticketId}`;
      
      // Remove from Redis queue
      const job = await this.slaQueue.getJob(jobId);
      if (job) {
        await job.remove();
      }
      
      // Remove from database
      await this.queueJobRepository.delete({ job_id: jobId });
      
    } catch (error) {
      console.error(`Error removing SLA job for ticket ${ticketId}:`, error);
    }
  }

  async getQueueStats(queueName: string): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  }> {
    const queue = queueName === 'notify' ? this.notifyQueue : this.slaQueue;
    
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaiting(),
      queue.getActive(),
      queue.getCompleted(),
      queue.getFailed(),
      queue.getDelayed(),
    ]);

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      delayed: delayed.length,
    };
  }
}
