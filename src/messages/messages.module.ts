import { Module } from '@nestjs/common';
import { MessagesService } from './services/messages.service';
import { MessagesController } from './controllers/messages.controller';

@Module({
  providers: [MessagesService],
  controllers: [MessagesController],
})
export class MessagesModule {}
