import { OnEvent } from '@nestjs/event-emitter';
import { IDomainEventHandler } from '@/core/shared/application/domain-event-handler.interface';
import { IDomainEvent } from '@/core/shared/domain/events/domain-event.interface';
import { VideoAudioMediaReplacedEvent } from '@/core/video/domain/domain-events/video-audio-media-replaced.event';

export class PublishVideoMediaReplacedInQueueHandler implements IDomainEventHandler {
  @OnEvent(VideoAudioMediaReplacedEvent.name)
  async handle(event: IDomainEvent): Promise<void> {
    console.log(event);
  }
}
