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
  Query,
  forwardRef,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/input/create-user.dto';
import { User } from '../interfaces/user.interface';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UpdateUserDto } from '../dto/input/update-user.dto';
import { UserResponseDto } from '../dto/output/user-response.dto';
import { GetUsersFilterDto } from '../dto/input/get-users-filter.dto';
import { AuthService } from '../../auth/services/auth.service';
import { CreateUserResponseDto } from '../dto/output/create-user-response.dto';
import { Types } from 'mongoose';
import { ConversionService } from '../../conversion/conversion.service';
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly conversionService: ConversionService,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(
    @CurrentUser() currentUser: User,
    @Query('populate') populate: boolean,
  ): Promise<UserResponseDto> {
    return this.usersService.getUserById(currentUser.userId, populate);
  }

  @Get()
  async getUser(
    @Query('userId') userId: string,
    @Query('username') username: string,
    @Query('populate') populate: boolean,
  ): Promise<UserResponseDto> {
    let user: User;
    if (userId) {
      user = await this.usersService.getUserById(userId, populate);
      if (!Types.ObjectId.isValid(userId)) {
        throw new BadRequestException('Invalid user ID');
      }
    } else if (username) {
      user = await this.usersService.getUserByUsername(username, populate);
    } else {
      throw new BadRequestException(
        'Either username or userId must be provided',
      );
    }
    return this.conversionService.toResponseDto<User, UserResponseDto>(
      'User',
      user,
    );
  }

  @Get()
  async getUsers(
    @Body() userFilterQuery: GetUsersFilterDto,
    @Query('populate') populate: boolean,
  ): Promise<UserResponseDto[]> {
    const users: User[] = await this.usersService.getUsers(
      userFilterQuery,
      populate,
    );
    return this.conversionService.toResponseDtos<User, UserResponseDto>(
      'User',
      users,
    );
  }

  @Patch(':userId')
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @Param('userId') targetUserId: string,
    @Query('populate') populate: boolean,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: User,
  ): Promise<UserResponseDto> {
    const updatedUser: User = await this.usersService.updateUser(
      targetUserId,
      updateUserDto,
      populate,
      currentUser.userId,
    );
    return this.conversionService.toResponseDto<User, UserResponseDto>(
      'User',
      updatedUser,
    );
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
