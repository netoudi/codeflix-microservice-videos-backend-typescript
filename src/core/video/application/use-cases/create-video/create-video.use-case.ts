import { CastMembersIdExistsInDatabaseValidator } from '@/core/cast-member/application/validations/cast-members-id-exists-in-database.validator';
import { CategoriesIdExistsInDatabaseValidator } from '@/core/category/application/validations/categories-id-exists-in-database.validator';
import { GenresIdExistsInDatabaseValidator } from '@/core/genre/application/validations/genres-id-exists-in-database.validator';
import { IUseCase } from '@/core/shared/application/use-case.interface';
import { IUnitOfWork } from '@/core/shared/domain/repository/unit-of-work.interface';
import { EntityValidationError } from '@/core/shared/domain/validators/validation.error';
import { CreateVideoInput } from '@/core/video/application/use-cases/create-video/create-video.input';
import { Rating } from '@/core/video/domain/rating.vo';
import { Video } from '@/core/video/domain/video.aggregate';
import { IVideoRepository } from '@/core/video/domain/video.repository';

export class CreateVideoUseCase implements IUseCase<CreateVideoInput, CreateVideoOutput> {
  constructor(
    private readonly uow: IUnitOfWork,
    private readonly videoRepository: IVideoRepository,
    private readonly categoriesIdValidator: CategoriesIdExistsInDatabaseValidator,
    private readonly genresIdValidator: GenresIdExistsInDatabaseValidator,
    private readonly castMembersIdValidator: CastMembersIdExistsInDatabaseValidator,
  ) {}

  async execute(input: CreateVideoInput): Promise<CreateVideoOutput> {
    const [rating, errorRating] = Rating.create(input.rating).asArray();

    const [categoriesId, errorsCategoriesId] = (
      await this.categoriesIdValidator.validate(input.categories_id)
    ).asArray();

    const [genresId, errorsGenresId] = (await this.genresIdValidator.validate(input.genres_id)).asArray();

    const [castMembersId, errorsCastMembersId] = (
      await this.castMembersIdValidator.validate(input.cast_members_id)
    ).asArray();

    const video = Video.create({
      ...input,
      rating: errorRating ? Rating.createRL() : rating,
      categories_id: errorsCategoriesId ? [] : categoriesId,
      genres_id: errorsGenresId ? [] : genresId,
      cast_members_id: errorsCastMembersId ? [] : castMembersId,
    });

    const notification = video.notification;

    if (errorsCategoriesId) {
      notification.setError(
        errorsCategoriesId.map((e) => e.message),
        'categories_id',
      );
    }

    if (errorsGenresId) {
      notification.setError(
        errorsGenresId.map((e) => e.message),
        'genres_id',
      );
    }

    if (errorsCastMembersId) {
      notification.setError(
        errorsCastMembersId.map((e) => e.message),
        'cast_members_id',
      );
    }

    if (notification.hasErrors()) {
      throw new EntityValidationError(notification.toJSON());
    }

    await this.uow.do(async () => {
      return this.videoRepository.insert(video);
    });

    return { id: video.id.value };
  }
}

export type CreateVideoOutput = {
  id: string;
};
