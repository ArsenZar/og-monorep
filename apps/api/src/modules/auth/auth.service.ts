import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        memberships: true,
      },
    });

    // 🔥 НІКОЛИ не кажемо що email не існує
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.password!);

    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const membership = await this.prisma.membership.findFirst({
      where: {
        userId: user.id,
      },
      include: {
        role: true,
      },
    });

    if (!membership) {
      throw new UnauthorizedException('User has no organization');
    }

    const payload = {
      sub: user.id,
      organizationId: membership.organizationId,
      role: membership.role.name, // 'ADMIN' | 'MANAGER' | 'WORKER'
    };

    return {
      access_token: this.jwt.sign(payload),
    };
  }
}
