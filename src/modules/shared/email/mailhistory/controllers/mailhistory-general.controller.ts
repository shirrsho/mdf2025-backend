import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { MailHistoryGeneralService } from '../providers';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('v1/mailhistory')
@ApiBearerAuth()
@Controller({ path: 'mailhistory', version: '1' })
export class MailHistoryGeneralController {
  constructor(private readonly mailhistoryService: MailHistoryGeneralService) {}

  @Get('tracking-pixel/:id')
  @ApiOperation({ summary: 'Track mail received' })
  @ApiParam({ name: 'id', description: 'MailHistory ID' })
  async updateOpened(@Param('id') id: string, @Res() res: Response) {
    await this.mailhistoryService.updateMailOpened(id);
    const imageBase64 =
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=';
    const imageBuffer = Buffer.from(imageBase64, 'base64');

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Length', imageBuffer.length);
    res.send(imageBuffer);
  }

  @Get('tracking-click/:id')
  @ApiOperation({ summary: 'Track email open and redirect user' })
  @ApiParam({ name: 'id', description: 'MailHistory ID' })
  @ApiQuery({
    name: 'redirect',
    description: 'Encoded redirect URL',
    required: true,
    example: 'https://mdf.marketron.com/signin',
  })
  async updateOpenedAndRedirect(
    @Param('id') id: string,
    @Query('redirect') redirectUrl: string,
    @Res() res: Response,
  ) {
    try {
      await this.mailhistoryService.updateMailOpened(id);

      const decodedUrl = decodeURIComponent(redirectUrl);

      return res.redirect(302, decodedUrl ?? 'https://mdf.marketron.com');
    } catch (error) {
      this.mailhistoryService.logControllerError(error);
      return res.redirect(302, 'https://mdf.marketron.com');
    }
  }

  @Get('email-stat/:email')
  @ApiOperation({ summary: 'Track email open and redirect user' })
  @ApiParam({ name: 'email', description: 'MailHistory ID' })
  async getEmailStat(@Param('email') email: string) {
    return await this.mailhistoryService.getEmailStat(email);
  }
}
