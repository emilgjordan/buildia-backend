import { Injectable } from '@nestjs/common';
import { EntityRepository } from '../../database/entity.repository';
import { LikeDocument } from '../schemas/like.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class LikesRepository extends EntityRepository<LikeDocument> {
  constructor(@InjectModel('Like') likeModel: Model<LikeDocument>) {
    super(likeModel);
  }
}
