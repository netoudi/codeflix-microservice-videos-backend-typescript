import { SequelizeOptions } from 'sequelize-typescript';
import { CastMemberModel } from '@/core/cast-member/infra/db/sequelize/cast-member.model';
import { CategoryModel } from '@/core/category/infra/db/sequelize/category.model';
import { GenreCategoryModel, GenreModel } from '@/core/genre/infra/db/sequelize/genre.model';
import { setupSequelize } from '@/core/shared/infra/testing/helpers';
import { AudioVideoMediaModel } from '@/core/video/infra/db/sequelize/audio-video-media.model';
import { ImageMediaModel } from '@/core/video/infra/db/sequelize/image-media.model';
import {
  VideoCastMemberModel,
  VideoCategoryModel,
  VideoGenreModel,
  VideoModel,
} from '@/core/video/infra/db/sequelize/video.model';

export function setupSequelizeForVideo(options: SequelizeOptions = {}) {
  return setupSequelize({
    models: [
      AudioVideoMediaModel,
      CastMemberModel,
      CategoryModel,
      GenreCategoryModel,
      GenreModel,
      ImageMediaModel,
      VideoCastMemberModel,
      VideoCategoryModel,
      VideoGenreModel,
      VideoModel,
    ],
    ...options,
  });
}
