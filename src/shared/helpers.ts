import { Prisma } from '@prisma/client';

// catch lỗi unique constraint error (trùng giá trị ở trường unique)
export function isUniqueConstraintPrismaError(error: any): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}

// catch lỗi not found error (truy vấn không tìm thấy bản ghi)
export function isNotFoundPrismaError(error: any): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025';
}
