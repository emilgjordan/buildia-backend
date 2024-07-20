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

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

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
    return this.projectsService.toProjectResponseDto(project);
  }

  @Post(':projectId/join-request')
  @UseGuards(JwtAuthGuard)
  async requestToJoinProject(
    @Param('projectId') projectId: string,
    @CurrentUser() currentUser: User,
  ): Promise<{ message: string }> {
    if (!Types.ObjectId.isValid(projectId)) {
      throw new BadRequestException('Invalid project ID');
    }

    await this.projectsService.requestJoinProject(
      projectId,
      currentUser.userId,
    );
    return { message: 'Request sent' };
  }

  @Post(':projectId/approve-join-request')
  @UseGuards(JwtAuthGuard)
  async approveJoinRequest(
    @Param('projectId') projectId: string,
    @Body('userId') userId: string,
    @CurrentUser() currentUser: User,
  ) {
    if (!Types.ObjectId.isValid(projectId)) {
      throw new BadRequestException('Invalid project ID');
    }
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }
    await this.projectsService.approveJoinRequest(projectId, userId);
  }

  @Get()
  async getProjects(
    @Query('populate') populate: boolean,
  ): Promise<ProjectResponseDto[]> {
    console.log('requesting projects');
    const projects: Project[] = await this.projectsService.getProjects(
      {},
      populate,
    );
    return projects.map((project) =>
      this.projectsService.toProjectResponseDto(project),
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
    return this.projectsService.toProjectResponseDto(project);
  }
}
