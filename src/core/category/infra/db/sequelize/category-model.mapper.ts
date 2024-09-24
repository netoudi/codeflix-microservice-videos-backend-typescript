import { Category, CategoryId } from '@/core/category/domain/category.entity';
import { CategoryModel } from '@/core/category/infra/db/sequelize/category.model';
import { EntityValidationError } from '@/core/shared/domain/validators/entity-validation.error';

export class CategoryModelMapper {
  static toModel(entity: Category): CategoryModel {
    return CategoryModel.build({
      id: entity.id.value,
      name: entity.name,
      description: entity.description,
      is_active: entity.is_active,
      created_at: entity.created_at,
    });
  }

  static toEntity(model: CategoryModel): Category {
    const category = new Category({
      id: new CategoryId(model.id),
      name: model.name,
      description: model.description,
      is_active: model.is_active,
      created_at: model.created_at,
    });
    category.validate();
    if (category.notification.hasErrors()) {
      throw new EntityValidationError(category.notification.toJSON());
    }
    return category;
  }

  static toModels(entities: Category[]): CategoryModel[] {
    return entities.map((entity) => this.toModel(entity));
  }

  static toEntities(models: CategoryModel[]): Category[] {
    return models.map((model) => this.toEntity(model));
  }
}
