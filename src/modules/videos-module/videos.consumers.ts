import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, UseFilters, ValidationPipe } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { AudioVideoMediaStatus } from '@/core/shared/domain/value-objects/audio-video-media.vo';
import { ProcessAudioVideoMediasUseCaseInput } from '@/core/video/application/use-cases/process-audio-video-medias/process-audio-video-medias-use-case.input';
import { ProcessAudioVideoMediasUseCase } from '@/core/video/application/use-cases/process-audio-video-medias/process-audio-video-medias.use-case';
import { RabbitmqConsumeErrorFilter } from '@/modules/rabbitmq-module/rabbitmq-consume-error/rabbitmq-consume-error.filter';

type OnProcessVideoCommand = {
  video: {
    resource_id: string;
    encoded_video_folder: string;
    status: 'COMPLETED' | 'FAILED';
  };
};

@UseFilters(RabbitmqConsumeErrorFilter)
@Injectable()
export class VideoConsumers {
  constructor(private moduleRef: ModuleRef) {}

  @RabbitSubscribe({
    exchange: 'direct.delayed',
    routingKey: 'videos.convert',
    queue: 'micro-videos/videos.convert',
    allowNonJsonMessages: true,
    queueOptions: {
      deadLetterExchange: 'dlx.exchange',
      deadLetterRoutingKey: 'videos.convert',
    },
  })
  async onProcessVideo(msg: OnProcessVideoCommand) {
    console.log(msg);
    const resource_id = `${msg?.video?.resource_id}`;
    const [video_id, field] = resource_id.split('.');
    const input = new ProcessAudioVideoMediasUseCaseInput({
      video_id,
      field,
      status: msg?.video?.status as AudioVideoMediaStatus,
      encoded_location: msg?.video?.encoded_video_folder,
    });

    await new ValidationPipe({ errorHttpStatusCode: 422 }).transform(input, {
      metatype: ProcessAudioVideoMediasUseCaseInput,
      type: 'body',
    });

    const useCase = await this.moduleRef.resolve(ProcessAudioVideoMediasUseCase);
    await useCase.execute(input);
  }
}
