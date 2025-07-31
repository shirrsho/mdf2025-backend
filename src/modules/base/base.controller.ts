import { ApiBearerAuth } from '@nestjs/swagger';
import { Controller } from '@nestjs/common';

@ApiBearerAuth()
@Controller()
export class BaseController {
  constructor() {}
}
