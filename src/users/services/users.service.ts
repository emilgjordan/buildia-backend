import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersRepository } from '../repositories/users.repository';
import { FilterQuery } from 'mongoose';
import { UserDocument } from '../schemas/user.schema';
import { User } from '../interfaces/user.interface';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from '../dto/input/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private userRepository: UsersRepository) {}

  private transformToUser(userDocument: UserDocument): User {
    const { _id, __v, ...user } = userDocument.toObject();
    return { ...user, userId: _id.toString() };
  }

  async getUserById(userId: string): Promise<User> {
    const userDocument: UserDocument = await this.userRepository.findOne({
      _id: userId,
    });
    if (!userDocument) {
      throw new NotFoundException('User not found');
    }
    return this.transformToUser(userDocument);
  }

  async getUserByUsername(username: string): Promise<User> {
    const userDocument: UserDocument = await this.userRepository.findOne({
      username: username,
    });
    if (!userDocument) {
      throw new NotFoundException('User not found');
    }
    return this.transformToUser(userDocument);
  }

  async getUserByEmail(email: string): Promise<User> {
    const userDocument: UserDocument = await this.userRepository.findOne({
      email: email,
    });
    if (!userDocument) {
      throw new NotFoundException('User not found');
    }
    return this.transformToUser(userDocument);
  }

  async getUsers(userFilterQuery: FilterQuery<User>): Promise<User[]> {
    const userDocuments: UserDocument[] =
      await this.userRepository.findMany(userFilterQuery);
    return userDocuments.map((userDocument) =>
      this.transformToUser(userDocument),
    );
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { username, email } = createUserDto;
    const userExists = await this.userRepository.findOne({
      $or: [{ username: username }, { email: email }],
    });
    console.log(userExists);
    if (userExists) {
      throw new ConflictException('Username or email already exists');
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

    const createdUserDocument: UserDocument =
      await this.userRepository.create(newUser);
    return this.transformToUser(createdUserDocument);
  }

  async updateUser(
    currentUserId: string,
    targetUserId: string,
    updateUserDto: Partial<User>,
  ): Promise<User> {
    const userExists = await this.userRepository.findOne({ _id: targetUserId });
    if (!userExists) {
      throw new NotFoundException('User not found');
    }
    if (targetUserId !== currentUserId) {
      throw new UnauthorizedException(
        'You do not have permission to perform this action',
      );
    }
    const updatedUserDocument: UserDocument =
      await this.userRepository.updateOne({ _id: targetUserId }, updateUserDto);
    return this.transformToUser(updatedUserDocument);
  }

  async removeUser(
    targetUserId: string,
    currentUserId: string,
  ): Promise<{ message: string }> {
    if (targetUserId !== currentUserId) {
      throw new UnauthorizedException(
        'You do not have permission to perform this action',
      );
    }
    const result = await this.userRepository.deleteOne({ _id: targetUserId });
    if (result.deletedCount === 0) {
      throw new NotFoundException(`User with ID '${targetUserId}' not found.`);
    }
    return {
      message: `User with ID '${targetUserId}' was deleted successfully.`,
    };
  }
}
