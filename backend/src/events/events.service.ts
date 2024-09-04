import {Injectable, Logger} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AbsoluteEvent } from '../shared/entities/absolute-event.entity';
import {CreateEventDto} from "../shared/DTO/create-event.dto";
import { AbsoluteEventEntityService, AbsoluteEventEntity } from "../shared/services/data-base-services/absoulte-event-entity/absolute-event-entity.service";
import {EditEventDto} from "../shared/DTO/edit-event.dto";
import {FlexibleEvent} from "../shared/entities/flexible-event.entity";
import { FlexibleEventEntityService, FlexibleEventEntity } from "../shared/services/data-base-services/flexible-event-entity/flexible-event-entity.service";
import {EventPriorityEnum} from "../shared/enum/event-priority.enum";
import {EventCategoryEnum} from "../shared/enum/event-category.enum";
import {parse} from "ts-jest";
import {RepeatTypeEnum} from "../shared/enum/repeat-type.enum";

export class CreationFailedError extends Error {
    constructor(public object1: any, message?: string) {
        super(message);
        this.name = 'CreationFailed';
    }
}

@Injectable()
export class EventsService {
    constructor(
        @InjectRepository(AbsoluteEvent)
        private readonly absoluteEventRepository: Repository<AbsoluteEvent>,
        @InjectRepository(FlexibleEvent)
        private readonly flexibleEventRepository: Repository<FlexibleEvent>,
        private absoluteEventService: AbsoluteEventEntityService,
        private flexibleEventService: FlexibleEventEntityService,
    ) {}

    async changeFlexibleEventsToAbsoluteEvents(events: any) {
        for(let event of events.changeEvents){
            await this.flexibleEventService.deleteFlexibleEvent(event.id);
            await this.absoluteEventService.createAbsoluteEvent({
                user_id: event.user_id,
                name: event.name,
                priority: event.priority,
                flexible: false,
                start_date: event.optimal_start_date,
                end_date: event.optimal_end_date,
                whole_day: false,
                start_time: event.optimal_start_time,
                end_time: event.optimal_end_time,
                location: event.location,
                category: event.category,
                description: event.description,
                alarms: event.alarms,
                repeat: false,
                repeat_type: event.repeat_type,
                repeat_interval: event.repeat_interval,
                flexible_event_id: null
            } as CreateEventDto);
        }

        await this.absoluteEventService.createAbsoluteEvent({
            user_id: events.eventData.user_id,
            name: events.eventData.name,
            priority: events.eventData.priority,
            flexible: false,
            start_date: events.eventData.start_date,
            end_date: events.eventData.end_date,
            whole_day: false,
            start_time: events.eventData.start_time,
            end_time: events.eventData.end_time,
            location: events.eventData.location,
            category: events.eventData.category,
            description: events.eventData.description,
            alarms: events.eventData.alarms,
            repeat: events.eventData.repeat,
            repeat_type: events.eventData.repeat_type,
            repeat_interval: events.eventData.repeat_interval,
            flexible_event_id: null
        } as CreateEventDto);

    }


    async createEvent(eventData: CreateEventDto) :Promise<boolean>{
        const genericStartDate = new Date(new Date(eventData.start_date).setHours(0, 0, 0, 0));
        eventData.start_date = genericStartDate;
        eventData.end_date = genericStartDate;

        if (eventData.flexible) {
            const genericFlexStartDate = new Date(new Date(eventData.from_flexible_date).setHours(0, 0, 0, 0));
            const genericFlexEndDate = new Date(new Date(eventData.until_flexible_date).setHours(0, 0, 0, 0));
            eventData.from_flexible_date = genericFlexStartDate;
            eventData.until_flexible_date = genericFlexEndDate;
        }

        let newEvent: CreateEventDto[] = [];
        if (eventData.repeat) {
            newEvent = this.createRepeatedEvents(eventData);
        } else {
            newEvent.push(eventData);
        }

        return await this.advancedPlacementForCreate(newEvent);
    }

