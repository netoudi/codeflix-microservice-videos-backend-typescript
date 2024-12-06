import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CategoryOutput } from '@/core/category/application/use-cases/common/category-output.mapper';
import { CreateCategoryUseCase } from '@/core/category/application/use-cases/create-category/create-category.use-case';
import { DeleteCategoryUseCase } from '@/core/category/application/use-cases/delete-category/delete-category.use-case';
import { GetCategoryUseCase } from '@/core/category/application/use-cases/get-category/get-category.use-case';
import { ListCategoriesUseCase } from '@/core/category/application/use-cases/list-category/list-categories.use-case';
import { UpdateCategoryUseCase } from '@/core/category/application/use-cases/update-category/update-category.use-case';
import { AuthGuard } from '@/modules/auth-module/auth.guard';
import { CheckIsAdminGuard } from '@/modules/auth-module/check-is-admin.guard';
import { CategoryCollectionPresenter, CategoryPresenter } from '@/modules/categories-module/categories.presenter';
import { CreateCategoryDto } from '@/modules/categories-module/dto/create-category.dto';
import { SearchCategoriesDto } from '@/modules/categories-module/dto/search-categories.dto';
import { UpdateCategoryDto } from '@/modules/categories-module/dto/update-category.dto';

@UseGuards(AuthGuard, CheckIsAdminGuard)
@Controller('categories')
export class CategoriesController {
  @Inject(CreateCategoryUseCase)
  private createUseCase: CreateCategoryUseCase;

  @Inject(DeleteCategoryUseCase)
  private deleteUseCase: DeleteCategoryUseCase;

  @Inject(GetCategoryUseCase)
  private getUseCase: GetCategoryUseCase;

  @Inject(ListCategoriesUseCase)
  private listUseCase: ListCategoriesUseCase;

  @Inject(UpdateCategoryUseCase)
  private updateUseCase: UpdateCategoryUseCase;

  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    const output = await this.createUseCase.execute(createCategoryDto);
    return CategoriesController.serialize(output);
  }

  @Get()
  async search(@Query() searchParamsDto: SearchCategoriesDto) {
    const output = await this.listUseCase.execute(searchParamsDto);
    return new CategoryCollectionPresenter(output);
  }

  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string) {
    const output = await this.getUseCase.execute({ id });
    return CategoriesController.serialize(output);
  }

  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    const output = await this.updateUseCase.execute({ ...updateCategoryDto, id });
    return CategoriesController.serialize(output);
  }

  @HttpCode(204)
  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string) {
    return this.deleteUseCase.execute({ id });
  }

  static serialize(output: CategoryOutput) {
    return new CategoryPresenter(output);
  }
}
