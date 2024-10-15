import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { GenreCategoryModel, GenreModel } from '@/core/genre/infra/db/sequelize/genre.model';
import { CategoriesModule } from '@/modules/categories-module/categories.module';
import { GenresController } from '@/modules/genres-module/genres.controller';
import { GENRE_PROVIDERS } from '@/modules/genres-module/genres.providers';

@Module({
  imports: [SequelizeModule.forFeature([GenreModel, GenreCategoryModel]), CategoriesModule],
  controllers: [GenresController],
  providers: [
    ...Object.values(GENRE_PROVIDERS.REPOSITORIES),
    ...Object.values(GENRE_PROVIDERS.USE_CASES),
    ...Object.values(GENRE_PROVIDERS.VALIDATIONS),
  ],
  exports: [
    GENRE_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
    GENRE_PROVIDERS.VALIDATIONS.GENRES_ID_EXISTS_IN_DATABASE_VALIDATOR.provide,
  ],
})
export class GenresModule {}
