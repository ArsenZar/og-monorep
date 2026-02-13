import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  projectId: string;

  @IsOptional()
  @IsString()
  templateId?: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  workerMembershipId?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  managerComment?: string;
}
