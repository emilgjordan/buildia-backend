import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../users/interfaces/user.interface';

export const getCurrentUserByContext = (context: ExecutionContext): User => {
  if (context.getType() === 'http') {
    return context.switchToHttp().getRequest().user;
  } else if (context.getType() === 'ws') {
    return context.switchToWs().getClient().handshake.user;
  } else {
    throw new Error('Unsupported context type');
  }
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    getCurrentUserByContext(context),
);
