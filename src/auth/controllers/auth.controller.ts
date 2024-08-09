import {
  Body,
  Controller,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import { AuthService } from '../services/auth.service';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { Request, Response } from 'express';
import { UsersService } from '../../users/services/users.service';
import { CreateUserDto } from '../../users/dto/input/create-user.dto';
import { UserResponseDto } from '../../users/dto/output/user-response.dto';
import { ConversionService } from '../../conversion/conversion.service';
import { User } from 'src/users/interfaces/user.interface';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly conversionService: ConversionService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: Request, @Res() res: Response): Promise<void> {
    const { accessToken, refreshToken } = await this.authService.generateTokens(
      req.user,
    );

    const isProduction = process.env.NODE_ENV === 'production';
    console.log('isProduction ', isProduction);
    console.log('accessToken ', accessToken);
    console.log('refreshToken ', refreshToken);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
    });
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
    });

    res.json({
      userId: req.user.userId,
    });
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response): Promise<void> {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const { newAccessToken, newRefreshToken } =
      await this.authService.refreshTokens(refreshToken);

    const isProduction = process.env.NODE_ENV === 'production';
    // Set new tokens as cookies
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
    });
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
    });

    res.json({ success: true });
  }

  @Post('register')
  async register(
    @Body() createUserDto: CreateUserDto,
    @Query('populate') populate: boolean,
    @Res() response: Response,
  ): Promise<UserResponseDto> {
    // Use the UsersService to create a new user
    const user = await this.usersService.createUser(createUserDto, populate);

    const { accessToken, refreshToken } =
      await this.authService.generateTokens(user);

    const isProduction = process.env.NODE_ENV === 'production';
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
    });
    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
    });

    return this.conversionService.toResponseDto<User, UserResponseDto>(
      'User',
      user,
    );
  }
}
