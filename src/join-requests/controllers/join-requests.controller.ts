import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JoinRequestsService } from '../services/join-requests.service';
import { CreateJoinRequestDto } from '../dto/input/create-join-request.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from '../../users/interfaces/user.interface';
import { JoinRequestResponseDto } from '../dto/output/join-request-response.dto';
import { ProjectsService } from 'src/projects/services/projects.service';
import { create } from 'domain';
import { Types } from 'mongoose';
import { JoinRequest } from '../interfaces/join-request.interface';
import { ConversionService } from '../../conversion/conversion.service';

@Controller('projects/:projectId/join-requests')
export class JoinRequestsController {
  constructor(
    private readonly joinRequestsService: JoinRequestsService,
    private readonly projectsService: ProjectsService,
    private readonly conversionService: ConversionService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createJoinRequest(
    @Query('populate') populate: boolean,
    @Param('projectId') projectId: string,
    @CurrentUser() currentUser: User,
  ) {
    if (!this.projectsService.projectExists(projectId)) {
      throw new NotFoundException('Project not found');
    }

    const internalCreateJoinRequestDto = {
      projectId: projectId,
      userId: currentUser.userId,
    };

    return this.joinRequestsService.createJoinRequest(
      internalCreateJoinRequestDto,
      populate,
    );
  }

  @Patch(':joinRequestId/approve')
  @UseGuards(JwtAuthGuard)
  async approveJoinRequest(
    @Param('joinRequestId') joinRequestId: string,
    @CurrentUser() currentUser: User,
  ): Promise<{ message: string }> {
    if (!Types.ObjectId.isValid(joinRequestId)) {
      throw new BadRequestException('Invalid joinrequest ID');
    }

    return this.joinRequestsService.approveJoinRequest(
      joinRequestId,
      currentUser.userId,
    );
  }

  @Delete(':joinRequestId')
  @UseGuards(JwtAuthGuard)
  async removeJoinRequest(
    @Param('joinRequestId') joinRequestId: string,
    @CurrentUser() currentUser: User,
  ): Promise<{ message: string }> {
    if (!Types.ObjectId.isValid(joinRequestId)) {
      throw new BadRequestException('Invalid joinrequest ID');
    }

    return this.joinRequestsService.removeJoinRequest(
      joinRequestId,
      currentUser.userId,
    );
  }

  @Get()
  async getJoinRequestsByProject(
    @Param('projectId') projectId: string,
    @Query('populate') populate: boolean,
  ): Promise<JoinRequestResponseDto[]> {
    if (!Types.ObjectId.isValid(projectId)) {
      throw new BadRequestException('Invalid project ID');
    }
    if (!this.projectsService.projectExists(projectId)) {
      throw new NotFoundException('Project not found');
    }
    const joinrequests: JoinRequest[] =
      await this.joinRequestsService.getJoinRequestsByProject(
        projectId,
        populate,
      );
    return this.conversionService.toResponseDtos<
      JoinRequest,
      JoinRequestResponseDto
    >('JoinRequest', joinrequests);
  }
}
