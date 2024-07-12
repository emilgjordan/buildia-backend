import { Module, forwardRef } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ProjectsModule } from '../projects/projects.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule, forwardRef(() => ProjectsModule)],
  providers: [ChatGateway],
  exports: [ChatGateway],
})
export class ChatModule {}
