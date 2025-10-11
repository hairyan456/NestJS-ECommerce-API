import { Injectable, NotFoundException } from '@nestjs/common';
import { LanguageRepository } from 'src/routes/language/language.repo';
import { CreateLanguageBodyType, UpdateLanguageBodyType } from 'src/routes/language/language.model';
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers';
import { LanguageAlreadyExistsException } from 'src/routes/language/language.error';

@Injectable()
export class LanguageService {
  constructor(private LanguageRepository: LanguageRepository) {}

  async findAll() {
    const data = await this.LanguageRepository.findAll();
    return {
      data,
      totalItems: data.length,
    };
  }

  async findById(id: string) {
    const language = await this.LanguageRepository.findById(id);
    if (!language) {
      throw new NotFoundException('Language không tồn tại');
    }
    return language;
  }

  async create({ data, createdById }: { data: CreateLanguageBodyType; createdById: number }) {
    try {
      return await this.LanguageRepository.create({
        createdById,
        data,
      });
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw LanguageAlreadyExistsException;
      }
      throw error;
    }
  }

  async update({ id, data, updatedById }: { id: string; data: UpdateLanguageBodyType; updatedById: number }) {
    try {
      const language = await this.LanguageRepository.update({
        id,
        updatedById,
        data,
      });
      return language;
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw new NotFoundException('Language không tồn tại');
      }
      throw error;
    }
  }

  async delete(id: string) {
    try {
      // hard delete
      await this.LanguageRepository.delete(id, true);
      return {
        message: 'Delete successfully',
      };
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw new NotFoundException('Language không tồn tại');
      }
      throw error;
    }
  }
}