    async editEvent(eventData: EditEventDto) {
        const category: EventCategoryEnum = eventData.category as EventCategoryEnum;

        let newEvent: CreateEventDto = {
            user_id: eventData.user_id,
            name: eventData.name,
            priority: eventData.priority,
            flexible: eventData.flexible,
            start_date: eventData.start_date,
            end_date: eventData.end_date,
            whole_day: eventData.whole_day,
            from_flexible_date: eventData.from_flexible_date,
            until_flexible_date: eventData.until_flexible_date,
            start_time: eventData.start_time,
            end_time: eventData.end_time,
            from_flexible_time: eventData.from_flexible_time,
            until_flexible_time: eventData.until_flexible_time,
            alarms: eventData.alarms,
            location: eventData.location,
            category: category,
            description: eventData.description,
            repeat: eventData.repeat,
            repeat_type: eventData.repeat_type,
            repeat_interval: eventData.repeat_interval,
            flexible_event_id: null
        };

        await this.flexibleEventService.deleteFlexibleEvent(eventData.id);
        await this.absoluteEventService.deleteEvent(eventData.id);

        if(!await this.createEvent(newEvent)) {
            if(newEvent.flexible){
                await this.flexibleEventService.createAbsoluteEvent(this.createFlexEventForDB(newEvent));
            } else {
                await this.absoluteEventService.createAbsoluteEvent(newEvent);
            }
        }
    }

    createRepeatedEvents(eventData: CreateEventDto){
        let repeatedEvents: CreateEventDto[] = [];

        for(let i = 0; i <= eventData.repeat_interval; i++){
            let newEvent = {...eventData};
            newEvent.repeat = false;
            newEvent.start_date = new Date(newEvent.start_date);
            newEvent.end_date = new Date(newEvent.end_date);

            if (eventData.repeat_type.toString() === RepeatTypeEnum.DAILY.toString()) {
                newEvent.start_date.setDate(newEvent.start_date.getDate() + i);
                newEvent.end_date.setDate(newEvent.end_date.getDate() + i);
            } else if (eventData.repeat_type.toString() === RepeatTypeEnum.WEEKLY.toString()) {
                newEvent.start_date.setDate(newEvent.start_date.getDate() + i * 7);
                newEvent.end_date.setDate(newEvent.end_date.getDate() + i * 7);
            } else if (eventData.repeat_type.toString() === RepeatTypeEnum.MONTHLY.toString()) {
                newEvent.start_date.setMonth(newEvent.start_date.getMonth() + i);
                newEvent.end_date.setMonth(newEvent.end_date.getMonth() + i);
            } else if (eventData.repeat_type.toString() === RepeatTypeEnum.YEARLY.toString()) {
                newEvent.start_date.setFullYear(newEvent.start_date.getFullYear() + i);
                newEvent.end_date.setFullYear(newEvent.end_date.getFullYear() + i);
            }

            repeatedEvents.push(newEvent);
        }

        return repeatedEvents.reverse();
    }

    //if this method gets multiple events, its can only because of repeated events (which is only absolute type)
    async advancedPlacementForCreate(events: CreateEventDto[]): Promise<boolean> {
        let eventsCopy: CreateEventDto[] = events.slice();
        let flexibleEventsThatChangedPreviously: FlexibleEvent[] = [];
        let isChanged: boolean = true;
        let problematicEvent = events[0];

        for (let event of eventsCopy) {
            if (!event.whole_day && !await this.advancedPlacementHelper(event, flexibleEventsThatChangedPreviously)) {
                isChanged = false;
                problematicEvent = event;
                break;
            }
        }
        if(isChanged){
            for(let event of eventsCopy) {
                if(event.flexible){
                    let newFlexibleEvent = this.createFlexEventForDB(event);
                    await this.flexibleEventService.createAbsoluteEvent(newFlexibleEvent);
                } else {
                    await this.absoluteEventService.createAbsoluteEvent(event);
                }
            }
            for(let event of flexibleEventsThatChangedPreviously){
                await this.flexibleEventService.editFlexibleEvent(event);
            }
        } else {
            let overLappingFlexEvents = await this.OverlappingFlexEvents(problematicEvent.user_id, problematicEvent.start_date,
                problematicEvent.end_date, this.extractTime(problematicEvent.start_time), this.extractTime(problematicEvent.end_time));

            throw new CreationFailedError (overLappingFlexEvents, "Event creation failed")
        }

        return isChanged;
    }

    createFlexEventForDB(event: CreateEventDto): FlexibleEventEntity {
        const newFlexibleEvent = this.flexibleEventRepository.create({
            user_id: event.user_id,
            name: event.name,
            priority: event.priority,
            flexible: event.flexible,
            optimal_start_date: event.start_date ?? new Date(),
            optimal_end_date: event.end_date ?? new Date(),
            from_date: event.from_flexible_date ?? event.start_date ?? new Date(),
            until_date: event.until_flexible_date ?? event.end_date ?? new Date(),
            whole_day: false,
            optimal_start_time: event.start_time ?? new Date(),
            optimal_end_time: event.end_time ?? new Date(),
            from_time: event.from_flexible_time ?? event.start_time ?? new Date(),
            until_time: event.until_flexible_time ?? event.end_time ?? new Date(),
            location: event.location,
            category: event.category,
            description: event.description,
        });

        return newFlexibleEvent as FlexibleEventEntity;
    }

