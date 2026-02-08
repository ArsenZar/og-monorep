import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { randomBytes } from 'crypto';

@Injectable()
export class InvitesService {
  constructor(private prisma: PrismaService) {}

  private generateToken() {
    return randomBytes(32).toString('hex');
  }

  async createInvite(email: string, roleId: string, organizationId: string) {
    const token = this.generateToken();

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);

    await this.prisma.invite.create({
      data: {
        email,
        token,
        roleId,
        organizationId,
        expiresAt,
      },
    });

    return token;
  }
}
