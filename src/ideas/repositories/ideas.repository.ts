import { Injectable } from '@nestjs/common';
import { EntityRepository } from '../../database/entity.repository';
import { IdeaDocument } from '../schemas/idea.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class IdeasRepository extends EntityRepository<IdeaDocument> {
  constructor(@InjectModel('Idea') ideaModel: Model<IdeaDocument>) {
    super(ideaModel);
  }
}
