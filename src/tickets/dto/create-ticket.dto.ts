import { IsString, IsEnum, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5, { message: 'Title must be at least 5 characters long' })
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000, { message: 'Description must be 5000 characters or less' })
  description: string;

  @IsEnum(['LOW', 'MEDIUM', 'HIGH'], { message: 'Priority must be LOW, MEDIUM, or HIGH' })
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}
