import { Controller, Get, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { BaseController } from './modules/base';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiCustomBadRequestResponse } from './modules/decorator';

@ApiTags('v1/ping')
@Controller()
export class AppController extends BaseController {
  constructor(private readonly appService: AppService) {
    super();
  }

  @Get()
  @ApiOperation({
    summary: 'ping',
    description: 'Check backend',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Hello World!',
    schema: {
      type: 'string',
      example: 'Hello World!',
    },
  })
  @ApiCustomBadRequestResponse('Hello World!')
  getHello(): string {
    return this.appService.getHello();
  }
}
