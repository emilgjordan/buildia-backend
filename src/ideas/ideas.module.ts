import { Module } from '@nestjs/common';
import { IdeasController } from './controllers/ideas.controller';
import { IdeasService } from './services/ideas.service';
import { IdeasRepository } from './repositories/ideas.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { IdeaSchema } from './schemas/idea.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Idea', schema: IdeaSchema }]),
    AuthModule,
  ],
  controllers: [IdeasController],
  providers: [IdeasService, IdeasRepository],
})
export class IdeasModule {}
