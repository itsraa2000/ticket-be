import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('queue_jobs')
export class QueueJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  job_id: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  job_type: 'TicketNotifyJob' | 'TicketSlaJob';

  @Column()
  ticket_id: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'waiting',
  })
  status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed';

  @Column({ default: 0 })
  attempts: number;

  @Column({ default: 3 })
  max_attempts: number;

  @Column({ nullable: true })
  delay_until: Date;

  @Column('text', { nullable: true })
  data: string;

  @Column({ nullable: true })
  error_message: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: true })
  completed_at: Date;
}
