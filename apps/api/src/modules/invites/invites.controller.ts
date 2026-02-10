import { Controller, Post, Body, UseGuards } from '@nestjs/common';

import { InvitesService } from './invites.service';
import { CreateInviteDto } from './dto/create-invite.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('invites')
export class InvitesController {
  constructor(private invitesService: InvitesService) {}

  /**
   * 🔐 Only ADMIN can invite users
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  async createInvite(@Body() dto: CreateInviteDto) {
    const token = await this.invitesService.createInvite(
      dto.email,
      dto.roleId,
      dto.organizationId,
    );

    return {
      inviteLink: `http://localhost:3000/accept-invite?token=${token}`,
    };
  }

  /**
   * ✅ Public endpoint
   * User is not logged in yet
   */
  @Post('accept')
  acceptInvite(@Body() dto: AcceptInviteDto) {
    return this.invitesService.acceptInvite(dto);
  }
}
