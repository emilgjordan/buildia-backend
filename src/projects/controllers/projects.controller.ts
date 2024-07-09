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
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from 'src/users/interfaces/user.interface';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get(':projectId')
  async getProjectById(
    @Param('projectId') projectId: string,
    @Query('populate') populate: string,
  ): Promise<ProjectResponseDto> {
    if (!Types.ObjectId.isValid(projectId)) {
      throw new BadRequestException('Invalid project ID');
    }
    const shouldPopulate = populate === 'true';
    const project: Project = await this.projectsService.getProjectById(
      projectId,
      shouldPopulate,
    );
    return this.projectsService.toProjectResponseDto(project);
  }

  @Get()
  async getProjects(
    @Query('populate') populate: string,
  ): Promise<ProjectResponseDto[]> {
    const shouldPopulate = populate === 'true';
    const projects: Project[] = await this.projectsService.getProjects(
      {},
      shouldPopulate,
    );
    return projects.map((project) =>
      this.projectsService.toProjectResponseDto(project),
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createProject(
    @Body() createProjectDto: CreateProjectDto,
    @Query('populate') populate: string,
    @CurrentUser() currentUser: User,
  ): Promise<ProjectResponseDto> {
    const shouldPopulate = populate === 'true';
    const project: Project = await this.projectsService.createProject(
      createProjectDto,
      shouldPopulate,
      currentUser.userId,
    );
    return this.projectsService.toProjectResponseDto(project);
  }
}
