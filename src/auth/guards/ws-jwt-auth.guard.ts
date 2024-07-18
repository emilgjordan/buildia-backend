import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../services/auth.service';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsJwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient();
    const auth = client.handshake.auth.token || client.handshake.headers.token;

    if (!auth) {
      throw new WsException('Unauthorized: No token provided');
    }

    const token = auth.split(' ')[1];
    try {
      const user = await this.authService.verifyToken(token);
      client.user = user;
      return true;
    } catch (error) {
      throw new WsException('Unauthorized: Invalid or expired token');
    }
  }
}
