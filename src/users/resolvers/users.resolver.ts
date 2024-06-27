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
import { UserDocument } from '../schemas/user.schema';
import { CurrentUser } from 'src/auth/current-user.decorator';

@Resolver(() => User)
export class UsersResolver {
  constructor(
    private usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  private transformToUser(userDocument: UserDocument): User {
    const { _id, __v, ...user } = userDocument.toObject();
    return { ...user, userId: _id.toString() };
  }
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
    @CurrentUser() currentUser: User,
  ): Promise<User> {
    return this.usersService.updateUser(
      currentUser.userId,
      userId,
      updateUserInput,
    );
  }
  @Mutation(() => RemoveUserOutput)
  @UseGuards(GqlAuthGuard)
  async removeUser(
    @Args('userId') userId: string,
    @CurrentUser() currentUser: User,
  ): Promise<{ message: string }> {
    return this.usersService.removeUser(currentUser.userId, userId);
  }
}
