import { IUseCase } from '@/core/shared/application/use-case.interface';
import { IUnitOfWork } from '@/core/shared/domain/repository/unit-of-work.interface';
import { VideoId } from '@/core/video/domain/video.aggregate';
import { IVideoRepository } from '@/core/video/domain/video.repository';

export class DeleteVideoUseCase implements IUseCase<DeleteVideoInput, DeleteVideoOutput> {
  constructor(
    private readonly uow: IUnitOfWork,
    private readonly videoRepository: IVideoRepository,
  ) {}

  async execute(input: DeleteVideoInput): Promise<DeleteVideoOutput> {
    return this.uow.do(async () => {
      return this.videoRepository.delete(new VideoId(input.id));
    });
  }
}

export type DeleteVideoInput = {
  id: string;
};

export type DeleteVideoOutput = void;
