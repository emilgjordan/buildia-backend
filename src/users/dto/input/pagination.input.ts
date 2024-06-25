import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class PaginationInput {
  @Field()
  skip: number;

  @Field()
  take: number;
}
