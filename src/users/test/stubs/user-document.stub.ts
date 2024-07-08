import { UserDocument } from '../../schemas/user.schema';
import { userStub } from './user.stub';
import { Types } from 'mongoose';

export const userDocumentStub = (): Partial<UserDocument> => {
  const user = userStub();
  const { userId, ...rest } = user;
  return {
    _id: Types.ObjectId.createFromHexString(userId),
    __v: 0,
    toObject: function () {
      const { _id, __v, ...plainUser } = this;
      return this;
    },
    ...rest,
  };
};
