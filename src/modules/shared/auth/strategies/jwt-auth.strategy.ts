import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { AuthService } from '../providers';

export type JwtAccessPayload = {
  id: string;
  email: string;
};

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(
  Strategy,
  'access-token',
) {
  constructor(
    configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: JwtAuthStrategy.extractJwtFromCookie,
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET_KEY'),
    });
  }

  async validate(payload: JwtAccessPayload) {
    if (!payload) {
      throw new UnauthorizedException();
    }
    try {
      const user = await this.authService.getValidUserById(payload.id);
      if (!user) {
        throw new HttpException('Invalid token', 498);
      }
      return user;
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException('Invalid token', 498);
      }
    }
  }

  static extractJwtFromCookie(req: Request) {
    let token = null;

    if (req && req.cookies) {
      token = req.cookies['access_token'];
    }

    return token || ExtractJwt.fromAuthHeaderAsBearerToken()(req);
  }
}
