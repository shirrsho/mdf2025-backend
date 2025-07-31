export class MailDraftSendEvent {
  resourceId: string;

  constructor({ resourceId }: { resourceId: string }) {
    this.resourceId = resourceId;
  }
}
