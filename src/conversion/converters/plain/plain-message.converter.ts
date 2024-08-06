import { MessageDocument } from '../../../messages/schemas/message.schema';
import { EntityConverter } from '../entity.converter';
import { Message } from '../../../messages/interfaces/message.interface';
import { MessageResponseDto } from '../../../messages/dto/output/message-response.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PlainMessageConverter extends EntityConverter<
  MessageDocument,
  Message,
  MessageResponseDto
> {
  toEntity(document) {
    return document;
  }

  toResponseDto(entity) {
    return entity;
  }
}
