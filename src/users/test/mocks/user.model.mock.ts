import { mockModelFactory } from '../../../database/test/support/mock.model';
import { userStub } from '../stubs/user.stubs';
import { User } from '../../schemas/user.schema';

export const UserModelMock = mockModelFactory<User>(userStub());
