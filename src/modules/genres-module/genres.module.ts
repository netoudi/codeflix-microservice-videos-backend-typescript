import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { GenreModel } from '@/core/genre/infra/db/sequelize/genre.model';
import { GenresController } from '@/modules/genres-module/genres.controller';
import { GENRE_PROVIDERS } from '@/modules/genres-module/genres.providers';

@Module({
  imports: [SequelizeModule.forFeature([GenreModel])],
  controllers: [GenresController],
  providers: [...Object.values(GENRE_PROVIDERS.REPOSITORIES), ...Object.values(GENRE_PROVIDERS.USE_CASES)],
})
export class GenresModule {}
