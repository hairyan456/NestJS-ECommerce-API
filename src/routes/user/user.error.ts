import { ForbiddenException, UnprocessableEntityException } from '@nestjs/common';

export const UserAlreadyExistsException = new UnprocessableEntityException([
  {
    message: 'User email already exists',
    path: 'email',
  },
]);

export const CannotUpdateAdminUserException = new ForbiddenException('Cannot update admin user');

export const CannotDeleteAdminUserException = new ForbiddenException('Cannot delete admin user');

// Chỉ Admin mới có thể đặt role là ADMIN
export const CannotSetAdminRoleToUserException = new ForbiddenException('Cannot set admin role to user');

export const RoleNotFoundException = new UnprocessableEntityException([
  {
    message: 'Role not found in the system database',
    path: 'roleId',
  },
]);

// Không thể xóa hoặc cập nhật chính bản thân mình
export const CannotUpdateOrDeleteYourselfException = new ForbiddenException('Cannot update or delete yourself');
