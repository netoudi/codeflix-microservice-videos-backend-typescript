import { Op } from 'sequelize';
import { Category } from '@/category/domain/category.entity';
import { CategorySearchParams, CategorySearchResult, ICategoryRepository } from '@/category/domain/category.repository';
import { CategoryModel } from '@/category/infra/db/sequelize/category.model';
import { NotFoundError } from '@/shared/domain/errors/not-found';
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
    const model = await this.categoryModel.findByPk(entity.id.value);
    if (!model) {
      throw new NotFoundError(entity.id, this.getEntity());
    }
    await this.categoryModel.update(
      {
        id: entity.id.value,
        name: entity.name,
        description: entity.description,
        is_active: entity.isActive,
        created_at: entity.createdAt,
      },
      { where: { id: entity.id.value } },
    );
  }

  async delete(entityId: Uuid): Promise<void> {
    const model = await this.categoryModel.findByPk(entityId.value);
    if (!model) {
      throw new NotFoundError(entityId, this.getEntity());
    }
    await this.categoryModel.destroy({ where: { id: entityId.value } });
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
    const models = await this.categoryModel.findAll();
    return models.map((model) => {
      return new Category({
        id: new Uuid(model.id),
        name: model.name,
        description: model.description,
        isActive: model.is_active,
        createdAt: model.created_at,
      });
    });
  }

  async search(props: CategorySearchParams): Promise<CategorySearchResult> {
    const offset = (props.page - 1) * props.perPage;
    const limit = props.perPage;
    const { rows: models, count } = await this.categoryModel.findAndCountAll({
      ...(props.filter && { where: { name: { [Op.like]: `%${props.filter}%` } } }),
      ...(props.sort && this.sortableFields.includes(props.sort)
        ? { order: [[props.sort, props.sortDir]] }
        : { order: [['created_at', 'desc']] }),
      offset,
      limit,
    });
    return new CategorySearchResult({
      items: models.map((model) => {
        return new Category({
          id: new Uuid(model.id),
          name: model.name,
          description: model.description,
          isActive: model.is_active,
          createdAt: model.created_at,
        });
      }),
      currentPage: props.page,
      perPage: props.perPage,
      total: count,
    });
  }

  getEntity(): new (...args: any[]) => Category {
    return Category;
  }
}
