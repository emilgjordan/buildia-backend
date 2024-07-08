import { userStub } from '../stubs/user.stub';

export class UsersServiceMock {
  getUserById = jest.fn().mockResolvedValue(userStub());

  getUserByUsername = jest.fn().mockResolvedValue(userStub());

  getUsers = jest.fn().mockResolvedValue([userStub()]);

  createUser = jest.fn().mockResolvedValue(userStub());

  updateUser = jest.fn().mockResolvedValue(userStub());

  removeUser = jest
    .fn()
    .mockResolvedValue({ message: 'User was deleted successfully.' });
}
