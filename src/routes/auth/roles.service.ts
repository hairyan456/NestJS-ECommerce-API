import { Injectable } from '@nestjs/common';
import { RoleName } from 'src/shared/constants/role.constant';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class RolesService {
  private clientRoleId: number | null = null;

  constructor(private readonly prismaService: PrismaService) {}

  // Lấy roleId của role 'CLIENT', sử dụng caching để tránh truy vấn nhiều lần
  async getClientRoleId() {
    if (this.clientRoleId) {
      return this.clientRoleId;
    }

    const role = await this.prismaService.role.findUniqueOrThrow({
      where: {
        name: RoleName.CLIENT,
      },
    });

    this.clientRoleId = role.id;
    return role.id;
  }
}
