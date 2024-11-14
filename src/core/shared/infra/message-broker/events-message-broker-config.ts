import { VideoAudioMediaReplacedEvent } from '@/core/video/domain/domain-events/video-audio-media-replaced.event';

export const EVENTS_MESSAGE_BROKER_CONFIG = {
  [VideoAudioMediaReplacedEvent.name]: {
    exchange: 'amq.direct',
    routing_key: VideoAudioMediaReplacedEvent.name,
  },
  TestEvent: {
    exchange: 'test-exchange',
    routing_key: 'TestEvent',
  },
};
