import { Test, TestingModule } from '@nestjs/testing';
import { UsersRepositoryMock } from '../mocks/users.repository.mock';
import { UsersRepository } from '../../repository/users.repository';
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

  describe('findOneById', () => {
    describe('when findOneById is called', () => {
      let user: unknown;
      beforeEach(async () => {
        user = await usersService.findOneById(userStub()._id.toString());
      });

      test('then it should call the usersRepository', () => {
        expect(usersRepository.findOne).toHaveBeenCalledWith(
          userStub()._id.toString(),
        );
      });

      test('then it should return a user', () => {
        expect(user).toEqual(userStub());
        expect(user).toBeInstanceOf(User);
      });
    });
  });
});
