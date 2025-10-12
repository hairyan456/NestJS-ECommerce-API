import { UnprocessableEntityException } from '@nestjs/common';

export const PermissionAlreadyExistsException = new UnprocessableEntityException([
  {
    message: 'Permission đã tồn tại',
    path: 'path',
  },
  {
    message: 'Permission đã tồn tại',
    path: 'method',
  },
]);
