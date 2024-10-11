import { CastMember } from '@/core/cast-member/domain/cast-member.entity';
import { ICastMemberRepository } from '@/core/cast-member/domain/cast-member.repository';
import { CastMemberSequelizeRepository } from '@/core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { CastMemberModel } from '@/core/cast-member/infra/db/sequelize/cast-member.model';
import { Category } from '@/core/category/domain/category.entity';
import { ICategoryRepository } from '@/core/category/domain/category.repository';
import { CategorySequelizeRepository } from '@/core/category/infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '@/core/category/infra/db/sequelize/category.model';
import { Genre } from '@/core/genre/domain/genre.aggregate';
import { IGenreRepository } from '@/core/genre/domain/genre.repository';
import { GenreSequelizeRepository } from '@/core/genre/infra/db/sequelize/genre-sequelize.repository';
import { GenreModel } from '@/core/genre/infra/db/sequelize/genre.model';
import { LoadEntityError } from '@/core/shared/domain/validators/validation.error';
import { AudioVideoMediaStatus } from '@/core/shared/domain/value-objects/audio-video-media.vo';
import { FakeUnitOfWorkInMemory } from '@/core/shared/infra/db/in-memory/fake-unit-of-work-in-memory';
import { Banner } from '@/core/video/domain/banner.vo';
import { Rating, RatingValues } from '@/core/video/domain/rating.vo';
import { ThumbnailHalf } from '@/core/video/domain/thumbnail-half.vo';
import { Thumbnail } from '@/core/video/domain/thumbnail.vo';
import { TrailerMedia } from '@/core/video/domain/trailer-media.vo';
import { VideoMedia } from '@/core/video/domain/video-media.vo';
import { Video, VideoId } from '@/core/video/domain/video.aggregate';
import {
  AudioVideoMediaModel,
  AudioVideoMediaRelatedField,
} from '@/core/video/infra/db/sequelize/audio-video-media.model';
import { ImageMediaModel, ImageMediaRelatedField } from '@/core/video/infra/db/sequelize/image-media.model';
import { setupSequelizeForVideo } from '@/core/video/infra/db/sequelize/testing/helpers';
import { VideoModelMapper } from '@/core/video/infra/db/sequelize/video-model.mapper';
import {
  VideoCastMemberModel,
  VideoCategoryModel,
  VideoGenreModel,
  VideoModel,
} from '@/core/video/infra/db/sequelize/video.model';

