import {
  Inject,
  Injectable,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from '../../users/services/users.service';
import * as bcrypt from 'bcryptjs';
import { User } from '../../users/interfaces/user.interface';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.getUserByEmail(email, false);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const passwordIsValid = await bcrypt.compare(password, user.hashedPassword);
    if (!passwordIsValid) {
      throw new UnauthorizedException('Invalid password');
    }
    return user;
  }

  generateAccessToken(user: User): string {
    const payload = {
      email: user.email,
      sub: user.userId,
    };

    return this.jwtService.sign(payload);
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
}
