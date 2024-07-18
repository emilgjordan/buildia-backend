import { Controller, Post, Req, UseGuards } from '@nestjs/common';

import { User } from '../../users/interfaces/user.interface';
import { AuthService } from '../services/auth.service';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Req() request: Request): { userId: string; access_token: string } {
    return {
      userId: request.user.userId,
      access_token: this.authService.generateAccessToken(request.user as User),
    };
  }
}
