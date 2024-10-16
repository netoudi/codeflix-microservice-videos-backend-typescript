import {
  BadRequestException,
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
  UploadedFiles,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { VideoOutput } from '@/core/video/application/use-cases/common/video-output.mapper';
import { CreateVideoUseCase } from '@/core/video/application/use-cases/create-video/create-video.use-case';
import { DeleteVideoUseCase } from '@/core/video/application/use-cases/delete-video/delete-video.use-case';
import { GetVideoUseCase } from '@/core/video/application/use-cases/get-video/get-video.use-case';
import { ListVideosUseCase } from '@/core/video/application/use-cases/list-video/list-videos.use-case';
import { UpdateVideoUseCase } from '@/core/video/application/use-cases/update-video/update-video.use-case';
import { UploadAudioVideoMediasInput } from '@/core/video/application/use-cases/upload-audio-video-medias/upload-audio-video-medias.input';
import { UploadAudioVideoMediasUseCase } from '@/core/video/application/use-cases/upload-audio-video-medias/upload-audio-video-medias.use-case';
import { CreateVideoDto } from '@/modules/videos-module/dto/create-video.dto';
import { SearchVideosDto } from '@/modules/videos-module/dto/search-videos.dto';
import { UpdateVideoDto } from '@/modules/videos-module/dto/update-video.dto';
import { VideoCollectionPresenter, VideoPresenter } from '@/modules/videos-module/videos.presenter';

@Controller('videos')
export class VideosController {
  @Inject(CreateVideoUseCase)
  private createUseCase: CreateVideoUseCase;

  @Inject(DeleteVideoUseCase)
  private deleteUseCase: DeleteVideoUseCase;

  @Inject(GetVideoUseCase)
  private getUseCase: GetVideoUseCase;

  @Inject(ListVideosUseCase)
  private listUseCase: ListVideosUseCase;

  @Inject(UpdateVideoUseCase)
  private updateUseCase: UpdateVideoUseCase;

  @Inject(UploadAudioVideoMediasUseCase)
  private uploadAudioVideoMedia: UploadAudioVideoMediasUseCase;

  @Post()
  async create(@Body() createVideoDto: CreateVideoDto) {
    const { id } = await this.createUseCase.execute(createVideoDto);
    const output = await this.getUseCase.execute({ id });
    return VideosController.serialize(output);
  }

  @Get()
  async search(@Query() searchParamsDto: SearchVideosDto) {
    const output = await this.listUseCase.execute(searchParamsDto);
    return new VideoCollectionPresenter(output);
  }

  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string) {
    const output = await this.getUseCase.execute({ id });
    return VideosController.serialize(output);
  }

  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string,
    @Body() updateVideoDto: UpdateVideoDto,
  ) {
    await this.updateUseCase.execute({ ...updateVideoDto, id });
    const output = await this.getUseCase.execute({ id });
    return VideosController.serialize(output);
  }

  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'banner', maxCount: 1 },
      { name: 'thumbnail', maxCount: 1 },
      { name: 'thumbnail_half', maxCount: 1 },
      { name: 'trailer', maxCount: 1 },
      { name: 'video', maxCount: 1 },
    ]),
  )
  @Patch(':id/upload')
  async uploadFile(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string,
    @UploadedFiles()
    files: {
      banner?: Express.Multer.File[];
      thumbnail?: Express.Multer.File[];
      thumbnail_half?: Express.Multer.File[];
      trailer?: Express.Multer.File[];
      video?: Express.Multer.File[];
    },
  ) {
    const hasMoreThanOneFile = Object.keys(files).length > 1;

    if (hasMoreThanOneFile) {
      throw new BadRequestException('Only on file can be sent');
    }

    const hasAudioVideoMedia = files.trailer?.length || files.video?.length;
    const fieldField = Object.keys(files)[0];
    const file = files[fieldField][0];

    if (hasAudioVideoMedia) {
      const dto: UploadAudioVideoMediasInput = {
        video_id: id,
        field: fieldField,
        file: {
          raw_name: file.originalname,
          data: file.buffer,
          mime_type: file.mimetype,
          size: file.size,
        },
      };
      const input = await new ValidationPipe({ errorHttpStatusCode: 422 }).transform(dto, {
        metatype: UploadAudioVideoMediasInput,
        type: 'body',
      });
      await this.uploadAudioVideoMedia.execute(input);
    }

    const output = await this.getUseCase.execute({ id });
    return VideosController.serialize(output);
  }

  @HttpCode(204)
  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string) {
    return this.deleteUseCase.execute({ id });
  }

  static serialize(output: VideoOutput) {
    return new VideoPresenter(output);
  }
}
