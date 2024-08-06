import { LikeDocument } from 'src/likes/schemas/like.schema';
import { EntityConverter } from '../entity.converter';
import { Like } from '../../../likes/interfaces/like.interface';
import { LikeResponseDto } from '../../../likes/dto/output/like-response.dto';
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
export class LikeConverter extends EntityConverter<
  LikeDocument,
  Like,
  LikeResponseDto
> {
  constructor(
    private readonly plainUserConverter: PlainUserConverter,
    private readonly plainProjectConverter: PlainProjectConverter,
  ) {
    super();
  }
  toEntity(likeDocument: LikeDocument): Like {
    const { _id, __v, ...like } = likeDocument.toObject();
    let projectNew;
    let userNew;

    if (likeDocument.project instanceof Types.ObjectId) {
      projectNew = likeDocument.project.toString();
    } else if (typeof likeDocument.project === 'object') {
      projectNew = this.plainProjectConverter.toEntity(likeDocument.project);
    } else {
      throw new InternalServerErrorException(
        'Invalid like document project data',
      );
    }

    if (likeDocument.user instanceof Types.ObjectId) {
      userNew = likeDocument.user.toString();
    } else if (typeof likeDocument.user === 'object') {
      userNew = this.plainUserConverter.toEntity(likeDocument.user);
    } else {
      throw new InternalServerErrorException('Invalid like document user data');
    }

    return {
      likeId: _id.toString(),
      project: projectNew,
      user: userNew,
      timestamp: like.timestamp,
    };
  }
  toResponseDto(like: Like): LikeResponseDto {
    //exclude sensitive data from response
    const { ...likeResponseDto } = like;
    return likeResponseDto;
  }
}
