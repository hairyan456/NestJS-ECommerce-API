import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { RoleRepo } from 'src/routes/role/role.repo';
import { CreateRoleBodyType, GetRolesQueryType, UpdateRoleBodyType } from 'src/routes/role/role.model';
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers';
import { RoleAlreadyExistsException } from 'src/routes/role/role.error';
import { RoleName } from 'src/shared/constants/role.constant';

const BASE_ROLE_NAMES: string[] = [RoleName.ADMIN, RoleName.CLIENT, RoleName.SELLER];

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

  /**
   * Kiểm tra xem role có phải là 1 trong 3 role cơ bản không
   */
  private async verifyRole(roleId: number) {
    const role = await this.roleRepo.findById(roleId);
    if (!role) {
      throw new NotFoundException('Role không tồn tại trong hệ thống');
    }
    if (BASE_ROLE_NAMES.includes(role.name)) {
      throw new ForbiddenException('Không thể thực hiện hành động này trên role cơ bản');
    }
  }

  async update({ id, data, updatedById }: { id: number; data: UpdateRoleBodyType; updatedById: number }) {
    try {
      await this.verifyRole(id);

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
      throw error;
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.verifyRole(id);

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
