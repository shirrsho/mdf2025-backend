import { SentMailStatus } from '@/modules/enum';

export class CreateMailHistoryDto {
  recepitentEmail: string;
  resourceId: string;
  resourceName: string;
  tag: string;
  status: SentMailStatus;
  blueprint: string;
  placeValues?: Record<string, string>;
  cc?: string[];
  bcc?: string[];

  constructor({
    recepitentEmail,
    resourceId,
    resourceName,
    status,
    blueprint,
    placeValues,
    tag,
    cc,
    bcc,
  }: {
    recepitentEmail: string;
    resourceId: string;
    resourceName: string;
    status: SentMailStatus;
    blueprint: string;
    placeValues?: Record<string, string>;
    tag?: string;
    cc?: string[];
    bcc?: string[];
  }) {
    this.recepitentEmail = recepitentEmail;
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
