import { CastMember } from '@/core/cast-member/domain/cast-member.entity';
import { CastMemberInMemoryRepository } from '@/core/cast-member/infra/db/in-memory/cast-member-in-memory.repository';
import { Category } from '@/core/category/domain/category.entity';
import { CategoryInMemoryRepository } from '@/core/category/infra/db/in-memory/category-in-memory.repository';
import { Genre } from '@/core/genre/domain/genre.aggregate';
import { GenreInMemoryRepository } from '@/core/genre/infra/db/in-memory/genre-in-memory.repository';
import { NotFoundError } from '@/core/shared/domain/errors/not-found';
import { AudioVideoMediaStatus } from '@/core/shared/domain/value-objects/audio-video-media.vo';
import { FakeUnitOfWorkInMemory } from '@/core/shared/infra/db/in-memory/fake-unit-of-work-in-memory';
import { ProcessAudioVideoMediasUseCase } from '@/core/video/application/use-cases/process-audio-video-medias/process-audio-video-medias.use-case';
import { Video } from '@/core/video/domain/video.aggregate';
import { VideoInMemoryRepository } from '@/core/video/infra/db/in-memory/video-in-memory.repository';

describe('ProcessAudioVideoMediasUseCase Unit Tests', () => {
  let uow: FakeUnitOfWorkInMemory;
  let videoRepository: VideoInMemoryRepository;
  let categoryRepository: CategoryInMemoryRepository;
  let genreRepository: GenreInMemoryRepository;
  let castMemberRepository: CastMemberInMemoryRepository;
  let useCase: ProcessAudioVideoMediasUseCase;

  beforeEach(() => {
    uow = new FakeUnitOfWorkInMemory();
    videoRepository = new VideoInMemoryRepository();
    categoryRepository = new CategoryInMemoryRepository();
    genreRepository = new GenreInMemoryRepository();
    castMemberRepository = new CastMemberInMemoryRepository();
    useCase = new ProcessAudioVideoMediasUseCase(uow, videoRepository);
  });

  it('should throw error when video not found', async () => {
    await expect(
      useCase.execute({
        video_id: '4e9e2e4e-4b4a-4b4a-8b8b-8b8b8b8b8b8b',
        field: 'trailer',
        status: AudioVideoMediaStatus.COMPLETED,
        encoded_location: 'path/to/video/encoded',
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
          status: AudioVideoMediaStatus.COMPLETED,
          encoded_location: 'path/to/video/encoded',
        },
        expected: new Error('Trailer not found'),
      },
      {
        input: {
          video_id: video.id.value,
          field: 'video',
          status: AudioVideoMediaStatus.COMPLETED,
          encoded_location: 'path/to/video/encoded',
        },
        expected: new Error('Video not found'),
      },
    ];

    for (const { input, expected } of arrange) {
      try {
        await useCase.execute(input);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error).toEqual(expected);
      }
    }
  });

  it('should upload trailer or video file', async () => {
    const category = Category.fake().aCategory().build();
    await categoryRepository.insert(category);
    const genre = Genre.fake().aGenre().addCategoryId(category.id).build();
    await genreRepository.insert(genre);
    const castMember = CastMember.fake().anActor().build();
    await castMemberRepository.insert(castMember);
    const video = Video.fake()
      .aVideoWithAllMedias()
      .addCategoryId(category.id)
      .addGenreId(genre.id)
      .addCastMemberId(castMember.id)
      .build();
    await videoRepository.insert(video);

    for (const field_name of ['trailer', 'video']) {
      await useCase.execute({
        video_id: video.id.value,
        field: field_name,
        status: AudioVideoMediaStatus.FAILED,
        encoded_location: 'path/to/video/encoded',
      });
      let videoUpdated = await videoRepository.findById(video.id);
      expect(videoUpdated![field_name]).toBeDefined();
      expect(videoUpdated![field_name]!.encoded_location).toBeNull();

      await useCase.execute({
        video_id: video.id.value,
        field: field_name,
        status: AudioVideoMediaStatus.COMPLETED,
        encoded_location: 'path/to/video/encoded',
      });
      videoUpdated = await videoRepository.findById(video.id);
      expect(videoUpdated![field_name]).toBeDefined();
      expect(videoUpdated![field_name]!.encoded_location).toBe('path/to/video/encoded');
    }
  });
});
