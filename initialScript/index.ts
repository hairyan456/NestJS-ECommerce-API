import envConfig from 'src/shared/config';
import { RoleName } from 'src/shared/constants/role.constant';
import { PrismaService } from 'src/shared/services/prisma.service';
import { HashingService } from 'src/shared/services/hashing.service';
import { Logger } from '@nestjs/common';

const prisma = new PrismaService();
const hashingService = new HashingService();
const logger = new Logger();

// Chạy file bằng lệnh npm run init-seed-data (config trong package.json)
const main = async () => {
  // Seed Roles
  const rolesCount = await prisma.role.count();
  if (rolesCount > 0) {
    throw new Error('Roles already seeded');
  }
  const roles = await prisma.role.createMany({
    data: [
      {
        name: RoleName.ADMIN,
        description: 'Admin role with all permissions',
      },
      {
        name: RoleName.CLIENT,
        description: 'Client role with limited permissions',
      },
      {
        name: RoleName.SELLER,
        description: 'Seller role with permissions to manage products and orders',
      },
    ],
  });

  // Seed Admin User
  const adminRole = await prisma.role.findFirstOrThrow({
    where: { name: RoleName.ADMIN },
  });
  const adminUser = await prisma.user.create({
    data: {
      email: envConfig.ADMIN_EMAIL,
      password: await hashingService.hashPassword(envConfig.ADMIN_PASSWORD),
      name: envConfig.ADMIN_NAME,
      phoneNumber: envConfig.ADMIN_PHONE_NUMBER,
      roleId: adminRole?.id,
    },
  });

  return {
    createdRolesCount: roles.count,
    adminUser,
  };
};

main()
  .then(({ adminUser, createdRolesCount }) => {
    console.log(`Created ${createdRolesCount} roles`);
    console.log(`Created admin user with email: ${adminUser.email}`);
  })
  .catch((error) => {
    logger.error(error);
  });
