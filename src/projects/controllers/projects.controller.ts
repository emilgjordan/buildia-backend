import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from '../services/projects.service';
import { ProjectResponseDto } from '../dto/output/project-response.dto';
import { Types } from 'mongoose';
import { Project } from '../interfaces/project.interface';
import { CreateProjectDto } from '../dto/input/create-project.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from 'src/users/interfaces/user.interface';
import { ConversionService } from 'src/conversion/conversion.service';
import { UsersService } from '../../users/services/users.service';

@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly conversionService: ConversionService,
    private readonly usersService: UsersService,
  ) {}

  @Get(':projectId')
  async getProjectById(
    @Param('projectId') projectId: string,
    @Query('populate') populate: boolean,
  ): Promise<ProjectResponseDto> {
    if (!Types.ObjectId.isValid(projectId)) {
      throw new BadRequestException('Invalid project ID');
    }
    const project: Project = await this.projectsService.getProjectById(
      projectId,
      populate,
    );
    return this.conversionService.toResponseDto<Project, ProjectResponseDto>(
      'Project',
      project,
    );
  }

  @Get()
  async getProjects(
    @Query('search') search: string,
    @Query('tags') tags: string,
    @Query('limit') limit: number,
    @Query('skip') skip: number,
    @Query('populate') populate: boolean,
  ): Promise<{ projects: ProjectResponseDto[]; total: number }> {
    if (limit < 0) {
      throw new BadRequestException('Limit must be a positive number');
    }

    if (skip < 0) {
      throw new BadRequestException('Skip must be a positive number');
    }

    const tagsArray = tags ? tags.split(',') : [];
    const result = await this.projectsService.getProjects(
      search,
      tagsArray,
      limit,
      skip,
      populate,
    );

    return {
      projects: this.conversionService.toResponseDtos<
        Project,
        ProjectResponseDto
      >('Project', result.projects),
      total: result.total,
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createProject(
    @Body() createProjectDto: CreateProjectDto,
    @Query('populate') populate: boolean,
    @CurrentUser() currentUser: User,
  ): Promise<ProjectResponseDto> {
    const project: Project = await this.projectsService.createProject(
      createProjectDto,
      populate,
      currentUser.userId,
    );
    return this.conversionService.toResponseDto<Project, ProjectResponseDto>(
      'Project',
      project,
    );
  }
}
