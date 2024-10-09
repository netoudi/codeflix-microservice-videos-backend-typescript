import { Either } from '@/core/shared/domain/either';
import { ValueObject } from '@/core/shared/domain/value-object';

export enum RatingValues {
  RL = 'L',
  R10 = '10',
  R12 = '12',
  R14 = '14',
  R16 = '16',
  R18 = '18',
}

export class Rating extends ValueObject {
  private constructor(readonly value: RatingValues) {
    super();
    this.validate();
  }

  private validate() {
    const isValid = Object.values(RatingValues).includes(this.value);
    if (!isValid) throw new InvalidRatingError(this.value);
  }

  static create(value: RatingValues): Either<Rating, InvalidRatingError> {
    return Either.safe(() => new Rating(value));
  }

  static createRL(): Rating {
    return new Rating(RatingValues.RL);
  }

  static createR10(): Rating {
    return new Rating(RatingValues.R10);
  }

  static createR12(): Rating {
    return new Rating(RatingValues.R12);
  }

  static createR14(): Rating {
    return new Rating(RatingValues.R14);
  }

  static createR16(): Rating {
    return new Rating(RatingValues.R16);
  }

  static createR18(): Rating {
    return new Rating(RatingValues.R18);
  }

  static with(value: RatingValues): Rating {
    return new Rating(value);
  }
}

export class InvalidRatingError extends Error {
  constructor(value: any) {
    super(
      `The rating must be one of the following values: ${Object.values(RatingValues).join(', ')}, passed value: ${value}`,
    );
  }
}
