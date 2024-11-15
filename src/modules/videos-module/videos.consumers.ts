import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';

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
  onProcessVideo(msg: OnProcessVideoCommand) {
    console.log(msg);
  }
}
