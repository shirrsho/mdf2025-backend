import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AccessTokenGuard, RolePermissionGuard } from '@/modules/shared';
import { PaginationResponse } from '@/modules/utils';
import {
  ApiCustomBadRequestResponse,
  ApiCustomForbiddenResponse,
  ApiCustomNotFoundResponse,
  MongoIdParam,
} from '@/modules/decorator';
import { BaseController } from '@/modules/base';
import { PaymentCrudService } from '../providers';
import { Payment } from '../schema';
import {
  CreatePaymentDto,
  UpdatePaymentDto,
  PaymentPaginationResponse,
  QueryPaymentDto,
} from '../dtos';
import { OptionDto } from '@/modules/dto';

@ApiTags('v1/payment')
@Controller({ path: 'payment', version: '1' })
export class PaymentCrudController extends BaseController {
  constructor(private readonly paymentService: PaymentCrudService) {
    super();
  }

  @Get('count')
  @UseGuards(AccessTokenGuard, RolePermissionGuard)
  @ApiOperation({
    summary: 'Get payment count',
    description:
      'Retrieve the total count of payment based on query parameters.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment count retrieved successfully.',
    schema: {
      type: 'number',
      example: 10,
    },
  })
  @ApiCustomBadRequestResponse('Invalid query parameters.')
  @ApiCustomForbiddenResponse()
  async count(@Query() queryParams: QueryPaymentDto): Promise<number> {
    return await this.paymentService.count(queryParams);
  }

  @Get('option')
  @ApiOperation({
    summary: 'Get all payment options',
    description: 'Retrive all payment options.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment options retrived successfully.',
    type: [OptionDto],
  })
  @ApiCustomBadRequestResponse('Invalid request')
  async options(): Promise<OptionDto[]> {
    return await this.paymentService.options();
  }

  @Get('public')
  @ApiOperation({
    summary: 'Get all public payments',
    description: 'Retrive all public payments based on query parameters.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payments retrived successfully.',
    type: PaymentPaginationResponse,
  })
  @ApiCustomBadRequestResponse('Invalid query parameters')
  async findAllPublic(
    @Query() queryParams: QueryPaymentDto,
  ): Promise<PaginationResponse<Payment>> {
    return await this.paymentService.findAllPublic(queryParams);
  }

  @Get()
  @UseGuards(AccessTokenGuard, RolePermissionGuard)
  @ApiOperation({
    summary: 'Get all payments',
    description: 'Retrive all payments based on query parameters.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payments retrived successfully.',
    type: PaymentPaginationResponse,
  })
  @ApiCustomBadRequestResponse('Invalid query parameters')
  @ApiCustomForbiddenResponse()
  async findAll(
    @Query() queryParams: QueryPaymentDto,
  ): Promise<PaginationResponse<Payment>> {
    return await this.paymentService.findAll(queryParams);
  }

  @Get('public/:id')
  @ApiOperation({
    summary: 'Get public payment by ID',
    description: 'Retrive a payment by ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment retrived successfully.',
    type: Payment,
  })
  @ApiCustomBadRequestResponse('Invalid payment id')
  @ApiCustomNotFoundResponse('Payment not found')
  @ApiParam({ name: 'id', description: 'Payment ID' })
  async findByIdPublic(@Param('id') id: string): Promise<Payment> {
    const payment = await this.paymentService.findByIdPublic(id);
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return payment;
  }

  @Get(':id')
  @UseGuards(AccessTokenGuard, RolePermissionGuard)
  @ApiOperation({
    summary: 'Get payment by ID',
    description: 'Retrive a payment by ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment retrived successfully.',
    type: Payment,
  })
  @ApiCustomBadRequestResponse('Invalid payment id')
  @ApiCustomNotFoundResponse('Payment not found')
  @ApiCustomForbiddenResponse()
  @ApiParam({ name: 'id', description: 'Payment ID' })
  async findById(@MongoIdParam('id') id: string): Promise<Payment> {
    const payment = await this.paymentService.findById(id);
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return payment;
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new payment',
    description: 'Create a new payment if mandatory fields are present',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Payment created successfully.',
    type: Payment,
  })
  @ApiCustomBadRequestResponse('Invalid input')
  @ApiBody({ type: CreatePaymentDto })
  async create(
    @Body() createPaymentDto: CreatePaymentDto,
  ): Promise<Payment> {
    return await this.paymentService.create(createPaymentDto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update payment by ID',
    description: 'Update payment by ID from given fields',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Payment updated successfully.',
    type: Payment,
  })
  @ApiCustomBadRequestResponse('Invalid input')
  @ApiCustomNotFoundResponse()
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiBody({ type: UpdatePaymentDto })
  async update(
    @MongoIdParam('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ): Promise<Payment> {
    const updatedPayment = await this.paymentService.update(
      id,
      updatePaymentDto,
    );
    if (!updatedPayment) {
      throw new NotFoundException('Payment not found');
    }
    return updatedPayment;
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard, RolePermissionGuard)
  @ApiOperation({
    summary: 'Delete payment by ID',
    description: 'Delete payment by ID if present',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment deleted successfully.',
    type: Payment,
  })
  @ApiCustomBadRequestResponse('Invalid id')
  @ApiCustomNotFoundResponse()
  @ApiCustomForbiddenResponse()
  @ApiParam({ name: 'id', description: 'Payment ID' })
  async delete(@MongoIdParam('id') id: string): Promise<Payment> {
    const deletedPayment = await this.paymentService.delete(id);
    if (!deletedPayment) {
      throw new NotFoundException('Payment not found');
    }
    return deletedPayment;
  }
}
