import { Op } from 'sequelize';
import { Category } from '@/category/domain/category.entity';
import { CategorySearchParams, CategorySearchResult, ICategoryRepository } from '@/category/domain/category.repository';
import { CategoryModelMapper } from '@/category/infra/db/sequelize/category-model.mapper';
import { CategoryModel } from '@/category/infra/db/sequelize/category.model';
import { NotFoundError } from '@/shared/domain/errors/not-found';
import { Uuid } from '@/shared/domain/value-objects/uuid.vo';

export class CategorySequelizeRepository implements ICategoryRepository {
  sortableFields: string[] = ['name', 'createdAt'];

  constructor(private categoryModel: typeof CategoryModel) {}

  async insert(entity: Category): Promise<void> {
    const model = CategoryModelMapper.toModel(entity);
    await this.categoryModel.create(model.toJSON());
  }

  async bulkInsert(entities: Category[]): Promise<void> {
    const models = CategoryModelMapper.toModels(entities);
    await this.categoryModel.bulkCreate(models.map((model) => model.toJSON()));
  }

  async update(entity: Category): Promise<void> {
    const model = await this.categoryModel.findByPk(entity.id.value);
    if (!model) {
      throw new NotFoundError(entity.id, this.getEntity());
    }
    const modelToUpdate = CategoryModelMapper.toModel(entity);
    await this.categoryModel.update(modelToUpdate.toJSON(), { where: { id: entity.id.value } });
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
    return model ? CategoryModelMapper.toEntity(model) : null;
  }

  async findAll(): Promise<Category[]> {
    const models = await this.categoryModel.findAll();
    return CategoryModelMapper.toEntities(models);
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
      items: CategoryModelMapper.toEntities(models),
      currentPage: props.page,
      perPage: props.perPage,
      total: count,
    });
  }

  getEntity(): new (...args: any[]) => Category {
    return Category;
  }
}
