import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';

import { InvitesService } from './invites.service';
import { CreateInviteDto } from './dto/create-invite.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtUser } from '../auth/types/request-with-user.type';

@Controller('invites')
export class InvitesController {
  constructor(private invitesService: InvitesService) {}

  // 🔐 ТІЛЬКИ ADMIN може інвайтити
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  async createInvite(
    @Body() dto: CreateInviteDto,
    @CurrentUser() user: JwtUser,
  ) {
    const token = await this.invitesService.createInvite(
      dto.email,
      dto.roleId,
      user.organizationId,
    );

    return {
      inviteLink: `http://localhost:3000/accept-invite?token=${token}`,
    };
  }

  @Post('/accept')
  acceptInvite(@Body() dto: AcceptInviteDto) {
    return this.invitesService.acceptInvite(dto);
  }
}
