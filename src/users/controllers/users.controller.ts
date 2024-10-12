import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  BadRequestException,
  Query,
  ParseBoolPipe,
  ParseIntPipe,
  ParseArrayPipe,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { User } from '../interfaces/user.interface';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UpdateUserDto } from '../dto/input/update-user.dto';
import { UserResponseDto } from '../dto/output/user-response.dto';
import { Types } from 'mongoose';
import { ConversionService } from '../../conversion/conversion.service';
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly conversionService: ConversionService,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(
    @CurrentUser() currentUser: User,
    @Query('populate', ParseBoolPipe) populate: boolean,
  ): Promise<UserResponseDto> {
    return this.usersService.getUserById(currentUser.userId, populate);
  }

  @Get(':userId')
  async getUser(
    @Param('userId') userId: string,
    @Query('populate') populate: boolean,
  ): Promise<UserResponseDto> {
    console.log(populate);
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.usersService.getUserById(userId, populate);

    return this.conversionService.toResponseDto<User, UserResponseDto>(
      'User',
      user,
    );
  }

  @Get()
  async getUsers(
    @Query('search') search: string,
    @Query('username') username: string,
    @Query('email') email: string,
    @Query('skills') skills: string[],
    @Query('limit') limit: number,
    @Query('skip') skip: number,
    @Query('populate') populate: boolean,
  ): Promise<UserResponseDto | { users: UserResponseDto[]; total: number }> {
    if (username) {
      const user = await this.usersService.getUserByUsername(username);
      return this.conversionService.toResponseDto<User, UserResponseDto>(
        'User',
        user,
      );
    }

    if (email) {
      const user = await this.usersService.getUserByEmail(email);
      return this.conversionService.toResponseDto<User, UserResponseDto>(
        'User',
        user,
      );
    }
    console.log(skip);
    if (skip < 0) {
      throw new BadRequestException('Skip must be a positive number');
    }

    const result = await this.usersService.getUsers(
      search,
      skills,
      limit,
      skip,
      populate,
    );

    return {
      users: this.conversionService.toResponseDtos<User, UserResponseDto>(
        'User',
        result.users,
      ),
      total: result.total,
    };
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
