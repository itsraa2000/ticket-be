import { Controller, Get, Param } from '@nestjs/common';
import { QueueService } from '../queue/queue.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly queueService: QueueService) {}

  @Get('queues/:name/stats')
  async getQueueStats(@Param('name') name: string) {
    if (!['notify', 'sla'].includes(name)) {
      throw new Error('Invalid queue name');
    }
    
    return this.queueService.getQueueStats(name);
  }
}
