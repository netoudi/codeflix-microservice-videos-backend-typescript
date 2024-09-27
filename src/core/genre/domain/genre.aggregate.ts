import { CategoryId } from '@/core/category/domain/category.entity';
import { GenreFakeBuilder } from '@/core/genre/domain/genre-fake.builder';
import { GenreValidatorFactory } from '@/core/genre/domain/genre.validator';
import { AggregateRoot } from '@/core/shared/domain/aggregate-root';
import { ValueObject } from '@/core/shared/domain/value-object';
import { Uuid } from '@/core/shared/domain/value-objects/uuid.vo';

export type GenreConstructor = {
  id?: GenreId;
  name: string;
  categories_id: Map<string, CategoryId>;
  is_active?: boolean;
  created_at?: Date;
};

export type GenreCreateCommand = {
  name: string;
  categories_id: CategoryId[];
  is_active?: boolean;
  created_at?: Date;
};

export class GenreId extends Uuid {}

export class Genre extends AggregateRoot {
  id: GenreId;
  name: string;
  categories_id: Map<string, CategoryId>;
  is_active: boolean;
  created_at: Date;

  constructor(props: GenreConstructor) {
    super();
    this.id = props.id ?? new GenreId();
    this.name = props.name;
    this.categories_id = props.categories_id;
    this.is_active = props.is_active ?? true;
    this.created_at = props.created_at ?? new Date();
  }

  get entityId(): ValueObject {
    return this.id;
  }

  static create(props: GenreCreateCommand): Genre {
    const genre = new Genre({
      ...props,
      categories_id: new Map(props.categories_id.map((category_id) => [category_id.value, category_id])),
    });
    genre.validate();
    return genre;
  }

  changeName(name: string): void {
    this.name = name;
    this.validate(['name']);
  }

  addCategoryId(category_id: CategoryId) {
    this.categories_id.set(category_id.value, category_id);
  }

  removeCategoryId(category_id: CategoryId) {
    this.categories_id.delete(category_id.value);
  }

  syncCategoriesId(categories_id: CategoryId[]) {
    if (!categories_id.length) return;
    this.categories_id = new Map(categories_id.map((category_id) => [category_id.value, category_id]));
  }

  activate(): void {
    this.is_active = true;
  }

  deactivate(): void {
    this.is_active = false;
  }

  validate(fields?: string[]): boolean {
    const validator = GenreValidatorFactory.create();
    return validator.validate(this.notification, this, fields);
  }

  static fake() {
    return GenreFakeBuilder;
  }

  toJSON() {
    return {
      id: this.id.value,
      name: this.name,
      categories_id: Array.from(this.categories_id.values()).map((category_id) => category_id.value),
      is_active: this.is_active,
      created_at: this.created_at,
    };
  }
}
