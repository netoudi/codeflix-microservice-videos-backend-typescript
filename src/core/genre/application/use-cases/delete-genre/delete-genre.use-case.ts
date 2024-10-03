import { GenreId } from '@/core/genre/domain/genre.aggregate';
import { IGenreRepository } from '@/core/genre/domain/genre.repository';
import { IUseCase } from '@/core/shared/application/use-case.interface';

export class DeleteGenreUseCase implements IUseCase<DeleteGenreInput, DeleteGenreOutput> {
  constructor(private readonly genreRepository: IGenreRepository) {}

  async execute(input: DeleteGenreInput): Promise<DeleteGenreOutput> {
    await this.genreRepository.delete(new GenreId(input.id));
  }
}

export type DeleteGenreInput = {
  id: string;
};

export type DeleteGenreOutput = void;
