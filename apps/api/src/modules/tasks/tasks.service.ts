import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../database/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import type { JwtUser } from '../auth/types/jwt-user.type';

import { CreateTaskEventDto, TaskEventType } from './dto/create-task-event.dto';
import { AssignTaskDto } from './dto/assign-task.dto';

import { UpdateTaskReportDto } from './dto/update-task-report.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async assign(taskId: string, dto: AssignTaskDto, user: JwtUser) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // org isolation
    if (task.project.organizationId !== user.organizationId) {
      throw new ForbiddenException('Wrong organization');
    }

    const membership = await this.prisma.membership.findUnique({
      where: { id: dto.workerMembershipId },
      include: { role: true },
    });

    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    if (membership.organizationId !== user.organizationId) {
      throw new ForbiddenException('Wrong organization');
    }

    if (membership.role.name !== 'WORKER') {
      throw new ForbiddenException('Can assign only WORKER');
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        workerMembershipId: membership.id,
      },
    });
  }

  async createEvent(taskId: string, dto: CreateTaskEventDto, user: JwtUser) {
    const membership = await this.prisma.membership.findFirst({
      where: {
        userId: user.userId,
        organizationId: user.organizationId,
      },
    });

    if (!membership) {
      throw new ForbiddenException('Membership not found');
    }

    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          organizationId: user.organizationId,
        },
      },
    });

    if (!task) {
      throw new ForbiddenException('Task not found in your organization');
    }

    // 🔥 Worker ownership check
    if (task.workerMembershipId !== membership.id) {
      throw new ForbiddenException('Not your task');
    }

    await this.prisma.taskEvent.create({
      data: {
        taskId,
        membershipId: membership.id,
        type: dto.type,
      },
    });

    // optional — update status
    if (dto.type === TaskEventType.STARTED) {
      await this.prisma.task.update({
        where: { id: taskId },
        data: {
          status: 'IN_PROGRESS',
          startedAt: task.startedAt ?? new Date(),
        },
      });
    }

    if (dto.type === TaskEventType.COMPLETED) {
      await this.prisma.task.update({
        where: { id: taskId },
        data: {
          status: 'DONE',
          completedAt: new Date(),
        },
      });
    }

    return { success: true };
  }

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

  async updateReport(taskId: string, dto: UpdateTaskReportDto, user: JwtUser) {
    const membership = await this.prisma.membership.findFirst({
      where: {
        userId: user.userId,
        organizationId: user.organizationId,
      },
    });

    if (!membership) {
      throw new ForbiddenException('Membership not found');
    }

    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          organizationId: user.organizationId,
        },
      },
    });

    if (!task) {
      throw new ForbiddenException('Task not found in your organization');
    }

    // 🔥 перевірка власності
    if (task.workerMembershipId !== membership.id) {
      throw new ForbiddenException('Not your task');
    }

    // 🔥 дозволяємо report тільки якщо DONE
    if (task.status !== 'DONE') {
      throw new ForbiddenException('Cannot add report until task is DONE');
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        workerReport: dto.report,
      },
    });
  }
}
