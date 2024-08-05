import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../services/auth.service';
import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly authService: AuthService) {
    super();
  }

  handleRequest(err, user, info) {
    if (err) {
      throw new UnauthorizedException(err.message);
    }
    if (!user) {
      if (info && info.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      } else if (info && info.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token');
      } else if (
        info &&
        info.name === 'Error' &&
        info.message === 'No auth token'
      ) {
        throw new UnauthorizedException('No auth token provided');
      } else {
        throw new InternalServerErrorException(
          'Something went wrong during authorization',
        );
      }
    }
    return user;
  }
}
