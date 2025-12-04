import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UsersService } from '../users/users.service';

@Injectable()
export class AccountCleanupService {
    private readonly logger = new Logger(AccountCleanupService.name);

    constructor(private readonly usersService: UsersService) { }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleScheduledDeletions() {
        this.logger.log('Running scheduled account deletion cleanup...');

        try {
            const result = await this.usersService.processScheduledDeletions();

            if (result.deletedCount > 0) {
                this.logger.log(`Permanently deleted ${result.deletedCount} accounts`);
                result.deletedUsers.forEach(user => {
                    this.logger.log(`  - ${user.email} (${user.id})`);
                });
            } else {
                this.logger.log('No accounts scheduled for deletion');
            }
        } catch (error) {
            this.logger.error('Error processing scheduled deletions:', error);
        }
    }
}
