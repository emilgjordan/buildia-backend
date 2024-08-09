import {
  Inject,
  Injectable,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { add } from 'date-fns';

import { UsersService } from '../../users/services/users.service';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../users/interfaces/user.interface';
import { RefreshTokenDocument } from '../schemas/refresh-token.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectModel('RefreshToken')
    private readonly refreshTokenModel: Model<RefreshTokenDocument>,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.getUserByEmail(email, false);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const passwordIsValid = await bcrypt.compare(password, user.hashedPassword);
    if (!passwordIsValid) {
      throw new UnauthorizedException('Incorrect password');
    }
    return user;
  }

  async generateTokens(
    user: User,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = this.jwtService.sign({
      email: user.email,
      sub: user.userId,
    });

    const refreshToken = await this.generateRefreshToken(user.userId);

    return { accessToken, refreshToken };
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    const token = uuidv4();

    const expiresIn = this.configService.get<string>('refreshToken.expiresIn');
    const duration = this.parseExpiresIn(expiresIn);
    const expiresAt = add(new Date(), duration);

    const refreshToken = new this.refreshTokenModel({
      userId,
      token,
      expiresAt,
    });
    await refreshToken.save();
    return token;
  }

  async refreshTokens(
    refreshToken: string,
  ): Promise<{ newAccessToken: string; newRefreshToken: string }> {
    const storedToken = await this.refreshTokenModel.findOne({
      token: refreshToken,
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }

    const user = await this.usersService.getUserById(storedToken.userId);

    // Optionally delete the old refresh token and create a new one (token rotation)
    const newAccessToken = this.jwtService.sign({
      sub: storedToken.userId,
      email: user.email,
    });
    const newRefreshToken = await this.generateRefreshToken(user.userId);

    // Optionally delete the old token to implement token rotation
    await this.refreshTokenModel.deleteOne({ _id: storedToken._id });

    return { newAccessToken, newRefreshToken };
  }

  async verifyToken(token: string): Promise<User> {
    let decoded: any;
    try {
      decoded = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
    } catch (error) {
      throw new UnauthorizedException('Token verification failed');
    }

    const user = await this.usersService.getUserByEmail(decoded.email, false);
    if (!user) {
      throw new UnauthorizedException('User not found from token');
    }

    return user;
  }

  private parseExpiresIn(expiresIn: string): { [key: string]: number } {
    // Parse the expiresIn string like "7d", "24h", "60m", etc.
    const match = expiresIn.match(/^(\d+)([dhm])$/);
    if (!match) throw new Error('Invalid expiresIn format');

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 'd':
        return { days: value };
      case 'h':
        return { hours: value };
      case 'm':
        return { minutes: value };
      default:
        throw new Error('Invalid time unit in expiresIn');
    }
  }
}
