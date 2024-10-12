import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Post,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { LikesService } from '../services/likes.service';
import { CreateLikeDto } from '../dto/input/create-like.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from '../../users/interfaces/user.interface';
import { LikeResponseDto } from '../dto/output/like-response.dto';
import { ProjectsService } from 'src/projects/services/projects.service';
import { create } from 'domain';
import { Types } from 'mongoose';
import { Like } from '../interfaces/like.interface';
import { ConversionService } from '../../conversion/conversion.service';

@Controller('likes')
export class LikesController {
  constructor(
    private readonly likesService: LikesService,
    private readonly projectsService: ProjectsService,
    private readonly conversionService: ConversionService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createLike(
    @Body() createLikeDto: CreateLikeDto,
    @Query('populate') populate: boolean,
    @CurrentUser() currentUser: User,
  ) {
    if (!this.projectsService.projectExists(createLikeDto.projectId)) {
      throw new NotFoundException('Project not found');
    }

    const internalCreateLikeDto = {
      projectId: createLikeDto.projectId,
      userId: currentUser.userId,
    };

    return this.likesService.createLike(internalCreateLikeDto, populate);
  }

  @Delete(':likeId')
  @UseGuards(JwtAuthGuard)
  async removeLike(
    @Param('likeId') likeId: string,
    @CurrentUser() currentUser: User,
  ): Promise<{ message: string; likeId: string }> {
    if (!Types.ObjectId.isValid(likeId)) {
      throw new BadRequestException('Invalid like ID');
    }

    return this.likesService.removeLike(likeId, currentUser.userId);
  }

  @Get('count')
  async getLikeCount(@Query('projectId') projectId: string) {
    if (!projectId) {
      throw new BadRequestException('Must provide project ID');
    }
    if (!Types.ObjectId.isValid(projectId)) {
      throw new BadRequestException('Invalid project ID');
    }
    if (!this.projectsService.projectExists(projectId)) {
      throw new NotFoundException('Project not found');
    }

    const count = await this.likesService.getLikeCount(projectId);
    return { likeCount: count };
  }

  @Get()
  async getLikes(
    @Query('projectId') projectId: string,
    @Query('userId') userId: string,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('skip', ParseIntPipe) skip: number,
    @Query('populate', ParseBoolPipe) populate: boolean,
  ): Promise<LikeResponseDto[]> {
    if (!projectId) {
      throw new BadRequestException('Must provide project ID');
    }
    if (!Types.ObjectId.isValid(projectId)) {
      throw new BadRequestException('Invalid project ID');
    }
    if (!this.projectsService.projectExists(projectId)) {
      throw new NotFoundException('Project not found');
    }
    const likes: Like[] = await this.likesService.getLikes(
      projectId,
      userId,
      limit,
      skip,
      populate,
    );
    return this.conversionService.toResponseDtos<Like, LikeResponseDto>(
      'Like',
      likes,
    );
  }
}
