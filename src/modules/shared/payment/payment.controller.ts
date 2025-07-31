import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiExcludeController, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { PaymentService } from './payment.service';

@ApiTags('v1/payment')
@ApiExcludeController()
@Controller({
  path: 'payment',
  version: '1',
})
export class PaymentController {
  constructor(private readonly bkashService: PaymentService) {}

  @Get('/bkash/callback')
  async bkaskCallback(
    @Query('paymentID') paymentID: string,
    @Query('status') status: string,
    @Query('signature') signature: string,
    @Res() response: Response,
  ) {
    return this.bkashService.bkashCallback(
      paymentID,
      status,
      signature,
      response,
    );
  }
}
