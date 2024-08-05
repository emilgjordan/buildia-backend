import { MessageDocument } from 'src/messages/schemas/message.schema';
import { EntityConverter } from '../entity.converter';
import { Message } from '../../../messages/interfaces/message.interface';
import { MessageResponseDto } from '../../../messages/dto/output/message-response.dto';
import { Types } from 'mongoose';
import { ConversionService } from '../../conversion.service';
import { ProjectDocument } from 'src/projects/schemas/project.schema';
import { Project } from 'src/projects/interfaces/project.interface';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UserDocument } from 'src/users/schemas/user.schema';
import { User } from 'src/users/interfaces/user.interface';
import { PlainUserConverter } from '../plain/plain-user.converter';
import { PlainProjectConverter } from '../plain/plain-project.converter';

@Injectable()
export class MessageConverter extends EntityConverter<
  MessageDocument,
  Message,
  MessageResponseDto
> {
  constructor(
    private readonly plainUserConverter: PlainUserConverter,
    private readonly plainProjectConverter: PlainProjectConverter,
  ) {
    super();
  }
  toEntity(messageDocument: MessageDocument): Message {
    const { _id, __v, ...message } = messageDocument.toObject();
    let projectNew;
    let userNew;

    if (messageDocument.project instanceof Types.ObjectId) {
      projectNew = messageDocument.project.toString();
    } else if (typeof messageDocument.project === 'object') {
      projectNew = this.plainProjectConverter.toEntity(messageDocument.project);
    } else {
      throw new InternalServerErrorException(
        'Invalid message document project data',
      );
    }

    if (messageDocument.user instanceof Types.ObjectId) {
      userNew = messageDocument.user.toString();
    } else if (typeof messageDocument.user === 'object') {
      userNew = this.plainUserConverter.toEntity(messageDocument.user);
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
