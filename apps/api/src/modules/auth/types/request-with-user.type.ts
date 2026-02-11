import { Request } from 'express';

export interface JwtUser {
  userId: string;
  organizationId: string;
  role: string;
}

export interface RequestWithUser extends Request {
  user: JwtUser;
}
