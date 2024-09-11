import { CreateCategoryInput } from '@/core/category/application/use-cases/create-category/create-category.input';
import { CreateCategoryOutput } from '@/core/category/application/use-cases/create-category/create-category.use-case';
import { GetCategoryOutput } from '@/core/category/application/use-cases/get-category/get-category.use-case';
import { ListCategoriesOutput } from '@/core/category/application/use-cases/list-category/list-categories.use-case';
import { UpdateCategoryInput } from '@/core/category/application/use-cases/update-category/update-category.input';
import { UpdateCategoryOutput } from '@/core/category/application/use-cases/update-category/update-category.use-case';
import { CategoriesController } from '@/modules/categories-module/categories.controller';
import { CategoryCollectionPresenter, CategoryPresenter } from '@/modules/categories-module/categories.presenter';
import { SearchCategoriesDto } from '@/modules/categories-module/dto/search-categories.dto';

describe('CategoriesController Unit Tests', () => {
  let controller: CategoriesController;

  beforeEach(async () => {
    controller = new CategoriesController();
  });

  it('should create a category', async () => {
    const output: CreateCategoryOutput = {
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
    const input: CreateCategoryInput = {
      name: 'Movie',
      description: 'some description',
      is_active: true,
    };
    const presenter = await controller.create(input);
    expect(mockCreateUseCase.execute).toHaveBeenCalledWith(input);
    expect(presenter).toBeInstanceOf(CategoryPresenter);
    expect(presenter).toStrictEqual(new CategoryPresenter(output));
  });

  it('should update a category', async () => {
    const id = 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3';
    const output: UpdateCategoryOutput = {
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
    const input: Omit<UpdateCategoryInput, 'id'> = {
      name: 'Movie',
      description: 'some description',
      is_active: true,
    };
    const presenter = await controller.update(id, input);
    expect(mockUpdateUseCase.execute).toHaveBeenCalledWith({ id, ...input });
    expect(presenter).toBeInstanceOf(CategoryPresenter);
    expect(presenter).toStrictEqual(new CategoryPresenter(output));
  });

  it('should get a category', async () => {
    const id = 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3';
    const output: GetCategoryOutput = {
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
    expect(presenter).toBeInstanceOf(CategoryPresenter);
    expect(presenter).toStrictEqual(new CategoryPresenter(output));
  });

  it('should list categories', async () => {
    const output: ListCategoriesOutput = {
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
    const searchParams: SearchCategoriesDto = {
      page: 1,
      per_page: 1,
      sort: 'name',
      sort_dir: 'asc',
      filter: 'test',
    };
    const presenter = await controller.search(searchParams);
    expect(mockListUseCase.execute).toHaveBeenCalledWith(searchParams);
    expect(presenter).toBeInstanceOf(CategoryCollectionPresenter);
    expect(presenter).toStrictEqual(new CategoryCollectionPresenter(output));
  });

  it('should delete a category', async () => {
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
