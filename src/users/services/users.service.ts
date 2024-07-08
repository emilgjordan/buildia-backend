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

@Injectable()
export class UsersService {
  constructor(
    private userRepository: UsersRepository,
    @Inject(forwardRef(() => ProjectsService))
    private projectsService: ProjectsService,
  ) {}

  async getUserById(userId: string, populate: boolean): Promise<User> {
    const userDocument: UserDocument = await this.userRepository.findOne({
      _id: userId,
    });
    if (!userDocument) {
      throw new NotFoundException('User not found');
    }
    return this.toUser(userDocument);
  }

  async getUserByUsername(username: string, populate: boolean): Promise<User> {
    const userDocument: UserDocument = await this.userRepository.findOne({
      username: username,
    });
    if (!userDocument) {
      throw new NotFoundException('User not found');
    }
    return this.toUser(userDocument);
  }

  async getUserByEmail(email: string, populate: boolean): Promise<User> {
    const userDocument: UserDocument = await this.userRepository.findOne({
      email: email,
    });
    if (!userDocument) {
      throw new NotFoundException('User not found');
    }
    return this.toUser(userDocument);
  }

  async getUsers(
    userFilterQuery: FilterQuery<User>,
    populate: boolean,
  ): Promise<User[]> {
    const userDocuments: UserDocument[] =
      await this.userRepository.findMany(userFilterQuery);
    return userDocuments.map((userDocument) => this.toUser(userDocument));
  }

  async createUser(
    createUserDto: CreateUserDto,
    populate: boolean,
  ): Promise<User> {
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
    return this.toUser(createdUserDocument);
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
    return this.toUser(updatedUserDocument);
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

  toUserResponseDto(user: User): UserResponseDto {
    //exclude sensitive data from response
    const { hashedPassword, ...userResponseDto } = user;
    return userResponseDto;
  }

  toUser(userDocument: UserDocument): User {
    const { _id, projects, __v, ...user } = userDocument.toObject();
    let projectsNew;

    if (userDocument.projects.length === 0) {
      projectsNew = [];
    } else if (
      userDocument.projects.every(
        (project) => project instanceof Types.ObjectId,
      )
    ) {
      projectsNew = userDocument.projects.map((project) => project.toString());
    } else if (
      userDocument.projects.every((project) => typeof project === 'object')
    ) {
      projectsNew = userDocument.projects.map((project) =>
        this.projectsService.toProject(project),
      );
    } else {
      throw new InternalServerErrorException('Invalid user projects data');
    }

    return {
      ...user,
      userId: _id.toString(),
      projects: projectsNew,
    };
  }
}
