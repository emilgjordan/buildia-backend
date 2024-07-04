import { mockModelFactory } from '../../../database/test/support/mock.model';
import { createUserRepositoryDataStub } from '../stubs/user.stubs';
import { UserSchemaDefinition } from '../../schemas/user.schema';

export const UserModelMock = mockModelFactory<UserSchemaDefinition>(
  createUserRepositoryDataStub(),
);
