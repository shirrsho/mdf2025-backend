import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiExcludeController,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { MiniostorageService } from './miniostorage.service';
import { UploadFileDto } from './dto';

@ApiTags('v1/fileupload')
@ApiExcludeController()
@Controller({
  path: 'fileupload',
  version: '1',
})
export class MiniostorageController {
  constructor(private readonly miniostorageService: MiniostorageService) {}

  @Post()
  @ApiOperation({ summary: 'Upload any file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadFileDto })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: any) {
    return await this.miniostorageService.uploadFile(file);
  }
}
