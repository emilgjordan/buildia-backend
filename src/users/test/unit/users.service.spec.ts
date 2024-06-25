import { Test } from '@nestjs/testing';
import { UsersRepositoryMock } from '../mocks/users.repository.mock';
import { UsersRepository } from '../../../repositories/users.repository';
import { UsersService } from '../../services/users.service';
import { User } from '../../schemas/user.schema';
import { userStub } from '../stubs/user.stubs';

describe('UsersService', () => {
  let usersRepository: UsersRepositoryMock;
  let usersService: UsersService;
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useClass: UsersRepositoryMock,
        },
      ],
    }).compile();

    usersRepository = moduleRef.get<UsersRepositoryMock>(UsersRepository);
    usersService = moduleRef.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  describe('getUserById', () => {
    describe('when getUserById is called', () => {
      let user: User;
      beforeEach(async () => {
        user = await usersService.getUserById(userStub()._id.toString());
      });

      test('then it should call the usersRepository', () => {
        expect(usersRepository.findOne).toHaveBeenCalledWith({
          _id: userStub()._id.toString(),
        });
      });

      test('then it should return a user', () => {
        expect(user).toEqual(userStub());
      });
    });
  });

  describe('getUserByUsername', () => {
    describe('when getUserByUsername is called', () => {
      let user: User;
      beforeEach(async () => {
        user = await usersService.getUserByUsername(userStub().username);
      });

      test('then it should call the usersRepository', () => {
        expect(usersRepository.findOne).toHaveBeenCalledWith({
          username: userStub().username,
        });
      });

      test('then it should return a user', () => {
        expect(user).toEqual(userStub());
      });
    });
  });

  describe('getUsers', () => {
    describe('when getUsers is called', () => {
      let users: User[];
      beforeEach(async () => {
        users = await usersService.getUsers({});
      });

      test('then it should call the usersRepository', () => {
        expect(usersRepository.findMany).toHaveBeenCalled();
      });

      test('then it should return a list of users', () => {
        expect(users).toEqual([userStub()]);
      });
    });
  });

  describe('createUser', () => {
    describe('when createUser is called with new user data', () => {
      let user: User;
      beforeEach(async () => {
        usersRepository.findOne = jest.fn().mockResolvedValue(null);
        user = await usersService.createUser(userStub());
      });

      test('then it should call usersRepository.findOne', () => {
        expect(usersRepository.findOne).toHaveBeenCalled();
      });

      test('then it should call usersRepository.create', () => {
        expect(usersRepository.create).toHaveBeenCalledWith(userStub());
      });

      test('then it should return a user', () => {
        expect(user).toEqual(userStub());
      });
    });
    describe('when createUser is called with existing user data', () => {
      beforeEach(async () => {
        usersRepository.findOne = jest.fn().mockResolvedValue(userStub());
      });

      test('then it should not call usersRepository.create', async () => {
        await expect(usersService.createUser(userStub())).rejects.toThrow(
          'Username or email already exists',
        );
        expect(usersRepository.create).not.toHaveBeenCalled();
      });
    });
  });

  describe('updateUser', () => {
    describe('when updateUser is called with an existing user ID', () => {
      let user: User;
      beforeEach(async () => {
        user = await usersService.updateUser(
          userStub()._id.toString(),
          userStub(),
        );
      });

      test('then it should call the usersRepository', () => {
        expect(usersRepository.updateOne).toHaveBeenCalledWith(
          { _id: userStub()._id.toString() },
          userStub(),
        );
      });

      test('then it should return a user', () => {
        expect(user).toEqual(userStub());
      });
    });
    describe('when updateUser is called with a user ID that does not exist', () => {
      beforeEach(async () => {
        usersRepository.findOne = jest.fn().mockResolvedValue(null);
      });

      test('then it should not call usersRepository.updateOne', async () => {
        await expect(
          usersService.updateUser(userStub()._id.toString(), userStub()),
        ).rejects.toThrow('User does not exist');
        expect(usersRepository.updateOne).not.toHaveBeenCalled();
      });
    });
  });
});
