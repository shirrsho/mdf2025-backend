import { SentMailStatus } from '@/modules/enum';

export class CreateMailHistoryDto {
  recepitentEmail: string;
  resourceId: string;
  resourceName: string;
  tag: string;
  status: SentMailStatus;
  blueprint: string;
  scheduleTime?: Date;
  placeValues?: Record<string, string>;
  cc?: string[];
  bcc?: string[];
  priority?: number;
  isPredefined?: boolean;
  [key: string]: any;

  constructor({
    recepitentEmail,
    resourceId,
    resourceName,
    status,
    blueprint,
    placeValues,
    scheduleTime,
    tag,
    cc,
    bcc,
    priority,
    isPredefined,
    ...rest
  }: {
    recepitentEmail: string;
    resourceId: string;
    resourceName: string;
    status: SentMailStatus;
    blueprint: string;
    placeValues?: Record<string, string>;
    scheduleTime?: Date;
    tag?: string;
    cc?: string[];
    bcc?: string[];
    priority?: number;
    isPredefined?: boolean;
    [key: string]: any;
  }) {
    this.recepitentEmail = recepitentEmail;
    this.resourceId = resourceId;
    this.resourceName = resourceName;
    this.tag = tag;
    this.blueprint = blueprint;
    this.scheduleTime = scheduleTime;
    this.placeValues = placeValues;
    this.cc = cc;
    this.bcc = bcc;
    this.status = status;
    this.priority = priority;
    this.isPredefined = isPredefined;
    Object.assign(this, rest);
  }
}
