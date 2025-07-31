import { AuthGuard } from '@nestjs/passport';

export class AccessTokenOptionalGuard extends AuthGuard(
  'access-token-optional',
) {
  constructor() {
    super();
  }
}
