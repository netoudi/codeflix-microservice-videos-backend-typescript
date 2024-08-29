import { Transform } from 'class-transformer';

export type PaginationPresenterProps = {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
};

export class PaginationPresenter {
  @Transform(({ value }) => parseInt(value))
  current_page: number;

  @Transform(({ value }) => parseInt(value))
  last_page: number;

  @Transform(({ value }) => parseInt(value))
  per_page: number;

  @Transform(({ value }) => parseInt(value))
  total: number;

  constructor(props: PaginationPresenterProps) {
    this.current_page = props.currentPage;
    this.last_page = props.lastPage;
    this.per_page = props.perPage;
    this.total = props.total;
  }
}
