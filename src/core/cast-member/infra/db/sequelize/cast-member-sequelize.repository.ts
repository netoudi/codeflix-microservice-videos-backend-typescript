import { literal, Op } from 'sequelize';
import { CastMember, CastMemberId } from '@/core/cast-member/domain/cast-member.entity';
import {
  CastMemberSearchParams,
  CastMemberSearchResult,
  ICastMemberRepository,
} from '@/core/cast-member/domain/cast-member.repository';
import { CastMemberModelMapper } from '@/core/cast-member/infra/db/sequelize/cast-member-model.mapper';
import { CastMemberModel } from '@/core/cast-member/infra/db/sequelize/cast-member.model';
import { InvalidArgumentError } from '@/core/shared/domain/errors/invalid-argument.error';
import { NotFoundError } from '@/core/shared/domain/errors/not-found';
import { SortDirection } from '@/core/shared/domain/repository/search-params';

export class CastMemberSequelizeRepository implements ICastMemberRepository {
  sortableFields: string[] = ['name', 'created_at'];
  orderBy = { mysql: { name: (sort_dir: SortDirection) => literal(`binary name ${sort_dir}`) } };

  constructor(private castMemberModel: typeof CastMemberModel) {}

  async insert(entity: CastMember): Promise<void> {
    const model = CastMemberModelMapper.toModel(entity);
    await this.castMemberModel.create(model.toJSON());
  }

  async bulkInsert(entities: CastMember[]): Promise<void> {
    const models = CastMemberModelMapper.toModels(entities);
    await this.castMemberModel.bulkCreate(models.map((model) => model.toJSON()));
  }

  async update(entity: CastMember): Promise<void> {
    const model = await this.castMemberModel.findByPk(entity.id.value);
    if (!model) {
      throw new NotFoundError(entity.id, this.getEntity());
    }
    const modelToUpdate = CastMemberModelMapper.toModel(entity);
    await this.castMemberModel.update(modelToUpdate.toJSON(), { where: { id: entity.id.value } });
  }

  async delete(entityId: CastMemberId): Promise<void> {
    const model = await this.castMemberModel.findByPk(entityId.value);
    if (!model) {
      throw new NotFoundError(entityId, this.getEntity());
    }
    await this.castMemberModel.destroy({ where: { id: entityId.value } });
  }

  async findById(entityId: CastMemberId): Promise<CastMember | null> {
    const model = await this.castMemberModel.findByPk(entityId.value);
    return model ? CastMemberModelMapper.toEntity(model) : null;
  }

  async findAll(): Promise<CastMember[]> {
    const models = await this.castMemberModel.findAll();
    return CastMemberModelMapper.toEntities(models);
  }

  async findByIds(ids: CastMemberId[]): Promise<CastMember[]> {
    const models = await this.castMemberModel.findAll({
      where: {
        id: {
          [Op.in]: ids.map((id) => id.value),
        },
      },
    });
    return CastMemberModelMapper.toEntities(models);
  }

  async existsById(ids: CastMemberId[]): Promise<{ exists: CastMemberId[]; not_exists: CastMemberId[] }> {
    if (!ids.length) {
      throw new InvalidArgumentError('ids must be an array with at least one element');
    }

    const existsCastMemberModels = await this.castMemberModel.findAll({
      attributes: ['id'],
      where: {
        id: {
          [Op.in]: ids.map((id) => id.value),
        },
      },
    });
    const existsCastMemberIds = existsCastMemberModels.map((m) => new CastMemberId(m.id));
    const notExistsCastMemberIds = ids.filter((id) => !existsCastMemberIds.some((e) => e.equals(id)));
    return {
      exists: existsCastMemberIds,
      not_exists: notExistsCastMemberIds,
    };
  }

  async search(props: CastMemberSearchParams): Promise<CastMemberSearchResult> {
    const offset = (props.page - 1) * props.per_page;
    const limit = props.per_page;
    const { rows: models, count } = await this.castMemberModel.findAndCountAll({
      ...((props.filter?.name || props.filter?.type) && {
        where: {
          ...(props.filter?.name && { name: { [Op.like]: `%${props.filter.name}%` } }),
          ...(props.filter?.type && { type: { [Op.eq]: props.filter.type } }),
        },
      }),
      ...(props.sort && this.sortableFields.includes(props.sort)
        ? { order: this.formatSort(props.sort, props.sort_dir!) }
        : { order: [['created_at', 'desc']] }),
      offset,
      limit,
    });
    return new CastMemberSearchResult({
      items: CastMemberModelMapper.toEntities(models),
      current_page: props.page,
      per_page: props.per_page,
      total: count,
    });
  }

  private formatSort(sort: string, sort_dir: SortDirection) {
    const dialect = this.castMemberModel.sequelize!.getDialect() as 'msyql';
    if (this.orderBy[dialect] && this.orderBy[dialect][sort]) {
      // mysql searching by ascii
      return this.orderBy[dialect][sort](sort_dir);
    }
    return [[sort, sort_dir]];
  }

  getEntity(): new (...args: any[]) => CastMember {
    return CastMember;
  }
}
