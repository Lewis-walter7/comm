import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto, AddMemberDto } from './dto/project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) { }

    @Post()
    create(@CurrentUser() user: any, @Body() createProjectDto: CreateProjectDto) {
        return this.projectsService.create(user.id, createProjectDto);
    }

    @Get()
    findAll(@CurrentUser() user: any) {
        return this.projectsService.findAll(user.id);
    }

    @Get(':id')
    findOne(@CurrentUser() user: any, @Param('id') id: string) {
        return this.projectsService.findOne(user.id, id);
    }

    @Patch(':id')
    update(
        @CurrentUser() user: any,
        @Param('id') id: string,
        @Body() updateProjectDto: UpdateProjectDto,
    ) {
        return this.projectsService.update(user.id, id, updateProjectDto);
    }

    @Delete(':id')
    remove(@CurrentUser() user: any, @Param('id') id: string) {
        return this.projectsService.remove(user.id, id);
    }

    @Post(':id/members')
    addMember(
        @CurrentUser() user: any,
        @Param('id') id: string,
        @Body() addMemberDto: AddMemberDto,
    ) {
        return this.projectsService.addMember(user.id, id, addMemberDto);
    }

    @Delete(':id/members/:userId')
    removeMember(
        @CurrentUser() user: any,
        @Param('id') id: string,
        @Param('userId') userId: string,
    ) {
        return this.projectsService.removeMember(user.id, id, userId);
    }
}
