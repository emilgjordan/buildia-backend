import { Connection } from 'mongoose';
import { AppModule } from '../../../app.module';
import { DatabaseService } from '../../../database/database.service';
import { userStub } from '../stubs/user.stubs';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { CreateUserDto } from '../../dto/input/create-user.dto';
import { INestApplication } from '@nestjs/common';

describe('User Controller (e2e)', () => {
  let dbConnection: Connection;
  let httpServer: any;
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    dbConnection = moduleRef
      .get<DatabaseService>(DatabaseService)
      .getDbHandle();
    httpServer = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await dbConnection.collection('users').deleteMany({});
  });

  describe('getUsers', () => {
    test('should return an array of users', async () => {
      await dbConnection.collection('users').insertOne(userStub());
      const response = await request(httpServer).get('/user');

      const userStubInstance = userStub();
      const expectedUser = {
        ...userStubInstance,
        createdAt: userStubInstance.createdAt.toISOString(),
        updatedAt: userStubInstance.updatedAt.toISOString(),
      };

      expect(response.status).toBe(200);
      expect(response.body).toEqual([expectedUser]);
    });
  });

  describe('createUser', () => {
    test('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        firstName: userStub().firstName,
        lastName: userStub().lastName,
        email: userStub().email,
        password: userStub().hashedPassword,
        username: userStub().username,
      };
      const response = await request(httpServer)
        .post('/user')
        .send(createUserDto);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject(createUserDto);

      const user = await dbConnection
        .collection('users')
        .findOne({ email: createUserDto.email });
      expect(user).toMatchObject(createUserDto);
    });
  });
});
