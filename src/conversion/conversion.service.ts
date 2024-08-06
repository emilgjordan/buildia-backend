import { Injectable } from '@nestjs/common';
import { EntityConverter } from './converters/entity.converter';

@Injectable()
export class ConversionService {
  private converters = new Map<string, EntityConverter<any, any, any>>();

  registerConverter<Document, Entity, Dto>(
    name: string,
    converter: EntityConverter<Document, Entity, Dto>,
  ) {
    this.converters.set(name, converter);
  }

  getConverter<Document, Entity, Dto>(
    converterName: string,
  ): EntityConverter<Document, Entity, Dto> {
    const converter = this.converters.get(converterName);
    if (!converter) {
      throw new Error(`Converter for ${converterName} not found`);
    }
    return converter;
  }

  toEntity<Document, Entity>(name: string, document: Document): Entity {
    return this.getConverter<Document, Entity, any>(name).toEntity(document);
  }

  toResponseDto<Entity, ResponseDto>(
    converter: string,
    entity: Entity,
  ): ResponseDto {
    return this.getConverter<any, Entity, ResponseDto>(converter).toResponseDto(
      entity,
    );
  }

  toEntities<Document, Entity>(
    converter: string,
    documents: Document[],
  ): Entity[] {
    return this.getConverter<Document, Entity, any>(converter).toEntities(
      documents,
    );
  }

  toResponseDtos<Entity, ResponseDto>(
    converter: string,
    entities: Entity[],
  ): ResponseDto[] {
    return this.getConverter<Document, Entity, ResponseDto>(
      converter,
    ).toResponseDtos(entities);
  }
}
