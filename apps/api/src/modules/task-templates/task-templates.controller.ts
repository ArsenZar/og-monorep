import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';

import { TaskTemplatesService } from './task-templates.service';
import { CreateTaskTemplateDto } from './dto/create-task-template.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtUser } from '../auth/types/jwt-user.type';

@Controller('task-templates')
@UseGuards(JwtAuthGuard)
export class TaskTemplatesController {
  constructor(private service: TaskTemplatesService) {}

  @Post()
  create(@Body() dto: CreateTaskTemplateDto, @CurrentUser() user: JwtUser) {
    return this.service.create(dto, user);
  }

  @Get()
  findAll(@CurrentUser() user: JwtUser) {
    return this.service.findAll(user);
  }
}
