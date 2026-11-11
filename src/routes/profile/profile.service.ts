import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { ChangePasswordBodyType, UpdateMeBodyType } from './profile.model';
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo';
import { HashingService } from 'src/shared/services/hashing.service';
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers';

@Injectable()
export class ProfileService {
  constructor(
    private readonly sharedUserRepository: SharedUserRepository,
    private readonly hashingService: HashingService,
  ) {}

  async getProfile(userId: number) {
    const user = await this.sharedUserRepository.findUniqueIncludeRolePermissions({
      id: userId,
      deletedAt: null,
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy user trong hệ thống');
    }

    return user;
  }

  async updateProfile({ userId, body }: { userId: number; body: UpdateMeBodyType }) {
    try {
      return await this.sharedUserRepository.update(
        { id: userId, deletedAt: null },
        {
          ...body,
          updatedById: userId,
        },
      );
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw new UnprocessableEntityException('Thông tin cập nhật đã tồn tại');
      }
      throw error;
    }
  }

  async changePassword({ userId, body }: { userId: number; body: Omit<ChangePasswordBodyType, 'confirmNewPassword'> }) {
    try {
      const { password, newPassword } = body;
      const user = await this.sharedUserRepository.findUnique({
        id: userId,
        deletedAt: null,
      });
      if (!user) {
        throw new NotFoundException('Không tìm thấy user trong hệ thống');
      }
      const isPasswordMatch = await this.hashingService.comparePassword(password, user.password);
      if (!isPasswordMatch) {
        throw new UnprocessableEntityException([
          {
            message: 'Mật khẩu không chính xác',
            path: 'password',
          },
        ]);
      }
      const hashedPassword = await this.hashingService.hashPassword(newPassword);

      await this.sharedUserRepository.update(
        { id: userId, deletedAt: null },
        {
          password: hashedPassword,
          updatedById: userId,
        },
      );
      return {
        message: 'Đổi mật khẩu thành công',
      };
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw new NotFoundException('Không tìm thấy user trong hệ thống');
      }
      throw error;
    }
  }
}
