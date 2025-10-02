import { UnprocessableEntityException } from '@nestjs/common';
import { createZodValidationPipe } from 'nestjs-zod';
import { ZodError } from 'zod';

/**
 * Custom ZodValidationPipe
 * - Dùng để xử lý và format error khi validate thất bại
 * - Trả về lỗi UnprocessableEntityException (422)
 * - Convert err.path thành string "field.subfield"
 */

const CustomZodValidationPipe = createZodValidationPipe({
  // provide custom validation exception factory
  createValidationException: (error: ZodError) => {
    return new UnprocessableEntityException(
      error.errors.map((err) => {
        return {
          ...err,
          path: err.path.join('.'),
        };
      }),
    );
  },
}) as any;

export default CustomZodValidationPipe;
