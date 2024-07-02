export type CategoryConstructor = {
  id?: string;
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

  changeName(name: string): void {
    this.name = name;
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

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      is_active: this.isActive,
      created_at: this.createdAt,
    };
  }
}