    async advancedPlacementHelper(
        newEvent: CreateEventDto,
        flexibleEventsThatChangedPreviously: FlexibleEvent[]
    ): Promise<boolean> {
        const { startDate, endDate, startTime, endTime } = this.extractEventDates(newEvent);

        const absoluteEvents = await this.absoluteEventService.getEventsByDateRange(newEvent.user_id, startDate, endDate);
        const overlappingAbsoluteEvents = this.findOverlappingAbsoluteEvents(
            absoluteEvents,
            startDate,
            endDate,
            startTime,
            endTime
        );

        const flexibleEvents = await this.flexibleEventService.getFlexibleEventsByDateRange(newEvent.user_id, startDate, endDate);
        const overlappingFlexibleEvents = this.findOverlappingFlexibleEvents(
            flexibleEvents.concat(flexibleEventsThatChangedPreviously),
            startDate,
            endDate,
            startTime,
            endTime
        );

        if (!newEvent.flexible && overlappingFlexibleEvents.length === 0) {
            console.log("No flexible events overlap with the new event");
            return true;
        }

        if (overlappingAbsoluteEvents.length === 0 && overlappingFlexibleEvents.length === 0) {
            console.log("No events overlap with the new event");
            return true;
        }

        if (!newEvent.flexible) {
            console.log("Checking if the new event (none flexible) overlaps with the existing events");
            for (const event of overlappingFlexibleEvents) {
                console.log(`Flexible event: ${event.name} overlaps with the new event`);
                if (!(await this.isEventOverlapping(event, newEvent, flexibleEventsThatChangedPreviously))) {
                    return false;
                } else {
                    flexibleEventsThatChangedPreviously.push(event);
                }
            }
            return true;
        }


        const { exactStartDate, exactEndDate, exactStartTime, exactEndTime } = this.extractFlexibleExactDates(newEvent);

        const absoluteExactEvents = await this.absoluteEventService.getEventsByDateRange(newEvent.user_id, exactStartDate, exactEndDate);
        const overlappingExactAbsoluteEvents = this.findOverlappingAbsoluteEvents(
            absoluteExactEvents,
            exactStartDate,
            exactEndDate,
            exactStartTime,
            exactEndTime
        );

        const flexibleExactEvents = await this.flexibleEventService.getFlexibleEventsByDateRange(newEvent.user_id, exactStartDate, exactEndDate);
        const overlappingExactFlexibleEvents = this.findOverlappingFlexibleEvents(
            flexibleExactEvents.concat(flexibleEventsThatChangedPreviously),
            exactStartDate,
            exactEndDate,
            exactStartTime,
            exactEndTime
        );

        if(overlappingExactAbsoluteEvents.length === 0 && overlappingExactFlexibleEvents.length === 0){
            return true;
        }

        if (overlappingExactAbsoluteEvents.length !== 0) {
            console.log("Checking if the new event (flexible) overlaps with the existing events");
            if (!this.findOriginalEventSpot(newEvent, overlappingAbsoluteEvents, overlappingFlexibleEvents)) {
                throw new CreationFailedError (overlappingFlexibleEvents, "Event creation failed")
            } else{
                return true;
            }
        }
        else {
            console.log("Checking if the new event (flexible) overlaps with the existing events");
            let flag = true;

            if (newEvent.priority === EventPriorityEnum.HIGH){
                for (const event of overlappingExactFlexibleEvents) {
                    console.log(`Flexible event: ${event.name} overlaps with the new event`);
                    if (!(await this.isEventOverlapping(event, newEvent, flexibleEventsThatChangedPreviously))) {
                        flag = false;
                    } else {
                        flexibleEventsThatChangedPreviously.push(event);
                    }
                }

                if(flag){
                    return true;
                } else {
                    if(!this.findOriginalEventSpot(newEvent, overlappingAbsoluteEvents, overlappingFlexibleEvents)) {
                        throw new CreationFailedError (overlappingFlexibleEvents, "Event creation failed")
                    } else {
                        return true;
                    }
                }
            } else {
                flag = this.findOriginalEventSpot(newEvent, overlappingAbsoluteEvents, overlappingFlexibleEvents);

                if(!flag){
                    for (const event of overlappingExactFlexibleEvents) {
                        console.log(`Flexible event: ${event.name} overlaps with the new event`);
                        if (!(await this.isEventOverlapping(event, newEvent, flexibleEventsThatChangedPreviously))) {
                            flag = false;
                        } else {
                            flexibleEventsThatChangedPreviously.push(event);
                        }
                    }
                    flag = true;
                }

                if(!flag) {
                    throw new CreationFailedError (overlappingFlexibleEvents, "Event creation failed")
                } else {
                    return true;
                }

            }
        }
    }

