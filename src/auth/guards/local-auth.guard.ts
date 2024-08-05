import { UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export class LocalAuthGuard extends AuthGuard('local') {
  handleRequest(err, user, info) {
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
