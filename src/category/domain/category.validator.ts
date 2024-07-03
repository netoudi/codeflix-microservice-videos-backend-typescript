import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { Category } from '@/category/domain/category.entity';
import { ClassValidatorFields } from '@/shared/domain/validators/class-validator-fields';

export class CategoryRules {
  @MaxLength(255)
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description: string | null;

  @IsBoolean()
  isActive: boolean;

  constructor({ name, description, isActive }: Category) {
    Object.assign(this, { name, description, isActive });
  }
}

export class CategoryValidator extends ClassValidatorFields<CategoryRules> {
  validate(entity: Category): boolean {
    return super.validate(new CategoryRules(entity));
  }
}

export class CategoryValidatorFactory {
  static create(): CategoryValidator {
    return new CategoryValidator();
  }
}
