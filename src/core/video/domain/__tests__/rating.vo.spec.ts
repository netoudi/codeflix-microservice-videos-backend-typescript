import { Rating, RatingValues, InvalidRatingError } from '@/core/video/domain/rating.vo';

describe('Rating Value Object', () => {
  it('should create a valid Rating', () => {
    const rating = Rating.with(RatingValues.R10);
    expect(rating.value).toBe(RatingValues.R10);
  });

  it('should fail to create a Rating with invalid value', () => {
    expect(() => Rating.with('invalid' as any)).toThrow(InvalidRatingError);
    const [, error] = Rating.create('invalid' as any).asArray();
    expect(error).toBeInstanceOf(InvalidRatingError);
  });

  it('should create a Rating with RL value', () => {
    const rating = Rating.createRL();
    expect(rating.value).toBe(RatingValues.RL);
  });

  it('should create a Rating with R10 value', () => {
    const rating = Rating.createR10();
    expect(rating.value).toBe(RatingValues.R10);
  });

  it('should create a Rating with R12 value', () => {
    const rating = Rating.createR12();
    expect(rating.value).toBe(RatingValues.R12);
  });

  it('should create a Rating with R14 value', () => {
    const rating = Rating.createR14();
    expect(rating.value).toBe(RatingValues.R14);
  });

  it('should create a Rating with R16 value', () => {
    const rating = Rating.createR16();
    expect(rating.value).toBe(RatingValues.R16);
  });

  it('should create a Rating with R18 value', () => {
    const rating = Rating.createR18();
    expect(rating.value).toBe(RatingValues.R18);
  });
});
