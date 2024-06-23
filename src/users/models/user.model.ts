import { Field, ObjectType, Int } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field((type) => Int)
  userId: number;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  email: string;

  @Field()
  username: string;

  @Field()
  bio: string;

  @Field()
  portfolioUrl: string;

  @Field(() => [String])
  skills: string[];

  @Field(() => [String])
  projects: string[];

  @Field()
  isEmailVerified: boolean;

  @Field()
  isPremium: boolean;

  @Field()
  role: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
