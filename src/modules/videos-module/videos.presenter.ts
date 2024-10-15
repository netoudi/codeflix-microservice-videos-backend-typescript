import { Transform, Type } from 'class-transformer';
import { VideoCategoryOutput, VideoOutput } from '@/core/video/application/use-cases/common/video-output.mapper';
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

export class VideoPresenter {
  id: string;
  title: string;
  categories_id: string[];
  @Type(() => VideoCategoryPresenter)
  categories: VideoCategoryPresenter[];
  is_opened: boolean;
  @Transform(({ value }: { value: Date }) => value.toISOString())
  created_at: Date;

  constructor(output: VideoOutput) {
    this.id = output.id;
    this.title = output.title;
    this.categories_id = output.categories_id;
    this.categories = output.categories.map((item) => new VideoCategoryPresenter(item));
    this.is_opened = output.is_opened;
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
