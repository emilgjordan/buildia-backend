import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { LikesRepository } from '../repositories/likes.repository';
import { Like } from '../interfaces/like.interface';
import { LikeDocument } from '../schemas/like.schema';
import mongoose, { Types } from 'mongoose';
import { UsersService } from 'src/users/services/users.service';
import { ProjectsService } from 'src/projects/services/projects.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

import { ConversionService } from '../../conversion/conversion.service';
import { CreateLikeDto } from '../dto/input/create-like.dto';
import { OnEvent } from '@nestjs/event-emitter';
import { InternalCreateLikeDto } from '../dto/input/internal-create-like.dto';

@Injectable()
export class LikesService {
  constructor(
    private readonly likesRepository: LikesRepository,
    private readonly projectsService: ProjectsService,
    private readonly conversionService: ConversionService,
  ) {}

  async getLikesByProject(
    projectId: string,
    populate: boolean,
  ): Promise<Like[]> {
    const project = await this.projectsService.getProjectById(projectId, false);
    if (!project) {
      throw new InternalServerErrorException('Project not found');
    }
    const likeDocuments = await this.likesRepository.findMany({
      project: projectId,
    });
    if (populate) {
      return await Promise.all(
        likeDocuments.map(async (likeDocument) => {
          const populatedLike = await likeDocument.populate('project user');
          return this.conversionService.toEntity<LikeDocument, Like>(
            'Like',
            populatedLike,
          );
        }),
      );
    } else {
      return likeDocuments.map((likeDocument) =>
        this.conversionService.toEntity<LikeDocument, Like>(
          'Like',
          likeDocument,
        ),
      );
    }
  }

  async createLike(createLikeDto: InternalCreateLikeDto, populate: boolean) {
    const userId = new Types.ObjectId(createLikeDto.userId);
    const projectId = new Types.ObjectId(createLikeDto.projectId);

    const likeDocument = await this.likesRepository.create({
      user: userId,
      project: projectId,
    });

    //console.log(likeDocument);

    // const likeDocument = await this.likesRepository.create({
    //   user: userId,
    //   project: projectId,
    // });

    if (populate) {
      await likeDocument.populate('project user');
    }

    try {
      const like = this.conversionService.toEntity<LikeDocument, Like>(
        'Like',
        likeDocument,
      );
    } catch (error) {
      console.log(error);
    }
    const like = this.conversionService.toEntity<LikeDocument, Like>(
      'Like',
      likeDocument,
    );

    return this.conversionService.toEntity<LikeDocument, Like>(
      'Like',
      likeDocument,
    );
  }
}
