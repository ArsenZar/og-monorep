import { IsString, IsOptional } from 'class-validator';

export class CreateTaskTemplateDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;
}
