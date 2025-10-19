import { Injectable, NotFoundException } from '@nestjs/common';
import { RoleName } from 'src/shared/constants/role.constant';
import { PrismaService } from 'src/shared/services/prisma.service';
import { RoleType } from './auth.model';

@Injectable()
export class RolesService {
  private clientRoleId: number | null = null;

  constructor(private readonly prismaService: PrismaService) {}

  // Lấy roleId của role 'CLIENT', sử dụng caching để tránh truy vấn nhiều lần
  async getClientRoleId() {
    if (this.clientRoleId) {
      return this.clientRoleId;
    }

    // do sửa lại PARTIAL_UNIQUE_INDEX cho "name" trên table "Role" khi deleteAt=null, nên dùng queryRaw để truy vấn
    const role: RoleType = await this.prismaService
      .$queryRaw`SELECT * FROM "Role" WHERE "name" = ${RoleName.CLIENT} AND "deletedAt" IS NULL LIMIT 1`.then(
      (res: RoleType[]) => {
        if (res.length === 0) {
          throw new NotFoundException('Role CLIENT not found');
        }
        return res[0];
      },
    );

    this.clientRoleId = role.id;
    return role.id;
  }
}
