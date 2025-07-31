import { PartialType } from '@nestjs/swagger';
import { CreateMailHistoryDto } from './create-mailhistory.dto';

export class UpdateMailhistoryDto extends PartialType(CreateMailHistoryDto) {}
