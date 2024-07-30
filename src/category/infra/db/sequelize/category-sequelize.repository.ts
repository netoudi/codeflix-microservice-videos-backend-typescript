import { Category } from '@/category/domain/category.entity';
import { ICategoryRepository } from '@/category/domain/category.repository';
import { CategoryModel } from '@/category/infra/db/sequelize/category.model';
import { Entity } from '@/shared/domain/entity';
import { SearchParams } from '@/shared/domain/repository/search-params';
import { SearchResult } from '@/shared/domain/repository/search-result';
import { Uuid } from '@/shared/domain/value-objects/uuid.vo';

export class CategorySequelizeRepository implements ICategoryRepository {
  sortableFields: string[] = ['name', 'createdAt'];

  constructor(private categoryModel: typeof CategoryModel) {}

  async insert(entity: Category): Promise<void> {
    await this.categoryModel.create({
      id: entity.id.value,
      name: entity.name,
      description: entity.description,
      is_active: entity.isActive,
      created_at: entity.createdAt,
    });
  }

  async bulkInsert(entities: Category[]): Promise<void> {
    await this.categoryModel.bulkCreate(
      entities.map((entity) => ({
        id: entity.id.value,
        name: entity.name,
        description: entity.description,
        is_active: entity.isActive,
        created_at: entity.createdAt,
      })),
    );
  }

  async update(entity: Category): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async delete(entityId: Uuid): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async findById(entityId: Uuid): Promise<Category | null> {
    const model = await this.categoryModel.findByPk(entityId.value);
    return model
      ? new Category({
          id: new Uuid(model.id),
          name: model.name,
          description: model.description,
          isActive: model.is_active,
          createdAt: model.created_at,
        })
      : null;
  }

  async findAll(): Promise<Category[]> {
    throw new Error('Method not implemented.');
  }

  async search(props: SearchParams<string>): Promise<SearchResult<Entity>> {
    throw new Error('Method not implemented.');
  }

  getEntity(): new (...args: any[]) => Category {
    return Category;
  }
}
