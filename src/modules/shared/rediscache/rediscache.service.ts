import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class RediscacheService {
  private readonly redisClient: Redis;

  constructor(configService: ConfigService) {
    this.redisClient = new Redis({
      host: configService.get<string>('REDIS_HOST'),
      port: configService.get<number>('REDIS_PORT'),
    });
  }

  async get(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }

  async set(key: string, value: string, seconds?: number): Promise<void> {
    if (typeof seconds === 'number' && Number.isFinite(seconds)) {
      await this.redisClient.set(key, value, 'EX', seconds);
    } else {
      await this.redisClient.set(key, value);
    }
  }

  async delete(key: string): Promise<number> {
    return this.redisClient.del(key);
  }

  async update(key: string, value: string, seconds?: number): Promise<void> {
    const exists = await this.redisClient.exists(key);
    if (!exists) {
      throw new Error(`Key "${key}" does not exist and cannot be updated.`);
    }

    if (typeof seconds === 'number' && Number.isFinite(seconds)) {
      await this.redisClient.set(key, value, 'EX', seconds);
    } else {
      await this.redisClient.set(key, value);
    }
  }
}
