import {
  Controller,
  Post,
  UseGuards,
  Param,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtUser } from '../auth/types/jwt-user.type';
import { FilesService } from './files.service';

@Controller('tasks/:taskId/files')
export class FilesController {
  constructor(private filesService: FilesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('WORKER')
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @Param('taskId') taskId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: JwtUser,
  ) {
    return this.filesService.upload(taskId, file, user);
  }
}
