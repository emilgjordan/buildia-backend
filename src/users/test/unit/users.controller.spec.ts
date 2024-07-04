import { Test } from '@nestjs/testing';
import { UsersServiceMock } from '../mocks/users.service.mock';
import { AuthServiceMock } from '../mocks/auth.service.mock';
import { UsersService } from '../../services/users.service';
import { AuthService } from '../../../auth/auth.service';
import { User } from '../../interfaces/user.interface';
import { userStub } from '../stubs/user.stubs';
import { userResponseStub } from '../stubs/user-response.stub';
import { createUserStub } from '../stubs/create-user.stub';
import { UsersController } from '../../controllers/users.controller';
import { UserResponseDto } from '../../dto/output/user-response.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
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
        .mockRejectedValue(new Error('Unexpected error'));
      await expect(usersController.getUser(userId)).rejects.toThrow(Error);
    });
  });

  // describe('getUsers', () => {
  //   describe('when getUsers is called', () => {
  //     let users: UserResponseDto[];
  //     beforeEach(async () => {
  //       users = await usersController.getUsers({});
  //     });

  //     test('then it should call usersService.getUsers', () => {
  //       expect(usersService.getUsers).toHaveBeenCalledWith({});
  //     });

  //     test('then it should return a list of users', () => {
  //       expect(users).toEqual([userStub()]);
  //     });
  //   });
  // });

  // describe('createUser', () => {
  //   test('should return a new user for successful creation ', async () => {
  //     expect(await usersController.createUser(createUserDtoStub())).toEqual(
  //       userStub(),
  //     );
  //   });
  //   test('should return an error response when creation fails', () => {
  //     const errorMessage = 'User already exists';
  //     usersService.createUser = jest
  //       .fn()
  //       .mockRejectedValue(new Error(errorMessage));
  //     expect(usersController.createUser(createUserDtoStub())).rejects.toThrow(
  //       errorMessage,
  //     );
  //   });
  // });

  // describe('updateUser', () => {
  //   const updateUserDto = { username: 'newUsername' };
  //   const updatedUser = { ...userStub(), ...updateUserDto };
  //   test('should return the updated user', async () => {
  //     usersService.updateUser = jest.fn().mockResolvedValue(updatedUser);
  //     expect(
  //       await usersController.updateUser(
  //         userStub().userId.toString(),
  //         updateUserDto,
  //         userStub(),
  //       ),
  //     ).toEqual(updatedUser);
  //     expect(usersService.updateUser).toHaveBeenCalledWith(
  //       userStub().userId.toString(),
  //       updateUserDto,
  //       userStub(),
  //     );
  //   });
  //   it('should handle errors when updating a user fails', async () => {
  //     const errorMessage = 'User not found';
  //     usersService.updateUser.mockRejectedValue(new Error(errorMessage));

  //     // Assuming your controller is set up to catch errors and format them appropriately
  //     await expect(
  //       usersController.updateUser('invalidUserId', updateUserDto, userStub()),
  //     ).rejects.toThrow(errorMessage);

  //     expect(usersService.updateUser).toHaveBeenCalledWith(
  //       'invalidUserId',
  //       updateUserDto,
  //     );
  //   });
  // });
});
