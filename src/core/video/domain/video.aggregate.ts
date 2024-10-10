import { CastMemberId } from '@/core/cast-member/domain/cast-member.entity';
import { CategoryId } from '@/core/category/domain/category.entity';
import { GenreId } from '@/core/genre/domain/genre.aggregate';
import { AggregateRoot } from '@/core/shared/domain/aggregate-root';
import { ValueObject } from '@/core/shared/domain/value-object';
import { AudioVideoMediaStatus } from '@/core/shared/domain/value-objects/audio-video-media.vo';
import { Uuid } from '@/core/shared/domain/value-objects/uuid.vo';
import { Banner } from '@/core/video/domain/banner.vo';
import {
  VideoAudioMediaReplacedEvent,
  VideoAudioMediaReplacedEventProps,
} from '@/core/video/domain/domain-events/video-audio-media-replaced.event';
import { VideoCreatedEvent } from '@/core/video/domain/domain-events/video-created.event';
import { Rating } from '@/core/video/domain/rating.vo';
import { ThumbnailHalf } from '@/core/video/domain/thumbnail-half.vo';
import { Thumbnail } from '@/core/video/domain/thumbnail.vo';
import { TrailerMedia } from '@/core/video/domain/trailer-media.vo';
import { VideoFakeBuilder } from '@/core/video/domain/video-fake.builder';
import { VideoMedia } from '@/core/video/domain/video-media.vo';
import { VideoValidatorFactory } from '@/core/video/domain/video.validator';

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

  trailer?: TrailerMedia;
  video?: VideoMedia;

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

  trailer?: TrailerMedia;
  video?: VideoMedia;

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

  trailer: TrailerMedia | null;
  video: VideoMedia | null;

  categories_id: Map<string, CategoryId>;
  genres_id: Map<string, GenreId>;
  cast_members_id: Map<string, CastMemberId>;

  created_at: Date;

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

    this.trailer = props.trailer ?? null;
    this.video = props.video ?? null;

    this.categories_id = props.categories_id;
    this.genres_id = props.genres_id;
    this.cast_members_id = props.cast_members_id;

    this.created_at = props.created_at ?? new Date();

    this.registerHandler(VideoCreatedEvent.name, this.onVideoCreated.bind(this));
    this.registerHandler(VideoAudioMediaReplacedEvent.name, this.onAudioVideoMediaReplaced.bind(this));
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
    video.validate(['title']);
    this.apply(
      new VideoCreatedEvent({
        video_id: video.id,
        title: video.title,
        description: video.description,
        year_launched: video.year_launched,
        duration: video.duration,
        rating: video.rating,
        is_opened: video.is_opened,
        is_published: video.is_published,
        banner: video.banner,
        thumbnail: video.thumbnail,
        thumbnail_half: video.thumbnail_half,
        trailer: video.trailer,
        video: video.video,
        categories_id: Array.from(video.categories_id.values()),
        genres_id: Array.from(video.genres_id.values()),
        cast_members_id: Array.from(video.cast_members_id.values()),
        created_at: video.created_at,
      }),
    );
    return video;
  }

  changeTitle(title: string): void {
    this.title = title;
    this.validate(['title']);
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

  changeRating(rating: Rating): void {
    this.rating = rating;
  }

  markAsOpened(): void {
    this.is_opened = true;
  }

  markAsNotOpened(): void {
    this.is_opened = false;
  }

  replaceBanner(banner: Banner): void {
    this.banner = banner;
  }

  replaceThumbnail(thumbnail: Thumbnail): void {
    this.thumbnail = thumbnail;
  }

  replaceThumbnailHalf(thumbnailHalf: ThumbnailHalf): void {
    this.thumbnail_half = thumbnailHalf;
  }

  replaceTrailer(trailer: TrailerMedia): void {
    this.trailer = trailer;
    this.applyEvent(
      new VideoAudioMediaReplacedEvent({
        video_id: this.id,
        media: this.trailer,
        media_type: 'trailer',
      }),
    );
  }

  replaceVideo(video: VideoMedia): void {
    this.video = video;
    this.applyEvent(
      new VideoAudioMediaReplacedEvent({
        video_id: this.id,
        media: this.video,
        media_type: 'video',
      }),
    );
  }

  private tryMarkAsPublished() {
    if (
      this.trailer &&
      this.video &&
      this.trailer.status === AudioVideoMediaStatus.COMPLETED &&
      this.video.status === AudioVideoMediaStatus.COMPLETED
    ) {
      this.is_published = true;
    }
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onVideoCreated(event: VideoCreatedEvent) {
    if (this.is_published) return;
    this.tryMarkAsPublished();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onAudioVideoMediaReplaced(event: VideoAudioMediaReplacedEventProps) {
    if (this.is_published) return;
    this.tryMarkAsPublished();
  }

  validate(fields?: string[]): boolean {
    const validator = VideoValidatorFactory.create();
    return validator.validate(this.notification, this, fields);
  }

  static fake() {
    return VideoFakeBuilder;
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
      trailer: this.trailer ? this.trailer.toJSON() : null,
      video: this.video ? this.video.toJSON() : null,
      categories_id: Array.from(this.categories_id.values()).map((category_id) => category_id.value),
      genres_id: Array.from(this.genres_id.values()).map((category_id) => category_id.value),
      cast_members_id: Array.from(this.cast_members_id.values()).map((category_id) => category_id.value),
      created_at: this.created_at,
    };
  }
}
