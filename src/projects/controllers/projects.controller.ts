import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { ProjectsService } from '../services/projects.service';
import { ProjectResponseDto } from '../dto/output/project-response.dto';
import { Types } from 'mongoose';
import { Project } from '../interfaces/project.interface';

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
}
