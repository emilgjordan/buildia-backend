import { userStub } from '../stubs/user.stub';

export class AuthServiceMock {
  validate = jest.fn().mockResolvedValue(userStub());
  login = jest.fn().mockResolvedValue({ access_token: 'token' });
  verify = jest.fn().mockResolvedValue(userStub());
}
