import { MessageDocument } from 'src/messages/schemas/message.schema';
import { EntityConverter } from './entity.converter';
import { Message } from '../../messages/interfaces/message.interface';
import { MessageResponseDto } from '../../messages/dto/output/message-response.dto';
import { Types } from 'mongoose';
import { ConversionService } from '../conversion.service';
import { ProjectDocument } from 'src/projects/schemas/project.schema';
import { Project } from 'src/projects/interfaces/project.interface';
import { InternalServerErrorException } from '@nestjs/common';
import { UserDocument } from 'src/users/schemas/user.schema';
import { User } from 'src/users/interfaces/user.interface';

export class MessageConverter extends EntityConverter<
  MessageDocument,
  Message,
  MessageResponseDto
> {
  constructor(private readonly conversionService: ConversionService) {
    super();
  }
  toEntity(messageDocument: MessageDocument): Message {
    const { _id, __v, project, user, ...message } = messageDocument.toObject();
    let projectNew;
    let userNew;

    if (project instanceof Types.ObjectId) {
      projectNew = project.toString();
    } else if (typeof project === 'object') {
      projectNew = this.conversionService.toEntity<ProjectDocument, Project>(
        'Project',
        project,
      );
    } else {
      throw new InternalServerErrorException(
        'Invalid message document project data',
      );
    }

    if (user instanceof Types.ObjectId) {
      userNew = user.toString();
    } else if (typeof user === 'object') {
      projectNew = this.conversionService.toEntity<UserDocument, User>(
        'User',
        user,
      );
    } else {
      throw new InternalServerErrorException(
        'Invalid message document user data',
      );
    }

    return {
      ...message,
      messageId: _id.toString(),
      project: projectNew,
      user: userNew,
    };
  }
  toResponseDto(message: Message): MessageResponseDto {
    //exclude sensitive data from response
    const { ...messageResponseDto } = message;
    return messageResponseDto;
  }
}
