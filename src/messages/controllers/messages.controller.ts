import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { MessagesService } from '../services/messages.service';
import { CreateMessageDto } from '../dto/input/create-message.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from '../../users/interfaces/user.interface';

@Controller('projects/:projectId/messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createMessage(
    createMessageDto: CreateMessageDto,
    @Query('populate') populate: boolean,
    @CurrentUser() currentUser: User,
  ) {
    return this.messagesService.createMessage(
      createMessageDto,
      populate,
      currentUser.userId,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getMessagesByProject(
    @Query('populate') populate: boolean,
    @CurrentUser() currentUser: User,
  ) {
    return this.messagesService.getMessagesByProject(
      currentUser.userId,
      populate,
      currentUser.userId,
    );
  }
}
