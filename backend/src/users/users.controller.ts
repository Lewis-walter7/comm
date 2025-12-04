import { Controller, Get, Body, Patch, Param, UseGuards, Query, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/user.dto';
import { ScheduleDeletionDto } from './dto/schedule-deletion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('me')
    getProfile(@CurrentUser() user: any) {
        return this.usersService.findOne(user.id);
    }

    @Get('me/stats')
    getStats(@CurrentUser() user: any) {
        return this.usersService.getUserStats(user.id);
    }

    @Get('me/activity')
    getActivity(@CurrentUser() user: any, @Query('limit') limit?: string) {
        return this.usersService.getRecentActivity(user.id, limit ? parseInt(limit) : 10);
    }

    @Patch('me')
    update(@CurrentUser() user: any, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(user.id, updateUserDto);
    }

    @Get('search')
    search(@Query('q') query: string) {
        return this.usersService.search(query);
    }

    @Post('me/schedule-deletion')
    scheduleDeletion(@CurrentUser() user: any, @Body() dto: ScheduleDeletionDto) {
        return this.usersService.scheduleAccountDeletion(user.id, dto.reason);
    }

    @Post('me/cancel-deletion')
    cancelDeletion(@CurrentUser() user: any) {
        return this.usersService.cancelAccountDeletion(user.id);
    }

    @Post('me/complete-onboarding')
    completeOnboarding(@CurrentUser() user: any) {
        return this.usersService.completeOnboarding(user.id);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }
}
