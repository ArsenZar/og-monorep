import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Patch,
  Param,
} from '@nestjs/common';

import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtUser } from '../auth/types/jwt-user.type';
import { CreateTaskDto } from './dto/create-task.dto';
import { CreateTaskEventDto } from './dto/create-task-event.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
import { UpdateTaskReportDto } from './dto/update-task-report.dto';

@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Patch(':id/report')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('WORKER')
  updateReport(
    @Param('id') taskId: string,
    @Body() dto: UpdateTaskReportDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.tasksService.updateReport(taskId, dto, user);
  }

  // ✅ створювати можуть тільки manager + admin
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  create(@Body() dto: CreateTaskDto, @CurrentUser() user: JwtUser) {
    return this.tasksService.create(dto, user);
  }

  // ✅ всі ролі можуть дивитись
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@CurrentUser() user: JwtUser) {
    return this.tasksService.findAll(user);
  }

  @Patch(':id/event')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('WORKER')
  createEvent(
    @Param('id') taskId: string,
    @Body() dto: CreateTaskEventDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.tasksService.createEvent(taskId, dto, user);
  }

  @Patch(':id/assign')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  assign(
    @Param('id') taskId: string,
    @Body() dto: AssignTaskDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.tasksService.assign(taskId, dto, user);
  }
}
