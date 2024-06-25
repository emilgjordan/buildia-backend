import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from '../models/user.model';
import { UsersService } from '../services/users.service';
import { UserFilterInput } from '../dto/input/user-filter.input';
import { CreateUserInput } from '../dto/input/create-user.input';
import { UpdateUserInput } from '../dto/input/update-user.input';
import { RemoveUserOutput } from '../dto/output/remove-user.output';

@Resolver(() => User)
export class UsersResolver {
  constructor(private usersService: UsersService) {}
  @Query(() => User)
  async getUser(@Args('userId') userId: string): Promise<User> {
    return this.usersService.getUserById(userId);
  }
  @Query(() => [User])
  async getUsers(
    @Args('filter', { nullable: true }) filter?: UserFilterInput,
  ): Promise<User[]> {
    return this.usersService.getUsers(filter);
  }
  @Mutation(() => User)
  async createUser(
    @Args('createUserData') createUserData: CreateUserInput,
  ): Promise<User> {
    return this.usersService.createUser(createUserData);
  }
  @Mutation(() => User)
  async updateUser(
    @Args('userId') userId: string,
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
  ): Promise<User> {
    return this.usersService.updateUser(userId, updateUserInput);
  }
  @Mutation(() => RemoveUserOutput)
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
