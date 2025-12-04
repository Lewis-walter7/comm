import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { LogActivityDto, AnalyticsQueryDto } from "./dto/analytics.dto";
import { ActivityType } from "@prisma/client";

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  // Activity Logging
  async logActivity(dto: LogActivityDto) {
    return this.prisma.activity.create({
      data: {
        userId: dto.userId,
        type: dto.type,
        description: dto.description,
        projectId: dto.projectId,
        documentId: dto.documentId,
        metadata: dto.metadata,
      },
    });
  }

  // Activity Feed
  async getActivityFeed(userId: string, limit = 20, offset = 0) {
    const [activities, total] = await Promise.all([
      this.prisma.activity.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.activity.count({ where: { userId } }),
    ]);

    return { activities, total };
  }

  async getProjectActivity(projectId: string, query: AnalyticsQueryDto) {
    const where: any = { projectId };

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }

    return this.prisma.activity.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  // User Analytics
  async getUserAnalytics(userId: string, query: AnalyticsQueryDto) {
    const days = this.getPeriodDays(query.period || "week");
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const activities = await this.prisma.activity.findMany({
      where: {
        userId,
        createdAt: { gte: startDate },
      },
    });

    // Group by type
    const byType = activities.reduce(
      (acc, activity) => {
        acc[activity.type] = (acc[activity.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Group by date
    const byDate = activities.reduce(
      (acc, activity) => {
        const date = activity.createdAt.toISOString().split("T")[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      totalActivities: activities.length,
      byType,
      byDate,
      period: query.period || "week",
    };
  }

  // Project Analytics
  async getProjectAnalytics(projectId: string, query: AnalyticsQueryDto) {
    const days = this.getPeriodDays(query.period || "week");
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [activities, members, documents, messages] = await Promise.all([
      this.prisma.activity.findMany({
        where: {
          projectId,
          createdAt: { gte: startDate },
        },
        include: {
          user: {
            select: { id: true, name: true },
          },
        },
      }),
      this.prisma.projectMember.count({ where: { projectId } }),
      this.prisma.document.count({ where: { projectId } }),
      this.prisma.message.count({
        where: {
          conversation: {
            workspaceId: projectId, // Using workspaceId as proxy for project filtering
          },
          createdAt: { gte: startDate },
        },
      }),
    ]);

    // Activity by user
    const byUser = activities.reduce(
      (acc: any, activity: any) => {
        const userName = activity.user.name;
        acc[userName] = (acc[userName] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Activity by type
    const byType = activities.reduce(
      (acc: any, activity: any) => {
        acc[activity.type] = (acc[activity.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      totalActivities: activities.length,
      totalMembers: members,
      totalDocuments: documents,
      recentMessages: messages,
      byUser,
      byType,
      period: query.period || "week",
    };
  }

  // Dashboard Analytics (Platform-wide - Admin only)
  async getDashboardAnalytics(query: AnalyticsQueryDto) {
    const days = this.getPeriodDays(query.period || "month");
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [
      totalUsers,
      activeUsers,
      totalProjects,
      recentProjects,
      recentActivities,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.activity
        .groupBy({
          by: ["userId"],
          where: { createdAt: { gte: startDate } },
        })
        .then((result) => result.length),
      this.prisma.project.count(),
      this.prisma.project.count({
        where: { createdAt: { gte: startDate } },
      }),
      this.prisma.activity.count({
        where: { createdAt: { gte: startDate } },
      }),
    ]);

    return {
      totalUsers,
      activeUsers,
      totalProjects,
      newProjects: recentProjects,
      recentActivities,
      period: query.period || "month",
    };
  }

  private getPeriodDays(period: string): number {
    switch (period) {
      case "day":
        return 1;
      case "week":
        return 7;
      case "month":
        return 30;
      default:
        return 7;
    }
  }
}
