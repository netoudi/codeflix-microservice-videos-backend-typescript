import { IStorage } from '@/core/shared/application/storage.interface';
import { IUseCase } from '@/core/shared/application/use-case.interface';
import { NotFoundError } from '@/core/shared/domain/errors/not-found';
import { IUnitOfWork } from '@/core/shared/domain/repository/unit-of-work.interface';
import { EntityValidationError } from '@/core/shared/domain/validators/validation.error';
import { UploadAudioVideoMediasInput } from '@/core/video/application/use-cases/upload-audio-video-medias/upload-audio-video-medias.input';
import { TrailerMedia } from '@/core/video/domain/trailer-media.vo';
import { VideoMedia } from '@/core/video/domain/video-media.vo';
import { Video, VideoId } from '@/core/video/domain/video.aggregate';
import { IVideoRepository } from '@/core/video/domain/video.repository';

export class UploadAudioVideoMediasUseCase
  implements IUseCase<UploadAudioVideoMediasInput, UploadAudioVideoMediasOutput>
{
  constructor(
    private readonly uow: IUnitOfWork,
    private readonly videoRepository: IVideoRepository,
    private readonly storage: IStorage,
  ) {}

  async execute(input: UploadAudioVideoMediasInput): Promise<UploadAudioVideoMediasOutput> {
    const video = await this.videoRepository.findById(new VideoId(input.video_id));

    if (!video) throw new NotFoundError(input.video_id, Video);

    const fileMediaMap = {
      trailer: TrailerMedia,
      video: VideoMedia,
    };

    const [fileMedia, errorFileMedia] = fileMediaMap[input.field]
      .createFromFile({ ...input.file, video_id: video.id })
      .asArray();

    if (errorFileMedia) {
      throw new EntityValidationError([{ [input.field]: [errorFileMedia.message] }]);
    }

    fileMedia instanceof TrailerMedia && video.replaceTrailer(fileMedia);
    fileMedia instanceof VideoMedia && video.replaceVideo(fileMedia);

    await this.storage.store({
      id: fileMedia.url,
      data: input.file.data,
      mime_type: input.file.mime_type,
    });

    await this.uow.do(async () => {
      return this.videoRepository.update(video);
    });
  }
}

export type UploadAudioVideoMediasOutput = void;
