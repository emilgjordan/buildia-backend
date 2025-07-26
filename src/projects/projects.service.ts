import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PrismaService } from '../prisma/prisma.service';
import { JoinRequest, Prisma, Project } from '@prisma/client';


@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) { }

  async createProject(createProjectDto: CreateProjectDto, currentUserId: number): Promise<Project> {
    return this.prisma.project.create({
      data: {
        ...createProjectDto,
        creator: { connect: { id: currentUserId } },
        members: {
          create: [
            {
              user:
                { connect: { id: currentUserId } }
            },
          ]
        }
      },

    });
  }

  async requestToJoinProject(projectId: number, currentUserId: number): Promise<JoinRequest> {
    const project = await this.prisma.project.findUnique({
      where: {
        id: projectId,
      },
      include: {
        members: {
          where: {
            userId: currentUserId,
          },
        },
      },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    if (project.members.length > 0) {
      throw new UnauthorizedException('You are already a member of this project');
    }

    return this.prisma.joinRequest.create({
      data: {
        project: { connect: { id: projectId } },
        user: { connect: { id: currentUserId } },

      }
    })
  }

  async getJoinRequests(projectId: number, currentUserId: number): Promise<JoinRequest[]> {
    const project = await this.prisma.project.findUnique({
      where: {
        id: projectId,
      },
      include: {
        members: {

          where: {
            userId: currentUserId,
          },
        },
      },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    if (project.members.length === 0) {
      throw new UnauthorizedException('You are not a member of this project');
    }
    return this.prisma.joinRequest.findMany({
      where: {
        projectId,
        status: 'PENDING',
      },
      include: {
        user: true,
      },
    });
  }

  async acceptJoinRequest(joinRequestId: number, currentUserId: number): Promise<JoinRequest> {
    const joinRequest = await this.prisma.joinRequest.findUnique({
      where: {
        id: joinRequestId,
      },
      include: {
        project: {
          include: {
            members: {
              where: {
                userId: currentUserId,
              },
            },
          },
        },
      },
    });
    if (!joinRequest) {
      throw new NotFoundException('Join request not found');
    }
    if (joinRequest.project.members.length === 0) {
      throw new UnauthorizedException('You are not a member of this project');
    }

    return this.prisma.joinRequest.update({
      where: {
        id: joinRequestId,
      },
      data: {
        status: 'ACCEPTED',
        project: {
          update: {
            members: {
              create: {
                user: {
                  connect: {
                    id: joinRequest.userId,
                  },
                },
              },
            },
          },
        },
      },
      include: {
        user: true,
        project: {
          include: {
            members: true,
          },
        },
      },
    });
  }

  async rejectJoinRequest(joinRequestId: number, currentUserId: number): Promise<JoinRequest> {
    const joinRequest = await this.prisma.joinRequest.findUnique({
      where: {
        id: joinRequestId,
      },
      include: {
        project: {
          include: {
            members: {
              where: {
                userId: currentUserId,
              },
            },
          },
        },
      },
    });
    if (!joinRequest) {
      throw new NotFoundException('Join request not found');
    }
    if (joinRequest.project.members.length === 0) {
      throw new UnauthorizedException('You are not a member of this project');
    }

    return this.prisma.joinRequest.update({
      where: {
        id: joinRequestId,
      },
      data: {
        status: 'REJECTED',
      },
      include: {
        user: true,
        project: true,
      },
    });
  }

  async getProjects(filters: { userId?: number }): Promise<Project[]> {
    const { userId } = filters;

    const where: Prisma.ProjectWhereInput = {};

    if (userId) {
      where.members = {
        some: {
          userId
        },
      };
    }


    return this.prisma.project.findMany(
      {
        where,
      }
    );
  }

  async getProjectById(id: number): Promise<Project | null> {
    return this.prisma.project.findUnique({
      where: {
        id,
      },
      include: {
        members: {
          include: {
            user: true,
          },
        }
      }
    });
  }

  async updateProject(id: number, projectUpdateDto: Prisma.ProjectUpdateInput, currentUserId: number): Promise<Project> {

    const project = await this.prisma.project.findUnique({
      where: {
        id,
      }
    })

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.creatorId !== currentUserId) {
      throw new UnauthorizedException('You are not the creator of this project');
    }


    return this.prisma.project.update({
      where: {
        id,
      },
      data: projectUpdateDto,
    });
  }

  async removeProject(id: number, currentUserId: number): Promise<Project> {

    const project = await this.prisma.project.findUnique({
      where: {
        id,
      }
    })

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.creatorId !== currentUserId) {
      throw new UnauthorizedException('You are not the creator of this project');
    }

    return this.prisma.project.delete({
      where: {
        id,
      },
    });
  }
}
