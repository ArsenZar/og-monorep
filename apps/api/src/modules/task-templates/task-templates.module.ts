import { Module } from '@nestjs/common';
import { TaskTemplatesService } from './task-templates.service';
import { TaskTemplatesController } from './task-templates.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [TaskTemplatesService],
  controllers: [TaskTemplatesController],
})
export class TaskTemplatesModule {}
