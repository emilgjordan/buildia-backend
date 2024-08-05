import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ProjectsModule } from './projects/projects.module';
import * as Joi from 'joi';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import { ChatModule } from './chat/chat.module';
import { WsExceptionsFilter } from './common/filters/ws-exceptions.filter';
import { JwtExceptionFilter } from './common/filters/jwt-exceptions.filter';
import { MessagesModule } from './messages/messages.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConversionModule } from './conversion/conversion.module';
import { LikesModule } from './likes/likes.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV || 'development'}.env`,
      isGlobal: true,
      cache: true,
      load: [databaseConfig, jwtConfig],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(3000),
        MONGO_CONNECTION_URI: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
      }),
    }),
    EventEmitterModule.forRoot({ wildcard: true, delimiter: '.' }),
    UsersModule,
    DatabaseModule,
    AuthModule,
    ProjectsModule,
    ChatModule,
    MessagesModule,
    LikesModule,
    ConversionModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: JwtExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: WsExceptionsFilter,
    },
  ],
})
export class AppModule {}
