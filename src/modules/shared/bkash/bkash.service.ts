import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BkashService {
  private idToken: string;
  private expiresIn: number;
  private createdAt: number;

  constructor(private readonly configService: ConfigService) {}

  constructHeader() {
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      username: this.configService.get('Bkash.USERNAME'),
      password: this.configService.get('Bkash.PASSWORD'),
    };
  }

  async grantToken() {
    const tokenResponse = await fetch(
      this.configService.get('Bkash.GRANT_TOKEN_URL'),
      {
        method: 'POST',
        headers: this.constructHeader(),
        body: JSON.stringify({
          app_key: this.configService.get('Bkash.APP_KEY'),
          app_secret: this.configService.get('Bkash.APP_SECRET'),
        }),
      },
    );
    const tokenResult = await tokenResponse.json();
    this.idToken = tokenResult.id_token;
    this.expiresIn = tokenResult.expires_in;
    this.createdAt = Date.now();
    return tokenResult;
  }

  async createPayment(data: any) {
    if (!this.idToken) {
      await this.grantToken();
    } else if (Date.now() - this.createdAt > this.expiresIn) {
      await this.grantToken();
    }
    const paymentResponse = await fetch(
      this.configService.get('Bkash.CREATE_PAYMENT_URL'),
      {
        method: 'POST',
        headers: {
          ...this.constructHeader(),
          'x-app-key': this.configService.get('Bkash.APP_KEY'),
          authorization: `${this.idToken}`,
        },
        body: JSON.stringify({
          mode: '0011',
          payerReference: 'porisima',
          currency: 'BDT',
          intent: 'sale',
          callbackURL: `${this.configService.get('Bkash.BACKEND_CALLBACK_URL')}`,
          ...data,
        }),
      },
    );
    const paymentResult = await paymentResponse.json();
    if (paymentResult.statusMessage === 'Successful') {
      return paymentResult;
    }
    return;
  }

  getSuccessUrl() {
    return this.configService.get('Bkash.FRONTEND_SUCCESS_URL');
  }

  getFailureUrl() {
    return this.configService.get('Bkash.FRONTEND_FAIL_URL');
  }

  async executePayment(paymentId: string) {
    const paymentResponse = await fetch(
      this.configService.get('Bkash.EXECUTE_PAYMENT_URL'),
      {
        method: 'POST',
        headers: {
          ...this.constructHeader(),
          'x-app-key': this.configService.get('Bkash.APP_KEY'),
          authorization: `${this.idToken}`,
        },
        body: JSON.stringify({
          paymentID: paymentId,
        }),
      },
    );
    const paymentResult = await paymentResponse.json();
    if (paymentResult.statusMessage === 'Successful') {
      return paymentResult;
    }
  }

  async getPaymentStatus(id: string) {
    const paymentResponse = await fetch(
      this.configService.get('Bkash.GET_PAYMENT_STATUS_URL') + id,
      {
        method: 'GET',
        headers: this.constructHeader(),
      },
    );
    const paymentResult = await paymentResponse.json();
    return paymentResult;
  }
}
