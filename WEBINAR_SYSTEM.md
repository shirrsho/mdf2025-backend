# Webinar Scheduling System

## Overview

A comprehensive webinar scheduling system that allows multiple webinars to be scheduled within the same timeslot as long as they don't temporally overlap. The system supports flexible duration management and sophisticated time-based validation.

## Key Features

### 1. Duration Management
- **Fixed Durations**: 30 minutes, 1 hour, 1.5 hours, 2 hours
- **Enum-based Validation**: WebinarDuration enum ensures only valid durations
- **Type Safety**: TypeScript ensures compile-time validation

### 2. Time-based Scheduling
- **Multiple Webinars per Timeslot**: Allows multiple webinars in same timeslot if no temporal overlap
- **Precise Scheduling**: Uses scheduledStartTime for exact scheduling within timeslots
- **Overlap Detection**: Mathematical overlap checking using time ranges

### 3. Flexible Scheduling Rules
- Example: Timeslot 2pm-5pm can have:
  - Webinar A: 2:00pm-2:30pm (30 min)
  - Webinar B: 2:30pm-4:00pm (1.5 hrs)
  - Available: 4:00pm-5:00pm (1 hr slot remaining)

## System Architecture

### Core Components

#### 1. WebinarDuration Enum
```typescript
export enum WebinarDuration {
  THIRTY_MINUTES = 30,
  ONE_HOUR = 60,
  ONE_AND_HALF_HOUR = 90,
  TWO_HOURS = 120,
}
```

#### 2. Webinar Schema
```typescript
{
  title: string,
  description: string,
  timeslotId: ObjectId,
  duration: WebinarDuration,
  scheduledStartTime: Date,
  // ... other fields
}
```

#### 3. Timeslot Schema
```typescript
{
  title: string,
  startTime: Date,
  endTime: Date,
  isAvailable: boolean,
  // ... other fields
}
```

#### 4. WebinarValidationService
- **validateWebinarScheduling()**: Ensures no time conflicts
- **findAvailableTimeSlots()**: Finds available time windows
- **checkTimeOverlap()**: Mathematical overlap detection

## API Endpoints

### Webinar Endpoints
- `GET /api/webinar` - List all webinars
- `GET /api/webinar/:id` - Get specific webinar
- `POST /api/webinar` - Create new webinar (with validation)
- `PATCH /api/webinar/:id` - Update webinar
- `DELETE /api/webinar/:id` - Delete webinar
- `GET /api/webinar/available-slots/:timeslotId?duration=60` - Find available time slots

### Timeslot Endpoints
- `GET /api/timeslot` - List all timeslots
- `GET /api/timeslot/available` - List available timeslots
- `POST /api/timeslot` - Create new timeslot
- `PATCH /api/timeslot/:id` - Update timeslot
- `DELETE /api/timeslot/:id` - Delete timeslot

### Seed Data Endpoint
- `POST /api/timeslot-seed/create-sample-timeslots` - Create sample data

## Validation Logic

### Time Overlap Detection
```typescript
function checkTimeOverlap(start1: Date, end1: Date, start2: Date, end2: Date): boolean {
  return start1 < end2 && end1 > start2;
}
```

### Scheduling Validation
1. Check if timeslot exists and is available
2. Verify scheduledStartTime is within timeslot bounds
3. Calculate webinar end time based on duration
4. Check for overlaps with existing webinars
5. Ensure webinar fits within timeslot boundaries

### Available Slots Algorithm
1. Get all existing webinars in the timeslot
2. Create occupied time ranges
3. Sort by start time
4. Find gaps between occupied ranges
5. Filter gaps that can accommodate requested duration

## Usage Examples

### Creating a Webinar
```typescript
POST /api/webinar
{
  "title": "Introduction to React",
  "description": "Learn React basics",
  "timeslotId": "507f1f77bcf86cd799439011",
  "duration": 60,
  "scheduledStartTime": "2024-08-13T14:00:00.000Z"
}
```

### Finding Available Slots
```typescript
GET /api/webinar/available-slots/507f1f77bcf86cd799439011?duration=60

Response:
[
  {
    "startTime": "2024-08-13T16:00:00.000Z",
    "endTime": "2024-08-13T17:00:00.000Z"
  }
]
```

## Database Schema

### Webinar Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  timeslotId: ObjectId,
  duration: Number, // WebinarDuration enum value
  scheduledStartTime: Date,
  slug: String,
  isActive: Boolean,
  isDeleted: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Timeslot Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  startTime: Date,
  endTime: Date,
  isAvailable: Boolean,
  slug: String,
  isActive: Boolean,
  isDeleted: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Testing Scenarios

### Valid Scenarios
1. Single webinar in timeslot
2. Multiple non-overlapping webinars
3. Back-to-back webinars (2:00-2:30, 2:30-4:00)
4. Webinars with gaps between them

### Invalid Scenarios
1. Overlapping webinars
2. Webinar starting before timeslot
3. Webinar ending after timeslot
4. Invalid duration values

## Error Handling

### Validation Errors
- `400 Bad Request`: Invalid duration, missing fields
- `409 Conflict`: Time overlap detected
- `404 Not Found`: Timeslot not found
- `422 Unprocessable Entity`: Webinar doesn't fit in timeslot

### Error Response Format
```typescript
{
  "statusCode": 409,
  "message": "Webinar conflicts with existing booking from 2:00 PM to 2:30 PM",
  "error": "Conflict"
}
```

## File Structure

```
src/modules/
├── enum/webinar/
│   └── webinar-duration.enum.ts
├── shared/webinar/
│   └── webinar-validation.service.ts
└── v1/
    ├── webinar/
    │   ├── controllers/
    │   ├── schemas/
    │   ├── services/
    │   └── dto/
    └── timeslot/
        ├── controllers/
        ├── schemas/
        ├── services/
        └── dto/
```

## Future Enhancements

1. **Buffer Time**: Add configurable buffer between webinars
2. **Recurring Webinars**: Support for recurring schedules
3. **Capacity Management**: Multiple attendees per webinar
4. **Time Zone Support**: Multi-timezone scheduling
5. **Conflict Resolution**: Automatic rescheduling suggestions
6. **Calendar Integration**: Export to calendar systems

## Development Notes

- All time comparisons use JavaScript Date objects
- MongoDB stores dates in UTC
- Validation occurs at both DTO and service levels
- Soft delete pattern implemented for data integrity
- Comprehensive error handling for edge cases
