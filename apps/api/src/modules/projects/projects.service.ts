import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { JwtUser } from '../auth/types/jwt-user.type';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProjectDto, user: JwtUser) {
    const membership = await this.prisma.membership.findFirst({
      where: {
        userId: user.userId,
        organizationId: user.organizationId,
      },
    });

    if (!membership) {
      throw new ForbiddenException('Membership not found');
    }

    return this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        organizationId: user.organizationId,
        managerMembershipId: membership.id,
      },
    });
  }

  async findOne(projectId: string, user: JwtUser) {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId: user.organizationId, // 🔥 CRITICAL
      },
    });

    if (!project) {
      throw new ForbiddenException('Project not found in your organization');
    }

    // manager isolation
    if (user.role === 'MANAGER') {
      const membership = await this.prisma.membership.findFirst({
        where: {
          userId: user.userId,
          organizationId: user.organizationId,
        },
      });

      if (!membership || project.managerMembershipId !== membership.id) {
        throw new ForbiddenException('You do not have access to this project');
      }
    }

    return project;
  }

  async findAll(user: JwtUser) {
    // ADMIN бачить всі
    if (user.role === 'ADMIN') {
      return this.prisma.project.findMany({
        where: {
          organizationId: user.organizationId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    // MANAGER — тільки свої
    const membership = await this.prisma.membership.findFirst({
      where: {
        userId: user.userId,
        organizationId: user.organizationId,
      },
    });

    if (!membership) {
      throw new ForbiddenException('Membership not found');
    }

    return this.prisma.project.findMany({
      where: {
        managerMembershipId: membership.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
