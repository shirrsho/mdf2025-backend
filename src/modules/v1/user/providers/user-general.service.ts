import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import * as generator from 'generate-password';
import { User, UserDocument } from '../schema';
import { Model } from 'mongoose';
import { CreateUserDto, UpdateUserDto, VerifyUserDto } from '../dtos';
import { UserCurdService } from './user-curd.service';
import { Role, TempMailType, Providers, MailEventNames } from '@/modules/enum';
import { generateRandomNumber } from '@/modules/utils';
import { TempMail, TempMailDocument } from '../schema/tempmail.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MailSendEvent } from '@/modules/events';

@Injectable()
export class UserGeneralService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(TempMail.name)
    private readonly tempMailModel: Model<TempMailDocument>,
    private readonly userService: UserCurdService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findUserByEmail(email: string): Promise<UserDocument> {
    return await this.userModel.findOne({ email }).exec();
  }

  async countAdminUser(): Promise<number> {
    return await this.userModel.countDocuments({ role: Role.ADMIN }).exec();
  }

  async createAdminUser(user: CreateUserDto): Promise<UserDocument> {
    return await this.userModel.create({
      name: user.name,
      isverified: true,
      email: user.email,
      password: user.password,
      provider: Providers.Local,
      role: [Role.ADMIN, Role.USER],
      rolePermission: 'admin',
    });
  }

  async findUserById(id: string): Promise<UserDocument> {
    return await this.userModel.findById(id).exec();
  }

  async getValidUserById(id: string) {
    const user = await this.userModel
      .findById(id)
      .select('-password -otp')
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.role.includes(Role.TEMP)) {
      throw new HttpException(
        'User is a temporary user',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return user;
  }

  async findUserByIdPassword(id: string): Promise<UserDocument> {
    return await this.userModel.findById(id).select('-password -otp').exec();
  }

  async addRealEmailInGuestUser(tempmail: string, email: string, name: string) {
    const tempMailUpdate = await this.tempMailModel
      .findOne({ tempEmail: tempmail })
      .exec();
    if (!tempMailUpdate) {
      throw new NotFoundException('Temp mail not found');
    }
    tempMailUpdate.convertedMail = email;
    tempMailUpdate.convertedName = name;
    await tempMailUpdate.save();
  }

  async createGuestUser(userType: Role) {
    let randomNum = generateRandomNumber();
    let userName = `guest-user${randomNum}`;

    while (await this.findUserByEmail(`${userName}@marketron.com`)) {
      randomNum = generateRandomNumber();
      userName = `guest-user${randomNum}`;
    }

    const email = `${userName}@marketron.com`;

    const userRole = [Role.USER, Role.GUEST, userType];

    const guestUser: CreateUserDto = {
      name: userName,
      isverified: true,
      email: email,
      password: 'XXXXXXXXXX',
      provider: Providers.Local,
      role: userRole,
      rolePermission: 'guest',
    };
    await this.tempMailModel.create({
      tempEmail: email,
      tempName: userName,
      tempMailType: TempMailType.GUEST,
    });
    return await this.registerUser(guestUser);
  }

  async createTempUser() {
    let randomNum = generateRandomNumber();
    let userName = `temp-user${randomNum}`;

    while (await this.findUserByEmail(`${userName}@marketron.com`)) {
      randomNum = generateRandomNumber();
      userName = `temp-user${randomNum}`;
    }

    const email = `${userName}@marketron.com`;

    const userRole = [Role.TEMP];

    const tempUser: CreateUserDto = {
      name: userName,
      isverified: true,
      email: email,
      password: 'XXXXXXXXXX',
      provider: Providers.Local,
      role: userRole,
      rolePermission: 'temporary',
    };
    await this.tempMailModel.create({
      tempEmail: email,
      tempName: userName,
      tempMailType: TempMailType.TEMP,
    });
    return await this.registerUser(tempUser);
  }

  async registerUser(user: CreateUserDto): Promise<UserDocument> {
    const existingUser = await this.findUserByEmail(user.email);
    if (existingUser) {
      throw new HttpException('User already registered', HttpStatus.CONFLICT);
    }
    return await this.userService.create(user);
  }

  async updateUser(
    id: string,
    user: UpdateUserDto | any,
  ): Promise<UserDocument> {
    const existingUser = await this.findUserById(id);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }
    return await this.userService.update(id, user);
  }

  async addUser(createUserDto: CreateUserDto): Promise<UserDocument> {
    const password = generator.generate({ length: 12 });
    createUserDto.password = await bcrypt.hash(password, 10);
    // if (!createUserDto.role || createUserDto.role.length === 0) {
    //   createUserDto.role = [Role.USER];
    // } else if (!createUserDto.role.includes(Role.USER)) {
    //   createUserDto.role.push(Role.USER);
    // }
    if (createUserDto.rolePermission === Role.COMPANY) {
      createUserDto.role = [Role.COMPANY];
    } else if (createUserDto.rolePermission === Role.ADMIN) {
      createUserDto.role = [Role.ADMIN];
    } else {
      createUserDto.role = [Role.USER];
    }
    const user = await this.registerUser({
      ...createUserDto,
      isverified: true,
    });

    this.eventEmitter.emit(
      MailEventNames.SEND,
      new MailSendEvent({
        isPredefined: true,
        mailName: 'admin-new-user',
        recepitentEmail: user.email,
        resourceName: 'Admin Add New User',
        subject: 'Welcome to the application',
        password: `${password}`,
        name: user.name,
        email: user.email,
        user: user,
        priority: 1,
      }),
    );

    return user;
  }

  async updateUserByAdmin(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument> {
    if (updateUserDto.role && updateUserDto.role.includes(Role.ADMIN)) {
      const adminCount = await this.countAdminUser();
      if (adminCount >= 1) {
        throw new HttpException(
          'Admin user already exist',
          HttpStatus.CONFLICT,
        );
      }
    }
    if (!updateUserDto.role || updateUserDto.role.length === 0) {
      updateUserDto.role = [Role.USER];
    } else if (!updateUserDto.role.includes(Role.USER)) {
      updateUserDto.role.push(Role.USER);
    }
    const user = await this.userService.update(id, updateUserDto);
    return user;
  }

  async verifyUserByAdmin(
    id: string,
    updateUserDto: VerifyUserDto,
  ): Promise<UserDocument> {
    const user = await this.userService.update(id, updateUserDto);
    return user;
  }
}
