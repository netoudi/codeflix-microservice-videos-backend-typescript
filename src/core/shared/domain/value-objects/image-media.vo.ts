import { ValueObject } from '@/core/shared/domain/value-object';

export type ImageMediaProps = {
  name: string;
  location: string;
};

export abstract class ImageMedia extends ValueObject {
  readonly name: string;
  readonly location: string;

  constructor(props: ImageMediaProps) {
    super();
    this.name = props.name;
    this.location = props.location;
  }

  get url() {
    return `${this.location}/${this.name}`;
  }

  toJSON() {
    return {
      name: this.name,
      location: this.location,
    };
  }
}
