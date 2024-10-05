import { CreateGenreInput } from '@/core/genre/application/use-cases/create-genre/create-genre.input';
import { CreateGenreOutput } from '@/core/genre/application/use-cases/create-genre/create-genre.use-case';
import { GetGenreOutput } from '@/core/genre/application/use-cases/get-genre/get-genre.use-case';
import { ListGenresOutput } from '@/core/genre/application/use-cases/list-genre/list-genres.use-case';
import { UpdateGenreInput } from '@/core/genre/application/use-cases/update-genre/update-genre.input';
import { UpdateGenreOutput } from '@/core/genre/application/use-cases/update-genre/update-genre.use-case';
import { SearchGenresDto } from '@/modules/genres-module/dto/search-genres.dto';
import { GenresController } from '@/modules/genres-module/genres.controller';
import { GenreCollectionPresenter, GenrePresenter } from '@/modules/genres-module/genres.presenter';

describe('GenresController Unit Tests', () => {
  let controller: GenresController;

  beforeEach(async () => {
    controller = new GenresController();
  });

  it('should create a genre', async () => {
    const output: CreateGenreOutput = {
      id: 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3',
      name: 'Movie',
      description: 'some description',
      is_active: true,
      created_at: new Date(),
    };
    const mockCreateUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };
    //@ts-expect-error defined part of methods
    controller['createUseCase'] = mockCreateUseCase;
    const input: CreateGenreInput = {
      name: 'Movie',
      description: 'some description',
      is_active: true,
    };
    const presenter = await controller.create(input);
    expect(mockCreateUseCase.execute).toHaveBeenCalledWith(input);
    expect(presenter).toBeInstanceOf(GenrePresenter);
    expect(presenter).toStrictEqual(new GenrePresenter(output));
  });

  it('should update a genre', async () => {
    const id = 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3';
    const output: UpdateGenreOutput = {
      id,
      name: 'Movie',
      description: 'some description',
      is_active: true,
      created_at: new Date(),
    };
    const mockUpdateUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };
    //@ts-expect-error defined part of methods
    controller['updateUseCase'] = mockUpdateUseCase;
    const input: Omit<UpdateGenreInput, 'id'> = {
      name: 'Movie',
      description: 'some description',
      is_active: true,
    };
    const presenter = await controller.update(id, input);
    expect(mockUpdateUseCase.execute).toHaveBeenCalledWith({ id, ...input });
    expect(presenter).toBeInstanceOf(GenrePresenter);
    expect(presenter).toStrictEqual(new GenrePresenter(output));
  });

  it('should get a genre', async () => {
    const id = 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3';
    const output: GetGenreOutput = {
      id,
      name: 'Movie',
      description: 'some description',
      is_active: true,
      created_at: new Date(),
    };
    const mockGetUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };
    //@ts-expect-error defined part of methods
    controller['getUseCase'] = mockGetUseCase;
    const presenter = await controller.findOne(id);
    expect(mockGetUseCase.execute).toHaveBeenCalledWith({ id });
    expect(presenter).toBeInstanceOf(GenrePresenter);
    expect(presenter).toStrictEqual(new GenrePresenter(output));
  });

  it('should list genres', async () => {
    const output: ListGenresOutput = {
      items: [
        {
          id: 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3',
          name: 'Movie',
          description: 'some description',
          is_active: true,
          created_at: new Date(),
        },
      ],
      current_page: 1,
      last_page: 1,
      per_page: 1,
      total: 1,
    };
    const mockListUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };
    //@ts-expect-error defined part of methods
    controller['listUseCase'] = mockListUseCase;
    const searchParams: SearchGenresDto = {
      page: 1,
      per_page: 1,
      sort: 'name',
      sort_dir: 'asc',
      filter: 'test',
    };
    const presenter = await controller.search(searchParams);
    expect(mockListUseCase.execute).toHaveBeenCalledWith(searchParams);
    expect(presenter).toBeInstanceOf(GenreCollectionPresenter);
    expect(presenter).toStrictEqual(new GenreCollectionPresenter(output));
  });

  it('should delete a genre', async () => {
    const expectedOutput = undefined;
    const mockDeleteUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(expectedOutput)),
    };
    //@ts-expect-error defined part of methods
    controller['deleteUseCase'] = mockDeleteUseCase;
    const id = 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3';
    const output = await controller.remove(id);
    expect(controller.remove(id)).toBeInstanceOf(Promise);
    expect(mockDeleteUseCase.execute).toHaveBeenCalledWith({ id });
    expect(output).toStrictEqual(expectedOutput);
  });
});
