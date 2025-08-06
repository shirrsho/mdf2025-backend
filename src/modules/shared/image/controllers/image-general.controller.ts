import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Get,
  Param,
  Query,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { ImagesGeneralService } from '../providers/image-general.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiExcludeController,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AccessTokenGuard, RoleGuard } from '../../auth/guards';
import { Role } from '@/modules/enum';
import { DynamicDto } from '../dtos/dynamic.dto';
import { HasRoles, ReqUser } from '@/modules/decorator';

@ApiTags('v1/image')
@ApiExcludeController()
@Controller({ path: 'image', version: '1' })
export class ImagesGeneralController {
  constructor(private readonly imagesService: ImagesGeneralService) {}

  @Post('v2/upload')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard, RoleGuard)
  @HasRoles(Role.ADMIN, Role.USER, Role.COMPANY)
  @ApiOperation({ summary: 'Upload any file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'file',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  uploadFileV2(
    @UploadedFile()
    file: any,
    @ReqUser() user,
  ) {
    return this.imagesService.uploadImageToSpace(file, user);
  }

  @Get('otp/:id')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard, RoleGuard)
  @HasRoles(Role.ADMIN, Role.USER, Role.COMPANY)
  @ApiParam({ name: 'id', description: 'vedio ID' })
  @ApiOperation({ summary: 'Get otp' })
  async getOtp(@Param('id') id: string) {
    return this.imagesService.getOtp(id);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard, RoleGuard)
  @HasRoles(Role.ADMIN, Role.USER, Role.COMPANY)
  @ApiOperation({ summary: 'Get all images' })
  @ApiQuery({ type: DynamicDto })
  async findAll(@Query() queryParams: DynamicDto) {
    return this.imagesService.findAll(queryParams);
  }

  @Post('upload')
  @ApiOperation({ summary: 'Upload any file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'file',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  uploadFileV1(
    @UploadedFile()
    file: any,
  ) {
    return this.imagesService.uploadImageToDoV1(file);
  }
}
