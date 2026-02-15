import { IsString, MinLength } from 'class-validator';

export class UpdateTaskReportDto {
  @IsString()
  @MinLength(3)
  report: string;
}
