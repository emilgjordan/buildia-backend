import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserInput } from '../dto/input/create-user.input';
import { UsersRepository } from '../repositories/users.repository';
import { FilterQuery } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private userRepository: UsersRepository) {}

  private transformToUser(userDocument: UserDocument): User {
    const { _id, __v, ...user } = userDocument.toObject();
    return { ...user, userId: _id.toString() };
  }

  async getUserById(userId: string): Promise<User> {
    return this.userRepository
      .findOne({ _id: userId })
      .then((userDocument) =>
        userDocument ? this.transformToUser(userDocument) : null,
      );
  }

  async getUserByUsername(username: string): Promise<User> {
    return this.userRepository
      .findOne({
        username: username,
      })
      .then((userDocument) =>
        userDocument ? this.transformToUser(userDocument) : null,
      );
  }

  async getUserByEmail(email: string): Promise<User> {
    return this.userRepository
      .findOne({
        email: email,
      })
      .then((userDocument) =>
        userDocument ? this.transformToUser(userDocument) : null,
      );
  }

  async getUsers(userFilterQuery: FilterQuery<User>): Promise<User[]> {
    return this.userRepository
      .findMany(userFilterQuery)
      .then((userDocuments) =>
        userDocuments.map((userDocument) => this.transformToUser(userDocument)),
      );
  }

  async createUser(createUserDto: CreateUserInput): Promise<User> {
    const { username, email } = createUserDto;
    const userExists = await this.userRepository.findOne({
      $or: [{ username: username }, { email: email }],
    });
    if (userExists) {
      throw new Error('Username or email already exists');
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      saltRounds,
    );

    const { password, ...userDetails } = createUserDto;
    const newUser = {
      ...userDetails,
      hashedPassword: hashedPassword,
    };

    return this.userRepository
      .create(newUser)
      .then((createdUserDocument) => this.transformToUser(createdUserDocument));
  }

  async updateUser(
    currentUserId: string,
    targetUserId: string,
    updateUserDto: Partial<User>,
  ): Promise<User> {
    const userExists = await this.userRepository.findOne({ _id: targetUserId });
    if (!userExists) {
      throw new Error('User does not exist');
    }
    if (targetUserId !== currentUserId) {
      throw new UnauthorizedException(
        'You do not have permission to perform this action.',
      );
    }
    return this.userRepository
      .updateOne({ _id: targetUserId }, updateUserDto)
      .then((updatedUserDoc) => this.transformToUser(updatedUserDoc));
  }

  async removeUser(
    currentUserId: string,
    targetUserId: string,
  ): Promise<{ message: string }> {
    if (targetUserId !== currentUserId) {
      throw new UnauthorizedException(
        'You do not have permission to perform this action.',
      );
    }
    const result = await this.userRepository.deleteOne({ _id: targetUserId });
    if (result.deletedCount === 0) {
      return { message: `User with ID '${targetUserId}' not found.` };
    }
    return {
      message: `User with ID '${targetUserId}' was deleted successfully.`,
    };
  }
}
