import {
  Injectable,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from '@/modules/base';
import { Webinar, WebinarDocument } from '../schema';
import { TimeslotCrudService } from '../../timeslot/providers';

@Injectable()
export class WebinarValidationService extends BaseService<WebinarDocument> {
  constructor(
    @InjectModel(Webinar.name)
    private readonly webinarModel: Model<WebinarDocument>,
    private readonly timeslotService: TimeslotCrudService,
  ) {
    super(WebinarValidationService.name);
  }

  /**
   * Validates if a webinar can be scheduled in the given timeslot
   * without overlapping with existing webinars
   */
  async validateWebinarScheduling(
    timeslotId: string,
    duration: number,
    requestedStartTime?: Date,
    excludeWebinarId?: string,
  ): Promise<Date> {
    // Get the timeslot details
    const timeslot = await this.timeslotService.findById(timeslotId);
    if (!timeslot) {
      throw new BadRequestException('Invalid timeslot ID');
    }

    // Check if the timeslot duration can accommodate the webinar duration
    const timeslotDurationMs = 
      new Date(timeslot.endTime).getTime() - new Date(timeslot.startTime).getTime();
    const timeslotDurationMinutes = timeslotDurationMs / (1000 * 60);

    if (timeslotDurationMinutes < duration) {
      throw new ConflictException(
        `Timeslot duration (${timeslotDurationMinutes} minutes) is insufficient for webinar duration (${duration} minutes)`,
      );
    }

    // If no specific start time is requested, use the timeslot start time
    const webinarStartTime = requestedStartTime || timeslot.startTime;
    const webinarEndTime = this.calculateWebinarEndTime(webinarStartTime, duration);

    // Validate that the webinar fits within the timeslot boundaries
    if (webinarStartTime < timeslot.startTime || webinarEndTime > timeslot.endTime) {
      throw new ConflictException(
        `Webinar (${webinarStartTime.toISOString()} - ${webinarEndTime.toISOString()}) must fit within timeslot bounds (${timeslot.startTime.toISOString()} - ${timeslot.endTime.toISOString()})`,
      );
    }

    // Check for overlapping webinars within the same timeslot
    await this.validateWebinarTimeOverlap(
      timeslot?.id,
      webinarStartTime,
      webinarEndTime,
      excludeWebinarId,
    );

    return webinarStartTime;
  }

  /**
   * Validates that no webinars overlap with the given time range within a specific timeslot
   */
  private async validateWebinarTimeOverlap(
    timeslotId: string,
    webinarStartTime: Date,
    webinarEndTime: Date,
    excludeWebinarId?: string,
  ): Promise<void> {
    const existingWebinarsQuery: any = { 
      timeslot: timeslotId,
      status: { $ne: 'cancelled' } // Exclude cancelled webinars - they free up their timeslots
    };

    // If we're updating a webinar, exclude it from the check
    if (excludeWebinarId) {
      existingWebinarsQuery._id = { $ne: excludeWebinarId };
    }

    // First, check if there are any cancelled webinars that would be freed up
    const cancelledWebinars = await this.webinarModel
      .find({ 
        timeslot: timeslotId,
        status: 'cancelled'
      })
      .exec();

    if (cancelledWebinars.length > 0) {
      this.logInfo(`Found ${cancelledWebinars.length} cancelled webinar(s) in timeslot ${timeslotId}. These have freed up their timeslots for new bookings.`);
    }

    const existingWebinars = await this.webinarModel
      .find(existingWebinarsQuery)
      .populate('timeslot')
      .exec();

    this.logInfo(`Checking for overlaps with ${existingWebinars.length} active webinar(s) in timeslot ${timeslotId}`);

    // Check each existing webinar for overlap
    for (const existingWebinar of existingWebinars) {
      // Get the actual start time of the existing webinar
      const existingStartTime = existingWebinar.scheduledStartTime || 
        new Date((existingWebinar as any).timeslot.startTime);
      const existingEndTime = this.calculateWebinarEndTime(existingStartTime, existingWebinar.duration);

      // Check for overlap
      const hasOverlap = this.checkTimeOverlap(
        webinarStartTime,
        webinarEndTime,
        existingStartTime,
        existingEndTime,
      );

      if (hasOverlap) {
        throw new ConflictException(
          `Webinar time (${webinarStartTime.toISOString()} - ${webinarEndTime.toISOString()}) overlaps with existing webinar "${existingWebinar.title}" (${existingStartTime.toISOString()} - ${existingEndTime.toISOString()})`,
        );
      }
    }
  }

  /**
   * Helper method to check if two time ranges overlap
   */
  private checkTimeOverlap(
    start1: Date,
    end1: Date,
    start2: Date,
    end2: Date,
  ): boolean {
    // Two time ranges overlap if:
    // - Range 1 starts before Range 2 ends AND Range 1 ends after Range 2 starts
    return start1 < end2 && end1 > start2;
  }

  /**
   * Calculates the end time of a webinar based on timeslot start time and duration
   */
  calculateWebinarEndTime(startTime: Date, duration: number): Date {
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + duration);
    return endTime;
  }

  /**
   * Validates webinar duration against minimum requirements
   */
  validateWebinarDuration(duration: number): number {
    if (!duration || duration < 1) {
      throw new BadRequestException(
        'Duration must be at least 1 minute',
      );
    }
    if (duration > 1440) { // 24 hours max
      throw new BadRequestException(
        'Duration cannot exceed 1440 minutes (24 hours)',
      );
    }
    return duration;
  }

  /**
   * Finds available time slots within a timeslot for a given duration
   */
  async findAvailableTimeSlots(
    timeslotId: string,
    duration: number,
  ): Promise<{ startTime: Date; endTime: Date }[]> {
    const timeslot = await this.timeslotService.findById(timeslotId);
    if (!timeslot) {
      return [];
    }

    // First check for cancelled webinars - these free up their slots
    const cancelledWebinars = await this.webinarModel
      .find({ 
        timeslot: timeslot,
        status: 'cancelled'
      })
      .exec();

    if (cancelledWebinars.length > 0) {
      this.logInfo(`Found ${cancelledWebinars.length} cancelled webinar(s) in timeslot ${timeslotId}. Their slots are now available.`);
    }

    const existingWebinars = await this.webinarModel
      .find({ 
        timeslot: timeslot,
        status: { $ne: 'cancelled' } // Only consider active webinars - cancelled ones free up their slots
      })
      .populate('timeslot')
      .exec();

    this.logInfo(`Calculating availability for timeslot ${timeslotId}: ${existingWebinars.length} active webinar(s) occupying slots`);

    // Create a list of occupied time ranges
    const occupiedRanges: { start: Date; end: Date }[] = [];
    
    for (const webinar of existingWebinars) {
      const startTime = webinar.scheduledStartTime || 
        new Date((webinar as any).timeslot.startTime);
      const endTime = this.calculateWebinarEndTime(startTime, webinar.duration);
      occupiedRanges.push({ start: startTime, end: endTime });
    }

    // Sort occupied ranges by start time
    occupiedRanges.sort((a, b) => a.start.getTime() - b.start.getTime());

    // Find available slots
    const availableSlots: { startTime: Date; endTime: Date }[] = [];
    const timeslotStart = new Date(timeslot.startTime);
    const timeslotEnd = new Date(timeslot.endTime);
    const durationMs = duration * 60 * 1000;

    let currentTime = timeslotStart;

    for (const occupied of occupiedRanges) {
      // Check if there's space before this occupied range
      if (currentTime.getTime() + durationMs <= occupied.start.getTime()) {
        const slotEnd = new Date(currentTime.getTime() + durationMs);
        availableSlots.push({
          startTime: new Date(currentTime),
          endTime: slotEnd,
        });
      }
      
      // Move current time to after this occupied range
      currentTime = new Date(Math.max(currentTime.getTime(), occupied.end.getTime()));
    }

    // Check if there's space after the last occupied range
    if (currentTime.getTime() + durationMs <= timeslotEnd.getTime()) {
      const slotEnd = new Date(currentTime.getTime() + durationMs);
      availableSlots.push({
        startTime: new Date(currentTime),
        endTime: slotEnd,
      });
    }

    return availableSlots;
  }
}
