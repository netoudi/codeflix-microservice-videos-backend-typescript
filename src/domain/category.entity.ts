export type CategoryConstructor = {
  id: string;
  name: string;
  description?: string | null;
  isActive?: boolean;
  createdAt?: Date;
};

export type CategoryCreateCommand = {
  id: string;
  name: string;
  description?: string | null;
  isActive?: boolean;
  createdAt?: Date;
};

export class Category {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;

  constructor(props: CategoryConstructor) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description ?? null;
    this.isActive = props.isActive ?? true;
    this.createdAt = props.createdAt ?? new Date();
  }

  static create(props: CategoryCreateCommand): Category {
    return new Category(props);
  }
}
