import { Injectable, NotFoundException } from '@nestjs/common';
import { RoleName } from 'src/shared/constants/role.constant';
import { RoleType } from 'src/shared/models/shared-role.model';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class SharedRoleRepository {
  private clientRoleId: number | null = null;
  private adminRoleId: number | null = null;

  constructor(private readonly prismaService: PrismaService) {}

  private async getRole(roleName: string) {
    // do sửa lại PARTIAL_UNIQUE_INDEX cho "name" trên table "Role" khi deleteAt=null, nên dùng queryRaw để truy vấn
    const role: RoleType = await this.prismaService
      .$queryRaw`SELECT * FROM "Role" WHERE "name" = ${roleName} AND "deletedAt" IS NULL LIMIT 1`.then(
      (res: RoleType[]) => {
        if (res.length === 0) {
          throw new NotFoundException(`Role ${roleName} not found`);
        }
        return res[0];
      },
    );
    return role;
  }

  // Lấy roleId của role 'CLIENT', sử dụng caching để tránh truy vấn nhiều lần
  async getClientRoleId() {
    if (this.clientRoleId) {
      return this.clientRoleId;
    }
    const role = await this.getRole(RoleName.CLIENT);
    this.clientRoleId = role.id;
    return role.id;
  }

  async getAdminRoleId() {
    if (this.adminRoleId) {
      return this.adminRoleId;
    }
    const role = await this.getRole(RoleName.ADMIN);
    this.adminRoleId = role.id;
    return role.id;
  }
}
