import { Test } from '@nestjs/testing';
import { UsersServiceMock } from '../mocks/users.service.mock';
import { AuthServiceMock } from '../mocks/auth.service.mock';
import { UsersService } from '../../services/users.service';
import { AuthService } from '../../../auth/auth.service';
import { userStub } from '../stubs/user.stub';
import { userResponseStub } from '../stubs/user-response.stub';
import { createUserStub } from '../stubs/create-user.stub';
import { UsersController } from '../../controllers/users.controller';
import { UserResponseDto } from '../../dto/output/user-response.dto';
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Types } from 'mongoose';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersServiceMock;
  let authService: AuthServiceMock;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersController,
        {
          provide: UsersService,
          useClass: UsersServiceMock,
        },
        {
          provide: AuthService,
          useClass: AuthServiceMock,
        },
      ],
    }).compile();

    usersService = moduleRef.get<UsersServiceMock>(UsersService);
    usersController = moduleRef.get<UsersController>(UsersController);
    authService = moduleRef.get<AuthServiceMock>(AuthService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getUser', () => {
    let user: UserResponseDto;
    test('should throw BadRequestException for an invalid user ID ', async () => {
      await expect(usersController.getUser('invalidUserId')).rejects.toThrow(
        BadRequestException,
      );
    });
    test('should call usersService.getUserById', async () => {
      user = await usersController.getUser(userStub().userId.toString());
      expect(usersService.getUserById).toHaveBeenCalledWith(
        userStub().userId.toString(),
      );
    });
    test('should return a user for a valid user ID', async () => {
      user = await usersController.getUser(userStub().userId.toString());
      expect(user).toEqual(userResponseStub());
    });
    test('should throw NotFoundException if user does not exist ', async () => {
      const userId = new Types.ObjectId().toHexString();
      jest
        .spyOn(usersService, 'getUserById')
        .mockRejectedValue(new NotFoundException('User not found'));
      await expect(usersController.getUser(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
    test('should propagate other exceptions from the service', async () => {
      const userId = new Types.ObjectId().toHexString();
      jest
        .spyOn(usersService, 'getUserById')
        .mockRejectedValue(new InternalServerErrorException());
      await expect(usersController.getUser(userId)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getUsers', () => {
    let users: UserResponseDto[];
    beforeEach(async () => {
      users = await usersController.getUsers({});
    });

    // test('should throw BadRequestException for an invalid input ', async () => {
    //   await expect(
    //     usersController.getUsers({
    //       userId: 'invalidUserId',
    //     }),
    //   ).rejects.toThrow(BadRequestException);
    // });

    //Pipe validation doesn't get invoked when calling the controller method directly, so it won't throw a Bad Request Exception for an invalid input. Should test for this in an e2e test.

    test('should call usersService.getUsers', async () => {
      users = await usersController.getUsers({});
      expect(usersService.getUsers).toHaveBeenCalledWith({});
    });

    test('should return a list of users for a valid input', async () => {
      users = await usersController.getUsers({});
      expect(users).toEqual([userResponseStub()]);
    });

    test('should propagate other exceptions from the service', async () => {
      jest
        .spyOn(usersService, 'getUsers')
        .mockRejectedValue(new InternalServerErrorException());
      await expect(usersController.getUsers({})).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('createUser', () => {
    //assume valid input

    test('should throw ConflictException if user already exists', async () => {
      jest
        .spyOn(usersService, 'createUser')
        .mockRejectedValue(
          new ConflictException('Username or email already exists'),
        );
      await expect(
        usersController.createUser(createUserStub()),
      ).rejects.toThrow(ConflictException);
    });

    test('should call usersService.createUser', async () => {
      await usersController.createUser(createUserStub());
      expect(usersService.createUser).toHaveBeenCalledWith(createUserStub());
    });

    test('should return the created user and access token for valid input data', async () => {
      const result = await usersController.createUser(createUserStub());
      expect(result).toEqual({
        user: userResponseStub(),
        accessToken: 'token',
      });
    });

    test('should propagate other exceptions from the service', async () => {
      jest
        .spyOn(usersService, 'getUsers')
        .mockRejectedValue(new InternalServerErrorException());
      await expect(usersController.getUsers({})).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('updateUser', () => {
    const updateUserDto = { username: 'newUsername' };
    const updatedUser = { ...userStub(), ...updateUserDto };

    test('should throw BadRequestException for an invalid user ID ', async () => {
      await expect(
        usersController.updateUser('invalidUserId', updateUserDto, userStub()),
      ).rejects.toThrow(BadRequestException);
    });

    test('should throw NotFoundException if user does not exist ', async () => {
      const userId = new Types.ObjectId().toHexString();
      jest
        .spyOn(usersService, 'updateUser')
        .mockRejectedValue(new NotFoundException('User not found'));
      await expect(
        usersController.updateUser(userId, updateUserDto, userStub()),
      ).rejects.toThrow(NotFoundException);
    });

    test('should throw UnauthorizedException if target user ID does not match current user ID', async () => {
      const userId = new Types.ObjectId().toHexString();
      jest
        .spyOn(usersService, 'updateUser')
        .mockRejectedValue(new UnauthorizedException());
      await expect(
        usersController.updateUser(userId, updateUserDto, userStub()),
      ).rejects.toThrow(UnauthorizedException);
    });

    test('should call usersService.updateUser', async () => {
      jest.spyOn(usersService, 'updateUser').mockResolvedValue(updatedUser);
      await usersController.updateUser(
        userStub().userId.toString(),
        updateUserDto,
        userStub(),
      );
      expect(usersService.updateUser).toHaveBeenCalledWith(
        userStub().userId.toString(),
        userStub().userId.toString(),
        updateUserDto,
      );
    });

    test('should return the updated user', async () => {
      jest.spyOn(usersService, 'updateUser').mockResolvedValue(updatedUser);

      const { hashedPassword, ...updatedUserResponse } = updatedUser;
      expect(
        await usersController.updateUser(
          userStub().userId.toString(),
          updateUserDto,
          userStub(),
        ),
      ).toEqual(updatedUserResponse);
    });

    test('should propagate other exceptions from the service', async () => {
      jest
        .spyOn(usersService, 'updateUser')
        .mockRejectedValue(new InternalServerErrorException());
      await expect(
        usersController.updateUser(
          userStub().userId.toString(),
          updateUserDto,
          userStub(),
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
