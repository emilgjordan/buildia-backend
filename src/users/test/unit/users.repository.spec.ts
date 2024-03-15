import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { UsersRepository } from '../../repository/users.repository';
import { User, UserDocument } from '../../schemas/user.schema';
import { UserModelMock } from '../mocks/user.model.mock';
import { FilterQuery } from 'mongoose';
import { userStub } from '../stubs/user.stubs';

describe('UsersRepository', () => {
  let usersRepository: UsersRepository;
  let userModel: typeof UserModelMock;
  let userFilterQuery: FilterQuery<UserDocument>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersRepository,
        {
          provide: getModelToken(User.name),
          useValue: UserModelMock,
        },
      ],
    }).compile();

    usersRepository = moduleRef.get<UsersRepository>(UsersRepository);
    userModel = moduleRef.get(getModelToken(User.name));
    userFilterQuery = { _id: userStub()._id };

    jest.clearAllMocks();
  });

  describe('findOne', () => {
    describe('when findOne is called', () => {
      let user: User;
      beforeEach(async () => {
        user = await usersRepository.findOne(userFilterQuery);
      });

      test('then it should call the userModel', () => {
        expect(userModel.findOne).toHaveBeenCalledWith(userFilterQuery);
      });

      test('then it should return a user', () => {
        expect(user).toEqual(userStub());
      });
    });
  });

  describe('findMany', () => {
    describe('when findMany is called', () => {
      let users: User[];

      beforeEach(async () => {
        users = await usersRepository.findMany(userFilterQuery);
      });

      test('then it should call the userModel', () => {
        expect(userModel.find).toHaveBeenCalledWith(userFilterQuery);
      });

      test('then it should return a user', () => {
        expect(users).toEqual([userStub()]);
      });
    });
  });

  describe('create', () => {
    describe('when create is called', () => {
      let user: User;
      let saveSpy: jest.SpyInstance;
      let constructorSpy: jest.SpyInstance;

      beforeEach(async () => {
        saveSpy = jest.spyOn(userModel.prototype, 'save');
        constructorSpy = jest.spyOn(userModel.prototype, 'constructorSpy');

        user = await usersRepository.create(userStub());
      });

      test('then it should call the userModel', () => {
        expect(saveSpy).toHaveBeenCalled();
        expect(constructorSpy).toHaveBeenCalledWith(userStub());
      });

      test('then it should return a user', () => {
        expect(user).toEqual(userStub());
      });
    });
  });

  describe('updateOne', () => {
    describe('when updateOne is called', () => {
      let user: User;

      beforeEach(async () => {
        user = await usersRepository.updateOne(userFilterQuery, userStub());
      });

      test('then it should call the userModel', () => {
        expect(userModel.findOneAndUpdate).toHaveBeenCalledWith(
          userFilterQuery,
          userStub(),
          { new: true },
        );
      });

      test('then it should return a user', () => {
        expect(user).toEqual(userStub());
      });
    });
  });

  describe('deleteOne', () => {
    describe('when deleteOne is called', () => {
      let result: { deletedCount?: number };

      beforeEach(async () => {
        result = await usersRepository.deleteOne(userFilterQuery);
      });

      test('then it should call the userModel', () => {
        expect(userModel.deleteOne).toHaveBeenCalledWith(userFilterQuery);
      });

      test('then it should return a user', () => {
        expect(result).toEqual({ deletedCount: 1 });
      });
    });
  });
});
