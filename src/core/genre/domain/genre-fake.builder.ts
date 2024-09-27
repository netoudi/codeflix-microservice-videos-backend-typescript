import { Chance } from 'chance';
import { CategoryId } from '@/core/category/domain/category.entity';
import { Genre, GenreId } from '@/core/genre/domain/genre.aggregate';

type PropOrFactory<T> = T | ((index: number) => T);

export class GenreFakeBuilder<TBuild = any> {
  // auto generated in entity
  private _genre_id: PropOrFactory<GenreId> | undefined = undefined;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private _name: PropOrFactory<string> = (_index) => this.chance.word();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private _categories_id: PropOrFactory<CategoryId>[] = [];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private _is_active: PropOrFactory<boolean> = (_index) => true;
  // auto generated in entity
  private _created_at: PropOrFactory<Date> | undefined = undefined;

  private countObjs;

  static aGenre() {
    return new GenreFakeBuilder<Genre>();
  }

  static theGenres(countObjs: number) {
    return new GenreFakeBuilder<Genre[]>(countObjs);
  }

  private chance: Chance.Chance;

  private constructor(countObjs: number = 1) {
    this.countObjs = countObjs;
    this.chance = Chance();
  }

  withGenreId(valueOrFactory: PropOrFactory<GenreId>) {
    this._genre_id = valueOrFactory;
    return this;
  }

  withName(valueOrFactory: PropOrFactory<string>) {
    this._name = valueOrFactory;
    return this;
  }

  addCategoryId(valueOrFactory: PropOrFactory<CategoryId>) {
    this._categories_id.push(valueOrFactory);
    return this;
  }

  activate() {
    this._is_active = true;
    return this;
  }

  deactivate() {
    this._is_active = false;
    return this;
  }

  withCreatedAt(valueOrFactory: PropOrFactory<Date>) {
    this._created_at = valueOrFactory;
    return this;
  }

  withInvalidNameTooLong(value?: string) {
    this._name = value ?? this.chance.word({ length: 256 });
    return this;
  }

  build(): TBuild {
    const genres = new Array(this.countObjs).fill(undefined).map((_, index) => {
      const categoriesId = this._categories_id.length
        ? this.callFactory(this._categories_id, index)
        : this.categories_id;
      const genre = new Genre({
        id: !this._genre_id ? undefined : this.callFactory(this._genre_id, index),
        name: this.callFactory(this._name, index),
        categories_id: new Map(categoriesId.map((id) => [id.value, id])),
        is_active: this.callFactory(this._is_active, index),
        ...(this._created_at && {
          created_at: this.callFactory(this._created_at, index),
        }),
      });
      genre.validate();
      return genre;
    });
    return this.countObjs === 1 ? (genres[0] as any) : genres;
  }

  get genre_id() {
    return this.getValue('genre_id');
  }

  get name() {
    return this.getValue('name');
  }

  get categories_id(): CategoryId[] {
    let categories_id = this.getValue('categories_id');
    if (!categories_id.length) {
      categories_id = [new CategoryId()];
    }
    return categories_id;
  }

  get is_active() {
    return this.getValue('is_active');
  }

  get created_at() {
    return this.getValue('created_at');
  }

  private getValue(prop: any) {
    const optional = ['genre_id', 'created_at'];
    const privateProp = `_${prop}` as keyof this;
    if (!this[privateProp] && optional.includes(prop)) {
      throw new Error(`Property ${prop} not have a factory, use 'with' methods`);
    }
    return this.callFactory(this[privateProp], 0);
  }

  private callFactory(factoryOrValue: PropOrFactory<any>, index: number) {
    return typeof factoryOrValue === 'function' ? factoryOrValue(index) : factoryOrValue;
  }
}
