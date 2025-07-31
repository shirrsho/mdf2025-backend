import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import * as controllers from './controllers';
import * as providers from './providers';
import * as strategies from './strategies';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from '@/modules/v1/user/user.module';
import { TempUserMiddleware } from '@/modules/middlewares';
import { ImageModule } from '../image';

@Module({
  imports: [
    UserModule,
    ImageModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_ACCESS_SECRET_KEY'),
        signOptions: {
          expiresIn: configService.get('JWT_ACCESS_EXPIRATION_TIME'),
        },
      }),
    }),
  ],
  controllers: Object.values(controllers),
  providers: [...Object.values(providers), ...Object.values(strategies)],
  exports: Object.values(providers),
})
export class AuthModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TempUserMiddleware).forRoutes({
      path: '/auth/local/optional-user',
      method: RequestMethod.GET,
    });
  }
}
