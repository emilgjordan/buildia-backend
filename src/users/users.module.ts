import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './schemas/user.schema';
import { UsersRepository } from './repositories/users.repository';
import { AuthModule } from './../auth/auth.module';
import { UsersController } from './controllers/users.controller';
import { ProjectsModule } from 'src/projects/projects.module';
import { ConversionModule } from 'src/conversion/conversion.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    forwardRef(() => AuthModule),
    ConversionModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
