import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CastMemberOutput } from '@/core/cast-member/application/use-cases/common/cast-member-output.mapper';
import { CreateCastMemberUseCase } from '@/core/cast-member/application/use-cases/create-cast-member/create-cast-member.use-case';
import { DeleteCastMemberUseCase } from '@/core/cast-member/application/use-cases/delete-cast-member/delete-cast-member.use-case';
import { GetCastMemberUseCase } from '@/core/cast-member/application/use-cases/get-cast-member/get-cast-member.use-case';
import { ListCastMembersUseCase } from '@/core/cast-member/application/use-cases/list-cast-member/list-cast-members.use-case';
import { UpdateCastMemberUseCase } from '@/core/cast-member/application/use-cases/update-cast-member/update-cast-member.use-case';
import {
  CastMemberPresenter,
  CastMemberCollectionPresenter,
} from '@/modules/cast-members-module/cast-members.presenter';
import { CreateCastMemberDto } from '@/modules/cast-members-module/dto/create-cast-member.dto';
import { SearchCastMembersDto } from '@/modules/cast-members-module/dto/search-cast-members.dto';
import { UpdateCastMemberDto } from '@/modules/cast-members-module/dto/update-cast-member.dto';

@Controller('cast-members')
export class CastMembersController {
  @Inject(CreateCastMemberUseCase)
  private createUseCase: CreateCastMemberUseCase;

  @Inject(DeleteCastMemberUseCase)
  private deleteUseCase: DeleteCastMemberUseCase;

  @Inject(GetCastMemberUseCase)
  private getUseCase: GetCastMemberUseCase;

  @Inject(ListCastMembersUseCase)
  private listUseCase: ListCastMembersUseCase;

  @Inject(UpdateCastMemberUseCase)
  private updateUseCase: UpdateCastMemberUseCase;

  @Post()
  async create(@Body() createCastMemberDto: CreateCastMemberDto) {
    const output = await this.createUseCase.execute(createCastMemberDto);
    return CastMembersController.serialize(output);
  }

  @Get()
  async search(@Query() searchParamsDto: SearchCastMembersDto) {
    const output = await this.listUseCase.execute(searchParamsDto);
    return new CastMemberCollectionPresenter(output);
  }

  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string) {
    const output = await this.getUseCase.execute({ id });
    return CastMembersController.serialize(output);
  }

  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string,
    @Body() updateCastMemberDto: UpdateCastMemberDto,
  ) {
    const output = await this.updateUseCase.execute({ ...updateCastMemberDto, id });
    return CastMembersController.serialize(output);
  }

  @HttpCode(204)
  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string) {
    return this.deleteUseCase.execute({ id });
  }

  static serialize(output: CastMemberOutput) {
    return new CastMemberPresenter(output);
  }
}
