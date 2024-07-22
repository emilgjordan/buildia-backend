import { EntityConverter } from './entity.converter';
import { User } from '../../users/interfaces/user.interface';
import { UserDocument } from 'src/users/schemas/user.schema';
import { UserResponseDto } from 'src/users/dto/output/user-response.dto';
import { Types } from 'mongoose';
import { InternalServerErrorException } from '@nestjs/common';
import { ProjectConverter } from './project.converter';
import { ConversionService } from '../conversion.service';
import { ProjectDocument } from 'src/projects/schemas/project.schema';
import { Project } from 'src/projects/interfaces/project.interface';

export class UserConverter extends EntityConverter<
  UserDocument,
  User,
  UserResponseDto
> {
  constructor(private readonly conversionService: ConversionService) {
    super();
  }
  toEntity(userDocument: UserDocument): User {
    const { _id, projects, __v, ...user } = userDocument.toObject();
    let projectsNew;

    if (userDocument.projects.length === 0) {
      projectsNew = [];
    } else if (
      userDocument.projects.every(
        (project) => project instanceof Types.ObjectId,
      )
    ) {
      projectsNew = userDocument.projects.map((project) => project.toString());
    } else if (
      userDocument.projects.every((project) => typeof project === 'object')
    ) {
      projectsNew = this.conversionService.toEntities<ProjectDocument, Project>(
        'Project',
        userDocument.projects,
      );
    } else {
      throw new InternalServerErrorException('Invalid user projects data');
    }

    return {
      ...user,
      userId: _id.toString(),
      projects: projectsNew,
    };
  }
  toResponseDto(user: User): UserResponseDto {
    //exclude sensitive data from response
    const { hashedPassword, ...userResponseDto } = user;
    return userResponseDto;
  }
}
