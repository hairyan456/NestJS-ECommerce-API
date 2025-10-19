import { Injectable } from '@nestjs/common';
import {
  CreateRoleBodyType,
  GetRolesQueryType,
  GetRolesResType,
  RoleWithPermissionsType,
  UpdateRoleBodyType,
} from 'src/routes/role/role.model';
import { RoleType } from '../auth/auth.model';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class RoleRepo {
  constructor(private prismaService: PrismaService) {}

  async list(pagination: GetRolesQueryType): Promise<GetRolesResType> {
    const skip = (pagination.page - 1) * pagination.limit;
    const take = pagination.limit;
    const [totalItems, data] = await Promise.all([
      this.prismaService.role.count({
        where: {
          deletedAt: null,
        },
      }),
      this.prismaService.role.findMany({
        where: {
          deletedAt: null,
        },
        skip,
        take,
      }),
    ]);
    return {
      data,
      totalItems,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(totalItems / pagination.limit),
    } as any;
  }

  findById(id: number): Promise<RoleWithPermissionsType | null> {
    return this.prismaService.role.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        permissions: {
          where: {
            deletedAt: null,
          },
        },
      },
    }) as any;
  }

  create({ createdById, data }: { createdById: number | null; data: CreateRoleBodyType }): Promise<RoleType> {
    return this.prismaService.role.create({
      data: {
        ...data,
        createdById,
      },
    }) as any;
  }

  async update({
    id,
    updatedById,
    data,
  }: {
    id: number;
    updatedById: number;
    data: UpdateRoleBodyType;
  }): Promise<RoleType> {
    // Kiểm tra nếu có permissionId nào đã được soft_delete thì không cho phép cập nhật
    if (data.permissionIds.length > 0) {
      const permissions = await this.prismaService.permission.findMany({
        where: {
          id: {
            in: data.permissionIds,
          },
        },
      });
      const deletedPermissions = permissions.filter((p) => p.deletedAt !== null);
      if (deletedPermissions.length > 0) {
        const deletedIds = deletedPermissions.map((p) => p.id).join(', ');
        throw new Error(`Permissions with id ${deletedIds} have been deleted`);
      }
    }

    return this.prismaService.role.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        name: data.name,
        description: data.description,
        isActive: data.isActive,
        permissions: {
          set: data.permissionIds.map((id) => ({ id })),
        },
        updatedById,
      },
      include: {
        permissions: {
          where: {
            deletedAt: null,
          },
        },
      },
    });
  }

  delete(
    {
      id,
      deletedById,
    }: {
      id: number;
      deletedById: number;
    },
    isHard?: boolean,
  ): Promise<RoleType> {
    return (
      isHard
        ? this.prismaService.role.delete({
            where: {
              id,
            },
          })
        : this.prismaService.role.update({
            where: {
              id,
              deletedAt: null,
            },
            data: {
              deletedAt: new Date(),
              deletedById,
            },
          })
    ) as any;
  }
}
