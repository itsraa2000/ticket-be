import { IsOptional, IsEnum, IsString, IsInt, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class TicketQueryDto {
  @IsOptional()
  @IsEnum(['OPEN', 'IN_PROGRESS', 'RESOLVED'], {
    message: 'status must be one of the following values: OPEN, IN_PROGRESS, RESOLVED'
  })
  status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH'], {
    message: 'priority must be one of the following values: LOW, MEDIUM, HIGH'
  })
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';

  @IsOptional()
  @IsString()
  search?: string;

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

  @IsOptional()
  @IsEnum(['created_at', 'status', 'priority'], {
    message: 'sortBy must be one of the following values: created_at, status, priority'
  })
  sortBy?: 'created_at' | 'status' | 'priority' = 'created_at';

  @IsOptional()
  @IsEnum(['ASC', 'DESC'], {
    message: 'sortOrder must be one of the following values: ASC, DESC'
  })
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
