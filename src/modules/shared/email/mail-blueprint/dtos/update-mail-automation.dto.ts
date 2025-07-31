import { PartialType } from '@nestjs/swagger';
import { CreateMailAutomationDto } from './create-mail-automation.dto';

export class UpdateMailAutomationDto extends PartialType(
  CreateMailAutomationDto,
) {}
