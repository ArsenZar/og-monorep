import { IsEnum } from 'class-validator';

export enum TaskEventType {
  STARTED = 'STARTED',
  PAUSED = 'PAUSED',
  RESUMED = 'RESUMED',
  COMPLETED = 'COMPLETED',
}

export class CreateTaskEventDto {
  @IsEnum(TaskEventType)
  type: TaskEventType;
}
