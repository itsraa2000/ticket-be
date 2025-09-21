import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueueService } from './queue.service';
import { QueueController } from './queue.controller';
import { NotifyProcessor } from './processors/notify.processor';
import { SlaProcessor } from './processors/sla.processor';
import { QueueJob } from './entities/queue-job.entity';
import { Ticket } from '../tickets/entities/ticket.entity';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'notify' }),
    BullModule.registerQueue({ name: 'sla' }),
    TypeOrmModule.forFeature([QueueJob, Ticket]),
  ],
  controllers: [QueueController],
  providers: [QueueService, NotifyProcessor, SlaProcessor],
  exports: [QueueService],
})
export class QueueModule {}
