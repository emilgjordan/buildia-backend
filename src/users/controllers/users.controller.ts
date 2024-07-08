import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/input/create-user.dto';
import { User } from '../interfaces/user.interface';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { UpdateUserDto } from '../dto/input/update-user.dto';
import { UserResponseDto } from '../dto/output/user-response.dto';
import { GetUsersFilterDto } from '../dto/input/get-users-filter.dto';
import { AuthService } from '../../auth/auth.service';
import { CreateUserResponseDto } from '../dto/output/create-user-response.dto';
import { Types } from 'mongoose';
import { IsMongoId } from 'class-validator';
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  private toUserResponseDto(user: User): UserResponseDto {
    //exclude sensitive data from response
    const { hashedPassword, ...userResponseDto } = user;
    return userResponseDto;
  }

  @Get(':userId')
  async getUser(@Param('userId') userId: string): Promise<UserResponseDto> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }
    const user: User = await this.usersService.getUserById(userId);
    return this.toUserResponseDto(user);
  }

  @Get()
  async getUsers(
    @Body() userFilterQuery: GetUsersFilterDto,
  ): Promise<UserResponseDto[]> {
    const users: User[] = await this.usersService.getUsers(userFilterQuery);
    return users.map((user) => this.toUserResponseDto(user));
  }

  @Post()
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<CreateUserResponseDto> {
    const user: User = await this.usersService.createUser(createUserDto);
    const loginResponse = await this.authService.login(user);

    return {
      user: this.toUserResponseDto(user),
      accessToken: loginResponse.access_token,
    };
  }
  @Patch(':userId')
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @Param('userId') targetUserId: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: User,
  ): Promise<UserResponseDto> {
    if (!Types.ObjectId.isValid(targetUserId)) {
      throw new BadRequestException('Invalid user ID');
    }
    const updatedUser: User = await this.usersService.updateUser(
      currentUser.userId,
      targetUserId,
      updateUserDto,
    );
    return this.toUserResponseDto(updatedUser);
  }
  @Delete(':userId')
  @UseGuards(JwtAuthGuard)
  async removeUser(
    @Param('userId') targetUserId: string,
    @CurrentUser() currentUser: User,
  ): Promise<{ message: string }> {
    if (!Types.ObjectId.isValid(targetUserId)) {
      throw new BadRequestException('Invalid user ID');
    }
    return this.usersService.removeUser(currentUser.userId, targetUserId);
  }
}
