import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { getConnectionToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { Channel, ChannelWrapper } from 'amqp-connection-manager';
import { ConsumeMessage } from 'amqplib';
import { Sequelize } from 'sequelize';
import { CastMember } from '@/core/cast-member/domain/cast-member.entity';
import { ICastMemberRepository } from '@/core/cast-member/domain/cast-member.repository';
import { Category } from '@/core/category/domain/category.entity';
import { ICategoryRepository } from '@/core/category/domain/category.repository';
import { Genre } from '@/core/genre/domain/genre.aggregate';
import { IGenreRepository } from '@/core/genre/domain/genre.repository';
import { UnitOfWorkSequelize } from '@/core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { EVENTS_MESSAGE_BROKER_CONFIG } from '@/core/shared/infra/message-broker/events-message-broker-config';
import { InMemoryStorage } from '@/core/shared/infra/storage/in-memory.storage';
import { UploadAudioVideoMediasUseCase } from '@/core/video/application/use-cases/upload-audio-video-medias/upload-audio-video-medias.use-case';
import { VideoAudioMediaReplacedIntegrationEvent } from '@/core/video/domain/domain-events/video-audio-media-replaced.event';
import { Video } from '@/core/video/domain/video.aggregate';
import { IVideoRepository } from '@/core/video/domain/video.repository';
import { CAST_MEMBER_PROVIDERS } from '@/modules/cast-members-module/cast-members.providers';
import { CATEGORY_PROVIDERS } from '@/modules/categories-module/categories.providers';
import { ConfigModule } from '@/modules/config-module/config.module';
import { DatabaseModule } from '@/modules/database-module/database.module';
import { EventModule } from '@/modules/event-module/event.module';
import { GENRE_PROVIDERS } from '@/modules/genres-module/genres.providers';
import { RabbitmqModule } from '@/modules/rabbitmq-module/rabbitmq.module';
import { SharedModule } from '@/modules/shared-module/shared.module';
import { UseCaseModule } from '@/modules/use-case-module/use-case.module';
import { VideosModule } from '@/modules/videos-module/videos.module';
import { VIDEO_PROVIDERS } from '@/modules/videos-module/videos.providers';

describe('PublishVideoMediaReplacedInQueueHandler Integration Tests', () => {
  let module: TestingModule;
  let channelWrapper: ChannelWrapper;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        SharedModule,
        EventModule,
        UseCaseModule,
        DatabaseModule,
        RabbitmqModule.forRoot(),
        VideosModule,
      ],
    })
      .overrideProvider('UnitOfWork')
      .useFactory({
        factory: (sequelize: Sequelize) => {
          return new UnitOfWorkSequelize(sequelize);
        },
        inject: [getConnectionToken()],
      })
      .overrideProvider('IStorage')
      .useFactory({
        factory: () => {
          return new InMemoryStorage();
        },
      })
      .compile();
    await module.init();

    const amqpConn = module.get<AmqpConnection>(AmqpConnection);
    channelWrapper = amqpConn.managedConnection.createChannel();
    await channelWrapper.addSetup(async (channel: Channel) => {
      return Promise.all([
        channel.assertQueue('test-queue-video-upload', { durable: false }),
        channel.bindQueue(
          'test-queue-video-upload',
          EVENTS_MESSAGE_BROKER_CONFIG[VideoAudioMediaReplacedIntegrationEvent.name].exchange,
          EVENTS_MESSAGE_BROKER_CONFIG[VideoAudioMediaReplacedIntegrationEvent.name].routing_key,
        ),
      ]).then(() => channel.purgeQueue('test-queue-video-upload'));
    });
  });

  afterEach(async () => {
    await channelWrapper.close();
    await module.close();
  });

  it('should publish video media replaced event in queue', async () => {
    const category = Category.fake().aCategory().build();
    const genre = Genre.fake().aGenre().addCategoryId(category.id).build();
    const cast_member = CastMember.fake().aDirector().build();
    const video = Video.fake()
      .aVideoWithoutMedias()
      .addCategoryId(category.id)
      .addGenreId(genre.id)
      .addCastMemberId(cast_member.id)
      .build();

    const categoryRepo = module.get<ICategoryRepository>(CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide);
    await categoryRepo.insert(category);

    const genreRepo = module.get<IGenreRepository>(GENRE_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide);
    await genreRepo.insert(genre);

    const castMemberRepo = module.get<ICastMemberRepository>(
      CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
    );
    await castMemberRepo.insert(cast_member);

    const videoRepo = module.get<IVideoRepository>(VIDEO_PROVIDERS.REPOSITORIES.VIDEO_REPOSITORY.provide);
    await videoRepo.insert(video);

    const useCase = module.get<UploadAudioVideoMediasUseCase>(
      VIDEO_PROVIDERS.USE_CASES.UPLOAD_AUDIO_VIDEO_MEDIAS_USE_CASE.provide,
    );

    await useCase.execute({
      video_id: video.id.value,
      field: 'video',
      file: {
        data: Buffer.from('data'),
        mime_type: 'video/mp4',
        raw_name: 'video.mp4',
        size: 100,
      },
    });

    const msg: ConsumeMessage = await new Promise((resolve) => {
      channelWrapper.consume('test-queue-video-upload', (msg) => {
        resolve(msg);
      });
    });

    const msgObj = JSON.parse(msg.content.toString());
    const updatedVideo = await videoRepo.findById(video.id);
    expect(msgObj).toEqual({
      resource_id: `${video.id.value}.video`,
      file_path: updatedVideo?.video?.raw_location,
    });
  });
});
