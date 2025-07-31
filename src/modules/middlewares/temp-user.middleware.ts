import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AuthService } from '../shared/auth/providers';

@Injectable()
export class TempUserMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authToken = req.cookies['access_token'];
    if (!authToken) {
      await this.authService.createTempAccount(res);
    }
    next();
  }
}
