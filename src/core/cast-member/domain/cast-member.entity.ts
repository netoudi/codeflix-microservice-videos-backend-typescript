import { CastMemberFakeBuilder } from '@/core/cast-member/domain/cast-member-fake.builder';
import { CastMemberValidatorFactory } from '@/core/cast-member/domain/cast-member.validator';
import { AggregateRoot } from '@/core/shared/domain/aggregate-root';
import { ValueObject } from '@/core/shared/domain/value-object';
import { Uuid } from '@/core/shared/domain/value-objects/uuid.vo';

export enum CastMemberType {
  DIRECTOR = 1,
  ACTOR = 2,
}

export type CastMemberConstructor = {
  id?: CastMemberId;
  name: string;
  type: CastMemberType;
  created_at?: Date;
};

export type CastMemberCreateCommand = {
  name: string;
  type: CastMemberType;
  created_at?: Date;
};

export class CastMemberId extends Uuid {}

export class CastMember extends AggregateRoot {
  id: CastMemberId;
  name: string;
  type: CastMemberType;
  created_at: Date;

  constructor(props: CastMemberConstructor) {
    super();
    this.id = props.id ?? new CastMemberId();
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
