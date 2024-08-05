import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { ProjectsModule } from '../projects/projects.module';
import { ConversionModule } from '../conversion/conversion.module';
import { LikeSchema } from './schemas/like.schema';
import { LikesController } from './controllers/likes.controller';
import { LikesRepository } from './repositories/likes.repository';
import { LikesService } from './services/likes.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Like', schema: LikeSchema }]),
    AuthModule,
    ProjectsModule,
    ConversionModule,
  ],
  providers: [LikesService, LikesRepository],
  controllers: [LikesController],
})
export class LikesModule {}
