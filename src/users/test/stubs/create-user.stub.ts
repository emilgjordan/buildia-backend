import { CreateUserDto } from '../../dto/input/create-user.dto';

export const createUserStub = (): CreateUserDto => {
  return {
    firstName: 'Johnny',
    lastName: 'Test',
    email: 'johnnytest@example.com',
    username: 'johnnytest',
    password: 'password123',
  };
};
