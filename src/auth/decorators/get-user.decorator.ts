import {
  ExecutionContext,
  InternalServerErrorException,
  createParamDecorator,
} from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user)
      throw new InternalServerErrorException(
        'Something went wrong, user not found in request',
      );

    return !data ? user : user[data];
  },
);
