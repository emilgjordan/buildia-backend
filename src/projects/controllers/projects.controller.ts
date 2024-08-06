import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
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

@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly conversionService: ConversionService,
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
    @Query('populate') populate: boolean,
  ): Promise<ProjectResponseDto[]> {
    const projects: Project[] = await this.projectsService.getProjects(
      {},
      populate,
    );
    return this.conversionService.toResponseDtos<Project, ProjectResponseDto>(
      'Project',
      projects,
    );
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
