import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './modules/database/database.module';
import { UsersModule } from './modules/users/users.module';
import { InvitesModule } from './modules/invites/invites.module';
import { AuthModule } from './modules/auth/auth.module';
import { SetupModule } from './modules/setup/setup.module';

@Module({
  imports: [
    SetupModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    DatabaseModule,
    UsersModule,
    InvitesModule,
    AuthModule,
  ],
})
export class AppModule {}
