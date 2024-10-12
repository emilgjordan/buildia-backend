import { InternalServerErrorException } from '@nestjs/common';
import { Document, FilterQuery, Model, UpdateQuery } from 'mongoose';

export abstract class EntityRepository<T extends Document> {
  constructor(protected readonly entityModel: Model<T>) {}

  async findOne(entityFilterQuery: FilterQuery<T>): Promise<T | null> {
    try {
      return this.entityModel.findOne(entityFilterQuery).exec();
    } catch (error) {
      throw new InternalServerErrorException('Database query failed');
    }
  }

  async findMany(query: any, limit: number, skip: number): Promise<T[]> {
    return this.entityModel.find(query).skip(skip).limit(limit).exec();
  }

  async create(createEntityData: Partial<T>): Promise<T> {
    const entity = new this.entityModel(createEntityData);
    return entity.save() as Promise<T>;
  }

  async updateOne(
    entityFilterQuery: FilterQuery<T>,
    updateEntityData: UpdateQuery<T>,
  ): Promise<T | null> {
    return this.entityModel
      .findOneAndUpdate(entityFilterQuery, updateEntityData, {
        new: true,
      })
      .exec();
  }

  async deleteOne(
    entityFilterQuery: FilterQuery<T>,
  ): Promise<{ deletedCount?: number }> {
    const result = await this.entityModel.deleteOne(entityFilterQuery);
    return { deletedCount: result.deletedCount };
  }
}
