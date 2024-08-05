import { LikeDocument } from '../../../likes/schemas/like.schema';
import { EntityConverter } from '../entity.converter';
import { Like } from '../../../likes/interfaces/like.interface';
import { LikeResponseDto } from '../../../likes/dto/output/like-response.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PlainLikeConverter extends EntityConverter<
  LikeDocument,
  Like,
  LikeResponseDto
> {
  toEntity(document) {
    return document;
  }

  toResponseDto(entity) {
    return entity;
  }
}
