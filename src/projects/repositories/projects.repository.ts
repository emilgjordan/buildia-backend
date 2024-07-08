import { Injectable } from '@nestjs/common';
import { EntityRepository } from '../../database/entity.repository';
import { ProjectDocument } from '../schemas/project.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ProjectsRepository extends EntityRepository<ProjectDocument> {
  constructor(@InjectModel('project') projectModel: Model<ProjectDocument>) {
    super(projectModel);
  }
}
