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

@Injectable()
export class ProjectsService {
  constructor(
    private readonly projectsRepository: ProjectsRepository,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => ChatGateway))
    private readonly chatGateway: ChatGateway,
    private readonly conversionService: ConversionService,
  ) {}

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
      !projectDocument.joinRequests
        .map((user) => user.toString())
        .includes(currentUserId)
    ) {
      await this.projectsRepository.updateOne(
        { _id: projectId },
        { $push: { joinRequests: new Types.ObjectId(currentUserId) } },
      );
    }
    this.chatGateway.notifyJoinRequest(projectId, currentUserId);
  }

  async approveJoinRequest(projectId: string, userId: string): Promise<void> {
    const projectDocument = await this.projectsRepository.findOne({
      _id: projectId,
    });
    if (!projectDocument) {
      throw new NotFoundException('Project not found');
    }

    if (
      projectDocument.joinRequests
        .map((user) => user.toString())
        .includes(userId)
    ) {
      await this.projectsRepository.updateOne(
        { _id: projectId },
        {
          $pull: { joinRequests: new Types.ObjectId(userId) },
        },
      );

      await this.projectsRepository.updateOne(
        { _id: projectId },
        {
          $push: { users: new Types.ObjectId(userId) },
        },
      );

      this.usersService.addProjectToUser(userId, projectId);
    }
    this.chatGateway.notifyJoinApproval(projectId, userId);
  }

  async userInProject(userId: string, projectId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(projectId)) {
      throw new InternalServerErrorException('Invalid ID');
    }
    const projectDocument = await this.projectsRepository.findOne({
      _id: projectId,
    });
    if (!projectDocument) {
      throw new NotFoundException('Project not found');
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
    const projectDocuments =
      await this.projectsRepository.findMany(projectFilterQuery);
    if (populate) {
      return await Promise.all(
        projectDocuments.map(async (projectDocument) => {
          const populatedProject = await projectDocument.populate(
            'creator users joinRequests',
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
    const projectDocument = await this.projectsRepository.create(newProject);
    this.usersService.addProjectToUser(currentUserId, projectDocument._id);
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
