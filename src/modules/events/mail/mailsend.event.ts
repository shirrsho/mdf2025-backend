import { SentMailStatus } from '@/modules/enum';

export class MailSendEvent {
  recepitentEmail: string;
  resourceId?: string;
  resourceName: string;
  status?: SentMailStatus;
  subject?: string;
  text?: string;
  blueprint?: string;
  placeValues?: any;
  tag?: string;
  cc?: string[];
  bcc?: string[];
  priority?: number;
  [key: string]: any;

  constructor({
    recepitentEmail,
    resourceId,
    resourceName,
    status,
    subject,
    text,
    blueprint,
    placeValues,
    tag,
    cc,
    bcc,
    priority,
    ...rest
  }: {
    recepitentEmail: string;
    resourceName: string;
    status?: SentMailStatus;
    subject?: string;
    text?: string;
    resourceId?: string;
    blueprint?: string;
    placeValues?: any;
    tag?: string;
    cc?: string[];
    bcc?: string[];
    priority?: number;
    [key: string]: any;
  }) {
    this.recepitentEmail = recepitentEmail;
    this.resourceId = resourceId;
    this.resourceName = resourceName;
    this.tag = tag;
    this.subject = subject;
    this.text = text;
    this.blueprint = blueprint;
    this.placeValues = placeValues;
    this.cc = cc;
    this.bcc = bcc;
    this.status = status;
    this.priority = priority;
    Object.assign(this, rest);
  }
}
