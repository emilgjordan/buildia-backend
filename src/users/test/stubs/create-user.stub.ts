import { CreateUserDto } from '../../dto/input/create-user.dto';

export const createUserStub = (): CreateUserDto => {
  return {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
  };
};
