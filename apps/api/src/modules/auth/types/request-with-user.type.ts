import { Request } from 'express';

export type Role = 'ADMIN' | 'MANAGER' | 'WORKER';

export interface JwtUser {
  userId: string;
  organizationId: string;
  role: Role;
}

export interface RequestWithUser extends Request {
  user: JwtUser;
}
