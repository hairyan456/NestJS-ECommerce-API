import { Prisma } from '@prisma/client';
import { randomInt } from 'crypto';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// catch lỗi unique constraint error (trùng giá trị ở trường unique)
export function isUniqueConstraintPrismaError(error: any): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}

// catch lỗi not found error (truy vấn không tìm thấy bản ghi)
export function isNotFoundPrismaError(error: any): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025';
}

// catch lỗi foreign key constraint error (truy vấn vi phạm ràng buộc khóa ngoại)
export function isForeignKeyConstraintPrismaError(error: any): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003';
}

// generate OTP Function
export const generateOTP = () => {
  return String(randomInt(100000, 1000000));
};

export const generateRandomFileName = (fileName: string) => {
  const ext = path.extname(fileName);
  return `${uuidv4()}${ext}`;
};
