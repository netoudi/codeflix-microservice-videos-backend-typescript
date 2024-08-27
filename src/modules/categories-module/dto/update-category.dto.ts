import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from 'src/modules/categories-module/dto/create-category.dto';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
