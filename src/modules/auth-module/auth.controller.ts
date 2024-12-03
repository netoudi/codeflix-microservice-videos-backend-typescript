import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@/modules/auth-module/auth.guard';
import { AuthService } from '@/modules/auth-module/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post()
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @UseGuards(AuthGuard)
  @Get()
  protected() {
    return { message: 'OK!' };
  }
}
