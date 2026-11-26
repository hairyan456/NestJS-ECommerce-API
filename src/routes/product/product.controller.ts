import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import {
  CreateProductBodyDTO,
  GetProductDetailResDTO,
  GetProductParamsDTO,
  GetProductsQueryDTO,
  GetProductsResDTO,
  ProductDTO,
  UpdateProductBodyDTO,
} from 'src/routes/product/product.dto';
import { ProductService } from 'src/routes/product/product.service';
import { Public } from 'src/shared/decorators/auth.decorator';
import { User } from 'src/shared/decorators/user.decorator';
import { MessageResDTO } from 'src/shared/dtos/response.dto';

@Controller('products')
@Public()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @Public()
  @ZodSerializerDto(GetProductsResDTO)
  list(@Query() query: GetProductsQueryDTO) {
    return this.productService.list(query);
  }

  @Get(':productId')
  @Public()
  @ZodSerializerDto(GetProductDetailResDTO)
  findById(@Param() params: GetProductParamsDTO) {
    return this.productService.findById(params.productId);
  }

  @Post()
  @ZodSerializerDto(GetProductDetailResDTO)
  create(@Body() body: CreateProductBodyDTO, @User('userId') userId: number) {
    return this.productService.create({
      data: body,
      createdById: userId,
    });
  }

  @Put(':productId')
  @ZodSerializerDto(ProductDTO)
  update(@Body() body: UpdateProductBodyDTO, @Param() params: GetProductParamsDTO, @User('userId') userId: number) {
    return this.productService.update({
      data: body,
      id: params.productId,
      updatedById: userId,
    });
  }

  @Delete(':productId')
  @ZodSerializerDto(MessageResDTO)
  delete(@Param() params: GetProductParamsDTO, @User('userId') userId: number) {
    return this.productService.delete({
      id: params.productId,
      deletedById: userId,
    });
  }
}
