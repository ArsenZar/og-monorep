import { IsEmail, IsString, MinLength } from 'class-validator';

export class SetupDto {
  @IsString()
  organizationName: string;

  @IsString()
  organizationSlug: string;

  @IsEmail()
  adminEmail: string;

  @IsString()
  @MinLength(8)
  adminPassword: string;
}
