import { UnprocessableEntityException } from '@nestjs/common';

export const LanguageAlreadyExistsException = new UnprocessableEntityException([
  {
    message: 'Language đã tồn tại',
    path: 'id',
  },
]);
