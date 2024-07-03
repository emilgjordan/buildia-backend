import { Test } from '@nestjs/testing';
import { UsersServiceMock } from '../mocks/users.service.mock';
import { UsersService } from '../../services/users.service';
import { User } from '../../interfaces/user.interface';
import { createUserDtoStub, userStub } from '../stubs/user.stubs';
import { UsersController } from '../../controllers/users.controller';
import { UserResponseDto } from 'src/users/dto/user-response.dto';

describe('UsersController', () => {
  let usersService: UsersServiceMock;
  let usersController: UsersController;
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersController,
        {
          provide: UsersService,
          useClass: UsersServiceMock,
        },
      ],
    }).compile();

    usersService = moduleRef.get<UsersServiceMock>(UsersService);
    usersController = moduleRef.get<UsersController>(UsersController);

    jest.clearAllMocks();
  });

  describe('getUser', () => {
    describe('when getUser is called', () => {
      let user: UserResponseDto;
      beforeEach(async () => {
        user = await usersController.getUser(userStub().userId.toString());
      });

      test('then it should call usersService.getUserById', () => {
        expect(usersService.getUserById).toHaveBeenCalledWith(
          userStub().userId.toString(),
        );
      });

      test('then it should return a user', () => {
        expect(user).toEqual(userStub());
      });
    });
  });

  describe('getUsers', () => {
    describe('when getUsers is called', () => {
      let users: UserResponseDto[];
      beforeEach(async () => {
        users = await usersController.getUsers({});
      });

      test('then it should call usersService.getUsers', () => {
        expect(usersService.getUsers).toHaveBeenCalledWith({});
      });

      test('then it should return a list of users', () => {
        expect(users).toEqual([userStub()]);
      });
    });
  });

  describe('createUser', () => {
    test('should return a new user for successful creation ', async () => {
      expect(await usersController.createUser(createUserDtoStub())).toEqual(
        userStub(),
      );
    });
    test('should return an error response when creation fails', () => {
      const errorMessage = 'User already exists';
      usersService.createUser = jest
        .fn()
        .mockRejectedValue(new Error(errorMessage));
      expect(usersController.createUser(createUserDtoStub())).rejects.toThrow(
        errorMessage,
      );
    });
  });

  describe('updateUser', () => {
    const updateUserDto = { username: 'newUsername' };
    const updatedUser = { ...userStub(), ...updateUserDto };
    test('should return the updated user', async () => {
      usersService.updateUser = jest.fn().mockResolvedValue(updatedUser);
      expect(
        await usersController.updateUser(
          userStub().userId.toString(),
          updateUserDto,
          userStub(),
        ),
      ).toEqual(updatedUser);
      expect(usersService.updateUser).toHaveBeenCalledWith(
        userStub().userId.toString(),
        updateUserDto,
        userStub(),
      );
    });
    it('should handle errors when updating a user fails', async () => {
      const errorMessage = 'User not found';
      usersService.updateUser.mockRejectedValue(new Error(errorMessage));

      // Assuming your controller is set up to catch errors and format them appropriately
      await expect(
        usersController.updateUser('invalidUserId', updateUserDto, userStub()),
      ).rejects.toThrow(errorMessage);

      expect(usersService.updateUser).toHaveBeenCalledWith(
        'invalidUserId',
        updateUserDto,
      );
    });
  });
});
