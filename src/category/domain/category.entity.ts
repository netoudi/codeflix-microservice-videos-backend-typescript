import { CategoryFakeBuilder } from '@/category/domain/category-fake.builder';
import { CategoryValidatorFactory } from '@/category/domain/category.validator';
import { Entity } from '@/shared/domain/entity';
import { ValueObject } from '@/shared/domain/value-object';
import { Uuid } from '@/shared/domain/value-objects/uuid.vo';

export type CategoryConstructor = {
  id?: Uuid;
  name: string;
  description?: string | null;
  isActive?: boolean;
  createdAt?: Date;
};

export type CategoryCreateCommand = {
  name: string;
  description?: string | null;
  isActive?: boolean;
  createdAt?: Date;
};

export class Category extends Entity {
  id: Uuid;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;

  constructor(props: CategoryConstructor) {
    super();
    this.id = props.id ?? new Uuid();
    this.name = props.name;
    this.description = props.description ?? null;
    this.isActive = props.isActive ?? true;
    this.createdAt = props.createdAt ?? new Date();
  }

  get entityId(): ValueObject {
    return this.id;
  }

  static create(props: CategoryCreateCommand): Category {
    const category = new Category(props);
    category.validate(['name']);
    return category;
  }

  changeName(name: string): void {
    this.name = name;
    this.validate(['name']);
  }

  changeDescription(description: string): void {
    this.description = description;
  }

  activate(): void {
    this.isActive = true;
  }

  deactivate(): void {
    this.isActive = false;
  }

  validate(fields?: string[]): boolean {
    const validator = CategoryValidatorFactory.create();
    return validator.validate(this.notification, this, fields);
  }

  static fake() {
    return CategoryFakeBuilder;
  }

  toJSON() {
    return {
      id: this.id.value,
      name: this.name,
      description: this.description,
      is_active: this.isActive,
      created_at: this.createdAt,
    };
  }
}
