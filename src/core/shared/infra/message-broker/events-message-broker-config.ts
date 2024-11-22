import { VideoAudioMediaReplacedIntegrationEvent } from '@/core/video/domain/domain-events/video-audio-media-replaced.event';

export const EVENTS_MESSAGE_BROKER_CONFIG = {
  [VideoAudioMediaReplacedIntegrationEvent.name]: {
    exchange: 'amq.direct',
    routing_key: VideoAudioMediaReplacedIntegrationEvent.name,
  },
  TestEvent: {
    exchange: 'test-exchange',
    routing_key: 'TestEvent',
  },
};
