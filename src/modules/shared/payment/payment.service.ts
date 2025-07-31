import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { BkashService } from '../bkash/bkash.service';

@Injectable()
export class PaymentService {
  constructor(private readonly bkashService: BkashService) {}

  async bkashCallback(
    paymentID: string,
    status: string,
    signature: string,
    response: Response,
  ) {
    try {
      if (status === 'success') {
        const res = await this.bkashService.executePayment(paymentID);
        if (res) {
          // confirmed pass
          return response.redirect(this.bkashService.getSuccessUrl());
        } else {
          // failed
          return response.redirect(this.bkashService.getFailureUrl());
        }
      } else if (status === 'failure') {
        // failed
        return response.redirect(this.bkashService.getFailureUrl());
      } else if (status === 'cancel') {
        // cancel
        return response.redirect(this.bkashService.getFailureUrl());
      }
      response.redirect(this.bkashService.getFailureUrl());
    } catch (error) {
      console.log(error);
      return response.redirect(this.bkashService.getFailureUrl());
    }
  }
}
