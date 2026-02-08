import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class InvitesService {
  constructor(private prisma: PrismaService) {}

  async createInvite(email: string, roleId: string, organizationId: string) {
    const token = crypto.randomBytes(32).toString('hex');

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

    await this.prisma.invite.create({
      data: {
        email,
        token: hashedToken,
        roleId,
        organizationId,
        expiresAt,
      },
    });

    return token;
  }
}
