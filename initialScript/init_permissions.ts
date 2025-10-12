import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { HTTPMethod } from 'src/shared/constants/role.constant';
import { PrismaService } from 'src/shared/services/prisma.service';

const prisma = new PrismaService();
const logger = new Logger();

/**
 * Viết 1 script phát hiện:
 *  - Nếu permissions trong DB không tồn tại trong các routes của hệ thống hiện tại => Delete
 *  - Nếu trong routes hệ thống hiện tại chứa route mà chưa tồn tại trong Permission của DB => Create
 */

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3010);
  const server = app.getHttpAdapter().getInstance();
  const router = server.router;

  const permissionsInDB = await prisma.permission.findMany({
    where: {
      deletedAt: null,
    },
  });
  const availableRoutes: { path: string; method: keyof typeof HTTPMethod; name: string }[] = router.stack
    .map((layer) => {
      if (layer?.route) {
        const path = layer.route?.path;
        const method = String(layer.route.stack[0].method).toUpperCase() as keyof typeof HTTPMethod;
        return {
          path,
          method,
          name: `${method} ${path}`,
        };
      }
    })
    .filter((item) => item !== undefined);

  // Tạo object permissionsInDBMap với key: [method-path]
  const permissionsInDBMap: Record<string, (typeof permissionsInDB)[0]> = permissionsInDB.reduce((acc, item) => {
    acc[`${item.method}-${item.path}`] = item;
    return acc;
  }, {});
  // Tạo object availableRoutesMap với key: [method-path]
  const availableRoutesMap: Record<string, (typeof availableRoutes)[0]> = availableRoutes.reduce((acc, item) => {
    acc[`${item.method}-${item.path}`] = item;
    return acc;
  }, {});

  // Tìm permissions trong DB mà không tồn tại trong availableRoutes
  const permissionsToDelete = permissionsInDB.filter((item) => {
    return !availableRoutesMap[`${item.method}-${item.path}`];
  });

  // Xóa permissions không tồn tại trong availableRoutes
  if (permissionsToDelete.length > 0) {
    const deleteResult = await prisma.permission.deleteMany({
      where: {
        id: {
          in: permissionsToDelete.map((item) => item.id),
        },
      },
    });
    logger.warn(`Deleted ${deleteResult.count} permissions from the database.`);
  } else {
    logger.verbose('No permission to delete');
  }

  // Tìm routes trong source code mà không tồn tại trong permissionsInDB
  const routesToAdd = availableRoutes.filter((item) => {
    return !permissionsInDBMap[`${item.method}-${item.path}`];
  });

  // Thêm các routes này vào permission DB
  if (routesToAdd.length > 0) {
    const permissionsToAdd = await prisma.permission.createMany({
      data: routesToAdd,
      skipDuplicates: true, // Bổ sung skipDuplicates: true để an toàn hơn
    });
    logger.warn(`Added ${permissionsToAdd.count} permissions to the database.`);
  } else {
    logger.verbose('No permission to add');
  }

  process.exit(0);
}
bootstrap();
