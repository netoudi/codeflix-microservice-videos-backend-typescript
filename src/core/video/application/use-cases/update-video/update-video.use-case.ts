import { CastMembersIdExistsInDatabaseValidator } from '@/core/cast-member/application/validations/cast-members-id-exists-in-database.validator';
import { CategoriesIdExistsInDatabaseValidator } from '@/core/category/application/validations/categories-id-exists-in-database.validator';
import { GenresIdExistsInDatabaseValidator } from '@/core/genre/application/validations/genres-id-exists-in-database.validator';
import { IUseCase } from '@/core/shared/application/use-case.interface';
import { NotFoundError } from '@/core/shared/domain/errors/not-found';
import { IUnitOfWork } from '@/core/shared/domain/repository/unit-of-work.interface';
import { EntityValidationError } from '@/core/shared/domain/validators/validation.error';
import { UpdateVideoInput } from '@/core/video/application/use-cases/update-video/update-video.input';
import { Rating } from '@/core/video/domain/rating.vo';
import { Video, VideoId } from '@/core/video/domain/video.aggregate';
import { IVideoRepository } from '@/core/video/domain/video.repository';

export class UpdateVideoUseCase implements IUseCase<UpdateVideoInput, UpdateVideoOutput> {
  constructor(
    private readonly uow: IUnitOfWork,
    private readonly videoRepository: IVideoRepository,
    private readonly categoriesIdValidator: CategoriesIdExistsInDatabaseValidator,
    private readonly genresIdValidator: GenresIdExistsInDatabaseValidator,
    private readonly castMembersIdValidator: CastMembersIdExistsInDatabaseValidator,
  ) {}

  async execute(input: UpdateVideoInput): Promise<UpdateVideoOutput> {
    const video = await this.videoRepository.findById(new VideoId(input.id));

    if (!video) throw new NotFoundError(input.id, Video);

    'title' in input && input.title !== undefined && input.title !== null && video.changeTitle(input.title);

    'description' in input &&
      input.description !== undefined &&
      input.description !== null &&
      video.changeDescription(input.description);

    'year_launched' in input &&
      input.year_launched !== undefined &&
      input.year_launched !== null &&
      video.changeYearLaunched(input.year_launched);

    'duration' in input &&
      input.duration !== undefined &&
      input.duration !== null &&
      video.changeDuration(input.duration);

    const notification = video.notification;

    if (input.rating) {
      const [newRating, errorRating] = Rating.create(input.rating).asArray();
      newRating && video.changeRating(newRating);
      errorRating && notification.setError(errorRating.message, 'rating');
    }

    if (input.is_opened === true) video.markAsOpened();
    if (input.is_opened === false) video.markAsNotOpened();

    if (input.categories_id) {
      const [categoriesId, errorsCategoriesId] = (
        await this.categoriesIdValidator.validate(input.categories_id)
      ).asArray();

      categoriesId && video.syncCategoriesId(categoriesId);

      errorsCategoriesId &&
        notification.setError(
          errorsCategoriesId.map((e) => e.message),
          'categories_id',
        );
    }

    if (input.genres_id) {
      const [genresId, errorsGenresId] = (await this.genresIdValidator.validate(input.genres_id)).asArray();

      genresId && video.syncGenresId(genresId);

      errorsGenresId &&
        notification.setError(
          errorsGenresId.map((e) => e.message),
          'genres_id',
        );
    }

    if (input.cast_members_id) {
      const [cast_membersId, errorsCastMembersId] = (
        await this.castMembersIdValidator.validate(input.cast_members_id)
      ).asArray();

      cast_membersId && video.syncCastMembersId(cast_membersId);

      errorsCastMembersId &&
        notification.setError(
          errorsCastMembersId.map((e) => e.message),
          'cast_members_id',
        );
    }

    if (video.notification.hasErrors()) {
      throw new EntityValidationError(video.notification.toJSON());
    }

    await this.uow.do(async () => {
      return await this.videoRepository.update(video);
    });
  }
}

export type UpdateVideoOutput = void;
