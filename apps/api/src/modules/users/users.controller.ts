import { UsersService } from './users.service';
import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { RequestWithUser } from '../auth/types/request-with-user.type';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Request() req: RequestWithUser) {
    return this.usersService.findAll(req.user.organizationId);
  }
}
