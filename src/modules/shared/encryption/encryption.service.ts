import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  randomBytes,
  createCipheriv,
  createDecipheriv,
  CipherGCM,
  DecipherGCM,
} from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm: string = 'aes-256-gcm';
  private readonly keyLength: number = 32; // 256 bits
  private readonly ivLength: number = 16; // 128 bits

  private readonly secretKey: Buffer;

  constructor(configService: ConfigService) {
    const key = configService.get('AES_KEY');
    if (!key) {
      throw new Error('ENCRYPTION_KEY is not set in environment variables');
    }
    this.secretKey = Buffer.from(key, 'hex');
    if (this.secretKey.length !== this.keyLength) {
      throw new Error(`Encryption key must be ${this.keyLength} bytes`);
    }
  }

  encrypt(text: string): string {
    const iv: Buffer = randomBytes(this.ivLength);
    const cipher: CipherGCM = createCipheriv(
      this.algorithm,
      this.secretKey,
      iv,
    ) as CipherGCM;

    let encrypted: string = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const tag: Buffer = cipher.getAuthTag();

    return `${iv.toString('hex')}:${encrypted}:${tag.toString('hex')}`;
  }

  decrypt(encryptedText: string): string {
    const [ivHex, encrypted, tagHex] = encryptedText.split(':');
    if (!ivHex || !encrypted || !tagHex) {
      throw new Error('Invalid encrypted text format');
    }

    const iv: Buffer = Buffer.from(ivHex, 'hex');
    const tag: Buffer = Buffer.from(tagHex, 'hex');

    const decipher: DecipherGCM = createDecipheriv(
      this.algorithm,
      this.secretKey,
      iv,
    ) as DecipherGCM;
    decipher.setAuthTag(tag);

    let decrypted: string = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
