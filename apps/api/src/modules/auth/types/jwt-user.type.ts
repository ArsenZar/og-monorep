export type JwtUser = {
  userId: string;
  organizationId: string;
  role: 'ADMIN' | 'MANAGER' | 'WORKER';
};
