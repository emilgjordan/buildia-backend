import { ProjectDocument } from 'src/projects/schemas/project.schema';
import { EntityConverter } from '../entity.converter';
import { Project } from 'src/projects/interfaces/project.interface';
import { ProjectResponseDto } from 'src/projects/dto/output/project-response.dto';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Types } from 'mongoose';
import { ConversionService } from '../../conversion.service';
import { UserDocument } from 'src/users/schemas/user.schema';
import { User } from 'src/users/interfaces/user.interface';
import { PlainUserConverter } from '../plain/plain-user.converter';
import { join } from 'path';
@Injectable()
export class ProjectConverter extends EntityConverter<
  ProjectDocument,
  Project,
  ProjectResponseDto
> {
  constructor(private readonly plainUserConverter: PlainUserConverter) {
    super();
  }
  toEntity(projectDocument: ProjectDocument): Project {
    const { _id, __v, ...project } = projectDocument.toObject();
    let creatorNew;
    let usersNew;
    let joinRequestsNew;

    //creator field

    if (projectDocument.creator instanceof Types.ObjectId) {
      creatorNew = projectDocument.creator.toString();
    } else if (typeof projectDocument.creator === 'object') {
      creatorNew = this.plainUserConverter.toEntity(projectDocument.creator);
    } else {
      throw new InternalServerErrorException(
        'Invalid project document creator data',
      );
    }

    //users field

    if (projectDocument.users.length === 0) {
      usersNew = [];
    } else if (
      projectDocument.users.every((user) => user instanceof Types.ObjectId)
    ) {
      usersNew = projectDocument.users.map((user) => user.toString());
    } else if (
      projectDocument.users.every((user) => typeof user === 'object')
    ) {
      usersNew = this.plainUserConverter.toEntities(
        projectDocument.users as UserDocument[],
      );
    } else {
      throw new InternalServerErrorException(
        'Invalid project document users data',
      );
    }

    //joinRequests field

    if (projectDocument.joinRequests.length === 0) {
      joinRequestsNew = [];
    } else if (
      projectDocument.joinRequests.every(
        (user) => user instanceof Types.ObjectId,
      )
    ) {
      joinRequestsNew = projectDocument.joinRequests.map((user) =>
        user.toString(),
      );
    } else if (
      projectDocument.joinRequests.every((user) => typeof user === 'object')
    ) {
      joinRequestsNew = this.plainUserConverter.toEntities(
        projectDocument.joinRequests as UserDocument[],
      );
    } else {
      throw new InternalServerErrorException(
        'Invalid project document joinRequests data',
      );
    }

    return {
      ...project,
      projectId: _id.toString(),
      creator: creatorNew,
      users: usersNew,
      joinRequests: joinRequestsNew,
    };
  }

  toResponseDto(project: Project): ProjectResponseDto {
    //exclude sensitive data from response

    return project;
  }
}
