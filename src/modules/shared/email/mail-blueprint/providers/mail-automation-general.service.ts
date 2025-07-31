import { Injectable } from '@nestjs/common';
import { generateOptions } from '@/modules/utils';
import {
  BlogAutomationName,
  BookAutomationName,
  CourseAutomationName,
  EnrolledCourseAutomationName,
  EventAutomationName,
  ExamAutomationName,
  ForumAutomationName,
  MailResourceName,
  OrderAutomationName,
  PromotionAutomationName,
  ResourceAutomationName,
  ShipmintAutomationName,
} from '@/modules/enum';
import {
  BLOG_PLACEHOLDERS,
  BOOK_PLACEHOLDERS,
  COURSE_PLACEHOLDERS,
  ENROLLED_COURSE_PLACEHOLDES,
  EVENT_PLACEHOLDERS,
  EXAM_PLACEHOLDERS,
  FORUM_PLACEHOLDERS,
  ORDER_PLACEHOLDERS,
  PROMOTION_PLACEHOLDERS,
  RESOURCE_PLACEHOLDER,
  SHIPMINT_PLACEHOLDERS,
} from '@/modules/constants';

@Injectable()
export class MailAutomationGeneralService {
  constructor() {}

  async getResourcesOptions() {
    return generateOptions(MailResourceName);
  }

  async getAutomationOptions(resource: string) {
    const resourceMapping: Record<string, any> = {
      [MailResourceName.COURSE]: CourseAutomationName,
      [MailResourceName.ENROLLED_COURSE]: EnrolledCourseAutomationName,
      [MailResourceName.EXAM]: ExamAutomationName,
      [MailResourceName.BOOK]: BookAutomationName,
      [MailResourceName.EVENT]: EventAutomationName,
      [MailResourceName.SHIPMINT]: ShipmintAutomationName,
      [MailResourceName.RESOURCE]: ResourceAutomationName,
      [MailResourceName.FORUM]: ForumAutomationName,
      [MailResourceName.BLOG]: BlogAutomationName,
      [MailResourceName.ORDER]: OrderAutomationName,
      [MailResourceName.PROMOTION]: PromotionAutomationName,
    };
    const automationName = resourceMapping[resource];
    return automationName ? generateOptions(automationName) : [];
  }

  async getAutomationPlaceholders(resource: string) {
    const resourceMapping: Record<string, string[]> = {
      [MailResourceName.COURSE]: COURSE_PLACEHOLDERS,
      [MailResourceName.ENROLLED_COURSE]: ENROLLED_COURSE_PLACEHOLDES,
      [MailResourceName.EXAM]: EXAM_PLACEHOLDERS,
      [MailResourceName.BOOK]: BOOK_PLACEHOLDERS,
      [MailResourceName.EVENT]: EVENT_PLACEHOLDERS,
      [MailResourceName.SHIPMINT]: SHIPMINT_PLACEHOLDERS,
      [MailResourceName.RESOURCE]: RESOURCE_PLACEHOLDER,
      [MailResourceName.FORUM]: FORUM_PLACEHOLDERS,
      [MailResourceName.BLOG]: BLOG_PLACEHOLDERS,
      [MailResourceName.ORDER]: ORDER_PLACEHOLDERS,
      [MailResourceName.PROMOTION]: PROMOTION_PLACEHOLDERS,
    };
    const automationName = resourceMapping[resource];
    return automationName ? automationName : [];
  }
}
