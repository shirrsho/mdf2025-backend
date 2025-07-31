import { Controller, Get, HttpStatus, Param, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AccessTokenGuard } from '@/modules/shared/auth/guards';
import {
  ApiCustomBadRequestResponse,
  ApiCustomNotFoundResponse,
} from '@/modules/decorator';
import { OptionDto } from '@/modules/dto';
import { MailAutomationGeneralService } from '../providers';

@ApiBearerAuth()
@ApiTags('v1/mail-blueprint', 'v1/mail-automation')
@Controller({ path: 'mail-automation', version: '1' })
export class MailAutomationGeneralController {
  constructor(
    private readonly mailAutomationService: MailAutomationGeneralService,
  ) {}

  @Get('resource-option')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Get placeholder by resource' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Mail Blueprint retrived successfully.',
    type: [OptionDto],
  })
  @ApiCustomBadRequestResponse('Invalid resource')
  @ApiCustomNotFoundResponse()
  async getResourceOptions(): Promise<OptionDto[]> {
    return await this.mailAutomationService.getResourcesOptions();
  }

  @Get('automation-option/:resource')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Get placeholder by resource' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Mail Blueprint retrived successfully.',
    type: [OptionDto],
  })
  @ApiCustomBadRequestResponse('Invalid resource')
  @ApiCustomNotFoundResponse()
  @ApiParam({ name: 'resource', description: 'MailBlueprint resource' })
  async getAutomationOptions(
    @Param('resource') resource: string,
  ): Promise<OptionDto[]> {
    return await this.mailAutomationService.getAutomationOptions(resource);
  }

  @Get('automation-placeholder/:resource')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Get placeholder by resource' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Mail Blueprint retrived successfully.',
    type: [String],
  })
  @ApiCustomBadRequestResponse('Invalid resource')
  @ApiCustomNotFoundResponse()
  @ApiParam({ name: 'resource', description: 'MailBlueprint resource' })
  async getPlaceholder(@Param('resource') resource: string): Promise<string[]> {
    return await this.mailAutomationService.getAutomationPlaceholders(resource);
  }
}
