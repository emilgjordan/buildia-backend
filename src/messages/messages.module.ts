import { Module, forwardRef } from '@nestjs/common';
import { MessagesService } from './services/messages.service';
import { MessagesController } from './controllers/messages.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageSchema } from './schemas/message.schema';
import { AuthModule } from '../auth/auth.module';
import { ProjectsModule } from '../projects/projects.module';
import { UsersModule } from 'src/users/users.module';
import { ConversionModule } from 'src/conversion/conversion.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Message', schema: MessageSchema }]),
    AuthModule,
    forwardRef(() => ProjectsModule),
    ConversionModule,
  ],
  providers: [MessagesService],
  controllers: [MessagesController],
})
export class MessagesModule {}
