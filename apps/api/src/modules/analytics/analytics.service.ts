import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type { JwtUser } from '../auth/types/jwt-user.type';
import type { WorkerAnalyticsResponse } from './dto/worker-analytics.response';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getWorkerAnalytics(user: JwtUser): Promise<WorkerAnalyticsResponse[]> {
    const workers = await this.getRelevantWorkers(user);

    const result: WorkerAnalyticsResponse[] = [];

    for (const membership of workers) {
      const tasks = await this.prisma.task.findMany({
        where: {
          workerMembershipId: membership.id,
        },
      });

      const completedTasks = tasks.filter((t) => t.status === 'DONE');

      const totalMinutesWorked = completedTasks.reduce((sum, task) => {
        if (task.startedAt && task.completedAt) {
          const minutes =
            (task.completedAt.getTime() - task.startedAt.getTime()) / 60000;
          return sum + minutes;
        }
        return sum;
      }, 0);

      const avgTaskDurationMinutes =
        completedTasks.length > 0
          ? totalMinutesWorked / completedTasks.length
          : 0;

      const activeTasks = tasks.filter(
        (t) => t.status === 'IN_PROGRESS',
      ).length;

      result.push({
        workerMembershipId: membership.id,
        workerUserId: membership.user.id,
        email: membership.user.email,

        tasksCompleted: completedTasks.length,
        totalMinutesWorked: Math.round(totalMinutesWorked),
        avgTaskDurationMinutes: Math.round(avgTaskDurationMinutes),
        activeTasks,
      });
    }

    return result;
  }

  private async getRelevantWorkers(user: JwtUser) {
    if (user.role === 'ADMIN') {
      return this.prisma.membership.findMany({
        where: {
          organizationId: user.organizationId,
          role: {
            name: 'WORKER',
          },
        },
        include: {
          user: true,
        },
      });
    }

    if (user.role === 'MANAGER') {
      return this.prisma.membership.findMany({
        where: {
          organizationId: user.organizationId,
          role: {
            name: 'WORKER',
          },
          tasksAssigned: {
            some: {
              project: {
                managerMembership: {
                  userId: user.userId,
                },
              },
            },
          },
        },
        include: {
          user: true,
        },
      });
    }

    // WORKER
    return this.prisma.membership.findMany({
      where: {
        organizationId: user.organizationId,
        userId: user.userId,
      },
      include: {
        user: true,
      },
    });
  }
}
