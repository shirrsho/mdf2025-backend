import { AuthGuard } from '@nestjs/passport';

export class AccessTokenTempGuard extends AuthGuard('access-token-temp') {
  constructor() {
    super();
  }
}
