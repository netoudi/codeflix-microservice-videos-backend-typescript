import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CategorySequelizeRepository } from '@/core/category/infra/db/sequelize/category-sequelize.repository';
import { CreateCategoryDto } from '@/modules/categories-module/dto/create-category.dto';
import { UpdateCategoryDto } from '@/modules/categories-module/dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private categoryRepository: CategorySequelizeRepository) {
    console.log(this.categoryRepository);
  }

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
