import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';

import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtUser } from '../auth/types/jwt-user.type';

@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

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
}
