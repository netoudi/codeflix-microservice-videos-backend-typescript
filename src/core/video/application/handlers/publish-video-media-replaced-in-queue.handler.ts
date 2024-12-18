import { OnEvent } from '@nestjs/event-emitter';
import { IIntegrationEventHandler } from '@/core/shared/application/domain-event-handler.interface';
import { IMessageBroker } from '@/core/shared/application/message-broker.interface';
import { IIntegrationEvent } from '@/core/shared/domain/events/domain-event.interface';
import { VideoAudioMediaReplacedIntegrationEvent } from '@/core/video/domain/domain-events/video-audio-media-replaced.event';

export class PublishVideoMediaReplacedInQueueHandler implements IIntegrationEventHandler {
  constructor(private messageBroker: IMessageBroker) {}

  @OnEvent(VideoAudioMediaReplacedIntegrationEvent.name)
  async handle(event: IIntegrationEvent): Promise<void> {
    await this.messageBroker.publishEvent(event);
  }
}
