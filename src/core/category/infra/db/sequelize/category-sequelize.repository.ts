import { literal, Op } from 'sequelize';
import { Category, CategoryId } from '@/core/category/domain/category.entity';
import {
  CategorySearchParams,
  CategorySearchResult,
  ICategoryRepository,
} from '@/core/category/domain/category.repository';
import { CategoryModelMapper } from '@/core/category/infra/db/sequelize/category-model.mapper';
import { CategoryModel } from '@/core/category/infra/db/sequelize/category.model';
import { NotFoundError } from '@/core/shared/domain/errors/not-found';
import { SortDirection } from '@/core/shared/domain/repository/search-params';

export class CategorySequelizeRepository implements ICategoryRepository {
  sortableFields: string[] = ['name', 'created_at'];
  orderBy = { mysql: { name: (sort_dir: SortDirection) => literal(`binary name ${sort_dir}`) } };

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

  async delete(entityId: CategoryId): Promise<void> {
    const model = await this.categoryModel.findByPk(entityId.value);
    if (!model) {
      throw new NotFoundError(entityId, this.getEntity());
    }
    await this.categoryModel.destroy({ where: { id: entityId.value } });
  }

  async findById(entityId: CategoryId): Promise<Category | null> {
    const model = await this.categoryModel.findByPk(entityId.value);
    return model ? CategoryModelMapper.toEntity(model) : null;
  }

  async findAll(): Promise<Category[]> {
    const models = await this.categoryModel.findAll();
    return CategoryModelMapper.toEntities(models);
  }

  async search(props: CategorySearchParams): Promise<CategorySearchResult> {
    const offset = (props.page - 1) * props.per_page;
    const limit = props.per_page;
    const { rows: models, count } = await this.categoryModel.findAndCountAll({
      ...(props.filter && { where: { name: { [Op.like]: `%${props.filter}%` } } }),
      ...(props.sort && this.sortableFields.includes(props.sort)
        ? { order: this.formatSort(props.sort, props.sort_dir!) }
        : { order: [['created_at', 'desc']] }),
      offset,
      limit,
    });
    return new CategorySearchResult({
      items: CategoryModelMapper.toEntities(models),
      current_page: props.page,
      per_page: props.per_page,
      total: count,
    });
  }

  private formatSort(sort: string, sort_dir: SortDirection) {
    const dialect = this.categoryModel.sequelize!.getDialect() as 'msyql';
    if (this.orderBy[dialect] && this.orderBy[dialect][sort]) {
      // mysql searching by ascii
      return this.orderBy[dialect][sort](sort_dir);
    }
    return [[sort, sort_dir]];
  }

  getEntity(): new (...args: any[]) => Category {
    return Category;
  }
}
