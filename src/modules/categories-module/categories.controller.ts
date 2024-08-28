import { Body, Controller, Delete, Get, Inject, Param, Patch, Post } from '@nestjs/common';
import { CreateCategoryUseCase } from '@/core/category/application/use-cases/create-category/create-category.use-case';
import { DeleteCategoryUseCase } from '@/core/category/application/use-cases/delete-category/delete-category.use-case';
import { GetCategoryUseCase } from '@/core/category/application/use-cases/get-category/get-category.use-case';
import { ListCategoriesUseCase } from '@/core/category/application/use-cases/list-category/list-categories.use-case';
import { UpdateCategoryUseCase } from '@/core/category/application/use-cases/update-category/update-category.use-case';
import { CreateCategoryDto } from '@/modules/categories-module/dto/create-category.dto';
import { UpdateCategoryDto } from '@/modules/categories-module/dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
  @Inject(CreateCategoryUseCase)
  private createUseCase: CreateCategoryUseCase;

  @Inject(DeleteCategoryUseCase)
  private deleteUseCase: DeleteCategoryUseCase;

  @Inject(GetCategoryUseCase)
  private getUseCase: GetCategoryUseCase;

  @Inject(ListCategoriesUseCase)
  private: ListCategoriesUseCase;

  @Inject(UpdateCategoryUseCase)
  private updateUseCase: UpdateCategoryUseCase;

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    throw new Error('Method not implemented');
  }

  @Get()
  findAll() {
    throw new Error('Method not implemented');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    throw new Error('Method not implemented');
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    throw new Error('Method not implemented');
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    throw new Error('Method not implemented');
  }
}
