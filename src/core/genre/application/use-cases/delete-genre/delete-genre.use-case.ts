import { GenreId } from '@/core/genre/domain/genre.aggregate';
import { IGenreRepository } from '@/core/genre/domain/genre.repository';
import { IUseCase } from '@/core/shared/application/use-case.interface';
import { IUnitOfWork } from '@/core/shared/domain/repository/unit-of-work.interface';

export class DeleteGenreUseCase implements IUseCase<DeleteGenreInput, DeleteGenreOutput> {
  constructor(
    private readonly uow: IUnitOfWork,
    private readonly genreRepository: IGenreRepository,
  ) {}

  async execute(input: DeleteGenreInput): Promise<DeleteGenreOutput> {
    return this.uow.do(async () => {
      return this.genreRepository.delete(new GenreId(input.id));
    });
  }
}

export type DeleteGenreInput = {
  id: string;
};

export type DeleteGenreOutput = void;
