import { Injectable, RequestTimeoutException } from '@nestjs/common';
import * as crypto from 'crypto';
import { RediscacheService } from '../rediscache';

@Injectable()
export class IdempotencyService {
  constructor(private readonly redisChase: RediscacheService) {}

  async processNewRequest(responseBody: any) {
    const maxRetries = 3;
    const retryDelay = 10000;

    const hash = this.generateHash(responseBody);

    let cachedResponse = await this.getFromRedis(hash);

    if (cachedResponse) {
      if (cachedResponse === 'processing') {
        let retryCount = 0;
        while (retryCount < maxRetries) {
          retryCount++;
          await new Promise((resolve) => setTimeout(resolve, retryDelay));

          cachedResponse = await this.getFromRedis(hash);
          if (cachedResponse && cachedResponse !== 'processing') {
            return JSON.parse(cachedResponse);
          }
        }
        throw new RequestTimeoutException('Request is still processing');
      }
      return JSON.parse(cachedResponse);
    } else {
      await this.redisChase.set(hash, 'processing', 3600);
      return { isNewId: true, hash };
    }
  }

  private generateHash(requestBody: any): string {
    const payload = JSON.stringify(requestBody);
    return crypto.createHash('sha256').update(payload).digest('hex');
  }

  private async getFromRedis(hash: string): Promise<any> {
    return await this.redisChase.get(`idempotent:${hash}`);
  }

  async saveToRedis(hash: string, responseBody: any): Promise<void> {
    await this.redisChase.set(
      `idempotent:${hash}`,
      JSON.stringify(responseBody),
      3600,
    );
  }

  async removeFromRedis(hash: string): Promise<void> {
    await this.redisChase.set(`idempotent:${hash}`, '', 3600);
  }
}
