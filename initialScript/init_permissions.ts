import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { HTTPMethod } from 'src/shared/constants/role.constant';
import { PrismaService } from 'src/shared/services/prisma.service';

const prisma = new PrismaService();
const logger = new Logger();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3010);
  const server = app.getHttpAdapter().getInstance();
  const router = server.router;

  const availableRoutes = router.stack
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

  // Add vào Database với logic kiểm tra tồn tại
  try {
    // 1. Kiểm tra xem đã có bản ghi nào trong bảng Permission chưa
    const existingCount = await prisma.permission.count();

    if (existingCount > 0) {
      // 2. Nếu đã có bản ghi, thông báo và không làm gì cả
      logger.warn('Permissions have already been seeded. Skipping initialization.');
    } else {
      // 3. Nếu chưa có, thực hiện createMany
      const result = await prisma.permission.createMany({
        data: availableRoutes,
        skipDuplicates: true, // Bổ sung skipDuplicates: true để an toàn hơn
      });
      logger.log(`Successfully seeded ${result.count} permissions into the database.`);
    }
  } catch (error) {
    logger.error('Error during permission seeding:', error);
    // Nếu có lỗi, ta thoát với mã lỗi 1 để báo hiệu thất bại
    process.exit(1);
  } finally {
    // Đảm bảo quy trình thoát dù thành công hay thất bại (trừ khi thoát với mã 1 ở trên)
    if (process.exitCode !== 1) {
      process.exit(0);
    }
  }
}
bootstrap();
