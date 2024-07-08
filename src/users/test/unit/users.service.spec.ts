import { Test } from '@nestjs/testing';
import { UsersRepositoryMock } from '../mocks/users.repository.mock';
import { UsersRepository } from '../../repositories/users.repository';
import { UsersService } from '../../services/users.service';
import { User } from '../../interfaces/user.interface';
import { userStub } from '../stubs/user.stub';
import { createUserStub } from '../stubs/create-user.stub';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Types } from 'mongoose';

describe('UsersService', () => {
  let usersService: UsersService;
  let usersRepository: UsersRepositoryMock;

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

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getUserById', () => {
    let user: User;

    test('should throw NotFoundException if user does not exist', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);
      await expect(usersService.getUserById(userStub().userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    test('should call usersRepository.findOne', async () => {
      user = await usersService.getUserById(userStub().userId);
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        _id: userStub().userId,
      });
    });

    test('should return a user for a valid user ID', () => {
      expect(user).toEqual(userStub());
    });

    test('should propagate other exceptions from the repository', async () => {
      jest
        .spyOn(usersRepository, 'findMany')
        .mockRejectedValue(new InternalServerErrorException());
      await expect(usersService.getUserById(userStub().userId)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getUserByUsername', () => {
    let user: User;

    test('should throw NotFoundException if user does not exist', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);
      await expect(
        usersService.getUserByUsername(userStub().username),
      ).rejects.toThrow(NotFoundException);
    });

    test('should call usersRepository.findOne', async () => {
      user = await usersService.getUserById(userStub().username);
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        username: userStub().username,
      });
    });

    test('should return a user for a valid username', () => {
      expect(user).toEqual(userStub());
    });

    test('should propagate other exceptions from the repository', async () => {
      jest
        .spyOn(usersRepository, 'findMany')
        .mockRejectedValue(new InternalServerErrorException());
      await expect(
        usersService.getUserById(userStub().username),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getUserByEmail', () => {
    let user: User;

    test('should throw NotFoundException if user does not exist', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);
      await expect(
        usersService.getUserByUsername(userStub().email),
      ).rejects.toThrow(NotFoundException);
    });

    test('should call usersRepository.findOne', async () => {
      user = await usersService.getUserByUsername(userStub().email);
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        email: userStub().email,
      });
    });

    test('should return a user for a valid email', () => {
      expect(user).toEqual(userStub());
    });

    test('should propagate other exceptions from the repository', async () => {
      jest
        .spyOn(usersRepository, 'findMany')
        .mockRejectedValue(new InternalServerErrorException());
      await expect(
        usersService.getUserByEmail(userStub().email),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getUsers', () => {
    let users: User[];

    test('should call usersRepository.findMany', async () => {
      users = await usersService.getUsers({});
      expect(usersRepository.findMany).toHaveBeenCalledWith({});
    });

    test('should return a list of users', () => {
      expect(users).toEqual([userStub()]);
    });

    test('should propagate other exceptions from the repository', async () => {
      jest
        .spyOn(usersRepository, 'findMany')
        .mockRejectedValue(new InternalServerErrorException());
      await expect(usersService.getUsers({})).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('createUser', () => {
    let user: User;

    test('should throw ConflictException if username or email already exists', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(userStub());
      await expect(usersService.createUser(createUserStub())).rejects.toThrow(
        ConflictException,
      );
    });

    test('should call usersRepository.findOne', () => {
      expect(usersRepository.findOne).toHaveBeenCalled();
    });

    test('should call usersRepository.createOne', async () => {
      user = await usersService.createUser(createUserStub());
      expect(usersRepository.create).toHaveBeenCalledWith(createUserStub());
    });

    test('should return a user', () => {
      expect(user).toEqual(userStub());
    });
  });

  describe('updateUser', () => {
    let user: User;
    const updateUserDto = { username: 'newUsername' };
    const updatedUser = { ...userStub(), ...updateUserDto };

    test('should throw NotFoundException if user does not exist', async () => {
      jest.spyOn(usersRepository, 'updateOne').mockResolvedValue(null);
      await expect(
        usersService.updateUser(
          userStub().userId.toString(),
          userStub().userId.toString(),
          userStub(),
        ),
      ).rejects.toThrow(NotFoundException);
    });

    test('should throw UnauthorizedException if user ID does not match current user ID', async () => {
      const differentUserId = new Types.ObjectId().toHexString();
      await expect(
        usersService.updateUser(differentUserId, userStub().userId, userStub()),
      ).rejects.toThrow(UnauthorizedException);
    });

    test('should call usersRepository.updateOne', async () => {
      user = await usersService.updateUser(
        userStub().userId,
        userStub().userId,
        updateUserDto,
      );
      expect(usersRepository.updateOne).toHaveBeenCalledWith(
        { _id: userStub().userId },
        updateUserDto,
      );
    });

    test('should return the updated User', () => {
      expect(user).toEqual(updatedUser);
    });

    test('then it should not call usersRepository.updateOne', async () => {
      await expect(
        usersService.updateUser(
          userStub().userId.toString(),
          userStub().userId.toString(),
          userStub(),
        ),
      ).rejects.toThrow('User does not exist');
      expect(usersRepository.updateOne).not.toHaveBeenCalled();
    });
  });
});
