import { ArgsType, Field } from '@nestjs/graphql';
import { PaginationInput } from '../input/pagination.input';
import { UserFilterInput } from '../input/user-filter.input';

@ArgsType()
export class GetUsersArgs {
  @Field({ nullable: true })
  filter?: UserFilterInput;

  @Field({ nullable: true })
  pagination?: PaginationInput;
}
