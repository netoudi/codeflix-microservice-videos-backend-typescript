import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AudioVideoMediaModel } from '@/core/video/infra/db/sequelize/audio-video-media.model';
import { ImageMediaModel } from '@/core/video/infra/db/sequelize/image-media.model';
import {
  VideoCastMemberModel,
  VideoCategoryModel,
  VideoGenreModel,
  VideoModel,
} from '@/core/video/infra/db/sequelize/video.model';
import { CastMembersModule } from '@/modules/cast-members-module/cast-members.module';
import { CategoriesModule } from '@/modules/categories-module/categories.module';
import { GenresModule } from '@/modules/genres-module/genres.module';
import { VideosController } from '@/modules/videos-module/videos.controller';
import { VIDEO_PROVIDERS } from '@/modules/videos-module/videos.providers';

@Module({
  imports: [
    SequelizeModule.forFeature([
      VideoModel,
      VideoCategoryModel,
      VideoGenreModel,
      VideoCastMemberModel,
      ImageMediaModel,
      AudioVideoMediaModel,
    ]),
    CategoriesModule,
    GenresModule,
    CastMembersModule,
  ],
  controllers: [VideosController],
  providers: [...Object.values(VIDEO_PROVIDERS.REPOSITORIES), ...Object.values(VIDEO_PROVIDERS.USE_CASES)],
  exports: [VIDEO_PROVIDERS.REPOSITORIES.VIDEO_REPOSITORY.provide],
})
export class VideosModule {}
