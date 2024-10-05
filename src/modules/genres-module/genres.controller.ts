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
import { GenreOutput } from '@/core/genre/application/use-cases/common/genre-output.mapper';
import { CreateGenreUseCase } from '@/core/genre/application/use-cases/create-genre/create-genre.use-case';
import { DeleteGenreUseCase } from '@/core/genre/application/use-cases/delete-genre/delete-genre.use-case';
import { GetGenreUseCase } from '@/core/genre/application/use-cases/get-genre/get-genre.use-case';
import { ListGenresUseCase } from '@/core/genre/application/use-cases/list-genre/list-genres.use-case';
import { UpdateGenreUseCase } from '@/core/genre/application/use-cases/update-genre/update-genre.use-case';
import { CreateGenreDto } from '@/modules/genres-module/dto/create-genre.dto';
import { SearchGenresDto } from '@/modules/genres-module/dto/search-genres.dto';
import { UpdateGenreDto } from '@/modules/genres-module/dto/update-genre.dto';
import { GenrePresenter, GenreCollectionPresenter } from '@/modules/genres-module/genres.presenter';

@Controller('genres')
export class GenresController {
  @Inject(CreateGenreUseCase)
  private createUseCase: CreateGenreUseCase;

  @Inject(DeleteGenreUseCase)
  private deleteUseCase: DeleteGenreUseCase;

  @Inject(GetGenreUseCase)
  private getUseCase: GetGenreUseCase;

  @Inject(ListGenresUseCase)
  private listUseCase: ListGenresUseCase;

  @Inject(UpdateGenreUseCase)
  private updateUseCase: UpdateGenreUseCase;

  @Post()
  async create(@Body() createGenreDto: CreateGenreDto) {
    const output = await this.createUseCase.execute(createGenreDto);
    return GenresController.serialize(output);
  }

  @Get()
  async search(@Query() searchParamsDto: SearchGenresDto) {
    const output = await this.listUseCase.execute(searchParamsDto);
    return new GenreCollectionPresenter(output);
  }

  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string) {
    const output = await this.getUseCase.execute({ id });
    return GenresController.serialize(output);
  }

  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string,
    @Body() updateGenreDto: UpdateGenreDto,
  ) {
    const output = await this.updateUseCase.execute({ ...updateGenreDto, id });
    return GenresController.serialize(output);
  }

  @HttpCode(204)
  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string) {
    return this.deleteUseCase.execute({ id });
  }

  static serialize(output: GenreOutput) {
    return new GenrePresenter(output);
  }
}
