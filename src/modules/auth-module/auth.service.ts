import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  login(email: string, password: string) {
    const payload = { email, password, name: 'John Doe', realm_access: { roles: ['admin-catalog'] } };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}