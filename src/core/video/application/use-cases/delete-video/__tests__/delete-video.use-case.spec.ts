import { NotFoundError } from '@/core/shared/domain/errors/not-found';
import { FakeUnitOfWorkInMemory } from '@/core/shared/infra/db/in-memory/fake-unit-of-work-in-memory';
import { DeleteVideoUseCase } from '@/core/video/application/use-cases/delete-video/delete-video.use-case';
import { Video, VideoId } from '@/core/video/domain/video.aggregate';
import { VideoInMemoryRepository } from '@/core/video/infra/db/in-memory/video-in-memory.repository';

describe('DeleteVideoUseCase Unit Tests', () => {
  let uow: FakeUnitOfWorkInMemory;
  let videoRepository: VideoInMemoryRepository;
  let useCase: DeleteVideoUseCase;

  beforeEach(() => {
    uow = new FakeUnitOfWorkInMemory();
    videoRepository = new VideoInMemoryRepository();
    useCase = new DeleteVideoUseCase(uow, videoRepository);
  });

  it('should throw error when entity not found', async () => {
    const videoId = new VideoId();
    await expect(() => useCase.execute({ id: videoId.value })).rejects.toThrow(new NotFoundError(videoId.value, Video));
  });

  it('should delete a video', async () => {
    const items = [Video.fake().aVideoWithoutMedias().build()];
    videoRepository.items = items;
    const spyOnDo = jest.spyOn(uow, 'do');
    await useCase.execute({
      id: items[0].id.value,
    });
    expect(spyOnDo).toBeCalledTimes(1);
    expect(videoRepository.items).toHaveLength(0);
  });
});
