import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from '@/modules/auth-module/auth.controller';
import { AuthGuard } from '@/modules/auth-module/auth.guard';
import { AuthService } from '@/modules/auth-module/auth.service';

@Module({
  imports: [
    JwtModule.register({
      secret: '123456',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard],
})
export class AuthModule {}
