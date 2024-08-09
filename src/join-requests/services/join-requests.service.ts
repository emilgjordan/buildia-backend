import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JoinRequestsRepository } from '../repositories/join-requests.repository';
import { JoinRequest } from '../interfaces/join-request.interface';
import { JoinRequestDocument } from '../schemas/join-request.schema';
import mongoose, { Types } from 'mongoose';
import { UsersService } from 'src/users/services/users.service';
import { ProjectsService } from 'src/projects/services/projects.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

import { ConversionService } from '../../conversion/conversion.service';
import { CreateJoinRequestDto } from '../dto/input/create-join-request.dto';
import { OnEvent } from '@nestjs/event-emitter';
import { InternalCreateJoinRequestDto } from '../dto/input/internal-create-join-request.dto';
import { join } from 'path';

@Injectable()
export class JoinRequestsService {
  constructor(
    private readonly joinRequestsRepository: JoinRequestsRepository,
    private readonly projectsService: ProjectsService,
    private readonly conversionService: ConversionService,
  ) {}

  async getJoinRequestsByProject(
    projectId: string,
    populate: boolean,
  ): Promise<JoinRequest[]> {
    const project = await this.projectsService.getProjectById(projectId, false);
    if (!project) {
      throw new InternalServerErrorException('Project not found');
    }
    const joinRequestDocuments = await this.joinRequestsRepository.findMany({
      project: projectId,
    });
    if (populate) {
      return await Promise.all(
        joinRequestDocuments.map(async (joinrequestDocument) => {
          const populatedJoinRequest =
            await joinrequestDocument.populate('project user');
          return this.conversionService.toEntity<
            JoinRequestDocument,
            JoinRequest
          >('JoinRequest', populatedJoinRequest);
        }),
      );
    } else {
      return joinRequestDocuments.map((joinRequestDocument) =>
        this.conversionService.toEntity<JoinRequestDocument, JoinRequest>(
          'JoinRequest',
          joinRequestDocument,
        ),
      );
    }
  }

  async createJoinRequest(
    createJoinRequestDto: InternalCreateJoinRequestDto,
    populate: boolean,
  ) {
    const userId = new Types.ObjectId(createJoinRequestDto.userId);
    const projectId = new Types.ObjectId(createJoinRequestDto.projectId);

    const joinRequestDocument = await this.joinRequestsRepository.create({
      user: userId,
      project: projectId,
    });

    //console.log(joinrequestDocument);

    // const joinrequestDocument = await this.joinrequestsRepository.create({
    //   user: userId,
    //   project: projectId,
    // });

    if (populate) {
      await joinRequestDocument.populate('project user');
    }

    let joinRequest;
    try {
      joinRequest = this.conversionService.toEntity<
        JoinRequestDocument,
        JoinRequest
      >('JoinRequest', joinRequestDocument);
    } catch (error) {
      console.log(error);
    }
    return joinRequest;
  }

  async approveJoinRequest(
    joinRequestId: string,
    currentUserId: string,
  ): Promise<{ message: string }> {
    const joinRequestDocument = await this.joinRequestsRepository.findOne({
      _id: joinRequestId,
    });
    if (!joinRequestDocument) {
      throw new NotFoundException('Join Request not found');
    }
    if (joinRequestDocument.approved) {
      throw new BadRequestException('Join Request already approved');
    }
    const project = await this.projectsService.getProjectById(
      joinRequestDocument.project.toString(),
      false,
    );

    if (!this.projectsService.userInProject(currentUserId, project.projectId)) {
      throw new UnauthorizedException(
        'User not authorized to approve join request',
      );
    }

    await this.joinRequestsRepository.updateOne(
      { _id: joinRequestId },
      {
        approved: true,
        approvedAt: new Date(),
      },
    );

    this.projectsService.addUserToProject(
      joinRequestDocument.user.toString(),
      joinRequestDocument.project.toString(),
    );

    return { message: 'Join Request approved successfully' };

    // this.eventEmitter.emit('project.userJoined', { userId, projectId });
  }

  async removeJoinRequest(
    joinRequestId: string,
    currentUserId: string,
  ): Promise<{ message: string; joinRequestId: string }> {
    const joinRequestDocument = await this.joinRequestsRepository.findOne({
      _id: joinRequestId,
    });
    if (!joinRequestDocument) {
      throw new NotFoundException('JoinRequest not found');
    }
    if (joinRequestDocument.user.toString() !== currentUserId) {
      throw new UnauthorizedException(
        'User not authorized to delete joinRequest',
      );
    }
    const result = await this.joinRequestsRepository.deleteOne({
      _id: joinRequestId,
    });
    if (result.deletedCount === 0) {
      throw new InternalServerErrorException('joinRequest not deleted');
    }

    return {
      message: `joinRequest with ID '${joinRequestId}' was deleted successfully.`,
      joinRequestId: joinRequestId,
    };
  }
}
