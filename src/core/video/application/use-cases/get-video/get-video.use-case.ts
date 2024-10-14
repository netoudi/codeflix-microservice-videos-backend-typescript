import { ICastMemberRepository } from '@/core/cast-member/domain/cast-member.repository';
import { ICategoryRepository } from '@/core/category/domain/category.repository';
import { IGenreRepository } from '@/core/genre/domain/genre.repository';
import { IUseCase } from '@/core/shared/application/use-case.interface';
import { NotFoundError } from '@/core/shared/domain/errors/not-found';
import { VideoOutput, VideoOutputMapper } from '@/core/video/application/use-cases/common/video-output.mapper';
import { Video, VideoId } from '@/core/video/domain/video.aggregate';
import { IVideoRepository } from '@/core/video/domain/video.repository';

export class GetVideoUseCase implements IUseCase<GetVideoInput, GetVideoOutput> {
  constructor(
    private readonly videoRepository: IVideoRepository,
    private readonly categoryRepository: ICategoryRepository,
    private readonly genreRepository: IGenreRepository,
    private readonly castMemberRepository: ICastMemberRepository,
  ) {}

  async execute(input: GetVideoInput): Promise<GetVideoOutput> {
    const video = await this.videoRepository.findById(new VideoId(input.id));

    if (!video) throw new NotFoundError(input.id, Video);

    const categories = await this.categoryRepository.findByIds(Array.from(video.categories_id.values()));
    const genres = await this.genreRepository.findByIds(Array.from(video.genres_id.values()));
    const cast_members = await this.castMemberRepository.findByIds(Array.from(video.cast_members_id.values()));

    return VideoOutputMapper.toOutput(video, categories, genres, cast_members);
  }
}

export type GetVideoInput = {
  id: string;
};

export type GetVideoOutput = VideoOutput;
