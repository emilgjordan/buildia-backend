import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { UsersRepository } from '../../repositories/users.repository';
import { UserDocument } from '../../schemas/user.schema';
import { UserModelMock } from '../mocks/user.model.mock';
import { FilterQuery } from 'mongoose';
import { userStub } from '../stubs/user.stubs';
import { createUserStub } from '../stubs/create-user.stub';

describe('UsersRepository', () => {
  let usersRepository: UsersRepository;
  let userModel: typeof UserModelMock;
  let userFilterQuery: FilterQuery<UserDocument>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersRepository,
        {
          provide: getModelToken('User'),
          useValue: UserModelMock,
        },
      ],
    }).compile();

    usersRepository = moduleRef.get<UsersRepository>(UsersRepository);
    userModel = moduleRef.get(getModelToken('User'));
    userFilterQuery = { _id: userStub().userId };

    jest.clearAllMocks();
  });

  describe('findOne', () => {
    describe('when findOne is called', () => {
      let user: UserDocument;
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
      let users: UserDocument[];

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
      let user: UserDocument;
      let saveSpy: jest.SpyInstance;
      let constructorSpy: jest.SpyInstance;

      beforeEach(async () => {
        saveSpy = jest.spyOn(userModel.prototype, 'save');
        constructorSpy = jest.spyOn(userModel.prototype, 'constructorSpy');

        user = await usersRepository.create(createUserDtoStub());
      });

      test('then it should call the userModel', () => {
        expect(saveSpy).toHaveBeenCalled();
        expect(constructorSpy).toHaveBeenCalledWith(createUserDtoStub());
      });

      test('then it should return a user', () => {
        expect(user).toEqual(userStub());
      });
    });
  });

  describe('updateOne', () => {
    describe('when updateOne is called', () => {
      let user: UserDocument;

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
