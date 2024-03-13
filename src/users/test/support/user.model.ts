import { MockModel } from '../../../database/test/support/mock.model';
import { userStub } from '../stubs/user.stubs';
import { User } from '../../schemas/user.schema';

export class UserModel extends MockModel<User> {
  protected entityStub = userStub();
}
