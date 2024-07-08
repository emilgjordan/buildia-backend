import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from '../users/services/users.service';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/interfaces/user.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validate(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.getUserByEmail(email, false);

    if (!user) {
      return null;
    }

    const passwordIsValid = await bcrypt.compare(password, user.hashedPassword);
    return passwordIsValid ? user : null;
  }

  login(user: User): { access_token: string } {
    const payload = {
      email: user.email,
      sub: user.userId,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async verify(token: string): Promise<User> {
    const decoded = this.jwtService.verify(token, {
      secret: process.env.JWT_SECRET,
    });

    const user = await this.usersService.getUserByEmail(decoded.email, false);

    if (!user) {
      throw new Error('Unable to get the user from decoded token.');
    }

    return user;
  }
}
