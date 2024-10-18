import { SortDirection } from '@/core/shared/domain/repository/search-params';
import { VideoOutput } from '@/core/video/application/use-cases/common/video-output.mapper';
import { GetVideoOutput } from '@/core/video/application/use-cases/get-video/get-video.use-case';
import { ListVideosOutput } from '@/core/video/application/use-cases/list-video/list-videos.use-case';
import { RatingValues } from '@/core/video/domain/rating.vo';
import { CreateVideoDto } from '@/modules/videos-module/dto/create-video.dto';
import { UpdateVideoDto } from '@/modules/videos-module/dto/update-video.dto';
import { VideosController } from '@/modules/videos-module/videos.controller';
import { VideoCollectionPresenter, VideoPresenter } from '@/modules/videos-module/videos.presenter';

class VideoOutputFactory {
  static create(): VideoOutput {
    return {
      id: '9366b7dc-2d71-4799-b91c-c64adb205104',
      title: 'Full Cycle',
      description: 'A saga que nunca acaba...',
      year_launched: 2020,
      duration: 120,
      rating: '18',
      is_opened: true,
      is_published: false,
      categories: [
        {
          id: '8d0b0c9e-9b1a-4e8a-9e1a-3b2c1d7c6b5a',
          name: 'category',
          created_at: new Date(),
        },
      ],
      categories_id: ['8d0b0c9e-9b1a-4e8a-9e1a-3b2c1d7c6b5a'],
      genres: [
        {
          id: 'f31ecdc3-91d2-46b7-b613-87722c81f17b',
          name: 'genre',
          created_at: new Date(),
        },
      ],
      genres_id: ['f31ecdc3-91d2-46b7-b613-87722c81f17b'],
      cast_members: [
        {
          id: '67ea1d8b-2fd5-4274-b398-e5ef637d1ef7',
          name: 'cast member',
          created_at: new Date(),
        },
      ],
      cast_members_id: ['67ea1d8b-2fd5-4274-b398-e5ef637d1ef7'],
      created_at: new Date(),
    };
  }
}

describe('VideosController Unit Tests', () => {
  let controller: VideosController;

  beforeEach(async () => {
    controller = new VideosController();
  });

  it('should create a video', async () => {
    const mockCreateUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve({ id: '9366b7dc-2d71-4799-b91c-c64adb205104' })),
    };
    //@ts-expect-error defined part of methods
    controller['createUseCase'] = mockCreateUseCase;
    const output: GetVideoOutput = VideoOutputFactory.create();
    //@ts-expect-error defined part of methods
    controller['getUseCase'] = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };
    const input: CreateVideoDto = {
      title: 'test',
      description: 'test description',
      year_launched: 1998,
      duration: 99,
      rating: RatingValues.R18,
      is_opened: false,
      categories_id: ['8d0b0c9e-9b1a-4e8a-9e1a-3b2c1d7c6b5a'],
      genres_id: ['8d0b0c9e-9b1a-4e8a-9e1a-3b2c1d7c6b5a'],
      cast_members_id: ['8d0b0c9e-9b1a-4e8a-9e1a-3b2c1d7c6b5a'],
    };
    const presenter = await controller.create(input);
    expect(mockCreateUseCase.execute).toHaveBeenCalledWith(input);
    expect(presenter).toBeInstanceOf(VideoPresenter);
    expect(presenter).toStrictEqual(new VideoPresenter(output));
  });

  it('should update a video', async () => {
    const id = '9366b7dc-2d71-4799-b91c-c64adb205104';
    const mockUpdateUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve()),
    };
    //@ts-expect-error defined part of methods
    controller['updateUseCase'] = mockUpdateUseCase;
    const output: GetVideoOutput = VideoOutputFactory.create();
    //@ts-expect-error defined part of methods
    controller['getUseCase'] = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };
    const input: UpdateVideoDto = {
      title: 'action',
      categories_id: ['8d0b0c9e-9b1a-4e8a-9e1a-3b2c1d7c6b5a'],
    };
    const presenter = await controller.update(id, input);
    expect(mockUpdateUseCase.execute).toHaveBeenCalledWith({ id, ...input });
    expect(presenter).toBeInstanceOf(VideoPresenter);
    expect(presenter).toStrictEqual(new VideoPresenter(output));
  });

  it('should get a video', async () => {
    const id = '9366b7dc-2d71-4799-b91c-c64adb205104';
    const output: GetVideoOutput = VideoOutputFactory.create();
    const mockGetUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };
    //@ts-expect-error defined part of methods
    controller['getUseCase'] = mockGetUseCase;
    const presenter = await controller.findOne(id);
    expect(mockGetUseCase.execute).toHaveBeenCalledWith({ id });
    expect(presenter).toBeInstanceOf(VideoPresenter);
    expect(presenter).toStrictEqual(new VideoPresenter(output));
  });

  it('should list videos', async () => {
    const output: ListVideosOutput = {
      items: [VideoOutputFactory.create()],
      current_page: 1,
      last_page: 1,
      per_page: 1,
      total: 1,
    };
    const mockListUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };
    //@ts-expect-error defined part of methods
    controller['listUseCase'] = mockListUseCase;
    const searchParams = {
      page: 1,
      per_page: 2,
      sort: 'title',
      sort_dir: 'desc' as SortDirection,
      filter: { title: 'actor test' },
    };
    const presenter = await controller.search(searchParams);
    expect(presenter).toBeInstanceOf(VideoCollectionPresenter);
    expect(mockListUseCase.execute).toHaveBeenCalledWith(searchParams);
    expect(presenter).toEqual(new VideoCollectionPresenter(output));
  });

  it('should delete a video', async () => {
    const expectedOutput = undefined;
    const mockDeleteUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(expectedOutput)),
    };
    //@ts-expect-error defined part of methods
    controller['deleteUseCase'] = mockDeleteUseCase;
    const id = '9366b7dc-2d71-4799-b91c-c64adb205104';
    expect(controller.remove(id)).toBeInstanceOf(Promise);
    const output = await controller.remove(id);
    expect(mockDeleteUseCase.execute).toHaveBeenCalledWith({ id });
    expect(expectedOutput).toStrictEqual(output);
  });
});
