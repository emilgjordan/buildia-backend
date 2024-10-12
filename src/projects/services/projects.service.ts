import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Project } from '../interfaces/project.interface';
import { ProjectDocument } from '../schemas/project.schema';
import { Model, Types } from 'mongoose';
import { ProjectsRepository } from '../repositories/projects.repository';
import { CreateProjectDto } from '../dto/input/create-project.dto';
import { UpdateProjectDto } from '../dto/input/update-project.dto';
import { ConversionService } from '../../conversion/conversion.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel('Project') private projectModel: Model<ProjectDocument>,
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

  async addUserToProject(userId: string, projectId: string): Promise<void> {
    const projectDocument = await this.projectsRepository.findOne({
      _id: projectId,
    });
    if (!projectDocument) {
      throw new NotFoundException('Project not found');
    }
    if (projectDocument.users.map((user) => user.toString()).includes(userId)) {
      throw new ConflictException('User is already a member of this project');
    }
    await this.projectsRepository.updateOne(
      { _id: projectId },
      { $push: { users: new Types.ObjectId(userId) } },
    );
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
        await projectDocument.populate('creator users'),
      );
    }
    return this.conversionService.toEntity<ProjectDocument, Project>(
      'Project',
      projectDocument,
    );
  }

  async getProjects(
    search?: string,
    tags?: string[],
    limit: number = 10,
    skip: number = 0,
    populate: boolean = false,
  ): Promise<{ projects: Project[]; total: number }> {
    const query: any = {};

    if (search) {
      query.$or = [
        { title: { $regex: `^${search}`, $options: 'i' } },
        { $text: { $search: search } },
      ];

      if (tags && tags.length > 0) {
        query.skills = { $in: tags };
      }
    }

    const total = await this.projectModel.countDocuments(query);

    // await new Promise((resolve) => setTimeout(resolve, 1000));

    const searchResults = await this.projectModel
      .find(query)
      .limit(limit)
      .skip(skip)
      .exec();

    const projects = populate
      ? await Promise.all(
          searchResults.map(async (projectDocument) => {
            const populatedProject =
              await projectDocument.populate('creator users');
            return this.conversionService.toEntity<ProjectDocument, Project>(
              'Project',
              populatedProject,
            );
          }),
        )
      : this.conversionService.toEntities<ProjectDocument, Project>(
          'Project',
          searchResults,
        );

    return { projects, total };
  }

  async getProjectsByCreatorId(
    creatorId: string,
    limit: number = 10,
    skip: number = 0,
    populate: boolean = false,
  ): Promise<{ projects: Project[]; total: number }> {
    const query = { creator: creatorId };

    const projectDocuments = await this.projectModel
      .find(query)
      .limit(limit)
      .skip(skip)
      .exec();

    const total = await this.projectModel.countDocuments(query);

    const projects = populate
      ? await Promise.all(
          projectDocuments.map(async (projectDocument) => {
            const populatedProject =
              await projectDocument.populate('creator users');
            return this.conversionService.toEntity<ProjectDocument, Project>(
              'Project',
              populatedProject,
            );
          }),
        )
      : this.conversionService.toEntities<ProjectDocument, Project>(
          'Project',
          projectDocuments,
        );

    return { projects, total };
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
          await projectDocument.populate('creator users'),
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
        await updatedProjectDocument.populate('creator users'),
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
