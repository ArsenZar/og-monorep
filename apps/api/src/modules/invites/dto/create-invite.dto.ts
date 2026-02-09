import { IsEmail, IsString } from 'class-validator';

export class CreateInviteDto {
  @IsEmail()
  email: string;

  @IsString()
  roleId: string;

  @IsString()
  organizationId: string;
}
