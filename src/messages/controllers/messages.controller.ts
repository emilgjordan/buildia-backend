import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { MessagesService } from '../services/messages.service';
import { CreateMessageDto } from '../dto/input/create-message.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from '../../users/interfaces/user.interface';
import { MessageResponseDto } from '../dto/output/message-response.dto';
import { ProjectsService } from 'src/projects/services/projects.service';
import { create } from 'domain';
import { Types } from 'mongoose';
import { Message } from '../interfaces/message.interface';
import { ConversionService } from '../../conversion/conversion.service';

@Controller('messages')
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly projectsService: ProjectsService,
    private readonly conversionService: ConversionService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createMessage(
    createMessageDto: CreateMessageDto,
    @Query('populate') populate: boolean,
    @CurrentUser() currentUser: User,
  ) {
    if (!this.projectsService.projectExists(createMessageDto.projectId)) {
      throw new NotFoundException('Project not found');
    }
    if (
      !this.projectsService.userInProject(
        currentUser.userId,
        createMessageDto.projectId,
      )
    ) {
      throw new UnauthorizedException('User not in project');
    }
    const message = { ...createMessageDto, userId: currentUser.userId };
    return this.messagesService.createMessage(message, populate);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getMessagesByProject(
    @Query('projectId') projectId: string,
    @Query('limit') limit: number,
    @Query('skip') skip: number,
    @Query('populate') populate: boolean,
    @CurrentUser() currentUser: User,
  ): Promise<MessageResponseDto[]> {
    if (!projectId) {
      throw new BadRequestException('Must provide a project ID');
    }
    if (!Types.ObjectId.isValid(projectId)) {
      throw new BadRequestException('Invalid project ID');
    }
    if (!this.projectsService.projectExists(projectId)) {
      throw new NotFoundException('Project not found');
    }
    if (!this.projectsService.userInProject(currentUser.userId, projectId)) {
      throw new UnauthorizedException('User not in project');
    }
    const messages: Message[] = await this.messagesService.getMessagesByProject(
      projectId,
      limit,
      skip,
      populate,
    );
    return this.conversionService.toResponseDtos<Message, MessageResponseDto>(
      'Message',
      messages,
    );
  }
}
