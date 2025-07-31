import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

@Injectable()
export class SSLCommerzService {
  private idToken: string;
  private expiresIn: number;
  private createdAt: number;

  private store_id: string;
  private store_passwd: string;
  private is_live: boolean;

  constructor(private readonly configService: ConfigService) {
    this.store_id = this.configService.get<string>('SSLCommerz.STORE_ID');
    this.store_passwd = this.configService.get<string>(
      'SSLCommerz.STORE_PASSWORD',
    );
    this.is_live = this.configService.get<boolean>('SSLCommerz.IS_LIVE');
  }

  async paymentInit() {
    const req = JSON.stringify({
      store_id: this.store_id,
      store_passwd: this.store_passwd,
      total_amount: 1000,
      currency: 'BDT',
      tran_id: 'REF123',
      success_url: `${this.configService.get('SSLCommerz.BACKEND_SUCCESS_URL')}`,
      fail_url: `${this.configService.get('SSLCommerz.BACKEND_FAIL_URL')}`,
      cancel_url: `${this.configService.get('SSLCommerz.BACKEND_CANCEL_URL')}`,

      cus_name: 'shirsho',
      cus_email: 'hniqbal01@gmail.com',
      cus_add1: 'mohakhali,dhaka',
      cus_add2: 'mohakhali,dhaka',
      cus_city: 'Dhake',
      cus_state: 'Dhaka',
      cus_postcode: '1229',
      cus_country: 'Bangladesh',
      cus_phone: '+8801534115844',

      emi_option: 0,

      shipping_method: 'NO',
      num_of_item: 1,

      product_name: 'book',
      product_category: 'Book',
      product_profile: 'general',
    });
    console.log(req);
    try {
      const res = await fetch(this.configService.get('SSLCommerz.INIT_URL'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: req,
      });
      console.log(await res.json());
    } catch (error) {
      console.error(error);
    }
  }

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
          payerReference: 'smartbepari',
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

  // eslint-disable-next-line
  async callback(paymentID: string, status: string, response: Response) {
    // if (status === 'success') {
    //   const res = await this.executePayment(paymentID);
    //   if (res) {
    //     await this.invoiceService.invoicePaymentUpdate(paymentID, status);
    //     response.redirect(this.configService.get('Bkash.FRONTEND_SUCCESS_URL'));
    //   } else {
    //     await this.invoiceService.invoicePaymentUpdate(paymentID, 'failure');
    //     response.redirect(this.configService.get('Bkash.FRONTEND_FAIL_URL'));
    //   }
    // } else if (status === 'failure') {
    //   await this.invoiceService.invoicePaymentUpdate(paymentID, status);
    //   response.redirect(this.configService.get('Bkash.FRONTEND_FAIL_URL'));
    // } else if (status === 'cancel') {
    //   await this.invoiceService.invoicePaymentUpdate(paymentID, status);
    //   response.redirect(this.configService.get('Bkash.FRONTEND_FAIL_URL'));
    // }
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
