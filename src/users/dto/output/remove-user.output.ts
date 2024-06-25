import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class RemoveUserOutput {
  @Field()
  message: string;
}
