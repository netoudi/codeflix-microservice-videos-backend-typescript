import { Storage as GoogleCloudStorageSdk } from '@google-cloud/storage';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import EventEmitter2 from 'eventemitter2';
import { DomainEventMediator } from '@/core/shared/domain/events/domain-event-mediator';
import { GoogleCloudStorage } from '@/core/shared/infra/storage/google-cloud.storage';

@Global()
@Module({
  providers: [
    {
      provide: 'IStorage',
      useFactory: (configService: ConfigService) => {
        const credentials = configService.get('GOOGLE_CLOUD_CREDENTIALS');
        const bucket = configService.get('GOOGLE_CLOUD_STORAGE_BUCKET_NAME');
        const storage = new GoogleCloudStorageSdk({ credentials });
        return new GoogleCloudStorage(storage, bucket);
      },
      inject: [ConfigService],
    },
    {
      provide: DomainEventMediator,
      useValue: new DomainEventMediator(new EventEmitter2()),
    },
  ],
})
export class SharedModule {}
