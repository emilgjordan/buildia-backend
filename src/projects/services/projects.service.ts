import {
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

@Injectable()
export class ProjectsService {
  constructor(
    private readonly projectsRepository: ProjectsRepository,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  async getProjectById(projectId: string, populate: boolean): Promise<Project> {
    const projectDocument = await this.projectsRepository.findOne({
      _id: projectId,
    });
    if (!projectDocument) {
      throw new InternalServerErrorException('Project not found');
    }
    if (populate) {
      return this.toProject(await projectDocument.populate('owner', 'users'));
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
            await projectDocument.populate('owner users');
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
    const ownerId = new Types.ObjectId(currentUserId);
    const newProject = {
      ...createProjectDto,
      owner: ownerId,
      users: [ownerId],
    };
    const projectDocument = await this.projectsRepository.create(newProject);
    this.usersService.addProjectToUser(currentUserId, projectDocument._id);
    return populate
      ? this.toProject(await projectDocument.populate('owner', 'users'))
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
    if (projectDocument.owner.toString() !== currentUserId) {
      throw new UnauthorizedException('You are not the owner of this project');
    }
    const updatedProjectDocument = await this.projectsRepository.updateOne(
      { _id: projectId },
      updateProjectDto,
    );
    if (populate) {
      return this.toProject(
        await updatedProjectDocument.populate('owner', 'users'),
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
    if (projectDocument.owner.toString() !== currentUserId) {
      throw new UnauthorizedException('You are not the owner of this project');
    }
    await this.projectsRepository.deleteOne({ _id: projectId });
    return { message: 'Project deleted successfully' };
  }

  toProjectResponseDto(project: Project): ProjectResponseDto {
    //exclude sensitive data from response

    return project;
  }

  toProject(projectDocument: ProjectDocument): Project {
    const { _id, __v, owner, users, ...project } = projectDocument.toObject();
    let ownerNew;
    let usersNew;

    if (projectDocument.owner instanceof Types.ObjectId) {
      ownerNew = projectDocument.owner.toString();
    } else if (typeof projectDocument.owner === 'object') {
      ownerNew = this.usersService.toUser(projectDocument.owner);
    } else {
      throw new InternalServerErrorException(
        'Invalid project document owner data',
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
      owner: ownerNew,
      users: usersNew,
    };
  }
}
