import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateTaskTemplateDto } from './dto/create-task-template.dto';
import { JwtUser } from '../auth/types/jwt-user.type';

@Injectable()
export class TaskTemplatesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTaskTemplateDto, user: JwtUser) {
    return this.prisma.taskTemplate.create({
      data: {
        title: dto.title,
        description: dto.description,
        organizationId: user.organizationId,
      },
    });
  }

  async findAll(user: JwtUser) {
    return this.prisma.taskTemplate.findMany({
      where: {
        organizationId: user.organizationId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
