import { userDocumentStub } from '../stubs/user.stubs';

export class UsersRepositoryMock {
  findOne = jest.fn().mockResolvedValue(userDocumentStub());

  findMany = jest.fn().mockResolvedValue([userDocumentStub()]);

  create = jest.fn().mockResolvedValue(userDocumentStub());

  updateOne = jest.fn().mockResolvedValue(userDocumentStub());

  deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });
}
