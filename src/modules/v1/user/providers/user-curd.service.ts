import {
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../schema';
import { Model } from 'mongoose';
import { CreateUserDto, UpdateUserDto } from '../dtos';
import { DynamicDto } from '../dtos/dynamic.dto';
import { PaginationResponse, buildWhereBuilder } from '@/modules/utils';
import { Role } from '@/modules/enum';

@Injectable()
export class UserCurdService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async count(
    queryParams: DynamicDto = { query: { where: {} } },
  ): Promise<number> {
    return this.userModel.countDocuments(queryParams.query?.where).exec();
  }

  async save(user: UserDocument) {
    return user.save();
  }

  async create(user: CreateUserDto) {
    try {
      const createdUser = await this.userModel.create(user);
      return createdUser.save();
    } catch (error) {
      if (error) {
        if (error?.code === 11000) {
          throw new ConflictException('User already exists');
        }
        throw new HttpException(error?.message, error?.status ?? 500, {
          cause: error,
        });
      }
    }
  }

  async options(queryParams: DynamicDto) {
    const { where = {} } = queryParams?.query || {};
    const whereClause = buildWhereBuilder(where);
    const users = await this.userModel
      .find({
        ...whereClause,
        role: { $nin: [Role.ADMIN, Role.GUEST], ...whereClause.role },
      })
      .select('_id name imageUrl description')
      .exec();
    return users.map((user) => ({
      label: user.name,
      value: user._id,
      imageUrl: user.imageUrl,
      description: user.description,
    }));
  }

  async findAll(
    queryParams: DynamicDto,
  ): Promise<PaginationResponse<UserDocument>> {
    const {
      select = {},
      where = {},
      page = 1,
      limit = 10,
    } = queryParams?.query || {};
    const skip = ((page > 1 ? page : 1) - 1) * (limit > 0 ? limit : 1);
    const whereClause = buildWhereBuilder(where);
    const users = await this.userModel
      .find({
        ...whereClause,
        role: {
          $nin: [Role.ADMIN, Role.GUEST, Role.TEMP],
          ...whereClause.role,
        },
      })
      .select(select)
      .select({ password: false, otp: false })
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 })
      .exec();
    const count = await this.userModel
      .countDocuments({
        ...whereClause,
        role: {
          $nin: [Role.ADMIN, Role.GUEST, Role.TEMP],
          ...whereClause.role,
        },
      })
      .exec();
    return { data: users, count };
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel
      .findById(id)
      .select('-password -otp')
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select('-password -otp')
      .exec();
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
    return updatedUser;
  }

  async delete(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.role.includes(Role.ADMIN)) {
      throw new NotFoundException('Cannot delete admin user');
    }
    const deletedUser = await this.userModel
      .findByIdAndDelete(id)
      .select('-password -otp')
      .exec();
    if (!deletedUser) {
      throw new NotFoundException('User not found');
    }
    return deletedUser;
  }
}
