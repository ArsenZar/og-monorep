import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';

import { InvitesService } from './invites.service';
import { CreateInviteDto } from './dto/create-invite.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import type { RequestWithUser } from '../auth/types/request-with-user.type';

@Controller('invites')
export class InvitesController {
  constructor(private invitesService: InvitesService) {}

  // 🔐 ТІЛЬКИ ADMIN може інвайтити
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  async createInvite(
    @Body() dto: CreateInviteDto,
    @Request() req: RequestWithUser,
  ) {
    const token = await this.invitesService.createInvite(
      dto.email,
      dto.roleId,
      req.user.organizationId, // 🔥 trusted source
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
