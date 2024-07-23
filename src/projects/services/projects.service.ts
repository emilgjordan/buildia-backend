import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { Project } from '../interfaces/project.interface';
import { ProjectResponseDto } from '../dto/output/project-response.dto';
import {
  ProjectDocument,
  ProjectSchemaDefinition,
} from '../schemas/project.schema';
import { Types } from 'mongoose';
import { UsersService } from '../../users/services/users.service';
import { ProjectsRepository } from '../repositories/projects.repository';
import { CreateProjectDto } from '../dto/input/create-project.dto';
import { UpdateProjectDto } from '../dto/input/update-project.dto';
import { ChatGateway } from 'src/chat/chat.gateway';
import { ConversionService } from '../../conversion/conversion.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly projectsRepository: ProjectsRepository,
    private readonly conversionService: ConversionService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async projectExists(projectId: string): Promise<boolean> {
    const projectDocument = await this.projectsRepository.findOne({
      _id: projectId,
    });
    return !!projectDocument;
  }

  async requestJoinProject(
    projectId: string,
    currentUserId: string,
  ): Promise<void> {
    const projectDocument = await this.projectsRepository.findOne({
      _id: projectId,
    });
    if (!projectDocument) {
      throw new NotFoundException('Project not found');
    }
    if (
      projectDocument.users
        .map((user) => user.toString())
        .includes(currentUserId)
    ) {
      throw new ConflictException('User is already a member of this project');
    }

    if (
      projectDocument.joinRequests
        .map((user) => user.toString())
        .includes(currentUserId)
    ) {
      throw new ConflictException('User has already requested to join');
    }
    await this.projectsRepository.updateOne(
      { _id: projectId },
      { $push: { joinRequests: new Types.ObjectId(currentUserId) } },
    );

    this.eventEmitter.emit('project.joinRequest', {
      currentUserId,
      projectId,
    });
  }

  async approveJoinRequest(projectId: string, userId: string): Promise<void> {
    const projectDocument = await this.projectsRepository.findOne({
      _id: projectId,
    });
    if (!projectDocument) {
      throw new NotFoundException('Project not found');
    }

    if (
      !projectDocument.joinRequests
        .map((user) => user.toString())
        .includes(userId)
    ) {
      throw new ConflictException(
        'User has not requested to join this project',
      );
    }
    await this.projectsRepository.updateOne(
      { _id: projectId },
      {
        $pull: { joinRequests: new Types.ObjectId(userId) },
        $push: { users: new Types.ObjectId(userId) },
      },
    );
    this.eventEmitter.emit('project.userJoined', { userId, projectId });
  }

  async userInProject(userId: string, projectId: string): Promise<boolean> {
    const projectDocument = await this.projectsRepository.findOne({
      _id: projectId,
    });
    if (!projectDocument) {
      throw new InternalServerErrorException(
        `Project with ID ${projectId} was not found during user check.`,
      );
    }
    const userInProject = projectDocument.users
      .map((user) => user.toString())
      .includes(userId);
    return userInProject;
  }

  async getProjectById(projectId: string, populate: boolean): Promise<Project> {
    const projectDocument = await this.projectsRepository.findOne({
      _id: projectId,
    });
    if (!projectDocument) {
      throw new InternalServerErrorException('Project not found');
    }
    if (populate) {
      return this.conversionService.toEntity<ProjectDocument, Project>(
        'Project',
        await projectDocument.populate('creator users joinRequests'),
      );
    }
    return this.conversionService.toEntity<ProjectDocument, Project>(
      'Project',
      projectDocument,
    );
  }

  async getProjects(
    projectFilterQuery: any,
    populate: boolean,
  ): Promise<Project[]> {
    console.log('service: requesting projects');
    const projectDocuments =
      await this.projectsRepository.findMany(projectFilterQuery);
    if (populate) {
      return await Promise.all(
        projectDocuments.map(async (projectDocument) => {
          const populatedProject = await projectDocument.populate(
            'creator users joinRequests',
          );
          console.log(
            this.conversionService.toEntity<ProjectDocument, Project>(
              'Project',
              populatedProject,
            ),
          );
          return this.conversionService.toEntity<ProjectDocument, Project>(
            'Project',
            populatedProject,
          );
        }),
      );
    } else {
      return this.conversionService.toEntities<ProjectDocument, Project>(
        'Project',
        projectDocuments,
      );
    }
  }

  async createProject(
    createProjectDto: CreateProjectDto,
    populate: boolean,
    currentUserId: string,
  ): Promise<Project> {
    const creatorId = new Types.ObjectId(currentUserId);
    const newProject = {
      ...createProjectDto,
      creator: creatorId,
      users: [creatorId],
    };
    //TODO: Add validation for project creation limit
    const projectDocument = await this.projectsRepository.create(newProject);

    this.eventEmitter.emit('project.created', {
      creatorId: currentUserId,
      projectId: projectDocument._id,
    });

    return populate
      ? this.conversionService.toEntity<ProjectDocument, Project>(
          'Project',
          await projectDocument.populate('creator users joinRequests'),
        )
      : this.conversionService.toEntity<ProjectDocument, Project>(
          'Project',
          projectDocument,
        );
  }

  async updateProject(
    projectId: string,
    updateProjectDto: UpdateProjectDto,
    populate: boolean,
    currentUserId: string,
  ): Promise<Project> {
    const projectDocument = await this.projectsRepository.findOne({
      _id: projectId,
    });
    if (!projectDocument) {
      throw new NotFoundException('Project not found');
    }
    if (projectDocument.creator.toString() !== currentUserId) {
      throw new UnauthorizedException(
        'You are not the creator of this project',
      );
    }
    const updatedProjectDocument = await this.projectsRepository.updateOne(
      { _id: projectId },
      updateProjectDto,
    );
    if (populate) {
      return this.conversionService.toEntity<ProjectDocument, Project>(
        'Project',
        await updatedProjectDocument.populate('creator users joinRequests'),
      );
    }
    return this.conversionService.toEntity<ProjectDocument, Project>(
      'Project',
      updatedProjectDocument,
    );
  }

  async removeProject(
    projectId: string,
    currentUserId: string,
  ): Promise<{ message: string }> {
    const projectDocument = await this.projectsRepository.findOne({
      _id: projectId,
    });
    if (!projectDocument) {
      throw new NotFoundException('Project not found');
    }
    if (projectDocument.creator.toString() !== currentUserId) {
      throw new UnauthorizedException(
        'You are not the creator of this project',
      );
    }
    await this.projectsRepository.deleteOne({ _id: projectId });
    return { message: 'Project deleted successfully' };
  }
}