    private extractEventDates(event: CreateEventDto): { startDate: Date, endDate: Date, startTime: string, endTime: string } {
        const startDate = new Date(event.flexible ? event.from_flexible_date : event.start_date);
        const endDate = new Date(event.flexible ? event.until_flexible_date : event.end_date);
        const startTime = this.extractTime(event.flexible ? event.from_flexible_time : event.start_time);
        const endTime = this.extractTime(event.flexible ? event.until_flexible_time : event.end_time);

        return { startDate, endDate, startTime, endTime };
    }

    private extractFlexibleExactDates(event: CreateEventDto): { exactStartDate: Date, exactEndDate: Date, exactStartTime: string, exactEndTime: string } {
        const exactStartDate = new Date(event.start_date);
        const exactEndDate = new Date(event.end_date);
        const exactStartTime = this.extractTime(event.start_time);
        const exactEndTime = this.extractTime(event.end_time);

        return { exactStartDate, exactEndDate, exactStartTime, exactEndTime };
    }

    private findOverlappingAbsoluteEvents(
        events: AbsoluteEvent[],
        startDate: Date,
        endDate: Date,
        startTime: string,
        endTime: string
    ): AbsoluteEvent[] {
        return events.filter(event => {
            const eventStartDate = new Date(event.start_date);
            const eventEndDate = new Date(event.end_date);

            const dateOverlap = eventStartDate <= endDate && eventEndDate >= startDate;

            if (event.whole_day) {
                return false;
            } else {
                return dateOverlap && this.isTimeOverlapping(
                    this.extractTime(event.start_time),
                    this.extractTime(event.end_time),
                    startTime,
                    endTime
                );
            }
        });
    }

    private findOverlappingFlexibleEvents(
        events: FlexibleEvent[],
        startDate: Date,
        endDate: Date,
        startTime: string,
        endTime: string
    ): FlexibleEvent[] {
        const dateOverlappingEvents = events.filter(event =>
            new Date(event.optimal_start_date) >= startDate && new Date(event.optimal_end_date) <= endDate
        );

        return dateOverlappingEvents.filter(event =>
            this.isTimeOverlapping(
                this.extractTime(event.optimal_start_time),
                this.extractTime(event.optimal_end_time),
                startTime,
                endTime
            )
        );
    }

    async OverlappingFlexEvents(
        userId: number,
        startDate: Date,
        endDate: Date,
        startTime: string,
        endTime: string
    ): Promise<FlexibleEvent[]> {
        let events = await this.flexibleEventService.getFlexibleEventsByDateRange(userId, startDate, endDate);

        return events.filter(event =>
            this.isTimeOverlapping(
                this.extractTime(event.optimal_start_time),
                this.extractTime(event.optimal_end_time),
                startTime,
                endTime
            )
        );
    }

    private extractTime(dateTimeString: string | Date): string {
        const date = typeof dateTimeString === 'string' ? new Date(dateTimeString) : dateTimeString;
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }

    private timeToMinutes(timeString: string): number {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes;
    }

    private isTimeOverlapping(start1: string, end1: string, start2: string, end2: string): boolean {
        return (start1 >= start2 && start1 < end2) ||
            (end1 > start2 && end1 <= end2) ||
            (start1 <= start2 && end1 >= end2);
    }

    private getTimeOfDay(date: Date): number {
        return date.getHours() * 3600000 + date.getMinutes() * 60000 + date.getSeconds() * 1000 + date.getMilliseconds();
    }

    async isEventOverlapping(
        event1: FlexibleEvent,
        event2: CreateEventDto,
        flexibleEventsThatChangedPreviously: FlexibleEvent[]
    ): Promise<boolean> {
        const event2StartDate = new Date(event2.flexible ? event2.from_flexible_date : event2.start_date);
        const event2StartMinutes = this.timeToMinutes(this.extractTime(event2.start_time));
        const event2EndMinutes = this.timeToMinutes(this.extractTime(event2.end_time));

        const eventRange = {
            from_date: new Date(event1.from_date),
            until_date: new Date(event1.until_date),
            from_time: event1.from_time,
            until_time: event1.until_time
        };

        const overlappingEvents = await this.getOverlappingEvents(event1.user_id, eventRange, flexibleEventsThatChangedPreviously);

        const len = this.calculateEventLength(event1);

        for (let d = new Date(eventRange.from_date); d <= eventRange.until_date; d.setUTCDate(d.getUTCDate() + 1)) {
            if (this.findAvailableSlot(d, event1, event2, len, event2StartDate, event2StartMinutes, event2EndMinutes, overlappingEvents)) {
                return true;
            }
        }

        return false;
    }

