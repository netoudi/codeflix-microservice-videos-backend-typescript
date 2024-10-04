import { DeleteGenreUseCase } from '@/core/genre/application/use-cases/delete-genre/delete-genre.use-case';
import { Genre, GenreId } from '@/core/genre/domain/genre.aggregate';
import { GenreInMemoryRepository } from '@/core/genre/infra/db/in-memory/genre-in-memory.repository';
import { NotFoundError } from '@/core/shared/domain/errors/not-found';
import { FakeUnitOfWorkInMemory } from '@/core/shared/infra/db/in-memory/fake-unit-of-work-in-memory';

describe('DeleteGenreUseCase Unit Tests', () => {
  let uow: FakeUnitOfWorkInMemory;
  let genreRepository: GenreInMemoryRepository;
  let useCase: DeleteGenreUseCase;

  beforeEach(() => {
    uow = new FakeUnitOfWorkInMemory();
    genreRepository = new GenreInMemoryRepository();
    useCase = new DeleteGenreUseCase(uow, genreRepository);
  });

  it('should throw error when entity not found', async () => {
    const genreId = new GenreId();
    await expect(() => useCase.execute({ id: genreId.value })).rejects.toThrow(new NotFoundError(genreId.value, Genre));
  });

  it('should delete a genre', async () => {
    const items = [Genre.fake().aGenre().build()];
    genreRepository.items = items;
    const spyOnDo = jest.spyOn(uow, 'do');
    await useCase.execute({
      id: items[0].id.value,
    });
    expect(spyOnDo).toBeCalledTimes(1);
    expect(genreRepository.items).toHaveLength(0);
  });
});
