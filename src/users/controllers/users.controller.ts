import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/input/create-user.input';
import { User, UserDocument } from '../schemas/user.schema';
import { FilterQuery } from 'mongoose';
// import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':userId')
  getUser(@Param('userId') userId: string): Promise<User> {
    return this.usersService.getUserById(userId);
  }
  @Get()
  async getUsers(
    @Body() userFilterQuery: FilterQuery<UserDocument>,
  ): Promise<User[]> {
    return this.usersService.getUsers(userFilterQuery);
  }

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.createUser(createUserDto);
  }

  @Patch(':userId')
  async updateUser(
    @Param('userId') targetUserId: string,
    @Body() updateUserDto: Partial<User>,
  ): Promise<User> {
    return this.usersService.updateUser(targetUserId, updateUserDto);
  }

  @Delete(':userId')
  async removeUser(
    @Param('userId') targetUserId: string,
  ): Promise<{ message: string }> {
    return this.usersService.removeUser(targetUserId);
  }
}