    private async getOverlappingEvents(
        userId: number,
        eventRange: { from_date: Date, until_date: Date, from_time: Date, until_time: Date },
        flexibleEventsThatChangedPreviously: FlexibleEvent[]
    ): Promise<{ absolute: AbsoluteEvent[], flexible: FlexibleEvent[] }> {
        // Create Maps to store unique events, giving priority to changed events
        const flexibleEventsMap = new Map<number, FlexibleEvent>();

        let absoluteEvents = await this.absoluteEventService.getEventsByDateRange(userId, eventRange.from_date, eventRange.until_date);
        absoluteEvents = absoluteEvents.filter(event => this.isAbsoluteEventDateOverlapping(event, eventRange));

        flexibleEventsThatChangedPreviously.forEach(event => {
            if (this.isFlexibleEventDateOverlapping(event, eventRange)) {
                flexibleEventsMap.set(event.id, event);
            }
        });
        let flexibleEventsDB = await this.flexibleEventService.getFlexibleEventsByDateRange(userId, eventRange.from_date, eventRange.until_date);
        flexibleEventsDB.forEach(event => {
            if (this.isFlexibleEventDateOverlapping(event, eventRange) && !flexibleEventsMap.has(event.id)) {
                flexibleEventsMap.set(event.id, event);
            }
        });

        const flexibleEvents = Array.from(flexibleEventsMap.values());

        return {
            absolute: this.filterAbsoluteEventsByTime(absoluteEvents, eventRange),
            flexible: this.filterFlexibleEventsByTime(flexibleEvents, eventRange)
        };
    }

    private isAbsoluteEventDateOverlapping(event: AbsoluteEvent, eventRange: { from_date: Date, until_date: Date }): boolean {
        return event.start_date.getTime() >= eventRange.from_date.getTime() && event.end_date.getTime() <= eventRange.until_date.getTime();
    }

    private isFlexibleEventDateOverlapping(event: FlexibleEvent, eventRange: { from_date: Date, until_date: Date }): boolean {
        return event.optimal_start_date.getTime() >= eventRange.from_date.getTime() && event.optimal_end_date.getTime() <= eventRange.until_date.getTime();
    }

    private filterAbsoluteEventsByTime(events: AbsoluteEvent[], eventRange: { from_time: Date, until_time: Date }): AbsoluteEvent[] {
        return events.filter(event => {
            const eventStartTime = this.getTimeOfDay(event.start_time);
            const eventEndTime = this.getTimeOfDay(event.end_time);
            const rangeStartTime = this.getTimeOfDay(eventRange.from_time);
            const rangeEndTime = this.getTimeOfDay(eventRange.until_time);

            return (eventStartTime >= rangeStartTime && eventStartTime <= rangeEndTime) ||
                (eventEndTime >= rangeStartTime && eventEndTime <= rangeEndTime);
        });
    }

    private filterFlexibleEventsByTime(events: FlexibleEvent[], eventRange: { from_time: Date, until_time: Date }): FlexibleEvent[] {
        return events.filter(event => {
            const eventStartTime = this.getTimeOfDay(event.optimal_start_time);
            const eventEndTime = this.getTimeOfDay(event.optimal_end_time);
            const rangeStartTime = this.getTimeOfDay(eventRange.from_time);
            const rangeEndTime = this.getTimeOfDay(eventRange.until_time);

            return (eventStartTime > rangeStartTime && eventStartTime < rangeEndTime) ||
                (eventEndTime > rangeStartTime && eventEndTime < rangeEndTime);
        });
    }

    private calculateEventLength(event: FlexibleEvent): number {
        return (event.optimal_end_time.getHours() * 60 + event.optimal_end_time.getMinutes()) -
            (event.optimal_start_time.getHours() * 60 + event.optimal_start_time.getMinutes());
    }

