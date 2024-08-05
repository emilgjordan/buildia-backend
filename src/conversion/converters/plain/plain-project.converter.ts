import { ProjectDocument } from 'src/projects/schemas/project.schema';
import { EntityConverter } from '../entity.converter';
import { ProjectResponseDto } from 'src/projects/dto/output/project-response.dto';
import { Project } from '../../../projects/interfaces/project.interface';
import mongoose, { Types } from 'mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class PlainProjectConverter extends EntityConverter<
  ProjectDocument,
  Project,
  ProjectResponseDto
> {
  toEntity(projectDocument: ProjectDocument): Project {
    const { _id, __v, ...project } = projectDocument.toObject();
    let creatorNew;
    let usersNew;
    let joinRequestsNew;

    //creator field

    if (projectDocument.creator instanceof Types.ObjectId) {
      creatorNew = projectDocument.creator.toString();
    } else if (typeof projectDocument.creator === 'object') {
      throw new InternalServerErrorException(
        'Project with populated creator cannot be converted with PlainProjectConverter',
      );
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
      throw new InternalServerErrorException(
        'Project with populated users cannot be converted with PlainProjectConverter',
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
      throw new InternalServerErrorException(
        'Project with populated joinRequests cannot be converted with PlainProjectConverter',
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
