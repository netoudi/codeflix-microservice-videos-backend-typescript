import { CastMember, CastMemberType } from '@/core/cast-member/domain/cast-member.entity';
import { CastMemberFilter, ICastMemberRepository } from '@/core/cast-member/domain/cast-member.repository';
import { SortDirection } from '@/core/shared/domain/repository/search-params';
import { Uuid } from '@/core/shared/domain/value-objects/uuid.vo';
import { InMemorySearchableRepository } from '@/core/shared/infra/db/in-memory/in-memory.repository';

export class CastMemberInMemoryRepository
  extends InMemorySearchableRepository<CastMember, Uuid, CastMemberFilter>
  implements ICastMemberRepository
{
  sortableFields: string[] = ['name', 'created_at'];

  protected async applyFilter(items: CastMember[], filter: CastMemberFilter | null): Promise<CastMember[]> {
    if (!filter) return items;
    return items.filter((i) => {
      if (
        filter.name !== undefined &&
        (filter.type === CastMemberType.ACTOR || filter.type === CastMemberType.DIRECTOR)
      )
        return i.name.toLowerCase().includes(filter.name.toLowerCase()) && i.type === filter.type;
      if (filter.name) return i.name.toLowerCase().includes(filter.name.toLowerCase());
      if (filter.type) return i.type === filter.type;
    });
  }

  protected applySort(items: CastMember[], sort: string | null, sort_dir: SortDirection | null): CastMember[] {
    return sort ? super.applySort(items, sort, sort_dir) : super.applySort(items, 'created_at', 'desc');
  }

  getEntity(): new (...args: any[]) => CastMember {
    return CastMember;
  }
}
