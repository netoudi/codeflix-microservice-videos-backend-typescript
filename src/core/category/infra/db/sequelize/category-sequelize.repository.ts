import { Op, literal } from 'sequelize';
import { Category } from '@/core/category/domain/category.entity';
import {
  CategorySearchParams,
  CategorySearchResult,
  ICategoryRepository,
} from '@/core/category/domain/category.repository';
import { CategoryModelMapper } from '@/core/category/infra/db/sequelize/category-model.mapper';
import { CategoryModel } from '@/core/category/infra/db/sequelize/category.model';
import { NotFoundError } from '@/core/shared/domain/errors/not-found';
import { SortDirection } from '@/core/shared/domain/repository/search-params';
import { Uuid } from '@/core/shared/domain/value-objects/uuid.vo';

export class CategorySequelizeRepository implements ICategoryRepository {
  sortableFields: string[] = ['name', 'createdAt'];
  orderBy = { mysql: { name: (sortDir: SortDirection) => literal(`binary name ${sortDir}`) } };

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
        ? { order: this.formatSort(props.sort, props.sortDir) }
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

  private formatSort(sort: string, sortDir: SortDirection) {
    const dialect = this.categoryModel.sequelize.getDialect() as 'msyql';
    if (this.orderBy[dialect] && this.orderBy[dialect][sort]) {
      // mysql searching by ascii
      return this.orderBy[dialect][sort](sortDir);
    }
    return [[sort, sortDir]];
  }

  getEntity(): new (...args: any[]) => Category {
    return Category;
  }
}
