import { CategoryId } from '@/core/category/domain/category.entity';
import { Genre, GenreId } from '@/core/genre/domain/genre.aggregate';
import { GenreCategoryModel, GenreModel } from '@/core/genre/infra/db/sequelize/genre.model';
import { Notification } from '@/core/shared/domain/validators/notification';
import { LoadEntityError } from '@/core/shared/domain/validators/validation.error';

export class GenreModelMapper {
  static toModel(aggregate: Genre): GenreModel {
    const { categories_id, ...otherData } = aggregate.toJSON();
    return GenreModel.build(
      {
        ...otherData,
        categories_id: categories_id.map(
          (category_id) =>
            new GenreCategoryModel({
              genre_id: aggregate.id.value,
              category_id: category_id,
            }),
        ),
      },
      { include: ['categories_id'] },
    );
  }

  static toEntity(model: GenreModel): Genre {
    const { id, categories_id = [], ...otherData } = model.toJSON();
    const categoriesId = categories_id.map((c) => new CategoryId(c.category_id));

    const notification = new Notification();
    if (!categoriesId.length) {
      notification.addError('categories_id should not be empty', 'categories_id');
    }

    const genre = new Genre({
      ...otherData,
      id: new GenreId(id),
      categories_id: new Map(categoriesId.map((c) => [c.value, c])),
    });

    genre.validate();

    notification.copyErrors(genre.notification);

    if (notification.hasErrors()) {
      throw new LoadEntityError(notification.toJSON());
    }

    return genre;
  }

  static toModels(entities: Genre[]): GenreModel[] {
    return entities.map((entity) => this.toModel(entity));
  }

  static toEntities(models: GenreModel[]): Genre[] {
    return models.map((model) => this.toEntity(model));
  }
}
