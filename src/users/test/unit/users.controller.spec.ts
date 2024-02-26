// import { Test, TestingModule } from '@nestjs/testing';
// import { UsersController } from '../../controllers/users.controller';
// import { UsersService } from '../../services/users.service';
// import { updatedUserStub, userStub } from '../stubs/user.stubs';
// import { User } from 'src/users/schemas/user.schema';
// import { CreateUserDto } from '../../dto/create-user.dto';

// jest.mock('../../services/users.service');

// describe('UsersController', () => {
//   let usersController: UsersController;
//   let usersService: UsersService;

//   beforeEach(async () => {
//     const moduleRef = await Test.createTestingModule({
//       imports: [],
//       controllers: [UsersController],
//       providers: [UsersService],
//     }).compile();

//     usersController = moduleRef.get<UsersController>(UsersController);
//     usersService = moduleRef.get<UsersService>(UsersService);
//     jest.clearAllMocks();
//   });

//   describe('getUser', () => {
//     describe('when getUser is called', () => {
//       let user: User;
//       beforeEach(async () => {
//         user = await usersController.getUser(userStub()._id.toString());
//       });

//       test('then it should call userService', () => {
//         expect(usersService.findOneById).toHaveBeenCalledWith(
//           userStub()._id.toString(),
//         );
//       });

//       test('then it should return a user', () => {
//         expect(user).toEqual(userStub());
//       });
//     });
//   });

//   describe('getAllUsers', () => {
//     describe('when getAllUsers is called', () => {
//       let users: User[];
//       beforeEach(async () => {
//         users = await usersController.getAllUsers();
//       });

//       test('then it should call userService', () => {
//         expect(usersService.findAll).toHaveBeenCalled();
//       });

//       test('then it should return an array of users', () => {
//         expect(users).toEqual([userStub()]);
//       });
//     });
//   });

//   describe('createUser', () => {
//     describe('when create is called', () => {
//       let user: User;
//       let createUserDto: CreateUserDto;

//       beforeEach(async () => {
//         createUserDto = {
//           name: userStub().name,
//           email: userStub().email,
//           password: userStub().password,
//           username: userStub().username,
//         };
//         user = await usersController.createUser(createUserDto);
//       });

//       test('then it should call userService', () => {
//         expect(usersService.create).toHaveBeenCalledWith(createUserDto);
//       });

//       test('then it should return a user', () => {
//         expect(user).toEqual(userStub());
//       });
//     });
//   });

//   describe('updateUser', () => {
//     describe('when update is called', () => {
//       let user: User;
//       let updateUserDto: Partial<User>;
//       let targetUserId: string;

//       beforeEach(async () => {
//         targetUserId = userStub()._id.toString();
//         updateUserDto = {
//           name: 'Updated Name',
//         };
//         user = await usersController.updateUser(targetUserId, updateUserDto, {
//           user: { userId: targetUserId },
//         });
//       });

//       test('then it should call userService', () => {
//         expect(usersService.update).toHaveBeenCalledWith(
//           targetUserId,
//           updateUserDto,
//           targetUserId,
//         );
//       });

//       test('then it should return a user', () => {
//         expect(user).toEqual(updatedUserStub());
//       });
//     });
//   });

//   describe('removeUser', () => {
//     describe('when remove is called', () => {
//       let result: { message: string };
//       let targetUserId: string;

//       beforeEach(async () => {
//         targetUserId = userStub()._id.toString();
//         result = await usersController.removeUser(targetUserId, {
//           user: { userId: targetUserId },
//         });
//       });

//       test('then it should call userService', () => {
//         expect(usersService.remove).toHaveBeenCalledWith(
//           targetUserId,
//           targetUserId,
//         );
//       });

//       test('then it should return a message', () => {
//         expect(result).toEqual({ message: 'User was deleted successfully.' });
//       });
//     });
//   });
// });
