import { CastMemberId } from '@/core/cast-member/domain/cast-member.entity';
import { ICastMemberRepository } from '@/core/cast-member/domain/cast-member.repository';
import { CategoryId } from '@/core/category/domain/category.entity';
import { ICategoryRepository } from '@/core/category/domain/category.repository';
import { GenreId } from '@/core/genre/domain/genre.aggregate';
import { IGenreRepository } from '@/core/genre/domain/genre.repository';
import { PaginationOutput, PaginationOutputMapper } from '@/core/shared/application/pagination-output.mapper';
import { IUseCase } from '@/core/shared/application/use-case.interface';
import { VideoOutput, VideoOutputMapper } from '@/core/video/application/use-cases/common/video-output.mapper';
import { ListVideosInput } from '@/core/video/application/use-cases/list-video/list-videos.input';
import { IVideoRepository, VideoSearchParams, VideoSearchResult } from '@/core/video/domain/video.repository';

export class ListVideosUseCase implements IUseCase<ListVideosInput, ListVideosOutput> {
  constructor(
    private readonly videoRepository: IVideoRepository,
    private readonly categoryRepository: ICategoryRepository,
    private readonly genreRepository: IGenreRepository,
    private readonly castMemberRepository: ICastMemberRepository,
  ) {}

  async execute(input: ListVideosInput): Promise<ListVideosOutput> {
    const result = await this.videoRepository.search(VideoSearchParams.create(input));
    return this.toOutput(result);
  }

  private async toOutput(searchResult: VideoSearchResult): Promise<ListVideosOutput> {
    const { items: _items } = searchResult;
    const categoriesIdRelated = searchResult.items.reduce<CategoryId[]>(
      (acc, item) => acc.concat([...item.categories_id.values()]),
      [],
    );
    const genresIdRelated = searchResult.items.reduce<GenreId[]>(
      (acc, item) => acc.concat([...item.genres_id.values()]),
      [],
    );
    const castMembersIdRelated = searchResult.items.reduce<CastMemberId[]>(
      (acc, item) => acc.concat([...item.cast_members_id.values()]),
      [],
    );
    const categoriesRelated = await this.categoryRepository.findByIds(categoriesIdRelated);
    const genresRelated = await this.genreRepository.findByIds(genresIdRelated);
    const castMembersRelated = await this.castMemberRepository.findByIds(castMembersIdRelated);
    const items = _items.map((i) => {
      const categoriesOfVideo = categoriesRelated.filter((c) => i.categories_id.has(c.id.value));
      const genresOfVideo = genresRelated.filter((c) => i.genres_id.has(c.id.value));
      const castMembersOfVideo = castMembersRelated.filter((c) => i.cast_members_id.has(c.id.value));
      return VideoOutputMapper.toOutput(i, categoriesOfVideo, genresOfVideo, castMembersOfVideo);
    });
    return PaginationOutputMapper.toOutput(items, searchResult);
  }
}

export type ListVideosOutput = PaginationOutput<VideoOutput>;
