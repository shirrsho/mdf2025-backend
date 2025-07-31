import { Controller, Param, Put } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { MailEventsGeneralService } from '../providers';

@ApiBearerAuth()
@ApiTags('v1/mailevent')
@Controller({ path: 'mailevent', version: '1' })
export class MailEventsController {
  constructor(
    private readonly mailEventsGeneralService: MailEventsGeneralService,
  ) {}

  @Put('resend/:id')
  @ApiOperation({ summary: 'Resend mailhistory by ID' })
  @ApiParam({ name: 'id', description: 'MailHistory ID' })
  async resend(@Param('id') id: string) {
    await this.mailEventsGeneralService.resendMail(id);
  }
}
