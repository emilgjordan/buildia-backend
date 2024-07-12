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
import { JoinProjectDto } from './dto/join-project.dto';
import { ChatMessageDto } from './dto/chat-message.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/interfaces/user.interface';
import { Inject, UseFilters, UseGuards, forwardRef } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthService } from '../auth/services/auth.service';
import { JwtService } from '@nestjs/jwt';
import { ProjectsService } from 'src/projects/services/projects.service';
import { WsExceptionsFilter } from 'src/common/filters/ws-exceptions.filter';

@WebSocketGateway({ cors: { origin: '*', credentials: true } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private authService: AuthService,
    @Inject(forwardRef(() => ProjectsService))
    private readonly projectsService: ProjectsService,
  ) {}

  notifyJoinRequest(projectId: string, userId: string) {
    this.server.to(projectId).emit('user:request_join', { userId });
  }

  notifyJoinApproval(projectId: string, userId: string) {
    this.server.to(projectId).emit('user:joined', { userId });
  }

  async handleConnection(client: Socket) {
    const auth = client.handshake.auth.token || client.handshake.headers.token;
    if (!auth) {
      client.disconnect();
      console.log('Unauthorized: No token provided');
      throw new WsException('Unauthorized: No token provided');
    }
    const token = auth.split(' ')[1];

    const user = await this.authService.verify(token);
    if (!user) {
      client.disconnect();
      console.log('Unauthorized: Invalid token');
      //   throw new WsException('Unauthorized: Invalid token');
    }

    const projects = user.projects.map((project) => project.toString());
    projects.forEach((projectId) => {
      client.join(projectId);
    });

    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('message:send')
  @UseGuards(JwtAuthGuard)
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
