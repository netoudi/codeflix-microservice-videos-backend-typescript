import { literal, Op } from 'sequelize';
import { Genre, GenreId } from '@/core/genre/domain/genre.aggregate';
import { GenreSearchParams, GenreSearchResult, IGenreRepository } from '@/core/genre/domain/genre.repository';
import { GenreModelMapper } from '@/core/genre/infra/db/sequelize/genre-model.mapper';
import { GenreModel } from '@/core/genre/infra/db/sequelize/genre.model';
import { InvalidArgumentError } from '@/core/shared/domain/errors/invalid-argument.error';
import { NotFoundError } from '@/core/shared/domain/errors/not-found';
import { SortDirection } from '@/core/shared/domain/repository/search-params';

export class GenreSequelizeRepository implements IGenreRepository {
  sortableFields: string[] = ['name', 'created_at'];
  orderBy = { mysql: { name: (sort_dir: SortDirection) => `binary ${this.genreModel.name}.name ${sort_dir}` } };

  constructor(private genreModel: typeof GenreModel) {}

  async insert(entity: Genre): Promise<void> {
    await this.genreModel.create(GenreModelMapper.toModel(entity).toJSON(), {
      include: ['categories_id'],
    });
  }

  async bulkInsert(entities: Genre[]): Promise<void> {
    const models = GenreModelMapper.toModels(entities).map((model) => model.toJSON());
    await this.genreModel.bulkCreate(models, {
      include: ['categories_id'],
    });
  }

  async findById(id: GenreId): Promise<Genre | null> {
    const model = await this._get(id.value);
    return model ? GenreModelMapper.toEntity(model) : null;
  }

  async findAll(): Promise<Genre[]> {
    const models = await this.genreModel.findAll({
      include: ['categories_id'],
    });
    return GenreModelMapper.toEntities(models);
  }

  async findByIds(ids: GenreId[]): Promise<Genre[]> {
    const models = await this.genreModel.findAll({
      where: {
        id: {
          [Op.in]: ids.map((id) => id.value),
        },
      },
      include: ['categories_id'],
    });
    return GenreModelMapper.toEntities(models);
  }

  async existsById(ids: GenreId[]): Promise<{ exists: GenreId[]; not_exists: GenreId[] }> {
    if (!ids.length) {
      throw new InvalidArgumentError('ids must be an array with at least one element');
    }

    const existsGenreModels = await this.genreModel.findAll({
      attributes: ['genre_id'],
      where: {
        id: {
          [Op.in]: ids.map((id) => id.value),
        },
      },
    });
    const existsGenreIds = existsGenreModels.map((m) => new GenreId(m.id));
    const notExistsGenreIds = ids.filter((id) => !existsGenreIds.some((e) => e.equals(id)));
    return {
      exists: existsGenreIds,
      not_exists: notExistsGenreIds,
    };
  }

  async update(aggregate: Genre): Promise<void> {
    const model = await this._get(aggregate.id.value);

    if (!model) {
      throw new NotFoundError(aggregate.id.value, this.getEntity());
    }

    await model.$remove(
      'categories',
      model.categories_id.map((c) => c.category_id),
    );
    const { categories_id, ...props } = GenreModelMapper.toModel(aggregate).toJSON();
    await this.genreModel.update(props, {
      where: { id: aggregate.id.value },
    });
    await model.$add(
      'categories',
      categories_id!.map((c) => c.category_id),
    );
  }

  async delete(id: GenreId): Promise<void> {
    const genreCategoryRelation = this.genreModel.associations.categories_id.target;
    await genreCategoryRelation.destroy({
      where: { genre_id: id.value },
    });
    const affectedRows = await this.genreModel.destroy({
      where: { id: id.value },
    });

    if (affectedRows !== 1) {
      throw new NotFoundError(id.value, this.getEntity());
    }
  }

  private async _get(id: string): Promise<GenreModel | null> {
    return this.genreModel.findByPk(id, {
      include: ['categories_id'],
    });
  }

  async search(props: GenreSearchParams): Promise<GenreSearchResult> {
    const offset = (props.page - 1) * props.per_page;
    const limit = props.per_page;
    const genreCategoryRelation = this.genreModel.associations.categories_id.target;
    const genreTableName = this.genreModel.getTableName();
    const genreCategoryTableName = genreCategoryRelation.getTableName();
    const genreAlias = this.genreModel.name;

    const wheres: any[] = [];

    if (props.filter && (props.filter.name || props.filter.categories_id)) {
      if (props.filter.name) {
        wheres.push({
          field: 'name',
          value: `%${props.filter.name}%`,
          get condition() {
            return {
              [this.field]: {
                [Op.like]: this.value,
              },
            };
          },
          rawCondition: `${genreAlias}.name LIKE :name`,
        });
      }

      if (props.filter.categories_id) {
        wheres.push({
          field: 'categories_id',
          value: props.filter.categories_id.map((c) => c.value),
          get condition() {
            return {
              ['$categories_id.category_id$']: {
                [Op.in]: this.value,
              },
            };
          },
          rawCondition: `${genreCategoryTableName}.category_id IN (:categories_id)`,
        });
      }
    }

    const orderBy =
      props.sort && this.sortableFields.includes(props.sort)
        ? this.formatSort(props.sort, props.sort_dir!)
        : `${genreAlias}.\`created_at\` DESC`;

    //@ts-expect-error  - count is a number
    const count: number = await this.genreModel.count({
      distinct: true,
      //@ts-expect-error - add include only if categories_id is defined
      include: [props.filter?.categories_id && 'categories_id'].filter((i) => i),
      where: wheres.length ? { [Op.and]: wheres.map((w) => w.condition) } : {},
    });

    const columnOrder = orderBy.replace('binary', '').trim().split(' ')[0];

    const query = [
      'SELECT',
      `DISTINCT ${genreAlias}.\`id\`,${columnOrder} FROM ${genreTableName} as ${genreAlias}`,
      props.filter?.categories_id
        ? `INNER JOIN ${genreCategoryTableName} ON ${genreAlias}.\`id\` = ${genreCategoryTableName}.\`genre_id\``
        : '',
      wheres.length ? `WHERE ${wheres.map((w) => w.rawCondition).join(' AND ')}` : '',
      `ORDER BY ${orderBy}`,
      `LIMIT ${limit}`,
      `OFFSET ${offset}`,
    ];

    const [idsResult] = await this.genreModel.sequelize!.query(query.join(' '), {
      replacements: wheres.reduce((acc, w) => ({ ...acc, [w.field]: w.value }), {}),
    });

    const models = await this.genreModel.findAll({
      where: {
        id: {
          [Op.in]: idsResult.map((id: { id: string }) => id.id) as string[],
        },
      },
      include: ['categories_id'],
      order: literal(orderBy),
    });

    return new GenreSearchResult({
      items: GenreModelMapper.toEntities(models),
      current_page: props.page,
      per_page: props.per_page,
      total: count,
    });
  }

  private formatSort(sort: string, sort_dir: SortDirection) {
    const dialect = this.genreModel.sequelize!.getDialect();
    if (this.orderBy[dialect] && this.orderBy[dialect][sort]) {
      return this.orderBy[dialect][sort](sort_dir);
    }
    return `${this.genreModel.name}.\`${sort}\` ${sort_dir}`;
  }

  getEntity(): new (...args: any[]) => Genre {
    return Genre;
  }
}
