import { Injectable } from '@nestjs/common';
import { EntityRepository } from '../../database/entity.repository';
import { JoinRequestDocument } from '../schemas/join-request.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class JoinRequestsRepository extends EntityRepository<JoinRequestDocument> {
  constructor(
    @InjectModel('JoinRequest') joinrequestModel: Model<JoinRequestDocument>,
  ) {
    super(joinrequestModel);
  }
}
