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
import { UseFilters, UseGuards } from '@nestjs/common';
import { AuthService } from '../auth/services/auth.service';
import { ProjectsService } from '../projects/services/projects.service';
import { WsJwtAuthGuard } from '../auth/guards/ws-jwt-auth.guard';
import { WsExceptionsFilter } from '../common/filters/ws-exceptions.filter';
import { Types } from 'mongoose';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ChatMessageResponseDto } from './dto/output/chat-message-response.dto';
import { InternalCreateMessageDto } from 'src/messages/dto/input/internal-create-message.dto';

@UseFilters(new WsExceptionsFilter())
@WebSocketGateway({ cors: { origin: '*', credentials: true } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private readonly authService: AuthService,
    private readonly projectsService: ProjectsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @OnEvent('project.joinRequest')
  handleProjectJoinRequestEvent(payload) {
    console.log('emmited user:request_join');
    this.notifyJoinRequest(payload.userId, payload.projectId);
  }

  notifyJoinRequest(userId: string, projectId: string) {
    //console.log('emmited user:request_join');
    console.log('join request project id');
    console.log(projectId);
    console.log('join request user id');
    console.log(userId);
    this.server
      .to(projectId)
      .emit('user:request_join', { projectId: projectId, userId: userId });
  }

  @OnEvent('project.userJoined')
  handleProjectUserJoinedEvent(userId: string, projectId: string) {
    this.notifyJoinApproval(userId, projectId);
  }

  notifyJoinApproval(userId: string, projectId: string) {
    this.server
      .to(projectId)
      .emit('user:joined', { projectId: projectId, userId: userId });
  }

  @UseFilters(WsExceptionsFilter)
  async handleConnection(client: Socket) {
    const auth = client.handshake.auth.token || client.handshake.headers.token;
    console.log(auth);
    if (!auth) {
      console.log('Unauthorized: No token provided');
      client.disconnect();
      //console.log('Unauthorized: No token provided');
      throw new WsException('Unauthorized: No token provided');
    }
    if (!auth.startsWith('Bearer ')) {
      console.log('Unauthorized: Invalid token format');
      client.disconnect();
      // TODO : figure out why this breaks the server and doesnt send back to the client
      //throw new WsException('Unauthorized: Invalid token format');
    }

    const token = auth.split(' ')[1];

    let user;
    try {
      user = await this.authService.verifyToken(token);
    } catch (error) {
      console.log(error);
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
    if (!(await this.projectsService.projectExists(projectId))) {
      throw new WsException('Project not found');
    }
    if (
      !(await this.projectsService.userInProject(
        client['user'].userId,
        projectId,
      ))
    ) {
      throw new WsException('Unauthorized: User not in project');
    }

    const messageResponse: ChatMessageResponseDto = {
      username: client['user'].username,
      content: content,
      timestamp: new Date(),
    };

    const message: InternalCreateMessageDto = {
      type: 'user',
      projectId: projectId,
      userId: client['user'].userId,
      content: content,
    };

    this.server.to(projectId).emit('message:new', messageResponse);
    this.eventEmitter.emit('message.newMessage', message);
  }
}
