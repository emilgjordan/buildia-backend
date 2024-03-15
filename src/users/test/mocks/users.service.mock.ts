import { updatedUserStub, userStub } from '../stubs/user.stubs';

export const UserService = jest.fn().mockReturnValue({
  findOneById: jest.fn().mockResolvedValue(userStub()),
  findOneByUsername: jest.fn().mockResolvedValue(userStub()),
  findAll: jest.fn().mockResolvedValue([userStub()]),
  create: jest.fn().mockResolvedValue(userStub()),
  update: jest.fn().mockResolvedValue(updatedUserStub()),
  remove: jest
    .fn()
    .mockResolvedValue({ message: 'User was deleted successfully.' }),
});
