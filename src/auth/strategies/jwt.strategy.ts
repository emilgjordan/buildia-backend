import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../../users/interfaces/user.interface';
import { Request } from 'express';
import { UsersService } from '../../users/services/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          // Extract the JWT from the 'accessToken' cookie
          return request?.cookies?.['accessToken'];
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(validationPayload: {
    email: string;
    sub: string;
  }): Promise<User> {
    const user = this.usersService.getUserByEmail(
      validationPayload.email,
      false,
    );
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
