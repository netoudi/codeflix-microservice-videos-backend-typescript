import { CreateCastMemberInput } from '@/core/cast-member/application/use-cases/create-cast-member/create-cast-member.input';
import { CreateCastMemberOutput } from '@/core/cast-member/application/use-cases/create-cast-member/create-cast-member.use-case';
import { GetCastMemberOutput } from '@/core/cast-member/application/use-cases/get-cast-member/get-cast-member.use-case';
import { ListCastMembersOutput } from '@/core/cast-member/application/use-cases/list-cast-member/list-cast-members.use-case';
import { UpdateCastMemberInput } from '@/core/cast-member/application/use-cases/update-cast-member/update-cast-member.input';
import { UpdateCastMemberOutput } from '@/core/cast-member/application/use-cases/update-cast-member/update-cast-member.use-case';
import { CastMembersController } from '@/modules/cast-members-module/cast-members.controller';
import {
  CastMemberCollectionPresenter,
  CastMemberPresenter,
} from '@/modules/cast-members-module/cast-members.presenter';
import { SearchCastMembersDto } from '@/modules/cast-members-module/dto/search-cast-members.dto';

describe('CastMembersController Unit Tests', () => {
  let controller: CastMembersController;

  beforeEach(async () => {
    controller = new CastMembersController();
  });

  it('should create a cast member', async () => {
    const output: CreateCastMemberOutput = {
      id: 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3',
      name: 'John Doe',
      type: 1,
      created_at: new Date(),
    };
    const mockCreateUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };
    //@ts-expect-error defined part of methods
    controller['createUseCase'] = mockCreateUseCase;
    const input: CreateCastMemberInput = {
      name: 'John Doe',
      type: 1,
    };
    const presenter = await controller.create(input);
    expect(mockCreateUseCase.execute).toHaveBeenCalledWith(input);
    expect(presenter).toBeInstanceOf(CastMemberPresenter);
    expect(presenter).toStrictEqual(new CastMemberPresenter(output));
  });

  it('should update a cast member', async () => {
    const id = 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3';
    const output: UpdateCastMemberOutput = {
      id,
      name: 'John Doe',
      type: 1,
      created_at: new Date(),
    };
    const mockUpdateUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };
    //@ts-expect-error defined part of methods
    controller['updateUseCase'] = mockUpdateUseCase;
    const input: Omit<UpdateCastMemberInput, 'id'> = {
      name: 'John Doe',
      type: 1,
    };
    const presenter = await controller.update(id, input);
    expect(mockUpdateUseCase.execute).toHaveBeenCalledWith({ id, ...input });
    expect(presenter).toBeInstanceOf(CastMemberPresenter);
    expect(presenter).toStrictEqual(new CastMemberPresenter(output));
  });

  it('should get a cast member', async () => {
    const id = 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3';
    const output: GetCastMemberOutput = {
      id,
      name: 'John Doe',
      type: 1,
      created_at: new Date(),
    };
    const mockGetUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };
    //@ts-expect-error defined part of methods
    controller['getUseCase'] = mockGetUseCase;
    const presenter = await controller.findOne(id);
    expect(mockGetUseCase.execute).toHaveBeenCalledWith({ id });
    expect(presenter).toBeInstanceOf(CastMemberPresenter);
    expect(presenter).toStrictEqual(new CastMemberPresenter(output));
  });

  it('should list cast members', async () => {
    const output: ListCastMembersOutput = {
      items: [
        {
          id: 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3',
          name: 'John Doe',
          type: 1,
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
    const searchParams: SearchCastMembersDto = {
      page: 1,
      per_page: 1,
      sort: 'name',
      sort_dir: 'asc',
      filter: { name: 'test' },
    };
    const presenter = await controller.search(searchParams);
    expect(mockListUseCase.execute).toHaveBeenCalledWith(searchParams);
    expect(presenter).toBeInstanceOf(CastMemberCollectionPresenter);
    expect(presenter).toStrictEqual(new CastMemberCollectionPresenter(output));
  });

  it('should delete a cast member', async () => {
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
