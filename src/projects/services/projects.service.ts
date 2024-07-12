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

@Injectable()
export class ProjectsService {
  constructor(
    private readonly projectsRepository: ProjectsRepository,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => ChatGateway))
    private readonly chatGateway: ChatGateway,
  ) {}

  async requestJoinProject(
    projectId: string,
    currentUserId: string,
  ): Promise<void> {
    console.log(projectId);
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
      return this.toProject(await projectDocument.populate('creator users'));
    }
    return this.toProject(projectDocument);
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
          const populatedProject =
            await projectDocument.populate('creator users');
          return this.toProject(populatedProject);
        }),
      );
    } else {
      return projectDocuments.map((projectDocument) =>
        this.toProject(projectDocument),
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
      ? this.toProject(await projectDocument.populate('creator', 'users'))
      : this.toProject(projectDocument);
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
      return this.toProject(
        await updatedProjectDocument.populate('creator', 'users'),
      );
    }
    return this.toProject(updatedProjectDocument);
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

  toProjectResponseDto(project: Project): ProjectResponseDto {
    //exclude sensitive data from response

    return project;
  }

  toProject(projectDocument: ProjectDocument): Project {
    const { _id, __v, creator, users, ...project } = projectDocument.toObject();
    let creatorNew;
    let usersNew;

    if (projectDocument.creator instanceof Types.ObjectId) {
      creatorNew = projectDocument.creator.toString();
    } else if (typeof projectDocument.creator === 'object') {
      creatorNew = this.usersService.toUser(projectDocument.creator);
    } else {
      throw new InternalServerErrorException(
        'Invalid project document creator data',
      );
    }

    if (projectDocument.users.length === 0) {
      usersNew = [];
    } else if (
      projectDocument.users.every((user) => user instanceof Types.ObjectId)
    ) {
      usersNew = projectDocument.users.map((user) => user.toString());
    } else if (
      projectDocument.users.every((user) => typeof user === 'object')
    ) {
      usersNew = projectDocument.users.map((user) =>
        this.usersService.toUser(user),
      );
    } else {
      throw new InternalServerErrorException(
        'Invalid project document users data',
      );
    }

    return {
      ...project,
      projectId: _id.toString(),
      creator: creatorNew,
      users: usersNew,
    };
  }
}
