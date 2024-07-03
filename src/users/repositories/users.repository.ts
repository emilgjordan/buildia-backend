import { Injectable } from '@nestjs/common';
import { EntityRepository } from '../../database/entity.repository';
import { UserDocument } from '../schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UsersRepository extends EntityRepository<UserDocument> {
  constructor(@InjectModel('User') userModel: Model<UserDocument>) {
    super(userModel);
  }
}
