import { Injectable } from '@nestjs/common';
import { EntityRepository } from '../../database/entity.repository';
import { MessageDocument } from '../schemas/message.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class MessagesRepository extends EntityRepository<MessageDocument> {
  constructor(@InjectModel('Message') messageModel: Model<MessageDocument>) {
    super(messageModel);
  }
}
