import {
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
import { UserResponseDto } from '../dto/output/user-response.dto';
import { ProjectsService } from '../../projects/services/projects.service';
import { ConversionService } from '../../conversion/conversion.service';

@Injectable()
export class UsersService {
  constructor(
    private userRepository: UsersRepository,
    @Inject(forwardRef(() => ProjectsService))
    private projectsService: ProjectsService,
    private conversionService: ConversionService,
  ) {}

  async getUserById(userId: string, populate: boolean): Promise<User> {
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

  async getUserByUsername(username: string, populate: boolean): Promise<User> {
    const userDocument: UserDocument = await this.userRepository.findOne({
      username: username,
    });
    console.log(populate);
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

  async getUserByEmail(email: string, populate: boolean): Promise<User> {
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
    populate: boolean,
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
    populate: boolean,
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

    return populate
      ? this.conversionService.toEntity<UserDocument, User>(
          'User',
          await createdUserDocument.populate('projects'),
        )
      : this.conversionService.toEntity<UserDocument, User>(
          'User',
          createdUserDocument,
        );
  }

  async updateUser(
    targetUserId: string,
    updateUserDto: Partial<User>,
    populate: boolean,
    currentUserId: string,
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

    return populate
      ? this.conversionService.toEntity<UserDocument, User>(
          'User',
          await updatedUserDocument.populate('projects'),
        )
      : this.conversionService.toEntity<UserDocument, User>(
          'User',
          updatedUserDocument,
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
}
