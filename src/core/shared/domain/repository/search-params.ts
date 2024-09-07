import { ValueObject } from '@/core/shared/domain/value-object';

export type SortDirection = 'asc' | 'desc';

export type SearchParamsConstructor<Filter = string> = {
  page?: number;
  per_page?: number;
  sort?: string;
  sortDir?: SortDirection | null;
  filter?: Filter | null;
};

export class SearchParams<Filter = string> extends ValueObject {
  protected _page: number = 1;
  protected _per_page: number = 15;
  protected _sort: string | null;
  protected _sortDir: SortDirection | null;
  protected _filter: Filter | null;

  constructor(props: SearchParamsConstructor<Filter> = {}) {
    super();
    this.page = props.page;
    this.per_page = props.per_page;
    this.sort = props.sort;
    this.sortDir = props.sortDir;
    this.filter = props.filter;
  }

  get page(): number {
    return this._page;
  }

  private set page(value: number) {
    let _page = +value;
    if (Number.isNaN(_page) || _page <= 0 || parseInt(_page as any) !== _page) {
      _page = 1;
    }
    this._page = _page;
  }

  get per_page(): number {
    return this._per_page;
  }

  private set per_page(value: number) {
    let _per_page = value === (true as any) ? this._per_page : +value;
    if (Number.isNaN(_per_page) || _per_page <= 0 || parseInt(_per_page as any) !== _per_page) {
      _per_page = this._per_page;
    }
    this._per_page = _per_page;
  }

  get sort(): string | null {
    return this._sort;
  }

  private set sort(value: string | null) {
    this._sort = value === null || value === undefined || value === '' ? null : `${value}`;
  }

  get sortDir(): SortDirection | null {
    return this._sortDir;
  }

  private set sortDir(value: SortDirection | null) {
    if (!this.sort) {
      this._sortDir = null;
      return;
    }
    const dir = `${value}`.toLowerCase();
    this._sortDir = dir !== 'asc' && dir !== 'desc' ? 'asc' : dir;
  }

  get filter(): Filter | null {
    return this._filter;
  }

  protected set filter(value: Filter | null) {
    this._filter = value === null || value === undefined || (value as unknown) === '' ? null : (`${value}` as any);
  }
}
