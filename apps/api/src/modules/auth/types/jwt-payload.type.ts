import type { Role } from './request-with-user.type';

export type JwtPayload = {
  sub: string;
  organizationId: string;
  role: Role;
};
