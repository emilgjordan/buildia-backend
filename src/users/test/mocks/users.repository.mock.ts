import { userStub } from '../stubs/user.stubs';

export class UsersRepositoryMock {
  findOne = jest.fn().mockResolvedValue(userStub());

  findMany = jest.fn().mockResolvedValue([userStub()]);

  create = jest.fn().mockResolvedValue(userStub());

  updateOne = jest.fn().mockResolvedValue(userStub());

  deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });
}
