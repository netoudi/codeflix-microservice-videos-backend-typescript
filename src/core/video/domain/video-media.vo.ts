import { Either } from '@/core/shared/domain/either';
import { MediaFileValidator } from '@/core/shared/domain/validators/media-file.validator';
import { AudioVideoMedia, AudioVideoMediaStatus } from '@/core/shared/domain/value-objects/audio-video-media.vo';
import { VideoId } from '@/core/video/domain/video.aggregate';

export type VideoMediaCreateFromFileCommand = {
  video_id: VideoId;
  raw_name: string;
  mime_type: string;
  size: number;
};

export class VideoMedia extends AudioVideoMedia {
  static max_size = 1024 * 1024 * 1024 * 50; // 50GB
  static mime_types = ['video/mp4'];

  static createFromFile(props: VideoMediaCreateFromFileCommand) {
    return Either.safe(() => {
      const mediaFileValidator = new MediaFileValidator(VideoMedia.max_size, VideoMedia.mime_types);
      const { name: newName } = mediaFileValidator.validate(props);
      return new VideoMedia({
        name: newName,
        raw_location: `videos/${props.video_id}/videos`,
        status: AudioVideoMediaStatus.PENDING,
      });
    });
  }

  process() {
    return new VideoMedia({
      name: this.name,
      raw_location: this.raw_location,
      status: AudioVideoMediaStatus.PROCESSING,
    });
  }

  complete(encoded_location: string) {
    return new VideoMedia({
      name: this.name,
      raw_location: this.raw_location,
      encoded_location,
      status: AudioVideoMediaStatus.COMPLETED,
    });
  }

  fail() {
    return new VideoMedia({
      name: this.name,
      raw_location: this.raw_location,
      encoded_location: this.encoded_location ?? undefined,
      status: AudioVideoMediaStatus.FAILED,
    });
  }
}
