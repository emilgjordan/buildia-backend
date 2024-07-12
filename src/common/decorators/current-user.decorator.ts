import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from '../../users/interfaces/user.interface';

export const getCurrentUserByContext = (context: ExecutionContext): User => {
  if (context.getType() === 'http') {
    return context.switchToHttp().getRequest().user;
  } else if (context.getType() === 'ws') {
    return context.switchToWs().getClient().handshake.user;
  }
  const ctx = GqlExecutionContext.create(context);
  return ctx.getContext().req.user;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    getCurrentUserByContext(context),
);
