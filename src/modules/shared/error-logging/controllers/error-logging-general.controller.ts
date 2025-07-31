import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BaseController } from '@/modules/base';
import { ErrorLoggingGeneralService } from '../providers';

@ApiTags('v1/routes')
@Controller({ path: 'routes', version: '1' })
export class ErrorLoggingGeneralController extends BaseController {
  constructor(
    private readonly errorLoggingService: ErrorLoggingGeneralService,
  ) {
    super();
  }
}
