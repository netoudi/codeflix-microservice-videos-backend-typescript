import { Transform } from 'class-transformer';
import { CastMemberOutput } from '@/core/cast-member/application/use-cases/common/cast-member-output.mapper';
import { ListCastMembersOutput } from '@/core/cast-member/application/use-cases/list-cast-member/list-cast-members.use-case';
import { CollectionPresenter } from '@/modules/shared-module/collection.presenter';

export class CastMemberPresenter {
  id: string;
  name: string;
  type: number;

  @Transform(({ value }: { value: Date }) => value.toISOString())
  created_at: Date;

  constructor(output: CastMemberOutput) {
    this.id = output.id;
    this.name = output.name;
    this.type = output.type;
    this.created_at = output.created_at;
  }
}

export class CastMemberCollectionPresenter extends CollectionPresenter {
  data: CastMemberPresenter[];

  constructor(output: ListCastMembersOutput) {
    const { items, ...paginationProps } = output;
    super(paginationProps);
    this.data = items.map((item) => new CastMemberPresenter(item));
  }
}
