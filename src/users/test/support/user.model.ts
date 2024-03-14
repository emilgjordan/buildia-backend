import { MockModel } from '../../../database/test/support/mock.model';
import { userStub } from '../stubs/user.stubs';
import { User } from '../../schemas/user.schema';

export class UserMockModel extends MockModel<User> {
  protected entityStub = userStub();

  constructor(createEntityData: User) {
    super(createEntityData);
  }
}