describe('VideoModelMapper Unit Tests', () => {
  let categoryRepository: ICategoryRepository;
  let genreRepository: IGenreRepository;
  let castMemberRepository: ICastMemberRepository;
  setupSequelizeForVideo();

  beforeEach(() => {
    categoryRepository = new CategorySequelizeRepository(CategoryModel);
    castMemberRepository = new CastMemberSequelizeRepository(CastMemberModel);
    genreRepository = new GenreSequelizeRepository(GenreModel, new FakeUnitOfWorkInMemory() as any);
  });

  it('should throws error when video is invalid', () => {
    const arrange = [
      {
        makeModel: () => {
          return VideoModel.build({
            id: '9366b7dc-2d71-4799-b91c-c64adb205104',
            title: 't'.repeat(256),
            categories_id: [],
            genres_id: [],
            cast_members_id: [],
          } as any);
        },
        expectedErrors: [
          {
            categories_id: ['categories_id should not be empty'],
          },
          {
            genres_id: ['genres_id should not be empty'],
          },
          {
            cast_members_id: ['cast_members_id should not be empty'],
          },
          {
            rating: [
              `The rating must be one of the following values: ${Object.values(RatingValues).join(', ')}, passed value: undefined`,
            ],
          },
          {
            title: ['title must be shorter than or equal to 255 characters'],
          },
        ],
      },
    ];

    for (const item of arrange) {
      try {
        VideoModelMapper.toEntity(item.makeModel());
        fail('The genre is valid, but it needs throws a LoadEntityError');
      } catch (e) {
        expect(e).toBeInstanceOf(LoadEntityError);
        expect(e.errors).toMatchObject(item.expectedErrors);
      }
    }
  });

  it('should convert a video model to a video entity', async () => {
    const category1 = Category.fake().aCategory().build();
    await categoryRepository.bulkInsert([category1]);
    const genre1 = Genre.fake().aGenre().addCategoryId(category1.id).build();
    await genreRepository.bulkInsert([genre1]);
    const castMember1 = CastMember.fake().anActor().build();
    await castMemberRepository.bulkInsert([castMember1]);

    const videoProps = {
      id: new VideoId().value,
      title: 'title',
      description: 'description',
      year_launched: 2020,
      duration: 90,
      rating: RatingValues.R10,
      is_opened: false,
      is_published: false,
      created_at: new Date(),
    };

    let model = await VideoModel.create(
      {
        ...videoProps,
        categories_id: [
          VideoCategoryModel.build({
            video_id: videoProps.id,
            category_id: category1.id.value,
          }),
        ],
        genres_id: [
          VideoGenreModel.build({
            video_id: videoProps.id,
            genre_id: genre1.id.value,
          }),
        ],
        cast_members_id: [
          VideoCastMemberModel.build({
            video_id: videoProps.id,
            cast_member_id: castMember1.id.value,
          }),
        ],
      } as any,
      { include: ['categories_id', 'genres_id', 'cast_members_id'] },
    );
    let entity = VideoModelMapper.toEntity(model);
    expect(entity.toJSON()).toEqual(
      new Video({
        id: new VideoId(model.id),
        title: videoProps.title,
        description: videoProps.description,
        year_launched: videoProps.year_launched,
        duration: videoProps.duration,
        rating: Rating.createR10(),
        is_opened: videoProps.is_opened,
        is_published: videoProps.is_published,
        created_at: videoProps.created_at,
        categories_id: new Map([[category1.id.value, category1.id]]),
        genres_id: new Map([[genre1.id.value, genre1.id]]),
        cast_members_id: new Map([[castMember1.id.value, castMember1.id]]),
      }).toJSON(),
    );

    videoProps.id = new VideoId().value;
    model = await VideoModel.create(
      {
        ...videoProps,
        image_medias: [
          ImageMediaModel.build({
            video_id: videoProps.id,
            location: 'location banner',
            name: 'name banner',
            video_related_field: ImageMediaRelatedField.BANNER,
          } as any),
          ImageMediaModel.build({
            video_id: videoProps.id,
            location: 'location thumbnail',
            name: 'name thumbnail',
            video_related_field: ImageMediaRelatedField.THUMBNAIL,
          } as any),
          ImageMediaModel.build({
            video_id: videoProps.id,
            location: 'location thumbnail half',
            name: 'name thumbnail half',
            video_related_field: ImageMediaRelatedField.THUMBNAIL_HALF,
          } as any),
        ],
        audio_video_medias: [
          AudioVideoMediaModel.build({
            video_id: videoProps.id,
            name: 'name trailer',
            raw_location: 'raw_location trailer',
            encoded_location: 'encoded_location trailer',
            status: AudioVideoMediaStatus.COMPLETED,
            video_related_field: AudioVideoMediaRelatedField.TRAILER,
          } as any),
          AudioVideoMediaModel.build({
            video_id: videoProps.id,
            name: 'name video',
            raw_location: 'raw_location video',
            encoded_location: 'encoded_location video',
            status: AudioVideoMediaStatus.COMPLETED,
            video_related_field: AudioVideoMediaRelatedField.VIDEO,
          } as any),
        ],
        categories_id: [
          VideoCategoryModel.build({
            video_id: videoProps.id,
            category_id: category1.id.value,
          }),
        ],
        genres_id: [
          VideoGenreModel.build({
            video_id: videoProps.id,
            genre_id: genre1.id.value,
          }),
        ],
        cast_members_id: [
          VideoCastMemberModel.build({
            video_id: videoProps.id,
            cast_member_id: castMember1.id.value,
          }),
        ],
      },
      {
        include: ['categories_id', 'genres_id', 'cast_members_id', 'image_medias', 'audio_video_medias'],
      },
    );

    entity = VideoModelMapper.toEntity(model);
    expect(entity.toJSON()).toEqual(
      new Video({
        id: new VideoId(model.id),
        title: videoProps.title,
        description: videoProps.description,
        year_launched: videoProps.year_launched,
        duration: videoProps.duration,
        rating: Rating.createR10(),
        is_opened: videoProps.is_opened,
        is_published: videoProps.is_published,
        created_at: videoProps.created_at,
        banner: new Banner({
          location: 'location banner',
          name: 'name banner',
        }),
        thumbnail: new Thumbnail({
          location: 'location thumbnail',
          name: 'name thumbnail',
        }),
        thumbnail_half: new ThumbnailHalf({
          location: 'location thumbnail half',
          name: 'name thumbnail half',
        }),
        trailer: new TrailerMedia({
          name: 'name trailer',
          raw_location: 'raw_location trailer',
          encoded_location: 'encoded_location trailer',
          status: AudioVideoMediaStatus.COMPLETED,
        }),
        video: new VideoMedia({
          name: 'name video',
          raw_location: 'raw_location video',
          encoded_location: 'encoded_location video',
          status: AudioVideoMediaStatus.COMPLETED,
        }),
        categories_id: new Map([[category1.id.value, category1.id]]),
        genres_id: new Map([[genre1.id.value, genre1.id]]),
        cast_members_id: new Map([[castMember1.id.value, castMember1.id]]),
      }).toJSON(),
    );
  });

  it('should convert a video entity to a video model', async () => {
    const category1 = Category.fake().aCategory().build();
    await categoryRepository.bulkInsert([category1]);
    const genre1 = Genre.fake().aGenre().addCategoryId(category1.id).build();
    await genreRepository.bulkInsert([genre1]);
    const castMember1 = CastMember.fake().anActor().build();
    await castMemberRepository.bulkInsert([castMember1]);

    const videoProps = {
      id: new VideoId(),
      title: 'title',
      description: 'description',
      year_launched: 2020,
      duration: 90,
      rating: Rating.createR10(),
      is_opened: false,
      is_published: false,
      created_at: new Date(),
    };

    let entity = new Video({
      ...videoProps,
      categories_id: new Map([[category1.id.value, category1.id]]),
      genres_id: new Map([[genre1.id.value, genre1.id]]),
      cast_members_id: new Map([[castMember1.id.value, castMember1.id]]),
    });

    const model = VideoModelMapper.toModel(entity);
    expect(model).toEqual({
      id: videoProps.id.value,
      title: videoProps.title,
      description: videoProps.description,
      year_launched: videoProps.year_launched,
      duration: videoProps.duration,
      rating: videoProps.rating.value,
      is_opened: videoProps.is_opened,
      is_published: videoProps.is_published,
      created_at: videoProps.created_at,
      audio_video_medias: [],
      image_medias: [],
      categories_id: [
        VideoCategoryModel.build({
          video_id: videoProps.id.value,
          category_id: category1.id.value,
        }),
      ],
      genres_id: [
        VideoGenreModel.build({
          video_id: videoProps.id.value,
          genre_id: genre1.id.value,
        }),
      ],
      cast_members_id: [
        VideoCastMemberModel.build({
          video_id: videoProps.id.value,
          cast_member_id: castMember1.id.value,
        }),
      ],
    });

    entity = new Video({
      ...videoProps,
      banner: new Banner({
        location: 'location banner',
        name: 'name banner',
      }),
      thumbnail: new Thumbnail({
        location: 'location thumbnail',
        name: 'name thumbnail',
      }),
      thumbnail_half: new ThumbnailHalf({
        location: 'location thumbnail half',
        name: 'name thumbnail half',
      }),
      trailer: new TrailerMedia({
        name: 'name trailer',
        raw_location: 'raw_location trailer',
        encoded_location: 'encoded_location trailer',
        status: AudioVideoMediaStatus.COMPLETED,
      }),
      video: new VideoMedia({
        name: 'name video',
        raw_location: 'raw_location video',
        encoded_location: 'encoded_location video',
        status: AudioVideoMediaStatus.COMPLETED,
      }),
      categories_id: new Map([[category1.id.value, category1.id]]),
      genres_id: new Map([[genre1.id.value, genre1.id]]),
      cast_members_id: new Map([[castMember1.id.value, castMember1.id]]),
    });

    const model2 = VideoModelMapper.toModel(entity);
    expect(model2.id).toEqual(videoProps.id.value);
    expect(model2.title).toEqual(videoProps.title);
    expect(model2.description).toEqual(videoProps.description);
    expect(model2.year_launched).toEqual(videoProps.year_launched);
    expect(model2.duration).toEqual(videoProps.duration);
    expect(model2.rating).toEqual(videoProps.rating.value);
    expect(model2.is_opened).toEqual(videoProps.is_opened);
    expect(model2.is_published).toEqual(videoProps.is_published);
    expect(model2.created_at).toEqual(videoProps.created_at);
    expect(model2.audio_video_medias[0]!.toJSON()).toEqual({
      audio_video_media_id: model2.audio_video_medias[0]!.audio_video_media_id,
      video_id: videoProps.id.value,
      name: 'name trailer',
      raw_location: 'raw_location trailer',
      encoded_location: 'encoded_location trailer',
      status: AudioVideoMediaStatus.COMPLETED,
      video_related_field: AudioVideoMediaRelatedField.TRAILER,
    });
    expect(model2.audio_video_medias[1]!.toJSON()).toEqual({
      audio_video_media_id: model2.audio_video_medias[1]!.audio_video_media_id,
      video_id: videoProps.id.value,
      name: 'name video',
      raw_location: 'raw_location video',
      encoded_location: 'encoded_location video',
      status: AudioVideoMediaStatus.COMPLETED,
      video_related_field: AudioVideoMediaRelatedField.VIDEO,
    });
    expect(model2.image_medias[0]!.toJSON()).toEqual({
      image_media_id: model2.image_medias[0]!.image_media_id,
      video_id: videoProps.id.value,
      location: 'location banner',
      name: 'name banner',
      video_related_field: ImageMediaRelatedField.BANNER,
    });
    expect(model2.image_medias[1]!.toJSON()).toEqual({
      image_media_id: model2.image_medias[1]!.image_media_id,
      video_id: videoProps.id.value,
      location: 'location thumbnail',
      name: 'name thumbnail',
      video_related_field: ImageMediaRelatedField.THUMBNAIL,
    });
    expect(model2.image_medias[2]!.toJSON()).toEqual({
      image_media_id: model2.image_medias[2]!.image_media_id,
      video_id: videoProps.id.value,
      location: 'location thumbnail half',
      name: 'name thumbnail half',
      video_related_field: ImageMediaRelatedField.THUMBNAIL_HALF,
    });
    expect(model2.categories_id[0].toJSON()).toEqual({
      video_id: videoProps.id.value,
      category_id: category1.id.value,
    });
    expect(model2.genres_id[0].toJSON()).toEqual({
      video_id: videoProps.id.value,
      genre_id: genre1.id.value,
    });
    expect(model2.cast_members_id[0].toJSON()).toEqual({
      video_id: videoProps.id.value,
      cast_member_id: castMember1.id.value,
    });
  });
});
