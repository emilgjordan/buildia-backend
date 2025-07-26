import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UnauthorizedException, InternalServerErrorException, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly usersService: UsersService,
    private readonly authService: AuthService
  ) { }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: Request) {

    if (!req.user) {
      throw new InternalServerErrorException('User not found');
    }

    const { accessToken, refreshToken } = await this.authService.generateTokens(
      req.user,
    )

    return {
      accessToken, refreshToken
    };
  }

  @Post('logout')
  logout(@Body() body: any) { }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshToken = req.headers['refresh-token'] as string;

    if (!refreshToken) {
      throw new UnauthorizedException(
        'Refresh token is required in Refresh-Token Header',
      );
    }

    const { newAccessToken, newRefreshToken } =
      await this.authService.refreshTokens(refreshToken);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

}
