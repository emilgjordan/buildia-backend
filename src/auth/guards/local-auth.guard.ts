import {
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Int } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

export class LocalAuthGuard extends AuthGuard('local') {
  handleRequest(err, user, info) {
    console.log('err', err);
    console.log('user', user);
    console.log('info', info);
    if (err) {
      // log error server side
      throw new UnauthorizedException(err.message);
    }
    if (!user) {
      if (info && info.message === 'User not found') {
        throw new UnauthorizedException('User not found');
      } else if (info && info.message === 'Invalid password') {
        throw new UnauthorizedException('Invalid credentials');
      } else {
        throw new UnauthorizedException('Unauthorized');
      }
    }
    return user;
  }
}
