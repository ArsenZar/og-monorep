import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type { JwtUser } from '../auth/types/jwt-user.type';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FilesService {
  constructor(private prisma: PrismaService) {}

  async upload(taskId: string, file: Express.Multer.File, user: JwtUser) {
    if (!file) {
      throw new ForbiddenException('File is required');
    }

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
        workerMembershipId: membership.id,
      },
    });

    if (!task) {
      throw new ForbiddenException('Not your task');
    }

    // 🔥 файл дозволено тільки якщо DONE
    if (task.status !== 'DONE') {
      throw new ForbiddenException('Cannot upload file until task is DONE');
    }

    const uploadDir = path.join(process.cwd(), 'uploads');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    const filename = randomUUID() + path.extname(file.originalname);
    const filepath = path.join(uploadDir, filename);

    fs.writeFileSync(filepath, file.buffer);

    return this.prisma.taskFile.create({
      data: {
        taskId,
        membershipId: membership.id,
        filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      },
    });
  }
}
