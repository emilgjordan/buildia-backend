import { UserDocument } from '../../../users/schemas/user.schema';
import { EntityConverter } from '../entity.converter';
import { User } from '../../../users/interfaces/user.interface';
import { UserResponseDto } from '../../../users/dto/output/user-response.dto';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class PlainUserConverter extends EntityConverter<
  UserDocument,
  User,
  UserResponseDto
> {
  toEntity(userDocument: UserDocument): User {
    const { _id, __v, ...user } = userDocument.toObject();
    let projectsNew;

    //projects field

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
      throw new InternalServerErrorException(
        'User with populated projects cannot be converted with PlainUserConverter',
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
