import {Injectable} from '@nestjs/common';
import { FlexibleEventEntityService } from '../shared/services/data-base-services/flexible-event-entity/flexible-event-entity.service';
import { AbsoluteEventEntityService } from '../shared/services/data-base-services/absoulte-event-entity/absolute-event-entity.service';
import {AbsoluteEvent} from "../shared/entities/absolute-event.entity";
import {FlexibleEvent} from "../shared/entities/flexible-event.entity";
import {EventCategoryEnum} from "../shared/enum/event-category.enum";

@Injectable()
export class StatisticsService {
    constructor(private absoluteEventEntityService: AbsoluteEventEntityService,
                private flexibleEventEntityService: FlexibleEventEntityService) {}

    async getCurrentMonthEvents(userId: number) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        return this.getEventsByDateRange(userId, startOfMonth, endOfMonth);
    }

    async getCurrentWeekEvents(userId: number) {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        return this.getEventsByDateRange(userId, startOfWeek, endOfWeek);
    }

    private async getEventsByDateRange(userId: number, startDate: Date, endDate: Date) {
        const absoluteEventsPromise = this.absoluteEventEntityService.getEventsByDateRange(userId, startDate, endDate);
        const flexibleEventsPromise = this.flexibleEventEntityService.getFlexibleEventsByDateRange(userId, startDate, endDate);

        return await this.countEventsByCategory(absoluteEventsPromise, flexibleEventsPromise);


    }

    private async countEventsByCategory(
        absoluteEventsPromise: Promise<AbsoluteEvent[]>,
        flexibleEventsPromise: Promise<FlexibleEvent[]>
    ): Promise<Record<string, number>> {
        const categoryCountObject: Record<string, number> = {};

        Object.values(EventCategoryEnum).forEach(category => {
            if (typeof category === 'number') {
                categoryCountObject[EventCategoryEnum[category]] = 0;
            }
        });

        const [absoluteEvents, flexibleEvents] = await Promise.all([absoluteEventsPromise, flexibleEventsPromise]);

        absoluteEvents.forEach(event => {
            const categoryName = EventCategoryEnum[event.category];
            categoryCountObject[categoryName]++;
        });

        flexibleEvents.forEach(event => {
            const categoryName = EventCategoryEnum[event.category];
            categoryCountObject[categoryName]++;
        });

        return categoryCountObject;
    }
}