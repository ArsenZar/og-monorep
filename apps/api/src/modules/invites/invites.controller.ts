import { Controller, Post, Body } from '@nestjs/common';
import { InvitesService } from './invites.service';
import { CreateInviteDto } from './dto/create-invite.dto';

@Controller('invites')
export class InvitesController {
  constructor(private invitesService: InvitesService) {}

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
}
