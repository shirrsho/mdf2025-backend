import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  AuthResponse,
  EmailAuthDto,
  CreateAuthDto,
  LoginAuthDto,
  VerifyEmailAuthDto,
  ChangePasswordOtpAuthDto,
  UpdateUserDto,
  CreateGuestAccountDto,
} from '../dtos';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserGeneralService } from '@/modules/v1/user/providers';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { generate } from 'otp-generator';
import { UserDocument } from '@/modules/v1/user/schema';
import { Profile as GoogleProfile } from 'passport-google-oauth20';
import { Profile as FacebookProfile } from 'passport-facebook';
import { MailEventNames, Role } from '@/modules/enum';
import { MailSendEvent } from '@/modules/events';
import { ImagesGeneralService } from '../../image/providers';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserGeneralService,
    private readonly jwtService: JwtService,
    private readonly eventEmitter: EventEmitter2,
    private readonly configService: ConfigService,
    private readonly imageService: ImagesGeneralService,
  ) {}

  async isExistingUser(checkEmailAuthDto: EmailAuthDto) {
    const user = await this.userService.findUserByEmail(
      checkEmailAuthDto.email,
    );
    if (user) {
      return true;
    } else {
      return false;
    }
  }

  async getUserById(id: string) {
    return await this.userService.findUserById(id);
  }

  async getValidUserById(id: string) {
    return await this.userService.getValidUserById(id);
  }

  async seedAdmin(createAuthDto: CreateAuthDto) {
    try {
      const adminCount = await this.userService.countAdminUser();
      if (adminCount > 0) {
        return false;
      }
      createAuthDto.password = await this.hashPassword(createAuthDto.password);
      await this.userService.createAdminUser(createAuthDto);
      return true;
    } catch (error) {
      throw new InternalServerErrorException('Admin creation failed', {
        cause: error,
      });
    }
  }

  async updateAccessToken(user: UserDocument, response: Response) {
    const [accessToken] = await this.generateTokens(user);
    await this.setTokens(response, { accessToken });
    return { user, status: 'success', accessToken };
  }

  async createGuestAccount(
    createGuestAccountDto: CreateGuestAccountDto,
    response: Response,
  ) {
    const key = this.configService.get('GUEST_ACCESS_KEY');
    if (createGuestAccountDto.key !== key) {
      throw new HttpException('Invalid access key', HttpStatus.UNAUTHORIZED);
    }
    try {
      const guestUser = await this.userService.createGuestUser(
        createGuestAccountDto.accountType as Role,
      );
      const [accessToken] = await this.generateTokens(guestUser, true);
      await this.setTokens(response, { accessToken }, true);
      return { guestUser, status: 'success' };
    } catch (error) {
      console.timeLog('error', error);
      throw new HttpException(
        'Error creating guest account',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createTempAccount(response: Response) {
    try {
      const tempUser = await this.userService.createTempUser();
      const [accessToken] = await this.generateTokens(tempUser, true);
      await this.setTokens(response, { accessToken });
      return tempUser;
    } catch (error) {
      console.timeLog('error', error);
      throw new HttpException(
        'Error creating temp account',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateUser(
    updateUserDto: UpdateUserDto,
    user: UserDocument,
    response: Response,
  ) {
    if (updateUserDto.password) {
      updateUserDto.password = await this.hashPassword(updateUserDto.password);
    }
    await this.userService.updateUser(user.id, updateUserDto);
    user.password = null;
    const [accessToken, refreshToken] = await this.generateTokens(user);
    await this.setTokens(response, { accessToken, refreshToken });
    return { user, status: 'success', accessToken, refreshToken };
  }

  async register(
    createAuthDto: CreateAuthDto,
    request: Request,
    response: Response,
  ): Promise<AuthResponse> {
    const isExistingUser = await this.isExistingUser(createAuthDto);
    if (isExistingUser) {
      throw new HttpException('User already registered', HttpStatus.CONFLICT);
    }
    createAuthDto.password = await this.hashPassword(createAuthDto.password);
    createAuthDto.rolePermission = 'user';
    const user = await this.userService.registerUser(createAuthDto);
    try {
      const tempUser = await this.getUserFromRequest(request);
      if (tempUser) {
        user.tempEmail = tempUser.email;
        await this.userService.addRealEmailInGuestUser(
          tempUser.email,
          user.email,
          user.name,
        );
      }
    } catch (error) {
      console.timeLog('error', error);
    } finally {
      await this.logout(response);
    }
    user.otp = generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    await this.userService.updateUser(user.id, user);
    this.eventEmitter.emit(
      MailEventNames.SEND,
      new MailSendEvent({
        isPredefined: true,
        mailName: 'registration',
        recepitentEmail: user.email,
        name: user.name,
        resourceName: 'New Registration',
        subject: 'Complete registration',
        otp: `${user.otp}`,
        user: user,
        priority: 1,
      }),
    );
    user.password = null;

    return { user, status: 'success' };
  }

  async login(loginAuthDto: LoginAuthDto, response: Response) {
    const user = await this.userService.findUserByEmail(loginAuthDto.email);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    if (!user.isverified) {
      throw new HttpException('User not verified', HttpStatus.UNAUTHORIZED);
    }
    const isPasswordCorrect = await this.comparePassword(
      loginAuthDto.password,
      user.password,
    );
    if (!isPasswordCorrect) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    user.password = null;
    const [accessToken, refreshToken] = await this.generateTokens(user);
    await this.setTokens(response, { accessToken, refreshToken });
    return { user, status: 'success', accessToken, refreshToken };
  }

  async refreshToken(token: string, response: Response) {
    const user = await this.getUserFromAuthenticationRefreshToken(token);
    if (!user) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    const [accessToken, refreshToken] = await this.generateTokens(user);
    await this.setTokens(response, { accessToken, refreshToken });
    return { user, status: 'success', accessToken, refreshToken };
  }

  public async updateGoogleUserAndSetCookie(response: Response, userInfo: any) {
    const { email, id: providerId, picture, name } = userInfo;
    const existingUser = await this.userService.findUserByEmail(email);
    const imageUrl = await this.imageService.uploadImageFromUrl(picture);
    if (!existingUser) {
      const user = await this.userService.registerUser({
        name: name,
        email: email,
        password: `google`,
        provider: 'google',
        providerId: providerId,
        imageUrl: imageUrl,
      });
      await this.setLoginCookie(response, user);
    } else {
      await this.userService.updateUser(existingUser.id, {
        name: name,
        provider: 'google',
        providerId: providerId,
        imageUrl: imageUrl ?? null,
        isverified: true,
      });
      await this.setLoginCookie(response, existingUser);
    }
  }

  public async registerGoogle(profile: GoogleProfile) {
    const user = await this.userService.registerUser({
      name: profile.displayName,

      email: profile.emails[0]?.value ?? `${profile.id}@google.com`,
      password: `google`,
      provider: profile.provider,
      providerId: profile.id,
      rolePermission: 'user',
      isverified: true,
    });

    return user;
  }

  public async registerFacebook(profile: FacebookProfile) {
    const user = await this.userService.registerUser({
      name: profile.displayName,
      email: profile.emails[0]?.value ?? `${profile.id}@facebook.com`,
      password: `facebook`,
      provider: profile.provider,
      providerId: profile.id,
      rolePermission: 'user',
      isverified: true,
    });

    return user;
  }

  public async setLoginCookie(response: Response, user: UserDocument) {
    try {
      const [accessToken, refreshToken] = await this.generateTokens(user);
      await this.setTokens(response, { accessToken, refreshToken });
      return user;
    } catch (err) {
      console.log(err);
      throw new HttpException(err.response, err.status);
    }
  }

  async forgetPassword(
    forgotPasswordAuthDto: EmailAuthDto,
  ): Promise<UserDocument> {
    const user = await this.userService.findUserByEmail(
      forgotPasswordAuthDto.email,
    );
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    user.otp = generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });
    await this.userService.updateUser(user.id, user);
    this.eventEmitter.emit(
      MailEventNames.SEND,
      new MailSendEvent({
        isPredefined: true,
        mailName: 'forgot-password',
        recepitentEmail: user.email,
        resourceName: 'Forgot Password',
        subject: 'Otp',
        name: user.name,
        otp: `${user.otp}`,
        user: user,
        priority: 1,
      }),
    );
    return user;
  }

  async receiveOtp(verifyEmailAuthDto: VerifyEmailAuthDto): Promise<boolean> {
    const user = await this.userService.findUserByEmail(
      verifyEmailAuthDto.email,
    );
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    if (user.otp !== verifyEmailAuthDto.otp) {
      throw new HttpException('Invalid otp', HttpStatus.UNAUTHORIZED);
    }
    user.isverified = true;
    if (verifyEmailAuthDto.removeotp) {
      user.otp = null;
    }
    await this.userService.updateUser(user.id, user);
    return true;
  }

  async setNewPassword(changePasswordOtpAuthDto: ChangePasswordOtpAuthDto) {
    const user = await this.userService.findUserByEmail(
      changePasswordOtpAuthDto.email,
    );
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    if (user.otp !== changePasswordOtpAuthDto.otp) {
      throw new HttpException('Invalid otp', HttpStatus.UNAUTHORIZED);
    }
    user.password = await this.hashPassword(changePasswordOtpAuthDto.password);
    user.otp = null;
    await this.userService.updateUser(user.id, user);
    return true;
  }

  private hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }

  private async comparePassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
  }

  private async generateTokens(user, isTemp: boolean = false) {
    const jwtid = uuidv4();
    const accessToken = await this.jwtService.signAsync(
      {
        id: user.id,
        email: user.email,
      },
      {
        issuer: 'shirsho',
        secret: this.configService.get('JWT_ACCESS_SECRET_KEY'),
        expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION_TIME'),
      },
    );
    if (isTemp) {
      return [accessToken];
    }
    const refreshToken = await this.jwtService.signAsync(
      {
        id: user.id,
        email: user.email,
      },
      {
        jwtid,
        issuer: 'shirsho',
        secret: this.configService.get('JWT_REFRESH_SECRET_KEY'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION_TIME'),
      },
    );
    return [accessToken, refreshToken];
  }

  private async setTokens(
    res: Response,
    {
      accessToken,
      refreshToken,
    }: { accessToken: string; refreshToken?: string },
    isTemp = false,
  ) {
    const domain = this.configService.get('DOMAIN');
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('access_token', accessToken, {
      maxAge: isTemp
        ? +this.configService.get('JWT_TEMP_ACCESS_EXPIRATION_SECOND')
        : +this.configService.get('JWT_ACCESS_EXPIRATION_SECOND'),
      httpOnly: true,
      sameSite: isProd ? 'strict' : 'lax',
      secure: isProd,
      domain: domain,
    });

    if (refreshToken) {
      res.cookie('refresh_token', refreshToken, {
        maxAge: +this.configService.get('JWT_REFRESH_EXPIRATION_SECOND'),
        httpOnly: true,
        sameSite: isProd ? 'strict' : 'lax',
        secure: isProd,
        domain: domain,
      });
    }
  }

  public async logout(response: Response) {
    const domain = this.configService.get('DOMAIN');
    const isProd = process.env.NODE_ENV === 'production';
    response.clearCookie('access_token', {
      domain: domain,
      httpOnly: true,
      sameSite: isProd ? 'strict' : 'lax',
      secure: isProd,
    });
    response.clearCookie('refresh_token', {
      domain: domain,
      httpOnly: true,
      sameSite: isProd ? 'strict' : 'lax',
      secure: isProd,
    });
    return { status: 'success' };
  }

  private async getUserFromRequest(request: Request) {
    const accessToken = request.cookies['access_token'];
    if (!accessToken) {
      throw new HttpException('No token provided', HttpStatus.UNAUTHORIZED);
    }
    return await this.getUserFromAuthenticationToken(accessToken);
  }

  public async getUserFromAuthenticationToken(token: string) {
    try {
      const payload: any = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_ACCESS_SECRET_KEY'),
      });
      const userId = payload.id;

      if (userId) {
        return this.userService.findUserByIdPassword(userId);
      }
    } catch (err) {
      console.log('err', err);
      return null;
    }
  }

  public async getUserFromAuthenticationRefreshToken(token: string) {
    try {
      const payload: any = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_REFRESH_SECRET_KEY'),
      });

      const userId = payload.id;

      if (userId) {
        return this.userService.findUserByIdPassword(userId);
      }
    } catch (err) {
      console.log('err', err);
      return null;
    }
  }
}
