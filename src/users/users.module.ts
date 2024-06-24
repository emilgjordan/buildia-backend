import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './schemas/user.schema';
import { UsersRepository } from './users.repository';
import { UsersResolver } from './users.resolver';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'User', schema: UserSchema }])],
  providers: [UsersService, UsersRepository, UsersResolver],
})
export class UsersModule {}
