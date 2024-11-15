import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, ValidationPipe } from '@nestjs/common';
import { AudioVideoMediaStatus } from '@/core/shared/domain/value-objects/audio-video-media.vo';
import { ProcessAudioVideoMediasUseCaseInput } from '@/core/video/application/use-cases/process-audio-video-medias/process-audio-video-medias-use-case.input';

type OnProcessVideoCommand = {
  video: {
    resource_id: string;
    encoded_video_folder: string;
    status: 'COMPLETED' | 'FAILED';
  };
};

@Injectable()
export class VideoConsumers {
  @RabbitSubscribe({
    exchange: 'amq.direct',
    routingKey: 'videos.convert',
    queue: 'micro-videos/videos.convert',
    allowNonJsonMessages: true,
  })
  async onProcessVideo(msg: OnProcessVideoCommand) {
    console.log(msg);
    const resource_id = `${msg.video.resource_id}`;
    const [video_id, field] = resource_id.split('.');
    const input = new ProcessAudioVideoMediasUseCaseInput({
      video_id,
      field,
      status: msg.video.status as AudioVideoMediaStatus,
      encoded_location: msg.video.encoded_video_folder,
    });

    await new ValidationPipe({ errorHttpStatusCode: 422 }).transform(input, {
      metatype: ProcessAudioVideoMediasUseCaseInput,
      type: 'body',
    });
  }
}
