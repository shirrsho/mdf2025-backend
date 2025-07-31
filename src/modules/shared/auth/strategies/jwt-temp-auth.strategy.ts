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

export type JwtTempAccessPayload = {
  id: string;
  email: string;
};

@Injectable()
export class JwtTempAuthStrategy extends PassportStrategy(
  Strategy,
  'access-token-temp',
) {
  constructor(
    configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: JwtTempAuthStrategy.extractJwtFromCookie,
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET_KEY'),
    });
  }

  async validate(payload: JwtTempAccessPayload) {
    if (!payload) {
      throw new UnauthorizedException();
    }
    try {
      const user = await this.authService.getUserById(payload.id);
      if (!user) {
        throw new HttpException('Token expired', 498);
      }
      return user;
    } catch (e) {
      if (e.status === 498) {
        throw new HttpException('Token expired', 498);
      }
      throw new HttpException('Token expired', 498);
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
