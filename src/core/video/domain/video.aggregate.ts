import { CastMemberId } from '@/core/cast-member/domain/cast-member.entity';
import { CategoryId } from '@/core/category/domain/category.entity';
import { GenreId } from '@/core/genre/domain/genre.aggregate';
import { AggregateRoot } from '@/core/shared/domain/aggregate-root';
import { ValueObject } from '@/core/shared/domain/value-object';
import { Uuid } from '@/core/shared/domain/value-objects/uuid.vo';
import { Banner } from '@/core/video/domain/banner.vo';
import { Rating } from '@/core/video/domain/rating.vo';
import { ThumbnailHalf } from '@/core/video/domain/thumbnail-half.vo';
import { Thumbnail } from '@/core/video/domain/thumbnail.vo';

export type VideoConstructor = {
  id?: VideoId;
  title: string;
  description: string;
  year_launched: number;
  duration: number;
  rating: Rating;
  is_opened: boolean;
  is_published: boolean;

  banner?: Banner;
  thumbnail?: Thumbnail;
  thumbnail_half?: ThumbnailHalf;

  categories_id: Map<string, CategoryId>;
  genres_id: Map<string, GenreId>;
  cast_members_id: Map<string, CastMemberId>;

  created_at?: Date;
};

export type VideoCreateCommand = {
  title: string;
  description: string;
  year_launched: number;
  duration: number;
  rating: Rating;
  is_opened: boolean;

  banner?: Banner;
  thumbnail?: Thumbnail;
  thumbnail_half?: ThumbnailHalf;

  categories_id: CategoryId[];
  genres_id: GenreId[];
  cast_members_id: CastMemberId[];
};

export class VideoId extends Uuid {}

export class Video extends AggregateRoot {
  id: VideoId;
  title: string;
  description: string;
  year_launched: number;
  duration: number;
  rating: Rating;
  is_opened: boolean;
  is_published: boolean;

  banner: Banner | null;
  thumbnail: Thumbnail | null;
  thumbnail_half: ThumbnailHalf | null;

  categories_id: Map<string, CategoryId>;
  genres_id: Map<string, GenreId>;
  cast_members_id: Map<string, CastMemberId>;

  created_at?: Date;

  constructor(props: VideoConstructor) {
    super();
    this.id = props.id ?? new VideoId();
    this.title = props.title;
    this.description = props.description;
    this.year_launched = props.year_launched;
    this.duration = props.duration;
    this.rating = props.rating;
    this.is_opened = props.is_opened;
    this.is_published = props.is_published;

    this.banner = props.banner ?? null;
    this.thumbnail = props.thumbnail ?? null;
    this.thumbnail_half = props.thumbnail_half ?? null;

    this.categories_id = props.categories_id;
    this.genres_id = props.genres_id;
    this.cast_members_id = props.cast_members_id;

    this.created_at = props.created_at ?? new Date();
  }

  get entityId(): ValueObject {
    return this.id;
  }

  static create(props: VideoCreateCommand): Video {
    const video = new Video({
      ...props,
      categories_id: new Map(props.categories_id.map((id) => [id.value, id])),
      genres_id: new Map(props.genres_id.map((id) => [id.value, id])),
      cast_members_id: new Map(props.cast_members_id.map((id) => [id.value, id])),
      is_published: false,
    });
    return video;
  }

  changeTitle(title: string): void {
    this.title = title;
  }

  changeDescription(description: string): void {
    this.description = description;
  }

  changeYearLaunched(yearLaunched: number): void {
    this.year_launched = yearLaunched;
  }

  changeDuration(duration: number): void {
    this.duration = duration;
  }

  markAsOpened(): void {
    this.is_opened = true;
  }

  markAsNotOpened(): void {
    this.is_opened = false;
  }

  addCategoryId(categoryId: CategoryId): void {
    this.categories_id.set(categoryId.value, categoryId);
  }

  removeCategoryId(categoryId: CategoryId): void {
    this.categories_id.delete(categoryId.value);
  }

  syncCategoriesId(categoriesId: CategoryId[]): void {
    if (!categoriesId.length) return;
    this.categories_id = new Map(categoriesId.map((id) => [id.value, id]));
  }

  addGenreId(genreId: GenreId): void {
    this.genres_id.set(genreId.value, genreId);
  }

  removeGenreId(genreId: GenreId): void {
    this.genres_id.delete(genreId.value);
  }

  syncGenresId(genresId: GenreId[]): void {
    if (!genresId.length) return;
    this.genres_id = new Map(genresId.map((id) => [id.value, id]));
  }

  addCastMemberId(castMemberId: CastMemberId): void {
    this.cast_members_id.set(castMemberId.value, castMemberId);
  }

  removeCastMemberId(castMemberId: CastMemberId): void {
    this.cast_members_id.delete(castMemberId.value);
  }

  syncCastMemberId(castMembersId: CastMemberId[]): void {
    if (!castMembersId.length) return;
    this.cast_members_id = new Map(castMembersId.map((id) => [id.value, id]));
  }

  toJSON() {
    return {
      id: this.id.value,
      title: this.title,
      description: this.description,
      year_launched: this.year_launched,
      duration: this.duration,
      rating: this.rating.value,
      is_opened: this.is_opened,
      is_published: this.is_published,
      banner: this.banner ? this.banner.toJSON() : null,
      thumbnail: this.thumbnail ? this.thumbnail.toJSON() : null,
      thumbnail_half: this.thumbnail_half ? this.thumbnail_half.toJSON() : null,
      categories_id: Array.from(this.categories_id.values()).map((category_id) => category_id.value),
      genres_id: Array.from(this.genres_id.values()).map((category_id) => category_id.value),
      cast_members_id: Array.from(this.cast_members_id.values()).map((category_id) => category_id.value),
      created_at: this.created_at,
    };
  }
}
