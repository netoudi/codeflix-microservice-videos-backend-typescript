import { CastMember } from '@/core/cast-member/domain/cast-member.entity';
import { CastMemberInMemoryRepository } from '@/core/cast-member/infra/db/in-memory/cast-member-in-memory.repository';
import { Category } from '@/core/category/domain/category.entity';
import { CategoryInMemoryRepository } from '@/core/category/infra/db/in-memory/category-in-memory.repository';
import { Genre } from '@/core/genre/domain/genre.aggregate';
import { GenreInMemoryRepository } from '@/core/genre/infra/db/in-memory/genre-in-memory.repository';
import { NotFoundError } from '@/core/shared/domain/errors/not-found';
import { EntityValidationError } from '@/core/shared/domain/validators/validation.error';
import { FakeUnitOfWorkInMemory } from '@/core/shared/infra/db/in-memory/fake-unit-of-work-in-memory';
import { InMemoryStorage } from '@/core/shared/infra/storage/in-memory.storage';
import { UploadAudioVideoMediasUseCase } from '@/core/video/application/use-cases/upload-audio-video-medias/upload-audio-video-medias.use-case';
import { Video } from '@/core/video/domain/video.aggregate';
import { VideoInMemoryRepository } from '@/core/video/infra/db/in-memory/video-in-memory.repository';

describe('UploadAudioVideoMediasUseCase Unit Tests', () => {
  let uow: FakeUnitOfWorkInMemory;
  let videoRepository: VideoInMemoryRepository;
  let categoryRepository: CategoryInMemoryRepository;
  let genreRepository: GenreInMemoryRepository;
  let castMemberRepository: CastMemberInMemoryRepository;
  let storageService: InMemoryStorage;
  let useCase: UploadAudioVideoMediasUseCase;

  beforeEach(() => {
    uow = new FakeUnitOfWorkInMemory();
    videoRepository = new VideoInMemoryRepository();
    categoryRepository = new CategoryInMemoryRepository();
    genreRepository = new GenreInMemoryRepository();
    castMemberRepository = new CastMemberInMemoryRepository();
    storageService = new InMemoryStorage();
    useCase = new UploadAudioVideoMediasUseCase(uow, videoRepository, storageService);
  });

  it('should throw error when video not found', async () => {
    await expect(
      useCase.execute({
        video_id: '4e9e2e4e-4b4a-4b4a-8b8b-8b8b8b8b8b8b',
        field: 'banner',
        file: {
          raw_name: 'banner.jpg',
          data: Buffer.from(''),
          mime_type: 'video/mpeg',
          size: 100,
        },
      }),
    ).rejects.toThrow(new NotFoundError('4e9e2e4e-4b4a-4b4a-8b8b-8b8b8b8b8b8b', Video));
  });

  it('should throw error when trailer or video is invalid', async () => {
    expect.assertions(4);
    const category = Category.fake().aCategory().build();
    await categoryRepository.insert(category);
    const genre = Genre.fake().aGenre().addCategoryId(category.id).build();
    await genreRepository.insert(genre);
    const castMember = CastMember.fake().anActor().build();
    await castMemberRepository.insert(castMember);
    const video = Video.fake()
      .aVideoWithoutMedias()
      .addCategoryId(category.id)
      .addGenreId(genre.id)
      .addCastMemberId(castMember.id)
      .build();
    await videoRepository.insert(video);

    const arrange = [
      {
        input: {
          video_id: video.id.value,
          field: 'trailer',
          file: {
            raw_name: 'trailer.mpeg',
            data: Buffer.from(''),
            mime_type: 'video/mpeg',
            size: 100,
          },
        },
        expected: [
          {
            trailer: ['Invalid media file mime type: video/mpeg not in video/mp4'],
          },
        ],
      },
      {
        input: {
          video_id: video.id.value,
          field: 'video',
          file: {
            raw_name: 'video.mpeg',
            data: Buffer.from(''),
            mime_type: 'video/mpeg',
            size: 100,
          },
        },
        expected: [
          {
            video: ['Invalid media file mime type: video/mpeg not in video/mp4'],
          },
        ],
      },
    ];

    for (const { input, expected } of arrange) {
      try {
        await useCase.execute(input);
      } catch (error) {
        expect(error).toBeInstanceOf(EntityValidationError);
        expect(error.errors).toEqual(expected);
      }
    }
  });

  it('should upload trailer or video file', async () => {
    const storeSpy = jest.spyOn(storageService, 'store');
    const category = Category.fake().aCategory().build();
    await categoryRepository.insert(category);
    const genre = Genre.fake().aGenre().addCategoryId(category.id).build();
    await genreRepository.insert(genre);
    const castMember = CastMember.fake().anActor().build();
    await castMemberRepository.insert(castMember);
    const video = Video.fake()
      .aVideoWithoutMedias()
      .addCategoryId(category.id)
      .addGenreId(genre.id)
      .addCastMemberId(castMember.id)
      .build();
    await videoRepository.insert(video);

    for (const field_name of ['trailer', 'video']) {
      await useCase.execute({
        video_id: video.id.value,
        field: field_name,
        file: {
          raw_name: 'video.mp4',
          data: Buffer.from('test data'),
          mime_type: 'video/mp4',
          size: 100,
        },
      });

      const videoUpdated = await videoRepository.findById(video.id);
      expect(videoUpdated![field_name]).toBeDefined();
      expect(videoUpdated![field_name]!.name.includes('.mp4')).toBeTruthy();
      expect(videoUpdated![field_name]!.raw_location).toBe(`videos/${videoUpdated!.id.value}/videos`);
      expect(storeSpy).toHaveBeenCalledWith({
        id: videoUpdated![field_name]!.url,
        data: Buffer.from('test data'),
        mime_type: 'video/mp4',
      });
    }
  });
});
