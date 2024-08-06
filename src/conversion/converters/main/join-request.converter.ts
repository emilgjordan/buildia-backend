import { JoinRequestDocument } from '../../../join-requests/schemas/join-request.schema';
import { EntityConverter } from '../entity.converter';
import { JoinRequest } from '../../../join-requests/interfaces/join-request.interface';
import { JoinRequestResponseDto } from '../../../join-requests/dto/output/join-request-response.dto';
import { Types } from 'mongoose';
import { ConversionService } from '../../conversion.service';
import { ProjectDocument } from 'src/projects/schemas/project.schema';
import { Project } from 'src/projects/interfaces/project.interface';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UserDocument } from 'src/users/schemas/user.schema';
import { User } from 'src/users/interfaces/user.interface';
import { PlainUserConverter } from '../plain/plain-user.converter';
import { PlainProjectConverter } from '../plain/plain-project.converter';

@Injectable()
export class JoinRequestConverter extends EntityConverter<
  JoinRequestDocument,
  JoinRequest,
  JoinRequestResponseDto
> {
  constructor(
    private readonly plainUserConverter: PlainUserConverter,
    private readonly plainProjectConverter: PlainProjectConverter,
  ) {
    super();
  }
  toEntity(joinRequestDocument: JoinRequestDocument): JoinRequest {
    const { _id, __v, user, project, ...joinRequest } =
      joinRequestDocument.toObject();
    let projectNew;
    let userNew;

    if (project instanceof Types.ObjectId) {
      projectNew = project.toString();
    } else if (typeof project === 'object') {
      projectNew = this.plainProjectConverter.toEntity(project);
    } else {
      throw new InternalServerErrorException(
        'Invalid joinrequest document project data',
      );
    }

    if (user instanceof Types.ObjectId) {
      userNew = user.toString();
    } else if (typeof user === 'object') {
      userNew = this.plainUserConverter.toEntity(user);
    } else {
      throw new InternalServerErrorException(
        'Invalid joinrequest document user data',
      );
    }

    return {
      joinRequestId: _id.toString(),
      project: projectNew,
      user: userNew,
      ...joinRequest,
    };
  }
  toResponseDto(joinrequest: JoinRequest): JoinRequestResponseDto {
    //exclude sensitive data from response
    const { ...joinrequestResponseDto } = joinrequest;
    return joinrequestResponseDto;
  }
}
