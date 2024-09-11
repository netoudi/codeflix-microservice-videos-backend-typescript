import { CastMemberFakeBuilder } from '@/core/cast-member/domain/cast-member-fake.builder';
import { CastMemberValidatorFactory } from '@/core/cast-member/domain/cast-member.validator';
import { Entity } from '@/core/shared/domain/entity';
import { ValueObject } from '@/core/shared/domain/value-object';
import { Uuid } from '@/core/shared/domain/value-objects/uuid.vo';

export enum CastMemberType {
  DIRECTOR = 1,
  ACTOR = 2,
}

export type CastMemberConstructor = {
  id?: Uuid;
  name: string;
  type: CastMemberType;
  created_at?: Date;
};

export type CastMemberCreateCommand = {
  name: string;
  type: CastMemberType;
  created_at?: Date;
};

export class CastMember extends Entity {
  id: Uuid;
  name: string;
  type: CastMemberType;
  created_at: Date;

  constructor(props: CastMemberConstructor) {
    super();
    this.id = props.id ?? new Uuid();
    this.name = props.name;
    this.type = props.type;
    this.created_at = props.created_at ?? new Date();
  }

  get entityId(): ValueObject {
    return this.id;
  }

  static create(props: CastMemberCreateCommand): CastMember {
    const castMember = new CastMember(props);
    castMember.validate(['name', 'type']);
    return castMember;
  }

  changeName(name: string): void {
    this.name = name;
    this.validate(['name']);
  }

  changeType(type: CastMemberType): void {
    this.type = type;
    this.validate(['type']);
  }

  validate(fields?: string[]): boolean {
    const validator = CastMemberValidatorFactory.create();
    return validator.validate(this.notification, this, fields);
  }

  static fake() {
    return CastMemberFakeBuilder;
  }

  toJSON() {
    return {
      id: this.id.value,
      name: this.name,
      type: this.type,
      created_at: this.created_at,
    };
  }
}
