import { Injectable, ForbiddenException } from '@nestjs/common';

import { PrismaService } from '../database/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import type { JwtUser } from '../auth/types/jwt-user.type';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTaskDto, user: JwtUser) {
    // ✅ Перевіряємо що project в цій org
    const project = await this.prisma.project.findFirst({
      where: {
        id: dto.projectId,
        organizationId: user.organizationId,
      },
    });

    if (!project) {
      throw new ForbiddenException('Project not found in your organization');
    }

    // ✅ Якщо призначаємо worker — перевіряємо org isolation
    if (dto.workerMembershipId) {
      const worker = await this.prisma.membership.findFirst({
        where: {
          id: dto.workerMembershipId,
          organizationId: user.organizationId,
        },
      });

      if (!worker) {
        throw new ForbiddenException('Worker not in your organization');
      }
    }

    // ✅ Якщо використовується template — теж перевіряємо org
    if (dto.templateId) {
      const template = await this.prisma.taskTemplate.findFirst({
        where: {
          id: dto.templateId,
          organizationId: user.organizationId,
        },
      });

      if (!template) {
        throw new ForbiddenException('Template not found in your organization');
      }
    }

    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        projectId: dto.projectId,
        workerMembershipId: dto.workerMembershipId,
        templateId: dto.templateId,
        managerComment: dto.managerComment,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });
  }

  // 🔥 ADMIN — всі таски
  // 🔥 MANAGER — тільки свої проекти
  // 🔥 WORKER — тільки призначені

  async findAll(user: JwtUser) {
    if (user.role === 'ADMIN') {
      return this.prisma.task.findMany({
        where: {
          project: {
            organizationId: user.organizationId,
          },
        },
        include: {
          project: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    if (user.role === 'MANAGER') {
      return this.prisma.task.findMany({
        where: {
          project: {
            organizationId: user.organizationId,
            managerMembership: {
              userId: user.userId,
            },
          },
        },
        include: {
          project: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    // WORKER
    return this.prisma.task.findMany({
      where: {
        workerMembership: {
          userId: user.userId,
        },
      },
      include: {
        project: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
