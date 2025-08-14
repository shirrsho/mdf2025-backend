import { Controller, Post, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TimeslotCrudService } from '../providers';
import { BaseController } from '@/modules/base';

@ApiTags('v1/timeslot-seed')
@Controller({ path: 'timeslot-seed', version: '1' })
export class TimeslotSeedController extends BaseController {
  constructor(private readonly timeslotService: TimeslotCrudService) {
    super();
  }

  @Post('create-sample-timeslots')
  @ApiOperation({
    summary: 'Create sample timeslots',
    description: 'Creates sample timeslots for testing the webinar system.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Sample timeslots created successfully.',
  })
  async createSampleTimeslots() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    const sampleTimeslots = [
      {
        timeslotName: 'Morning Session - Day 1',
        startTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 9, 0, 0),
        endTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 12, 0, 0),
        description: 'Morning session for Day 1 webinars (9:00 AM - 12:00 PM)',
      },
      {
        timeslotName: 'Afternoon Session - Day 1',
        startTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 14, 0, 0),
        endTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 17, 0, 0),
        description: 'Afternoon session for Day 1 webinars (2:00 PM - 5:00 PM)',
      },
      {
        timeslotName: 'Evening Session - Day 1',
        startTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 18, 0, 0),
        endTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 21, 0, 0),
        description: 'Evening session for Day 1 webinars (6:00 PM - 9:00 PM)',
      },
      {
        timeslotName: 'Morning Session - Day 2',
        startTime: new Date(dayAfterTomorrow.getFullYear(), dayAfterTomorrow.getMonth(), dayAfterTomorrow.getDate(), 9, 0, 0),
        endTime: new Date(dayAfterTomorrow.getFullYear(), dayAfterTomorrow.getMonth(), dayAfterTomorrow.getDate(), 12, 0, 0),
        description: 'Morning session for Day 2 webinars (9:00 AM - 12:00 PM)',
      },
      {
        timeslotName: 'Afternoon Session - Day 2',
        startTime: new Date(dayAfterTomorrow.getFullYear(), dayAfterTomorrow.getMonth(), dayAfterTomorrow.getDate(), 14, 0, 0),
        endTime: new Date(dayAfterTomorrow.getFullYear(), dayAfterTomorrow.getMonth(), dayAfterTomorrow.getDate(), 17, 0, 0),
        description: 'Afternoon session for Day 2 webinars (2:00 PM - 5:00 PM)',
      },
      {
        timeslotName: 'Evening Session - Day 2',
        startTime: new Date(dayAfterTomorrow.getFullYear(), dayAfterTomorrow.getMonth(), dayAfterTomorrow.getDate(), 18, 0, 0),
        endTime: new Date(dayAfterTomorrow.getFullYear(), dayAfterTomorrow.getMonth(), dayAfterTomorrow.getDate(), 21, 0, 0),
        description: 'Evening session for Day 2 webinars (6:00 PM - 9:00 PM)',
      },
    ];

    const createdTimeslots = [];
    for (const timeslotData of sampleTimeslots) {
      try {
        const timeslot = await this.timeslotService.create(timeslotData);
        createdTimeslots.push(timeslot);
      } catch (error) {
        // Continue if timeslot already exists
        console.warn(`Timeslot '${timeslotData.timeslotName}' may already exist`);
      }
    }

    return {
      message: `Successfully created ${createdTimeslots.length} sample timeslots`,
      timeslots: createdTimeslots,
    };
  }
}
