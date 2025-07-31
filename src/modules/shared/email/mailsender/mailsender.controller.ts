import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { MailsenderService } from './mailsender.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';

import { CreateMailCredDTO } from './dtos/mail-cred.dto';
import { AccessTokenGuard, RolePermissionGuard } from '../../auth';

@ApiTags('v1/mail')
@Controller({ path: 'mail', version: '1' })
export class MailSenderController {
  constructor(private readonly mailSenderService: MailsenderService) {}

  @UseGuards(AccessTokenGuard, RolePermissionGuard)
  @Post()
  @ApiOperation({ summary: 'add new smtp creds' })
  @ApiBody({ type: CreateMailCredDTO })
  async create(@Body() createMailDto: CreateMailCredDTO) {
    return await this.mailSenderService.create(createMailDto);
  }

  @UseGuards(AccessTokenGuard, RolePermissionGuard)
  @Get('option')
  @ApiOperation({ summary: 'Get all creds as option' })
  async getOption() {
    return await this.mailSenderService.getAsOption();
  }

  @UseGuards(AccessTokenGuard, RolePermissionGuard)
  @Get()
  @ApiOperation({ summary: 'Get all creds' })
  async get() {
    return await this.mailSenderService.getAll();
  }

  @UseGuards(AccessTokenGuard, RolePermissionGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete cred' })
  @ApiParam({ name: 'id', type: String })
  async delete(@Param('id') id) {
    return await this.mailSenderService.delete(id);
  }

  @UseGuards(AccessTokenGuard, RolePermissionGuard)
  @Put('set-default/:id')
  @ApiOperation({ summary: 'Set default by id' })
  @ApiParam({ name: 'id', type: String })
  async setDefault(@Param('id') id) {
    return await this.mailSenderService.setAsDefault(id);
  }

  @UseGuards(AccessTokenGuard, RolePermissionGuard)
  @Get('sent-test-mail/:name/:transport/:jobid/:smtpFrom')
  @ApiOperation({ summary: 'Sent test mail' })
  @ApiParam({ name: 'name', type: String })
  @ApiParam({ name: 'transport', type: String })
  @ApiParam({ name: 'jobid', type: String })
  @ApiParam({ name: 'smtpFrom', type: String })
  async sentTestMail(
    @Param('name') name,
    @Param('transport') transport,
    @Param('jobid') jobId,
    @Param('smtpFrom') smtpFrom,
  ) {
    return await this.mailSenderService.sendTestMail(
      name,
      transport,
      jobId,
      smtpFrom,
    );
  }
}
