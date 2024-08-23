import { Category } from '@/category/domain/category.entity';
import { CategoryModel } from '@/category/infra/db/sequelize/category.model';
import { EntityValidationError } from '@/shared/domain/validators/entity-validation.error';
import { Uuid } from '@/shared/domain/value-objects/uuid.vo';

export class CategoryModelMapper {
  static toModel(entity: Category): CategoryModel {
    return CategoryModel.build({
      id: entity.id.value,
      name: entity.name,
      description: entity.description,
      is_active: entity.isActive,
      created_at: entity.createdAt,
    });
  }

  static toEntity(model: CategoryModel): Category {
    const category = new Category({
      id: new Uuid(model.id),
      name: model.name,
      description: model.description,
      isActive: model.is_active,
      createdAt: model.created_at,
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
