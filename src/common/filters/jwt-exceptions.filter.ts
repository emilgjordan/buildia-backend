import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { TokenExpiredError } from 'jsonwebtoken';

@Catch(TokenExpiredError)
export class JwtExceptionFilter implements ExceptionFilter {
  catch(exception: TokenExpiredError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    response.status(HttpStatus.UNAUTHORIZED).json({
      statusCode: HttpStatus.UNAUTHORIZED,
      timestamp: new Date().toISOString(),
      message:
        'JWT token has expired, please login again or refresh the token.',
    });
  }
}
