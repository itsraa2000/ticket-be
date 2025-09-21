import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 500 })
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'OPEN',
  })
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

  @Column({
    type: 'varchar',
    length: 10,
    default: 'MEDIUM',
  })
  priority: 'LOW' | 'MEDIUM' | 'HIGH';

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