    private findAvailableSlot(
        d: Date,
        event1: FlexibleEvent,
        event2: CreateEventDto,
        len: number,
        event2StartDate: Date,
        event2StartMinutes: number,
        event2EndMinutes: number,
        overlappingEvents: { absolute: AbsoluteEvent[], flexible: FlexibleEvent[] }
    ): boolean {
        const startTime = event1.from_time.getHours() * 60 + event1.from_time.getMinutes();
        const endTime = event1.until_time.getHours() * 60 + event1.until_time.getMinutes();

        let startForCreate = event1.from_time.getUTCHours() * 60 + event1.from_time.getMinutes();

        const eventsInDayD = {
            absolute: overlappingEvents.absolute.filter(event => event.start_date.getUTCDate() === d.getUTCDate()),
            flexible: overlappingEvents.flexible.filter(event => event.optimal_start_date.getUTCDate() === d.getUTCDate() && event.id !== event1.id)
        };

        for (let i = startTime; i <= endTime - len; i += 15, startForCreate += 15) {
            const intervalStart = i;
            const intervalEnd = i + len;

            if (d.getDate() === event2StartDate.getDate() && (event2StartMinutes < intervalEnd && event2EndMinutes > intervalStart)) {
                continue;
            }

            if (!this.isIntervalOverlapping(intervalStart, intervalEnd, eventsInDayD)) {
                this.updateEventOptimalTimes(event1, d, startForCreate, startForCreate + len);
                console.log("Event placed at: " + event1.optimal_start_time.toString() + " - " + event1.optimal_end_time.toString());
                return true;
            }
        }

        return false;
    }

    private isIntervalOverlapping(intervalStart: number, intervalEnd: number, eventsInDayD: { absolute: AbsoluteEvent[], flexible: FlexibleEvent[] }): boolean {
        return eventsInDayD.absolute.some(event =>
            this.timeToMinutes(this.extractTime(event.start_time)) < intervalEnd &&
            this.timeToMinutes(this.extractTime(event.end_time)) > intervalStart
        ) || eventsInDayD.flexible.some(event =>
            this.timeToMinutes(this.extractTime(event.optimal_start_time)) < intervalEnd &&
            this.timeToMinutes(this.extractTime(event.optimal_end_time)) > intervalStart
        );
    }

