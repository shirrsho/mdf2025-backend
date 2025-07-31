import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiExcludeEndpoint,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import {
  ApiCustomBadRequestResponse,
  ApiCustomNotFoundResponse,
  ReqUser,
} from '@/modules/decorator';
import { BaseController } from '@/modules/base';
import { User } from '@/modules/v1/user/schema';
import { AuthService } from '../providers';
import {
  EmailAuthDto,
  CreateAuthDto,
  LoginAuthDto,
  VerifyEmailAuthDto,
  ChangePasswordOtpAuthDto,
  UpdateUserDto,
  CreateGuestAccountDto,
} from '../dtos';
import {
  AccessTokenGuard,
  AccessTokenOptionalGuard,
  GoogleGuard,
} from '../guards';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@ApiTags('v1/auth')
@Controller({ path: 'auth', version: '1' })
export class AuthGeneralController extends BaseController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  @Post('seed/admin')
  @ApiTags('v1/seed')
  @ApiOperation({
    summary: 'Seed first account',
    description: 'Create an admin account with provided data if correct',
  })
  @ApiCreatedResponse({
    description: 'Create an admin account with provided data if correct',
    type: User,
  })
  @ApiCustomBadRequestResponse('Already created')
  @ApiBody({ type: CreateAuthDto })
  async seedAdmin(@Body() createAuthDto: CreateAuthDto) {
    const ret = await this.authService.seedAdmin(createAuthDto);
    return { message: `Admin creation ${ret ? 'success' : 'failed'}` };
  }

  @Get('local/accesstoken')
  @ApiExcludeEndpoint()
  async updateAccessToken(@ReqUser() user, @Res() response: Response) {
    const ret = await this.authService.updateAccessToken(user, response);
    return response.send(ret);
  }

  @Post('account/guest')
  @ApiTags('v1/guest')
  @ApiOperation({
    summary: 'Create an guest account with correct access key',
  })
  @ApiCreatedResponse({
    description: 'Create an guest account with correct access key',
    type: User,
  })
  @ApiCustomBadRequestResponse('Misssing key')
  @ApiBody({ type: CreateGuestAccountDto })
  async createGuestAccount(
    @Body() createGuestAccountDto: CreateGuestAccountDto,
    @Res() response: Response,
  ) {
    const ret = await this.authService.createGuestAccount(
      createGuestAccountDto,
      response,
    );
    return response.send(ret);
  }

  @Get('local/user')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Get Logged in user' })
  @ApiOkResponse({
    description: 'Get Logged in user',
    type: User,
  })
  @ApiCustomBadRequestResponse('Unauthorize')
  async getUser(@ReqUser() user) {
    user.password = null;
    return { status: 'success', user };
  }

  @Get('local/optional-user')
  @UseGuards(AccessTokenOptionalGuard)
  @ApiOperation({ summary: 'Get Logged in user optional' })
  @ApiOkResponse({
    description: 'Get Logged in user optional',
    type: User,
  })
  @ApiCustomBadRequestResponse('Not available')
  async getOptionalUser(@ReqUser() user) {
    if (!user) {
      return;
    }
    if (typeof user === 'boolean') {
      return;
    }
    const { interactions, ...restUser } = user.toJSON();
    const interactionIds =
      interactions?.map((interaction: any) => interaction.resource) || [];
    return {
      ...restUser,
      interactions,
      interactionIds,
    };
  }

  @Post('local/check-email')
  @ApiOperation({ summary: 'Check email exist in database' })
  @ApiOkResponse({
    description: 'Is existing user',
    schema: {
      example: {
        status: 'success',
        existinguser: true,
      },
    },
  })
  @ApiCustomNotFoundResponse()
  @ApiBody({ type: EmailAuthDto })
  async isExistingUser(@Body() checkEmailAuthDto: EmailAuthDto) {
    const ret = await this.authService.isExistingUser(checkEmailAuthDto);
    return { status: 'success', existinguser: ret };
  }

  @Post('local/update')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Update an account with provided data if correct' })
  @ApiCreatedResponse({
    description: 'Create an account with provided data if correct',
  })
  @ApiCustomBadRequestResponse()
  @ApiBody({ type: UpdateUserDto })
  async updateUser(
    @Body() updateUserDto: UpdateUserDto,
    @ReqUser() user,
    @Res() response: Response,
  ) {
    const ret = await this.authService.updateUser(
      updateUserDto,
      user,
      response,
    );
    return response.send(ret);
  }

  @Post('local/register')
  @ApiOperation({ summary: 'Create an account with provided data if correct' })
  @ApiCreatedResponse({
    description: 'Create an account with provided data if correct',
    type: User,
  })
  @ApiCustomBadRequestResponse()
  @ApiBody({ type: CreateAuthDto })
  async register(
    @Body() createAuthDto: CreateAuthDto,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    const ret = await this.authService.register(
      createAuthDto,
      request,
      response,
    );
    return response.send(ret);
  }

  @Post('local/login')
  @ApiTags('v1/login')
  @ApiOperation({ summary: 'Logs in user' })
  @ApiOkResponse({
    description: 'Logs in user',
    schema: {
      example: {
        status: 'success',
        token: 'token',
      },
    },
  })
  @ApiCustomBadRequestResponse('Invalid credentials')
  @ApiBody({ type: LoginAuthDto })
  async login(@Body() loginAuthDto: LoginAuthDto, @Res() response: Response) {
    const ret = await this.authService.login(loginAuthDto, response);
    return response.send(ret);
  }

  @Post('local/refresh-token')
  @ApiOperation({ summary: 'Refersh token' })
  @ApiOkResponse({
    description: 'Refresh user token',
    schema: {
      example: {
        status: 'success',
        accessToken: 'token',
      },
    },
  })
  @ApiCustomBadRequestResponse('Invalid token')
  @ApiBody({ schema: { example: { token: 'token' } } })
  async refreshToken(@Body('token') token: string, @Res() response: Response) {
    const ret = await this.authService.refreshToken(token, response);
    return response.send(ret);
  }

  @Post('local/forgot-password')
  @ApiOperation({ summary: 'Sent forget-password otp' })
  @ApiOkResponse({
    description: 'Sent forget-password otp',
    schema: {
      example: {
        status: 'success',
        message: 'An email is sent at XXXXXXXXXXXXXX',
      },
    },
  })
  @ApiCustomBadRequestResponse('Invalid email')
  @ApiBody({ type: EmailAuthDto })
  async forgetPassword(@Body() forgotPasswordAuthDto: EmailAuthDto) {
    const ret = await this.authService.forgetPassword(forgotPasswordAuthDto);
    return { status: 'success', message: `An email is sent at ${ret.email}` };
  }

  @Post('local/receive-otp')
  @ApiOperation({ summary: 'Verify otp' })
  @ApiOkResponse({
    description: 'Verify otp',
    schema: {
      example: {
        status: 'success',
        isVerified: true,
        message: 'Otp verification success',
      },
    },
  })
  @ApiCustomBadRequestResponse('Invalid otp')
  @ApiBody({ type: VerifyEmailAuthDto })
  async receiveOtp(@Body() verifyEmailAuthDto: VerifyEmailAuthDto) {
    const ret = await this.authService.receiveOtp(verifyEmailAuthDto);
    return {
      status: 'success',
      isVerified: ret,
      message: `Otp verification ${ret ? 'success' : 'failed'}`,
    };
  }

  @Post('local/otp-newpassword')
  @ApiOperation({ summary: 'Set new password with otp' })
  @ApiOkResponse({
    description: 'Set new password with otp',
    schema: {
      example: {
        status: 'success',
        message: 'User password change success',
      },
    },
  })
  @ApiCustomBadRequestResponse('Invalid otp')
  @ApiBody({ type: ChangePasswordOtpAuthDto })
  async setNewPassword(
    @Body() changePasswordOtpAuthDto: ChangePasswordOtpAuthDto,
  ) {
    const ret = await this.authService.setNewPassword(changePasswordOtpAuthDto);
    return {
      status: 'success',
      message: `User password change ${ret ? 'success' : 'failed'}`,
    };
  }

  @Get('local/isloggedin')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Check User Login' })
  @ApiOkResponse({
    description: 'Check User Login',
    schema: {
      example: {
        status: 'success',
      },
    },
  })
  @ApiCustomBadRequestResponse('Invalid token')
  async isLoggedin(@ReqUser() user) {
    return { status: 'success', user };
  }

  @Get('local/logout')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Logs out user' })
  @ApiOkResponse({
    description: 'Logs out user',
    schema: {
      example: {
        status: 'success',
      },
    },
  })
  @ApiCustomBadRequestResponse('Invalid token')
  async logout(@Res() response: Response) {
    const ret = await this.authService.logout(response);
    return response.send(ret);
  }

  @Get('google/login')
  @UseGuards(GoogleGuard)
  async googleLogin() {}

  async exchangeCodeForToken(code: string): Promise<any> {
    const response = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      client_secret: this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
      redirect_uri: this.configService.get<string>('GOOGLE_CALLBACK_URL'),
      grant_type: 'authorization_code',
    });
    return response.data;
  }

  async getUserInfo(accessToken: string): Promise<any> {
    const response = await axios.get(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return response.data;
  }

  @ApiOkResponse({
    description: 'Google callback url',
  })
  @HttpCode(200)
  @Get('google/callback')
  async googleLoginCallback(
    @Query('code') code: string,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    const redirect_uri = request.cookies.redirect_uri || '/';
    response.clearCookie('redirect_uri');
    const tokenData = await this.exchangeCodeForToken(code);
    const userInfo = await this.getUserInfo(tokenData.access_token);
    await this.authService.updateGoogleUserAndSetCookie(response, userInfo);
    return response.redirect(redirect_uri);
  }

  @Get('local/role')
  @UseGuards(AccessTokenGuard)
  @ApiOkResponse({
    description: 'Get user role',
    schema: {
      example: {
        status: 'success',
        role: ['user'],
      },
    },
  })
  async getRoles(@ReqUser() user) {
    return { status: 'success', role: user.role };
  }
}
