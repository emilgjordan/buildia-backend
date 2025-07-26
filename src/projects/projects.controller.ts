import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ParseIntPipe, Req } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { GetProjectsDto } from './dto/get-projects.dto';
import { Request } from 'express';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  createProject(@Body() createProjectDto: CreateProjectDto, @CurrentUser() currentUser: User) {
    console.log(currentUser)
    return this.projectsService.createProject(createProjectDto, currentUser.id);
  }

  @Get()
  getProjects(
    @Query() query: GetProjectsDto,
    @Req() request: Request
  ) {

    return this.projectsService.getProjects(query);
  }

  @Get(':id')
  getProject(@Param('id') id: string) {
    return this.projectsService.getProjectById(+id);
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  joinProject(@Param('id') projectId: string, @CurrentUser() currentUser: User) {
    return this.projectsService.requestToJoinProject(+projectId, currentUser.id);
  }

  @Get(':id/join-requests')
  @UseGuards(JwtAuthGuard)
  getJoinRequests(@Param('id', ParseIntPipe) projectId: number, @CurrentUser() currentUser: User) {
    return this.projectsService.getJoinRequests(projectId, currentUser.id);
  }

  @Patch(':id/join-requests/:requestId/accept')
  @UseGuards(JwtAuthGuard)
  acceptJoinRequest(
    @Param('requestId', ParseIntPipe) requestId: number,
    @CurrentUser() currentUser: User
  ) {
    return this.projectsService.acceptJoinRequest(requestId, currentUser.id);
  }

  @Patch(':id/join-requests/:requestId/reject')
  @UseGuards(JwtAuthGuard)
  rejectJoinRequest(
    @Param('requestId', ParseIntPipe) requestId: number,
    @CurrentUser() currentUser: User
  ) {
    return this.projectsService.rejectJoinRequest(requestId, currentUser.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  updateProject(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @CurrentUser() currentUser: User
  ) {

    return this.projectsService.updateProject(+id, updateProjectDto, currentUser.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  removeProject(@Param('id') id: string, @CurrentUser() currentUser: User) {
    return this.projectsService.removeProject(+id, currentUser.id);
  }
}
