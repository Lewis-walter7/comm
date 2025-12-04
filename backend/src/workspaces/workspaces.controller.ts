import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto.ts';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthRequest extends ExpressRequest {
  user: {
    id: string;
  };
}

@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) { }

  @Post()
  create(@Request() req: AuthRequest, @Body() createWorkspaceDto: CreateWorkspaceDto) {
    return this.workspacesService.create(req.user.id, createWorkspaceDto);
  }

  @Get()
  findAll(@Request() req: AuthRequest) {
    return this.workspacesService.findAllForUser(req.user.id);
  }

  @Get(':id')
  findOne(@Request() req: AuthRequest, @Param('id') id: string) {
    return this.workspacesService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(@Request() req: AuthRequest, @Param('id') id: string, @Body() updateWorkspaceDto: UpdateWorkspaceDto) {
    return this.workspacesService.update(id, req.user.id, updateWorkspaceDto);
  }

  @Delete(':id')
  remove(@Request() req: AuthRequest, @Param('id') id: string) {
    return this.workspacesService.remove(id, req.user.id);
  }

  @Post(':id/members')
  addMember(@Request() req: AuthRequest, @Param('id') id: string, @Body('email') email: string) {
    return this.workspacesService.addMember(id, req.user.id, email);
  }

  @Post('join')
  joinWorkspace(@Request() req: AuthRequest, @Body('inviteCode') inviteCode: string) {
    return this.workspacesService.joinByCode(req.user.id, inviteCode);
  }

  @Get('verify/:code')
  verifyInviteCode(@Param('code') code: string) {
    return this.workspacesService.verifyInviteCode(code);
  }

  @Post(':id/invite')
  inviteMember(@Request() req: AuthRequest, @Param('id') id: string, @Body('email') email: string) {
    return this.workspacesService.inviteByEmail(id, req.user.id, email);
  }

  @Get(':id/pending-members')
  getPendingMembers(@Request() req: AuthRequest, @Param('id') id: string) {
    return this.workspacesService.getPendingMembers(id, req.user.id);
  }

  @Post(':id/members/:memberId/accept')
  acceptMemberRequest(@Request() req: AuthRequest, @Param('id') id: string, @Param('memberId') memberId: string) {
    return this.workspacesService.acceptMemberRequest(id, memberId, req.user.id);
  }

  @Post(':id/members/:memberId/reject')
  rejectMemberRequest(@Request() req: AuthRequest, @Param('id') id: string, @Param('memberId') memberId: string) {
    return this.workspacesService.rejectMemberRequest(id, memberId, req.user.id);
  }
}
