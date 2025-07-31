import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { isMongoId } from 'class-validator';

export const MongoIdParam = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const id = request.params[data];

    if (!isMongoId(id)) {
      throw new BadRequestException(`${data} must be a valid MongoId`);
    }
    return id;
  },
);
