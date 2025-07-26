import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService) { }

  async validateUser(email: string, password: string) {

    const user = await this.usersService.getUserByEmail(email);

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
  ): Promise<{ accessToken: string, refreshToken: string }> {

    const accessToken = this.jwtService.sign({
      email: user.email,
      sub: user.id,
    });

    const refreshToken = await this.generateRefreshToken(user.id);

    return { accessToken, refreshToken };
  }

  async generateRefreshToken(userId: number) {
    const token = uuidv4();

    // const expiresIn = this.configService.get<string>('refreshToken.expiresIn');
    const expiresIn = '7d';
    const duration = this.parseExpiresIn(expiresIn);
    const expiresAt = add(new Date(), duration);

    await this.prisma.refreshToken.create({
      data: {
        token,
        expiresAt,
        user: {
          connect: {
            id: userId
          },
        },
      },
    });

    return token;

  }

  async refreshTokens(
    refreshToken: string,
  ): Promise<{ newAccessToken: string; newRefreshToken: string }> {


    const storedToken = await this.prisma.refreshToken.findUnique({ where: { token: refreshToken } });

    if (!storedToken || storedToken.expiresAt < new Date() || storedToken.revoked) {

      throw new UnauthorizedException('Refresh token is invalid or expired');
    }

    const user = await this.usersService.getUserById(storedToken.userId);


    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Optionally delete the old refresh token and create a new one (token rotation)
    const newAccessToken = this.jwtService.sign({
      sub: storedToken.userId,
      email: user.email,
    });
    const newRefreshToken = await this.generateRefreshToken(user.id);

    // Optionally delete the old token to implement token rotation
    //await this.refreshTokenModel.deleteOne({ _id: storedToken._id });
    await this.prisma.refreshToken.delete({ where: { id: storedToken.id } });

    return { newAccessToken, newRefreshToken };
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
