import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class BaseService<T> {
  protected readonly logger: Logger;

  constructor(context: string) {
    this.logger = new Logger(context);
  }

  protected logInfo(message: string, meta?: T) {
    this.logger.log(message, meta ? JSON.stringify(meta) : '');
  }

  protected logWarn(message: string, meta?: T) {
    this.logger.warn(message, meta ? JSON.stringify(meta) : '');
  }

  protected logError(message: string, trace?: string, meta?: T) {
    this.logger.error(message, trace, meta ? JSON.stringify(meta) : '');
  }

  protected logDebug(message: string, meta?: T) {
    this.logger.debug(message, meta ? JSON.stringify(meta) : '');
  }
}
