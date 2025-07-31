import { SentMailStatus } from '@/modules/enum';

export class MailDraftEvent {
  recepitentEmails: string[];
  resourceId?: string;
  resourceName: string;
  status?: SentMailStatus;
  text?: string;
  blueprint?: string;
  placeValues?: Record<string, string>;
  tag?: string;
  cc?: string[];
  bcc?: string[];

  constructor({
    recepitentEmails,
    resourceId,
    resourceName,
    status,
    blueprint,
    placeValues,
    tag,
    cc,
    bcc,
  }: {
    recepitentEmails: string[];
    resourceId: string;
    resourceName?: string;
    status?: SentMailStatus;
    blueprint?: string;
    placeValues?: Record<string, string>;
    tag?: string;
    cc?: string[];
    bcc?: string[];
  }) {
    this.recepitentEmails = recepitentEmails;
    this.resourceId = resourceId;
    this.resourceName = resourceName;
    this.tag = tag;
    this.blueprint = blueprint;
    this.placeValues = placeValues;
    this.cc = cc;
    this.bcc = bcc;
    this.status = status;
  }
}
