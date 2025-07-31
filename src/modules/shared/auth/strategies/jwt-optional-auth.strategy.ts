import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { AuthService } from '../providers';

export type JwtOptionalAccessPayload = {
  id: string;
  email: string;
};

@Injectable()
export class JwtOptionalAuthStrategy extends PassportStrategy(
  Strategy,
  'access-token-optional',
) {
  constructor(
    configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: JwtOptionalAuthStrategy.extractJwtFromCookie,
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET_KEY'),
    });
  }

  async validate(payload: JwtOptionalAccessPayload) {
    if (!payload) {
      return null;
    }
    try {
      const user = await this.authService.getValidUserById(payload.id);
      if (!user) {
        return null;
      }
      return user;
    } catch (e) {
      if (e.name === 'TokenExpiredError') {
        return null;
      }
      return null;
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
