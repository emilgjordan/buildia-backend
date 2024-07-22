import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { MessagesRepository } from '../repositories/messages.repository';
import { Message } from '../interfaces/messages.interface';
import { MessageDocument } from '../schemas/message.schema';
import { Types } from 'mongoose';
import { UsersService } from 'src/users/services/users.service';
import { ProjectsService } from 'src/projects/services/projects.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateMessageDto } from '../dto/input/create-message.dto';
import { ConversionService } from '../../conversion/conversion.service';

@Injectable()
export class MessagesService {
  constructor(
    private readonly messagesRepository: MessagesRepository,
    private readonly projectsService: ProjectsService,
    private readonly conversionService: ConversionService,
  ) {}

  async getMessagesByProject(
    projectId: string,
    populate: boolean,
    currentUserId: string,
  ): Promise<Message[]> {
    const project = await this.projectsService.getProjectById(projectId, false);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    const userIds = project.users.map((user) => {
      return typeof user === 'string' ? user : user.userId;
    });
    if (!userIds.includes(currentUserId)) {
      throw new UnauthorizedException('Current user not in project');
    }
    const messageDocuments = await this.messagesRepository.findMany({
      project: projectId,
    });
    if (populate) {
      return await Promise.all(
        messageDocuments.map(async (messageDocument) => {
          const populatedMessage =
            await messageDocument.populate('project user');
          return this.conversionService.toEntity<MessageDocument, Message>(
            'Message',
            populatedMessage,
          );
        }),
      );
    } else {
      return messageDocuments.map((messageDocument) =>
        this.conversionService.toEntity<MessageDocument, Message>(
          'Message',
          messageDocument,
        ),
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  async createMessage(
    createMessageDto: CreateMessageDto,
    populate: boolean,
    currentUserId?: string,
  ) {
    if (createMessageDto.type === 'user' && !currentUserId) {
      throw new BadRequestException('No user ID provided');
    }
    if (createMessageDto.type === 'user') {
      const userId = new Types.ObjectId(currentUserId);
      const newMessage = { ...createMessageDto, user: userId };
      const messageDocument = await this.messagesRepository.create(newMessage);
    } else if (createMessageDto.type === 'system') {
      const newMessage = { ...createMessageDto };
      const messageDocument = await this.messagesRepository.create(newMessage);
    } else {
      throw new BadRequestException('Invalid message type');
    }
  }
}
