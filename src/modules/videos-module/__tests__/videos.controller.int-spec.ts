import { getConnectionToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { Sequelize } from 'sequelize';
import { UnitOfWorkSequelize } from '@/core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { InMemoryStorage } from '@/core/shared/infra/storage/in-memory.storage';
import { CreateVideoUseCase } from '@/core/video/application/use-cases/create-video/create-video.use-case';
import { DeleteVideoUseCase } from '@/core/video/application/use-cases/delete-video/delete-video.use-case';
import { GetVideoUseCase } from '@/core/video/application/use-cases/get-video/get-video.use-case';
import { ListVideosUseCase } from '@/core/video/application/use-cases/list-video/list-videos.use-case';
import { UpdateVideoUseCase } from '@/core/video/application/use-cases/update-video/update-video.use-case';
import { UploadAudioVideoMediasUseCase } from '@/core/video/application/use-cases/upload-audio-video-medias/upload-audio-video-medias.use-case';
import { UploadImageMediasUseCase } from '@/core/video/application/use-cases/upload-image-medias/upload-image-medias.use-case';
import { ConfigModule } from '@/modules/config-module/config.module';
import { DatabaseModule } from '@/modules/database-module/database.module';
import { SharedModule } from '@/modules/shared-module/shared.module';
import { VideosController } from '@/modules/videos-module/videos.controller';
import { VideosModule } from '@/modules/videos-module/videos.module';

describe('VideosController Integration Tests', () => {
  let controller: VideosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), DatabaseModule, SharedModule, VideosModule],
    })
      .overrideProvider('UnitOfWork')
      .useFactory({
        factory: (sequelize: Sequelize) => {
          return new UnitOfWorkSequelize(sequelize);
        },
        inject: [getConnectionToken()],
      })
      .overrideProvider('IStorage')
      .useValue(new InMemoryStorage())
      .compile();
    controller = await module.resolve(VideosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(controller['createUseCase']).toBeInstanceOf(CreateVideoUseCase);
    expect(controller['updateUseCase']).toBeInstanceOf(UpdateVideoUseCase);
    expect(controller['listUseCase']).toBeInstanceOf(ListVideosUseCase);
    expect(controller['getUseCase']).toBeInstanceOf(GetVideoUseCase);
    expect(controller['deleteUseCase']).toBeInstanceOf(DeleteVideoUseCase);
    expect(controller['uploadAudioVideoMedia']).toBeInstanceOf(UploadAudioVideoMediasUseCase);
    expect(controller['uploadImageMedia']).toBeInstanceOf(UploadImageMediasUseCase);
  });
});
