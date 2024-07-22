export abstract class EntityConverter<TDocument, TEntity, TResponseDto> {
  abstract toEntity(document: TDocument): TEntity;
  abstract toResponseDto(entity: TEntity): TResponseDto;

  toEntities(documents: TDocument[]): TEntity[] {
    return documents.map((document) => this.toEntity(document));
  }

  toResponseDtos(entities: TEntity[]): TResponseDto[] {
    return entities.map((entity) => this.toResponseDto(entity));
  }
}
