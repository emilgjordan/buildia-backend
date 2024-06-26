import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from '../models/user.model';
import { UsersService } from '../services/users.service';
import { UserFilterInput } from '../dto/input/user-filter.input';
import { CreateUserInput } from '../dto/input/create-user.input';
import { UpdateUserInput } from '../dto/input/update-user.input';
import { RemoveUserOutput } from '../dto/output/remove-user.output';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { UseGuards } from '@nestjs/common';
import { CreateUserOutput } from '../dto/output/create-user.output';
import { AuthService } from '../../auth/auth.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(
    private usersService: UsersService,
    private readonly authService: AuthService,
  ) {}
  @Query(() => User, { name: 'user' })
  async getUser(@Args('userId') userId: string): Promise<User> {
    return this.usersService.getUserById(userId);
  }
  @Query(() => [User], { name: 'users' })
  async getUsers(
    @Args('filter', { nullable: true }) filter?: UserFilterInput,
  ): Promise<User[]> {
    return this.usersService.getUsers(filter);
  }
  @Mutation(() => CreateUserOutput)
  async createUser(
    @Args('createUserData') createUserData: CreateUserInput,
  ): Promise<CreateUserOutput> {
    const user = await this.usersService.createUser(createUserData);
    const loginResponse = this.authService.login(user);
    return { user, accessToken: loginResponse.access_token };
  }
  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  async updateUser(
    @Args('userId') userId: string,
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
  ): Promise<User> {
    return this.usersService.updateUser(userId, updateUserInput);
  }
  @Mutation(() => RemoveUserOutput)
  @UseGuards(GqlAuthGuard)
  async removeUser(
    @Args('userId') userId: string,
  ): Promise<{ message: string }> {
    return this.usersService.removeUser(userId);
  }
}

// let newUser = {
//   firstName: 'Emil',
//   lastName: 'Jordan',
//   email: 'emiljordan@example.com',
//   username: 'emiljordan',
//   hashedPassword: 'password123',
//   bio: 'This is a test bio',
//   portfolioUrl: 'https://www.emiljordan.com',
//   skills: ['javascript', 'typescript', 'nodejs', 'nestjs'],
//   projects: ['project1', 'project2'],
//   isEmailVerified: false,
//   isPremium: false,
//   role: 'user',
//   createdAt: new Date(2006, 6, 23),
//   updatedAt: new Date(2024, 2, 20),
//   userId: 123123,
// };
// return newUser;
