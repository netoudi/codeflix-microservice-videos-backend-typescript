import { ValueObject } from '@/core/shared/domain/value-object';

export enum AudioVideoMediaStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export type AudioVideoMediaProps = {
  name: string;
  raw_location: string;
  encoded_location?: string | null;
  status: AudioVideoMediaStatus;
};

export abstract class AudioVideoMedia extends ValueObject {
  readonly name: string;
  readonly raw_location: string;
  readonly encoded_location: string | null;
  readonly status: AudioVideoMediaStatus;

  constructor(props: AudioVideoMediaProps) {
    super();
    this.name = props.name;
    this.raw_location = props.raw_location;
    this.encoded_location = props.encoded_location ?? null;
    this.status = props.status;
  }

  get url() {
    return `${this.raw_location}/${this.name}`;
  }

  toJSON() {
    return {
      name: this.name,
      raw_location: this.raw_location,
      encoded_location: this.encoded_location,
      status: this.status,
    };
  }
}
