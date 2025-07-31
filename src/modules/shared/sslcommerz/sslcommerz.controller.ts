import { Controller, Post, Req } from '@nestjs/common';
import { ApiExcludeController, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { SSLCommerzService } from './sslcommerz.service';

@ApiTags('v1/sslcommerz')
@ApiExcludeController()
@Controller({
  path: 'payment/sslcommerz',
  version: '1',
})
export class SSLCommerzController {
  constructor(private readonly sslcommerzService: SSLCommerzService) {}

  @Post('/init')
  async init() {
    return this.sslcommerzService.paymentInit();
  }

  @Post('success/calback')
  async successCallback(@Req() request: Request) {
    console.log(`body ${request.body}`);
    console.log(`query ${request.query}`);
    console.log(`params ${request.params}`);
    console.log(`headers ${request.headers}`);
  }

  @Post('fail/calback')
  async failCallback() {}
}
