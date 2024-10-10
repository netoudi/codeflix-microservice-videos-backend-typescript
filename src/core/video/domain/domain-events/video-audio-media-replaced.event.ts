import { IDomainEvent } from '@/core/shared/domain/events/domain-event.interface';
import { TrailerMedia } from '@/core/video/domain/trailer-media.vo';
import { VideoMedia } from '@/core/video/domain/video-media.vo';
import { VideoId } from '@/core/video/domain/video.aggregate';

export type VideoAudioMediaReplacedEventProps = {
  video_id: VideoId;
  media: TrailerMedia | VideoMedia;
  media_type: 'trailer' | 'video';
};

export class VideoAudioMediaReplacedEvent implements IDomainEvent {
  readonly aggregate_id: VideoId;
  readonly occurred_on: Date;
  readonly event_version: number;

  readonly media: TrailerMedia | VideoMedia;
  readonly media_type: 'trailer' | 'video';

  constructor(props: VideoAudioMediaReplacedEventProps) {
    this.aggregate_id = props.video_id;
    this.media = props.media;
    this.media_type = props.media_type;
    this.occurred_on = new Date();
    this.event_version = 1;
  }
}
