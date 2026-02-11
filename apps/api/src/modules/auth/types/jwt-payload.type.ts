import { RoleName } from '@prisma/client';

export type JwtPayload = {
  sub: string;
  role: RoleName;
  organizationId: string;
};
