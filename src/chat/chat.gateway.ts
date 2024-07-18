import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { ChatMessageDto } from './dto/chat-message.dto';
import {
  Inject,
  UnauthorizedException,
  UseFilters,
  UseGuards,
  forwardRef,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthService } from '../auth/services/auth.service';
import { ProjectsService } from 'src/projects/services/projects.service';
import { WsJwtAuthGuard } from 'src/auth/guards/ws-jwt-auth.guard';
import { User } from 'src/users/interfaces/user.interface';
import { WsExceptionsFilter } from '../common/filters/ws-exceptions.filter';
import { Types } from 'mongoose';

@UseFilters(new WsExceptionsFilter())
@WebSocketGateway({ cors: { origin: '*', credentials: true } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private authService: AuthService,
    @Inject(forwardRef(() => ProjectsService))
    private readonly projectsService: ProjectsService,
  ) {}

  notifyJoinRequest(projectId: string, userId: string) {
    console.log('emmited user:request_join');
    this.server
      .to(projectId)
      .emit('user:request_join', { projectId: projectId, userId: userId });
  }

  notifyJoinApproval(projectId: string, userId: string) {
    this.server
      .to(projectId)
      .emit('user:joined', { projectId: projectId, userId: userId });
  }
  @UseFilters(new WsExceptionsFilter())
  async handleConnection(client: Socket) {
    const auth = client.handshake.auth.token || client.handshake.headers.token;
    if (!auth) {
      client.disconnect();
      console.log('Unauthorized: No token provided');
      throw new WsException('Unauthorized: No token provided');
    }
    const token = auth.split(' ')[1];

    let user;
    try {
      user = await this.authService.verifyToken(token);
    } catch (error) {
      client.disconnect();
      return;
    }

    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('room:join')
  @UseGuards(WsJwtAuthGuard)
  async handleJoinRoom(
    @MessageBody() projectId: string,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    console.log(client['user'].userId);
    console.log(Types.ObjectId.isValid(client['user'].userId));
    console.log(projectId);
    if (
      !(await this.projectsService.userInProject(
        client['user'].userId,
        projectId,
      ))
    ) {
      throw new WsException('Unauthorized: User not in project');
    }
    client.join(projectId);
  }

  @SubscribeMessage('room:leave')
  async handleLeaveRoom(
    @MessageBody() projectId: string,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    client.leave(projectId);
  }

  @SubscribeMessage('message:send')
  @UseGuards(WsJwtAuthGuard)
  async handleMessage(
    @MessageBody() chatMessageDto: ChatMessageDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const { projectId, content } = chatMessageDto;
    if (
      !(await this.projectsService.userInProject(
        client['user'].userId,
        projectId,
      ))
    ) {
      throw new WsException('Unauthorized: User not in project');
    }

    const message = {
      user: client['user'].username,
      message: content,
      timestamp: new Date(),
    };

    this.server.to(projectId).emit('message:new', message);
  }
}
