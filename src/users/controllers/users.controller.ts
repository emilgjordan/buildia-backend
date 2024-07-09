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
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/input/create-user.dto';
import { User } from '../interfaces/user.interface';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
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
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  @Get(':userId')
  async getUser(
    @Param('userId') userId: string,
    @Query('populate') populate: string,
  ): Promise<UserResponseDto> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }
    const shouldPopulate = populate === 'true';
    const user: User = await this.usersService.getUserById(
      userId,
      shouldPopulate,
    );
    return this.usersService.toUserResponseDto(user);
  }

  @Get()
  async getUsers(
    @Body() userFilterQuery: GetUsersFilterDto,
    @Query('populate') populate: string,
  ): Promise<UserResponseDto[]> {
    const shouldPopulate = populate === 'true';
    const users: User[] = await this.usersService.getUsers(
      userFilterQuery,
      shouldPopulate,
    );
    return users.map((user) => this.usersService.toUserResponseDto(user));
  }

  @Post()
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @Query('populate') populate: string,
  ): Promise<CreateUserResponseDto> {
    const shouldPopulate = populate === 'true';
    const user: User = await this.usersService.createUser(
      createUserDto,
      shouldPopulate,
    );
    const loginResponse = await this.authService.login(user);

    return {
      user: this.usersService.toUserResponseDto(user),
      accessToken: loginResponse.access_token,
    };
  }
  @Patch(':userId')
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @Param('userId') targetUserId: string,
    @Query('populate') populate: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: User,
  ): Promise<UserResponseDto> {
    if (!Types.ObjectId.isValid(targetUserId)) {
      throw new BadRequestException('Invalid user ID');
    }
    const shouldPopulate = populate === 'true';
    const updatedUser: User = await this.usersService.updateUser(
      targetUserId,
      updateUserDto,
      shouldPopulate,
      currentUser.userId,
    );
    return this.usersService.toUserResponseDto(updatedUser);
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
