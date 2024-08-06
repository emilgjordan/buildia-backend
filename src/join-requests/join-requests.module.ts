import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { ProjectsModule } from '../projects/projects.module';
import { ConversionModule } from '../conversion/conversion.module';
import { JoinRequestSchema } from './schemas/join-request.schema';
import { JoinRequestsController } from './controllers/join-requests.controller';
import { JoinRequestsRepository } from './repositories/join-requests.repository';
import { JoinRequestsService } from './services/join-requests.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'JoinRequest', schema: JoinRequestSchema },
    ]),
    AuthModule,
    ProjectsModule,
    ConversionModule,
  ],
  providers: [JoinRequestsService, JoinRequestsRepository],
  controllers: [JoinRequestsController],
})
export class JoinRequestsModule {}
