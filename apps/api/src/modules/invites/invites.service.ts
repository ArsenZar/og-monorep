import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';

import { PrismaService } from '../database/prisma.service';
import { randomBytes, createHash } from 'crypto';
import * as bcrypt from 'bcrypt';
import { AcceptInviteDto } from './dto/accept-invite.dto';

@Injectable()
export class InvitesService {
  constructor(private prisma: PrismaService) {}

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  async createInvite(email: string, roleId: string, organizationId: string) {
    // 🔐 1. Перевірка що роль належить цій організації
    const role = await this.prisma.role.findFirst({
      where: {
        id: roleId,
        organizationId,
      },
    });

    if (!role) {
      throw new ForbiddenException('Role does not belong to your organization');
    }

    // 🔐 2. Перевірка що юзер не існує
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const rawToken = randomBytes(32).toString('base64url');
    const hashedToken = this.hashToken(rawToken);

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);

    // 🔄 3. Скасовуємо попередні PENDING інвайти
    await this.prisma.invite.updateMany({
      where: {
        email,
        organizationId,
        status: 'PENDING',
      },
      data: {
        status: 'CANCELLED',
      },
    });

    // ✉️ 4. Створюємо новий інвайт
    await this.prisma.invite.create({
      data: {
        email,
        token: hashedToken,
        roleId,
        organizationId,
        expiresAt,
        status: 'PENDING',
      },
    });

    return rawToken;
  }

  async acceptInvite(dto: AcceptInviteDto) {
    const { token, password } = dto;
    const hashedToken = this.hashToken(token);

    const invite = await this.prisma.invite.findUnique({
      where: { token: hashedToken },
    });

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    if (invite.expiresAt < new Date()) {
      throw new BadRequestException('Invite expired');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: invite.email },
    });

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: invite.email,
          password: hashedPassword,
          status: 'ACTIVE',
        },
      });

      await tx.membership.create({
        data: {
          userId: user.id,
          organizationId: invite.organizationId,
          roleId: invite.roleId,
        },
      });

      await tx.invite.update({
        where: { id: invite.id },
        data: {
          status: 'ACCEPTED',
        },
      });

      return { message: 'Invite accepted' };
    });
  }
}
