import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { SetupDto } from './dto/setup.dto';
import * as bcrypt from 'bcrypt';
import { RoleName, UserStatus } from '@prisma/client';

@Injectable()
export class SetupService {
  constructor(private prisma: PrismaService) {}

  async setup(dto: SetupDto) {
    // 🔥 1 — перевіряємо чи система вже ініціалізована
    const orgExists = await this.prisma.organization.findFirst();

    if (orgExists) {
      throw new BadRequestException('System already initialized');
    }

    const hashedPassword = await bcrypt.hash(dto.adminPassword, 10);

    // 🔥 2 — транзакція
    return this.prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: dto.organizationName,
          slug: dto.organizationSlug,
        },
      });

      // roles
      const roles = await Promise.all([
        tx.role.create({
          data: { name: RoleName.ADMIN, organizationId: org.id },
        }),
        tx.role.create({
          data: { name: RoleName.MANAGER, organizationId: org.id },
        }),
        tx.role.create({
          data: { name: RoleName.WORKER, organizationId: org.id },
        }),
      ]);

      const adminRole = roles.find((r) => r.name === RoleName.ADMIN)!;

      const admin = await tx.user.create({
        data: {
          email: dto.adminEmail,
          password: hashedPassword,
          status: UserStatus.ACTIVE,
        },
      });

      await tx.membership.create({
        data: {
          userId: admin.id,
          organizationId: org.id,
          roleId: adminRole.id,
        },
      });

      return {
        message: 'System initialized',
      };
    });
  }
}
