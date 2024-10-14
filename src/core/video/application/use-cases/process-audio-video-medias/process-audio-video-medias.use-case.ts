import { IUseCase } from '@/core/shared/application/use-case.interface';
import { NotFoundError } from '@/core/shared/domain/errors/not-found';
import { IUnitOfWork } from '@/core/shared/domain/repository/unit-of-work.interface';
import { AudioVideoMediaStatus } from '@/core/shared/domain/value-objects/audio-video-media.vo';
import { ProcessAudioVideoMediasUseCaseInput } from '@/core/video/application/use-cases/process-audio-video-medias/process-audio-video-medias-use-case.input';
import { Video, VideoId } from '@/core/video/domain/video.aggregate';
import { IVideoRepository } from '@/core/video/domain/video.repository';

export class ProcessAudioVideoMediasUseCase
  implements IUseCase<ProcessAudioVideoMediasUseCaseInput, ProcessAudioVideoMediasUseCaseOutput>
{
  constructor(
    private readonly uow: IUnitOfWork,
    private readonly videoRepository: IVideoRepository,
  ) {}

  async execute(input: ProcessAudioVideoMediasUseCaseInput): Promise<ProcessAudioVideoMediasUseCaseOutput> {
    const video = await this.videoRepository.findById(new VideoId(input.video_id));

    if (!video) throw new NotFoundError(input.video_id, Video);

    if (input.field === 'trailer') {
      if (!video.trailer) throw new Error('Trailer not found');
      video.replaceTrailer(
        input.status === AudioVideoMediaStatus.COMPLETED
          ? video.trailer.complete(input.encoded_location)
          : video.trailer.fail(),
      );
    }

    if (input.field === 'video') {
      if (!video.video) throw new Error('Video not found');
      video.replaceVideo(
        input.status === AudioVideoMediaStatus.COMPLETED
          ? video.video.complete(input.encoded_location)
          : video.video.fail(),
      );
    }

    await this.uow.do(async () => {
      return this.videoRepository.update(video);
    });
  }
}

export type ProcessAudioVideoMediasUseCaseOutput = void;
