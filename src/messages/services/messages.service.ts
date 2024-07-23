import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { MessagesRepository } from '../repositories/messages.repository';
import { Message } from '../interfaces/message.interface';
import { MessageDocument } from '../schemas/message.schema';
import { Types } from 'mongoose';
import { UsersService } from 'src/users/services/users.service';
import { ProjectsService } from 'src/projects/services/projects.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateMessageDto } from '../dto/input/create-message.dto';
import { ConversionService } from '../../conversion/conversion.service';
import { InternalCreateMessageDto } from '../dto/input/internal-create-message.dto';
import { OnEvent } from '@nestjs/event-emitter';

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
  ): Promise<Message[]> {
    const project = await this.projectsService.getProjectById(projectId, false);
    if (!project) {
      throw new InternalServerErrorException('Project not found');
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

  async createMessage(
    createMessageDto: InternalCreateMessageDto,
    populate: boolean,
  ) {
    if (createMessageDto.type === 'user' && !createMessageDto.userId) {
      throw new InternalServerErrorException(
        'InternalCreateMessageDto requires property userId for user messages',
      );
    }
    if (createMessageDto.type === 'user') {
      const userId = new Types.ObjectId(createMessageDto.userId);
      const newMessage = { ...createMessageDto, user: userId };
      const messageDocument = await this.messagesRepository.create(newMessage);
    } else if (createMessageDto.type === 'system') {
      const newMessage = { ...createMessageDto };
      const messageDocument = await this.messagesRepository.create(newMessage);
    }
  }

  @OnEvent('message.*')
  async handleChatNewMessageEvent(payload: InternalCreateMessageDto) {
    await this.createMessage(payload, false);
  }
}
