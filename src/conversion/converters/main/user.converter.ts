import { EntityConverter } from '../entity.converter';
import { User } from '../../../users/interfaces/user.interface';
import { UserDocument } from 'src/users/schemas/user.schema';
import { UserResponseDto } from 'src/users/dto/output/user-response.dto';
import { Types } from 'mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ProjectDocument } from 'src/projects/schemas/project.schema';
import { PlainProjectConverter } from '../plain/plain-project.converter';
@Injectable()
export class UserConverter extends EntityConverter<
  UserDocument,
  User,
  UserResponseDto
> {
  constructor(private readonly plainProjectConverter: PlainProjectConverter) {
    super();
  }
  toEntity(userDocument: UserDocument): User {
    const { _id, __v, ...user } = userDocument.toObject();
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
      projectsNew = this.plainProjectConverter.toEntities(
        userDocument.projects as ProjectDocument[],
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
