import { UpdateGenreUseCase } from '@/core/genre/application/use-cases/update-genre/update-genre.use-case';
import { Genre } from '@/core/genre/domain/genre.aggregate';
import { GenreInMemoryRepository } from '@/core/genre/infra/db/in-memory/genre-in-memory.repository';
import { NotFoundError } from '@/core/shared/domain/errors/not-found';
import { InvalidUuidError, Uuid } from '@/core/shared/domain/value-objects/uuid.vo';

describe('UpdateGenreUseCase Unit Tests', () => {
  let useCase: UpdateGenreUseCase;
  let repository: GenreInMemoryRepository;

  beforeEach(() => {
    repository = new GenreInMemoryRepository();
    useCase = new UpdateGenreUseCase(repository);
  });

  it('should throw error when genre is not valid', async () => {
    const genre = new Genre({ name: 'Movie' });
    repository.items = [genre];
    const input = { id: genre.id.value, name: 'x'.repeat(256) };
    await expect(useCase.execute(input)).rejects.toThrow('Entity Validation Error');
  });

  it('should throw error when entity not found', async () => {
    await expect(useCase.execute({ id: 'fake-id', name: 'test' })).rejects.toThrow(new InvalidUuidError());
    const uuid = new Uuid();
    await expect(useCase.execute({ id: uuid.value, name: 'test' })).rejects.toThrow(
      new NotFoundError(uuid.value, Genre),
    );
  });

  it('should update a genre', async () => {
    const spyInsert = jest.spyOn(repository, 'update');
    const genre = new Genre({ name: 'Movie' });
    repository.items = [genre];
    const output = await useCase.execute({ id: genre.id.value, name: 'test' });
    expect(spyInsert).toHaveBeenCalledTimes(1);
    expect(output).toStrictEqual({
      id: genre.id.value,
      name: 'test',
      description: null,
      is_active: true,
      created_at: genre.created_at,
    });
    type Arrange = {
      input: {
        id: string;
        name?: string;
        description?: string | null;
        is_active?: boolean;
      };
      output: {
        id: string;
        name: string;
        description: string | null;
        is_active: boolean;
        created_at: Date;
      };
    };
    const arrange: Arrange[] = [
      {
        input: {
          id: genre.id.value,
          name: 'test',
          description: 'some description',
        },
        output: {
          id: genre.id.value,
          name: 'test',
          description: 'some description',
          is_active: true,
          created_at: genre.created_at,
        },
      },
      {
        input: {
          id: genre.id.value,
          name: 'test',
        },
        output: {
          id: genre.id.value,
          name: 'test',
          description: 'some description',
          is_active: true,
          created_at: genre.created_at,
        },
      },
      {
        input: {
          id: genre.id.value,
          name: 'test',
          is_active: false,
        },
        output: {
          id: genre.id.value,
          name: 'test',
          description: 'some description',
          is_active: false,
          created_at: genre.created_at,
        },
      },
      {
        input: {
          id: genre.id.value,
          name: 'test',
        },
        output: {
          id: genre.id.value,
          name: 'test',
          description: 'some description',
          is_active: false,
          created_at: genre.created_at,
        },
      },
      {
        input: {
          id: genre.id.value,
          name: 'test',
          is_active: true,
        },
        output: {
          id: genre.id.value,
          name: 'test',
          description: 'some description',
          is_active: true,
          created_at: genre.created_at,
        },
      },
      {
        input: {
          id: genre.id.value,
          name: 'test',
          description: 'some description',
          is_active: false,
        },
        output: {
          id: genre.id.value,
          name: 'test',
          description: 'some description',
          is_active: false,
          created_at: genre.created_at,
        },
      },
      {
        input: {
          id: genre.id.value,
          description: null,
        },
        output: {
          id: genre.id.value,
          name: 'test',
          description: null,
          is_active: false,
          created_at: genre.created_at,
        },
      },
    ];
    for (const i of arrange) {
      const output = await useCase.execute({
        id: i.input.id,
        ...('name' in i.input && { name: i.input.name }),
        ...('description' in i.input && { description: i.input.description }),
        ...('is_active' in i.input && { is_active: i.input.is_active }),
      });
      expect(output).toStrictEqual(i.output);
    }
  });
});
