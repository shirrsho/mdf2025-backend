import {
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaginationResponse } from '@/modules/utils';
import { BaseService } from '@/modules/base';
import { Payment, PaymentDocument } from '../schema';
import {
  CreatePaymentDto,
  UpdatePaymentDto,
  QueryPaymentDto,
} from '../dtos';
import { OptionDto } from '@/modules/dto';

@Injectable()
export class PaymentCrudService extends BaseService<PaymentCrudService> {
  constructor(
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
  ) {
    super(PaymentCrudService.name);
  }

  buildPaymentWhereClause(query: QueryPaymentDto): Record<string, any> {
    const { transactionId, minTotal, maxTotal, createdAfter, createdBefore } =
      query;

    const whereClause: Record<string, any> = {};

    const stringFilters = { transactionId };
    Object.entries(stringFilters).forEach(([key, value]) => {
      if (value) {
        whereClause[key] = { $regex: value, $options: 'i' };
      }
    });

    const numberRangeFields = [
      { field: 'total', min: minTotal, max: maxTotal },
    ];

    numberRangeFields.forEach(({ field, min, max }) => {
      if (min !== undefined || max !== undefined) {
        whereClause[field] = {};
        if (min !== undefined) whereClause[field]['$gte'] = min;
        if (max !== undefined) whereClause[field]['$lte'] = max;
      }
    });

    const dateRangeFields = [
      { field: 'createdAt', min: createdAfter, max: createdBefore },
    ];

    dateRangeFields.forEach(({ field, min, max }) => {
      if (min || max) {
        whereClause[field] = {};
        if (min) whereClause[field]['$gte'] = min;
        if (max) whereClause[field]['$lte'] = max;
      }
    });

    const booleanFilters = {};
    Object.entries(booleanFilters).forEach(([key, value]) => {
      if (value !== undefined) {
        whereClause[key] = value;
      }
    });

    return whereClause;
  }

  async count(queryParams: QueryPaymentDto): Promise<number> {
    const query = this.buildPaymentWhereClause(queryParams);
    return this.paymentModel.countDocuments(query).exec();
  }

  async save(payment: PaymentDocument) {
    return payment.save();
  }

  async options(): Promise<OptionDto[]> {
    const payments = await this.paymentModel
      .find()
      .select('transactionId amount status')
      .exec();
    return payments.map((payment) => ({
      label: `${payment.transactionId} - ${payment.amount} (${payment.status})`,
      value: payment._id,
    }));
  }

  async create(
    createPaymentDto: CreatePaymentDto,
  ): Promise<PaymentDocument> {
    try {
      const payment = await this.paymentModel.create(createPaymentDto);
      return payment.save();
    } catch (error) {
      if (error?.code === 11000) {
        throw new ConflictException('Name already exists');
      }
      throw new HttpException(error?.message, error?.status ?? 500, {
        cause: error,
      });
    }
  }

  async findAll(
    queryParams: QueryPaymentDto,
  ): Promise<PaginationResponse<PaymentDocument>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = queryParams;

    const skip = ((page > 1 ? page : 1) - 1) * (limit > 0 ? limit : 10);

    const whereClause = this.buildPaymentWhereClause(queryParams);

    const sortOptions: any = { [sortBy]: sortOrder === 'ASC' ? 1 : -1 };

    const [payments, count] = await Promise.all([
      this.paymentModel
        .find(whereClause)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.paymentModel.countDocuments(whereClause).exec(),
    ]);

    return {
      data: payments,
      count,
    };
  }

  async findAllPublic(
    queryParams: QueryPaymentDto,
  ): Promise<PaginationResponse<PaymentDocument>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = queryParams;

    const skip = ((page > 1 ? page : 1) - 1) * (limit > 0 ? limit : 10);

    const whereClause = this.buildPaymentWhereClause(queryParams);

    const sortOptions: any = { [sortBy]: sortOrder === 'ASC' ? 1 : -1 };

    const [payments, count] = await Promise.all([
      this.paymentModel
        .find(whereClause)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.paymentModel.countDocuments(whereClause).exec(),
    ]);

    return {
      data: payments,
      count,
    };
  }

  async findById(id: string): Promise<PaymentDocument> {
    const payment = await this.paymentModel.findById(id).exec();
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return payment;
  }

  async findByIdPublic(id: string): Promise<PaymentDocument> {
    const payment = await this.paymentModel.findById(id).exec();
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return payment;
  }

  async update(
    id: string,
    updatePaymentDto: UpdatePaymentDto,
  ): Promise<PaymentDocument> {
    try {
      const updatedPayment = await this.paymentModel
        .findByIdAndUpdate(id, updatePaymentDto, { new: true })
        .exec();
      if (!updatedPayment) {
        throw new NotFoundException('Payment not found');
      }
      return updatedPayment;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Name already exists');
      }
      throw new HttpException(error?.message, error?.status ?? 500, {
        cause: error,
      });
    }
  }

  async delete(id: string): Promise<PaymentDocument> {
    const deletedPayment = await this.paymentModel
      .findByIdAndDelete(id)
      .exec();
    if (!deletedPayment) {
      throw new NotFoundException('Payment not found');
    }
    return deletedPayment;
  }
}
