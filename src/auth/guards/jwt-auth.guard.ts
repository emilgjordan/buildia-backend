import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../services/auth.service';
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly authService: AuthService) {
    super();
  }

  canActivate(context: ExecutionContext) {
    if (context.getType() === 'ws') {
      return this.validateTokenWs(context);
    }
    return super.canActivate(context);
  }

  async validateTokenWs(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient();

    const auth = client.handshake.auth.token || client.handshake.headers.token;
    if (!auth) {
      throw new WsException('Unauthorized: No token provided');
    }
    const token = auth.split(' ')[1];

    const user = await this.authService.verify(token);
    if (!user) {
      throw new WsException('Unauthorized: Invalid token');
    }
    client.user = user;
    return true;
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
