import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { UsersRepository } from '../repositories/users.repository';
import { FilterQuery, Types } from 'mongoose';
import { UserDocument } from '../schemas/user.schema';
import { User } from '../interfaces/user.interface';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from '../dto/input/create-user.dto';
import { ConversionService } from '../../conversion/conversion.service';
import { OnEvent } from '@nestjs/event-emitter';
import { UpdateUserDto } from '../dto/input/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private userRepository: UsersRepository,
    private conversionService: ConversionService,
  ) {}

  async getUserById(userId: string, populate: boolean = false): Promise<User> {
    const userDocument: UserDocument = await this.userRepository.findOne({
      _id: userId,
    });
    if (!userDocument) {
      throw new NotFoundException('User not found');
    }
    return populate
      ? this.conversionService.toEntity<UserDocument, User>(
          'User',
          await userDocument.populate('projects'),
        )
      : this.conversionService.toEntity<UserDocument, User>(
          'User',
          userDocument,
        );
  }

  async getUserByUsername(
    username: string,
    populate: boolean = false,
  ): Promise<User> {
    const userDocument: UserDocument = await this.userRepository.findOne({
      username: username,
    });
    if (!userDocument) {
      throw new NotFoundException('User not found');
    }
    return populate
      ? this.conversionService.toEntity<UserDocument, User>(
          'User',
          await userDocument.populate('projects'),
        )
      : this.conversionService.toEntity<UserDocument, User>(
          'User',
          userDocument,
        );
  }

  async getUserByEmail(
    email: string,
    populate: boolean = false,
  ): Promise<User> {
    const userDocument: UserDocument = await this.userRepository.findOne({
      email: email,
    });
    if (!userDocument) {
      throw new NotFoundException('User not found');
    }
    return populate
      ? this.conversionService.toEntity<UserDocument, User>(
          'User',
          await userDocument.populate('projects'),
        )
      : this.conversionService.toEntity<UserDocument, User>(
          'User',
          userDocument,
        );
  }

  async getUsers(
    userFilterQuery: FilterQuery<User>,
    populate: boolean = false,
  ): Promise<User[]> {
    const userDocuments: UserDocument[] =
      await this.userRepository.findMany(userFilterQuery);
    return populate
      ? Promise.all(
          userDocuments.map(async (userDocument) => {
            const populatedUser = await userDocument.populate('projects');
            return this.conversionService.toEntity<UserDocument, User>(
              'User',
              populatedUser,
            );
          }),
        )
      : this.conversionService.toEntities<UserDocument, User>(
          'User',
          userDocuments,
        );
  }

  async createUser(
    createUserDto: CreateUserDto,
    populate: boolean = false,
  ): Promise<User> {
    const { username, email } = createUserDto;
    const userExists = await this.userRepository.findOne({
      $or: [{ username: username }, { email: email }],
    });
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

    return this.conversionService.toEntity<UserDocument, User>(
      'User',
      populate
        ? await createdUserDocument.populate('projects')
        : createdUserDocument,
    );
  }

  async updateUser(
    targetUserId: string,
    updateUserDto: UpdateUserDto,
    populate: boolean = false,
    currentUserId: string,
  ): Promise<User> {
    if (!Types.ObjectId.isValid(targetUserId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.userRepository.findOne({ _id: targetUserId });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (targetUserId !== currentUserId) {
      throw new UnauthorizedException(
        'You do not have permission to perform this action',
      );
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const emailExists = await this.userRepository.findOne({
        email: updateUserDto.email,
      });
      if (emailExists) {
        throw new ConflictException('Email already exists');
      }
    }

    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const usernameExists = await this.userRepository.findOne({
        username: updateUserDto.username,
      });
      if (usernameExists) {
        throw new ConflictException('Username already exists');
      }
    }

    let newUser;
    if (updateUserDto.password) {
      const { password, ...rest } = updateUserDto;
      const saltRounds = 10;
      let newHashedPassword = await bcrypt.hash(password, saltRounds);
      newUser = { ...rest, hashedPassword: newHashedPassword };
    } else {
      newUser = updateUserDto;
    }

    const updatedUserDocument: UserDocument =
      await this.userRepository.updateOne({ _id: targetUserId }, newUser);

    return this.conversionService.toEntity<UserDocument, User>(
      'User',
      populate
        ? await updatedUserDocument.populate('projects')
        : updatedUserDocument,
    );
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

  addProjectToUser(userId: string, projectId: string): Promise<UserDocument> {
    return this.userRepository.updateOne(
      { _id: userId },
      { $push: { projects: projectId } },
    );
  }

  @OnEvent('project.userJoined')
  async handleProjectUserJoinedEvent(payload: {
    userId: string;
    projectId: string;
  }) {
    await this.addProjectToUser(payload.userId, payload.projectId);
  }

  @OnEvent('project.created')
  async handleProjectCreatedEvent(payload: {
    creatorId: string;
    projectId: string;
  }) {
    await this.addProjectToUser(payload.creatorId, payload.projectId);
  }
}
