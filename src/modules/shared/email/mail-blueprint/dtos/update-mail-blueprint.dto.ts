import { PartialType } from '@nestjs/swagger';
import { CreateMailBlueprintDto } from './create-mail-blueprint.dto';

export class UpdateMailBlueprintDto extends PartialType(
  CreateMailBlueprintDto,
) {}
