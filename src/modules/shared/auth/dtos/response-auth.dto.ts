import { User } from '@/modules/v1/user/schema';

export class AuthResponse {
  user: User;
  status: string;
  accessToken?: string;
  refreshToken?: string;
}
