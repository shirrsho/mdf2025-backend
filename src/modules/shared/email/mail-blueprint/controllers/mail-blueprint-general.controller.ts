import { Body, Controller, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { MailBlueprintGeneralService } from '../providers';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  SendMailBlueprintDto,
  CreateMailAutomationDto,
  CreateMailBlueprintAutomationDto,
} from '../dtos';

import { AccessTokenGuard } from '@/modules/shared/auth/guards';
import { ApiCustomBadRequestResponse } from '@/modules/decorator';
import { MailAutomation } from '../schema';

@ApiBearerAuth()
@ApiTags('v1/mail-blueprint')
@Controller({ path: 'mail-blueprint', version: '1' })
export class MailBlueprintGeneralController {
  constructor(
    private readonly mailBlueprintService: MailBlueprintGeneralService,
  ) {}

  @Post('add-automation-blueprint')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Add a new blueprint and add it to automation' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Mail Blueprint and Automation created successfully.',
    type: MailAutomation,
  })
  @ApiCustomBadRequestResponse('Invalid input')
  async addMailAutomationWithTemplate(
    @Body() createMailAutomationDto: CreateMailBlueprintAutomationDto,
  ) {
    return await this.mailBlueprintService.addMailAutomationWithTemplate(
      createMailAutomationDto,
    );
  }

  @Post('add-automation')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Add or update an automation' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Mail Automation created successfully.',
    type: MailAutomation,
  })
  @ApiCustomBadRequestResponse('Invalid input')
  async AddMailAutomation(
    @Body() createMailAutomationDto: CreateMailAutomationDto,
  ) {
    return await this.mailBlueprintService.createOrUpdateAutomatedMail(
      createMailAutomationDto,
    );
  }

  @Post('send-blueprint')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Send email by blueprint' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Send email by blueprint',
    schema: {
      type: 'string',
      example: 'done',
    },
  })
  @ApiCustomBadRequestResponse('Missing placeholders')
  async sendBluePrintMail(@Body() sendMailBlueprintDto: SendMailBlueprintDto) {
    return await this.mailBlueprintService.sendBlueprintMail(
      sendMailBlueprintDto,
    );
  }
}
