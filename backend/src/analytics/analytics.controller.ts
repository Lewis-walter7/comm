import { Controller, Get, Post, Body, Query, Param, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsQueryDto } from './dto/analytics.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
    constructor(private analyticsService: AnalyticsService) { }

    @Get('activity-feed')
    async getActivityFeed(
        @Req() req: any,
        @Query('limit') limit?: string,
        @Query('offset') offset?: string,
    ) {
        return this.analyticsService.getActivityFeed(
            req.user.id,
            limit ? parseInt(limit) : 20,
            offset ? parseInt(offset) : 0,
        );
    }

    @Get('user')
    async getUserAnalytics(@Req() req: any, @Query() query: AnalyticsQueryDto) {
        return this.analyticsService.getUserAnalytics(req.user.id, query);
    }

    @Get('project/:id')
    async getProjectAnalytics(
        @Param('id') id: string,
        @Query() query: AnalyticsQueryDto,
    ) {
        return this.analyticsService.getProjectAnalytics(id, query);
    }

    @Get('dashboard')
    async getDashboardAnalytics(@Query() query: AnalyticsQueryDto) {
        // TODO: Add admin guard
        return this.analyticsService.getDashboardAnalytics(query);
    }
}