    private updateEventOptimalTimes(event: FlexibleEvent, d: Date, intervalStart: number, intervalEnd: number): void {
        event.optimal_start_date = new Date(d);
        event.optimal_end_date = new Date(d);
        event.optimal_start_time = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), intervalStart / 60, intervalStart % 60));
        event.optimal_end_time = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), intervalEnd / 60, intervalEnd % 60));
    }

    private findOriginalEventSpot(newEvent: CreateEventDto, overlappingAbsoluteEvents: AbsoluteEvent[], overlappingFlexibleEvents: FlexibleEvent[]): boolean {
        if (!newEvent.flexible || !newEvent.from_flexible_date || !newEvent.until_flexible_date || !newEvent.from_flexible_time || !newEvent.until_flexible_time) {
            console.log("Event is not flexible or missing flexible date/time information");
            return false;
        }

        const startDate = new Date(newEvent.from_flexible_date);
        const endDate = new Date(newEvent.until_flexible_date);
        const eventDuration = this.calculateEventLength({
            optimal_start_time: new Date(newEvent.start_time),
            optimal_end_time: new Date(newEvent.end_time)
        } as FlexibleEvent);

        for (let currentDate = new Date(startDate); currentDate <= endDate; currentDate.setDate(currentDate.getDate() + 1)) {
            const availableSlot = this.findAvailableSlotInDay(
                currentDate,
                newEvent,
                eventDuration,
                overlappingAbsoluteEvents,
                overlappingFlexibleEvents
            );

            if (availableSlot) {
                // Update newEvent with the found slot
                const intervalStart = availableSlot.start.getUTCHours() * 60 + availableSlot.start.getUTCMinutes();
                const intervalEnd = availableSlot.end.getUTCHours() * 60 + availableSlot.end.getUTCMinutes();

                this.updateOriginalEventOptimalTimes(newEvent, currentDate, intervalStart, intervalEnd);

                console.log(`Found slot for event: ${newEvent.name} at ${newEvent.start_date} ${newEvent.start_time.toUTCString()} - ${newEvent.end_time.toUTCString()}`);
                return true;
            }
        }

        return false;
    }

    private updateOriginalEventOptimalTimes(event: CreateEventDto, d: Date, intervalStart: number, intervalEnd: number): void {
        event.start_date = new Date(d);
        event.end_date = new Date(d);
        event.start_time = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), intervalStart / 60, intervalStart % 60));
        event.end_time = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), intervalEnd / 60, intervalEnd % 60));
    }

    private findAvailableSlotInDay(
        currentDate: Date,
        newEvent: CreateEventDto,
        eventDuration: number,
        overlappingAbsoluteEvents: AbsoluteEvent[],
        overlappingFlexibleEvents: FlexibleEvent[]
    ): { start: Date, end: Date } | null {
        const dayStart = new Date(currentDate);
        const flexibleStartTime = new Date(newEvent.from_flexible_time);
        dayStart.setHours(flexibleStartTime.getHours(), flexibleStartTime.getMinutes(), 0, 0);

        const dayEnd = new Date(currentDate);
        const flexibleEndTime = new Date(newEvent.until_flexible_time);
        dayEnd.setHours(flexibleEndTime.getHours(), flexibleEndTime.getMinutes(), 59, 999);

        const eventsInDay = {
            absolute: overlappingAbsoluteEvents.filter(event => this.isSameDay(new Date(event.start_date), currentDate)),
            flexible: overlappingFlexibleEvents.filter(event => this.isSameDay(new Date(event.optimal_start_date), currentDate))
        };

        for (let i = this.timeToMinutes(this.extractTime(dayStart)); i <= this.timeToMinutes(this.extractTime(dayEnd)) - eventDuration; i += 15) {
            const intervalStart = i;
            const intervalEnd = i + eventDuration;

            if (!this.isIntervalOverlapping(intervalStart, intervalEnd, eventsInDay)) {
                const startTime = new Date(currentDate);
                startTime.setHours(Math.floor(intervalStart / 60), intervalStart % 60, 0, 0);
                const endTime = new Date(currentDate);
                endTime.setHours(Math.floor(intervalEnd / 60), intervalEnd % 60, 0, 0);
                return { start: startTime, end: endTime };
            }
        }

        return null;
    }

    private isSameDay(date1: Date, date2: Date): boolean {
        return date1.getUTCFullYear() === date2.getUTCFullYear() &&
            date1.getUTCMonth() === date2.getUTCMonth() &&
            date1.getUTCDate() === date2.getUTCDate();
    }

    private mockAbsoluteEvents: AbsoluteEvent[] = [
        {
            id: 1,
            user_id: 1,
            name: "Morning Meeting",
            priority: EventPriorityEnum.HIGH,
            flexible: false,
            start_date: new Date(Date.UTC(2023, 7, 1)), // August is month 7 in JavaScript
            end_date: new Date(Date.UTC(2023, 7, 1)),
            whole_day: false,
            start_time: new Date(Date.UTC(2023, 7, 1, 9, 0)), // 09:00 UTC
            end_time: new Date(Date.UTC(2023, 7, 1, 10, 0)), // 10:00 UTC
            repeat: false,
            repeat_type: null,
            repeat_interval: null,
            location: "Conference Room A",
            category: EventCategoryEnum.WORK,
            description: "Daily team sync-up meeting",
            alarms: [],
            flexible_event_id: null
        },
        {
            id: 2,
            user_id: 1,
            name: "Lunch Break",
            priority: EventPriorityEnum.HIGH,
            flexible: false,
            start_date: new Date(Date.UTC(2023, 7, 1)),
            end_date: new Date(Date.UTC(2023, 7, 1)),
            whole_day: false,
            start_time: new Date(Date.UTC(2023, 7, 1, 12, 0)), // 12:00 UTC
            end_time: new Date(Date.UTC(2023, 7, 1, 13, 0)), // 13:00 UTC
            repeat: false,
            repeat_type: null,
            repeat_interval: null,
            location: "Cafeteria",
            category: EventCategoryEnum.PERSONAL,
            description: "Lunch break",
            alarms: [],
            flexible_event_id: null
        },
        {
            id: 3,
            user_id: 1,
            name: "Project Deadline",
            priority: EventPriorityEnum.HIGH,
            flexible: false,
            start_date: new Date(Date.UTC(2023, 7, 2)),
            end_date: new Date(Date.UTC(2023, 7, 2, 23, 59, 59)),
            whole_day: true,
            start_time: new Date(Date.UTC(2023, 7, 2, 0, 0)),
            end_time: new Date(Date.UTC(2023, 7, 2, 23, 59, 59)),
            repeat: false,
            repeat_type: null,
            repeat_interval: null,
            location: "",
            category: EventCategoryEnum.WORK,
            description: "Project X deadline",
            alarms: [],
            flexible_event_id: null
        },
        {
            id: 4,
            user_id: 1,
            name: "Lunch Break2",
            priority: EventPriorityEnum.HIGH,
            flexible: false,
            start_date: new Date(Date.UTC(2023, 7, 1)),
            end_date: new Date(Date.UTC(2023, 7, 1)),
            whole_day: false,
            start_time: new Date(Date.UTC(2023, 7, 1, 16, 15)),
            end_time: new Date(Date.UTC(2023, 7, 1, 16, 45)),
            repeat: false,
            repeat_type: null,
            repeat_interval: null,
            location: "Cafeteria",
            category: EventCategoryEnum.PERSONAL,
            description: "Lunch break",
            alarms: [],
            flexible_event_id: null
        },
    ];

    private mockFlexibleEvents: FlexibleEvent[] = [
        {
            id: 101,
            user_id: 1,
            name: "Gym Workout",
            priority: EventPriorityEnum.LOW,
            flexible: true,
            optimal_start_date: new Date(Date.UTC(2023, 7, 1)),
            optimal_end_date: new Date(Date.UTC(2023, 7, 1)),
            from_date: new Date(Date.UTC(2023, 7, 1)),
            until_date: new Date(Date.UTC(2023, 7, 1)),
            whole_day: false,
            optimal_start_time: new Date(Date.UTC(2023, 7, 1, 18, 0)), // 18:00 UTC
            optimal_end_time: new Date(Date.UTC(2023, 7, 1, 19, 30)), // 19:30 UTC
            from_time: new Date(Date.UTC(2023, 7, 1, 17, 0)), // 17:00 UTC
            until_time: new Date(Date.UTC(2023, 7, 1, 21, 0)), // 21:00 UTC
            location: "Fitness Center",
            category: EventCategoryEnum.HEALTH,
            description: "Regular gym session"
        },
        {
            id: 102,
            user_id: 1,
            name: "Team Building Activity",
            priority: EventPriorityEnum.LOW,
            flexible: true,
            optimal_start_date: new Date(Date.UTC(2023, 7, 1)),
            optimal_end_date: new Date(Date.UTC(2023, 7, 1)),
            from_date: new Date(Date.UTC(2023, 7, 1)),
            until_date: new Date(Date.UTC(2023, 7, 3)),
            whole_day: false,
            optimal_start_time: new Date(Date.UTC(2023, 7, 1, 14, 0)), // 14:00 UTC
            optimal_end_time: new Date(Date.UTC(2023, 7, 1, 16, 0)), // 16:00 UTC
            from_time: new Date(Date.UTC(2023, 7, 1, 13, 0)), // 13:00 UTC
            until_time: new Date(Date.UTC(2023, 7, 1, 17, 0)), // 17:00 UTC
            location: "Park",
            category: EventCategoryEnum.WORK,
            description: "Monthly team building event"
        },
        {
            id: 103,
            user_id: 1,
            name: "Gym Workout",
            priority: EventPriorityEnum.LOW,
            flexible: true,
            optimal_start_date: new Date(Date.UTC(2023, 7, 2)),
            optimal_end_date: new Date(Date.UTC(2023, 7, 2)),
            from_date: new Date(Date.UTC(2023, 7, 2)),
            until_date: new Date(Date.UTC(2023, 7, 2)),
            whole_day: false,
            optimal_start_time: new Date(Date.UTC(2023, 7, 2, 12, 0)),
            optimal_end_time: new Date(Date.UTC(2023, 7, 2, 14, 30)),
            from_time: new Date(Date.UTC(2023, 7, 2, 11, 0)),
            until_time: new Date(Date.UTC(2023, 7, 2, 15, 0)),
            location: "Fitness Center",
            category: EventCategoryEnum.HEALTH,
            description: "Regular gym session"
        },
        {
            id: 104,
            user_id: 1,
            name: "test",
            priority: EventPriorityEnum.LOW,
            flexible: true,
            optimal_start_date: new Date(Date.UTC(2023, 7, 1)),
            optimal_end_date: new Date(Date.UTC(2023, 7, 1)),
            from_date: new Date(Date.UTC(2023, 7, 1)),
            until_date: new Date(Date.UTC(2023, 7, 2)),
            whole_day: false,
            optimal_start_time: new Date(Date.UTC(2023, 7, 1, 11, 0)),
            optimal_end_time: new Date(Date.UTC(2023, 7, 1, 11, 45)),
            from_time: new Date(Date.UTC(2023, 7, 1, 10, 30)),
            until_time: new Date(Date.UTC(2023, 7, 1, 12, 0)),
            location: "Fitness Center",
            category: EventCategoryEnum.HEALTH,
            description: "Regular gym session"
        }
    ];

}
