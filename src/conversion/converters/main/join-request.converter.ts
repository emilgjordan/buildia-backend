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
    const { _id, __v, ...joinRequest } = joinRequestDocument.toObject();
    let projectNew;
    let userNew;

    if (joinRequestDocument.project instanceof Types.ObjectId) {
      projectNew = joinRequestDocument.project.toString();
    } else if (typeof joinRequestDocument.project === 'object') {
      projectNew = this.plainProjectConverter.toEntity(
        joinRequestDocument.project,
      );
    } else {
      throw new InternalServerErrorException(
        'Invalid joinrequest document project data',
      );
    }

    if (joinRequestDocument.user instanceof Types.ObjectId) {
      userNew = joinRequestDocument.user.toString();
    } else if (typeof joinRequestDocument.user === 'object') {
      userNew = this.plainUserConverter.toEntity(joinRequestDocument.user);
    } else {
      throw new InternalServerErrorException(
        'Invalid joinrequest document user data',
      );
    }

    const { user, project, ...rest } = joinRequest;

    return {
      joinRequestId: _id.toString(),
      project: projectNew,
      user: userNew,
      ...rest,
    };
  }
  toResponseDto(joinrequest: JoinRequest): JoinRequestResponseDto {
    //exclude sensitive data from response
    const { ...joinrequestResponseDto } = joinrequest;
    return joinrequestResponseDto;
  }
}
