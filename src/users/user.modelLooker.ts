import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class UserModelLooker {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {
    this.userModel = userModel;
  }
  logModel() {
    console.log(this.userModel);
  }
}
