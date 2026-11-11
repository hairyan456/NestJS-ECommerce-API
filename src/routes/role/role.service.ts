import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { RoleRepo } from 'src/routes/role/role.repo';
import { CreateRoleBodyType, GetRolesQueryType, UpdateRoleBodyType } from 'src/routes/role/role.model';
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers';
import { RoleAlreadyExistsException } from 'src/routes/role/role.error';
import { RoleName } from 'src/shared/constants/role.constant';

@Injectable()
export class RoleService {
  constructor(private roleRepo: RoleRepo) {}

  async list(pagination: GetRolesQueryType) {
    const data = await this.roleRepo.list(pagination);
    return data;
  }

  async findById(id: number) {
    const role = await this.roleRepo.findById(id);
    if (!role) {
      throw new NotFoundException('Role không tồn tại');
    }
    return role;
  }

  async create({ data, createdById }: { data: CreateRoleBodyType; createdById: number }) {
    try {
      const role = await this.roleRepo.create({
        createdById,
        data,
      });
      return role;
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw RoleAlreadyExistsException;
      }
      throw error;
    }
  }

  async update({ id, data, updatedById }: { id: number; data: UpdateRoleBodyType; updatedById: number }) {
    try {
      const role = await this.roleRepo.findById(id);
      if (!role) {
        throw new NotFoundException('Role không tồn tại trong hệ thống');
      }
      // Không cho bất kì ai cập nhật role ADMIN
      if (role.name === RoleName.ADMIN) {
        throw new ForbiddenException('Không thể cập nhật role này!');
      }

      const updatedRole = await this.roleRepo.update({
        id,
        updatedById,
        data,
      });
      return updatedRole;
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw new NotFoundException('Role không tồn tại');
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw RoleAlreadyExistsException;
      }
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      const role = await this.roleRepo.findById(id);
      if (!role) {
        throw new NotFoundException('Role không tồn tại trong hệ thống');
      }
      // Không cho phép xóa 3 role cơ bản: ADMIN, CLIENT, SELLER
      const baseRoles: string[] = [RoleName.ADMIN, RoleName.CLIENT, RoleName.SELLER];
      if (baseRoles.includes(role.name)) {
        throw new ForbiddenException('Không thể xóa role này!');
      }

      await this.roleRepo.delete({
        id,
        deletedById,
      });
      return {
        message: 'Delete successfully',
      };
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw new NotFoundException('Role không tồn tại trong hệ thống');
      }
      throw error;
    }
  }
}
