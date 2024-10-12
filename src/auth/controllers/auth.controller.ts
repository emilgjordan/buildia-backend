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
import { Request } from 'express';
import { UsersService } from '../../users/services/users.service';
import { CreateUserDto } from '../../users/dto/input/create-user.dto';
import { UserResponseDto } from '../../users/dto/output/user-response.dto';
import { ConversionService } from '../../conversion/conversion.service';
import { User } from 'src/users/interfaces/user.interface';
import { CreateUserResponseDto } from 'src/users/dto/output/create-user-response.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly conversionService: ConversionService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Req() req: Request,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { accessToken, refreshToken } = await this.authService.generateTokens(
      req.user,
    );

    // console.log('accessToken ', accessToken);
    // console.log('refreshToken ', refreshToken);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    return { accessToken, refreshToken };
  }

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

  @Post('register')
  async register(
    @Body() createUserDto: CreateUserDto,
    @Query('populate') populate: boolean,
  ): Promise<CreateUserResponseDto> {
    // Use the UsersService to create a new user
    const user = await this.usersService.createUser(createUserDto, populate);

    const { accessToken, refreshToken } =
      await this.authService.generateTokens(user);

    const userResponseDto = this.conversionService.toResponseDto<
      User,
      UserResponseDto
    >('User', user);

    return { user: userResponseDto, accessToken, refreshToken };
  }
}
