import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductRepo } from 'src/routes/product/product.repo';
import { CreateProductBodyType, GetProductsQueryType, UpdateProductBodyType } from 'src/routes/product/product.model';
import { I18nContext } from 'nestjs-i18n';
import { isNotFoundPrismaError } from 'src/shared/helpers';

@Injectable()
export class ProductService {
  constructor(private productRepo: ProductRepo) {}

  async list(query: GetProductsQueryType) {
    const data = await this.productRepo.list(query, I18nContext.current()?.lang as string);
    return data;
  }

  async findById(id: number) {
    const product = await this.productRepo.findById(id, I18nContext.current()?.lang as string);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  create({ data, createdById }: { data: CreateProductBodyType; createdById: number }) {
    return this.productRepo.create({
      createdById,
      data,
    });
  }

  async update({ id, data, updatedById }: { id: number; data: UpdateProductBodyType; updatedById: number }) {
    try {
      const product = await this.productRepo.update({
        id,
        updatedById,
        data,
      });
      return product;
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw new NotFoundException('Product not found');
      }
      throw error;
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.productRepo.delete({
        id,
        deletedById,
      });
      return {
        message: 'Delete successfully',
      };
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw new NotFoundException('Product not found');
      }
      throw error;
    }
  }
}
