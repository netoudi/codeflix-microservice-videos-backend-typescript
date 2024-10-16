import { Transform, Type } from 'class-transformer';
import {
  VideoCastMemberOutput,
  VideoCategoryOutput,
  VideoGenreOutput,
  VideoOutput,
} from '@/core/video/application/use-cases/common/video-output.mapper';
import { ListVideosOutput } from '@/core/video/application/use-cases/list-video/list-videos.use-case';
import { CollectionPresenter } from '@/modules/shared-module/collection.presenter';

export class VideoCategoryPresenter {
  id: string;
  name: string;
  @Transform(({ value }: { value: Date }) => value.toISOString())
  created_at: Date;

  constructor(output: VideoCategoryOutput) {
    this.id = output.id;
    this.name = output.name;
    this.created_at = output.created_at;
  }
}

export class VideoGenrePresenter {
  id: string;
  name: string;
  @Transform(({ value }: { value: Date }) => value.toISOString())
  created_at: Date;

  constructor(output: VideoGenreOutput) {
    this.id = output.id;
    this.name = output.name;
    this.created_at = output.created_at;
  }
}

export class VideoCastMemberPresenter {
  id: string;
  name: string;
  @Transform(({ value }: { value: Date }) => value.toISOString())
  created_at: Date;

  constructor(output: VideoCastMemberOutput) {
    this.id = output.id;
    this.name = output.name;
    this.created_at = output.created_at;
  }
}

export class VideoPresenter {
  id: string;
  title: string;
  description: string;
  year_launched: number;
  duration: number;
  rating: string;
  is_opened: boolean;
  is_published: boolean;

  @Type(() => VideoCategoryPresenter)
  categories: VideoCategoryPresenter[];
  categories_id: string[];

  @Type(() => VideoGenrePresenter)
  genres: VideoGenrePresenter[];
  genres_id: string[];

  @Type(() => VideoCastMemberPresenter)
  cast_members: VideoCastMemberPresenter[];
  cast_members_id: string[];

  @Transform(({ value }: { value: Date }) => value.toISOString())
  created_at: Date;

  constructor(output: VideoOutput) {
    this.id = output.id;
    this.title = output.title;
    this.description = output.description;
    this.year_launched = output.year_launched;
    this.duration = output.duration;
    this.rating = output.rating;
    this.is_opened = output.is_opened;
    this.is_published = output.is_published;

    this.categories = output.categories.map((item) => new VideoCategoryPresenter(item));
    this.categories_id = output.categories_id;

    this.genres = output.genres.map((item) => new VideoGenrePresenter(item));
    this.genres_id = output.genres_id;

    this.cast_members = output.cast_members.map((item) => new VideoGenrePresenter(item));
    this.cast_members_id = output.cast_members_id;

    this.created_at = output.created_at;
  }
}

export class VideoCollectionPresenter extends CollectionPresenter {
  @Type(() => VideoPresenter)
  data: VideoPresenter[];

  constructor(output: ListVideosOutput) {
    const { items, ...paginationProps } = output;
    super(paginationProps);
    this.data = items.map((item) => new VideoPresenter(item));
  }
}
