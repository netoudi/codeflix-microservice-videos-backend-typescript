import { Either } from '@/core/shared/domain/either';
import { MediaFileValidator } from '@/core/shared/domain/validators/media-file.validator';
import { ImageMedia } from '@/core/shared/domain/value-objects/image-media.vo';
import { VideoId } from '@/core/video/domain/video.aggregate';

export type ThumbnailCreateFromFileCommand = {
  video_id: VideoId;
  raw_name: string;
  mime_type: string;
  size: number;
};

export class Thumbnail extends ImageMedia {
  static max_size = 1024 * 1024 * 2; // 2MB
  static mime_types = ['image/jpeg', 'image/png', 'image/gif'];

  static createFromFile(props: ThumbnailCreateFromFileCommand) {
    return Either.safe(() => {
      const mediaFileValidator = new MediaFileValidator(Thumbnail.max_size, Thumbnail.mime_types);
      const { name: newName } = mediaFileValidator.validate(props);
      return new Thumbnail({
        name: newName,
        location: `videos/${props.video_id}/images`,
      });
    });
  }
}
