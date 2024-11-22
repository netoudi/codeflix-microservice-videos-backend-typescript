import { Test, TestingModule } from '@nestjs/testing';
import EventEmitter2 from 'eventemitter2';
import { FakeUnitOfWorkInMemory } from '@/core/shared/infra/db/in-memory/fake-unit-of-work-in-memory';
import { InMemoryMessaging } from '@/core/shared/infra/message-broker/in-memory-messaging';
import { InMemoryStorage } from '@/core/shared/infra/storage/in-memory.storage';
import { VideoAudioMediaReplacedIntegrationEvent } from '@/core/video/domain/domain-events/video-audio-media-replaced.event';
import { ConfigModule } from '@/modules/config-module/config.module';
import { DatabaseModule } from '@/modules/database-module/database.module';
import { EventModule } from '@/modules/event-module/event.module';
import { SharedModule } from '@/modules/shared-module/shared.module';
import { UseCaseModule } from '@/modules/use-case-module/use-case.module';
import { RabbitmqModuleFake } from '@/modules/videos-module/testing/rabbitmq-module-fake';
import { VideosModule } from '@/modules/videos-module/videos.module';

describe('VideoModule Unit Tests', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        SharedModule,
        EventModule,
        UseCaseModule,
        DatabaseModule,
        RabbitmqModuleFake.forRoot(),
        VideosModule,
      ],
    })
      .overrideProvider('UnitOfWork')
      .useFactory({
        factory: () => {
          return new FakeUnitOfWorkInMemory();
        },
      })
      .overrideProvider('IStorage')
      .useFactory({
        factory: () => {
          return new InMemoryStorage();
        },
      })
      .overrideProvider('IMessageBroker')
      .useFactory({
        factory: () => {
          return new InMemoryMessaging();
        },
      })
      .compile();
    await module.init();
  });

  afterEach(async () => {
    await module.close();
  });

  it('should register events', async () => {
    const eventemitter2 = module.get<EventEmitter2>(EventEmitter2);
    expect(eventemitter2.listeners(VideoAudioMediaReplacedIntegrationEvent.name)).toHaveLength(1);
  });
});
