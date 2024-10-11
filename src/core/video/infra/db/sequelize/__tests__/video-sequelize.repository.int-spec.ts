import { CastMember } from '@/core/cast-member/domain/cast-member.entity';
import { CastMemberSequelizeRepository } from '@/core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { CastMemberModel } from '@/core/cast-member/infra/db/sequelize/cast-member.model';
import { Category } from '@/core/category/domain/category.entity';
import { CategorySequelizeRepository } from '@/core/category/infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '@/core/category/infra/db/sequelize/category.model';
import { Genre } from '@/core/genre/domain/genre.aggregate';
import { GenreSequelizeRepository } from '@/core/genre/infra/db/sequelize/genre-sequelize.repository';
import { GenreModel } from '@/core/genre/infra/db/sequelize/genre.model';
import { NotFoundError } from '@/core/shared/domain/errors/not-found';
import { UnitOfWorkSequelize } from '@/core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { Video, VideoId } from '@/core/video/domain/video.aggregate';
import { VideoSearchParams, VideoSearchResult } from '@/core/video/domain/video.repository';
import { AudioVideoMediaModel } from '@/core/video/infra/db/sequelize/audio-video-media.model';
import { ImageMediaModel } from '@/core/video/infra/db/sequelize/image-media.model';
import { setupSequelizeForVideo } from '@/core/video/infra/db/sequelize/testing/helpers';
import { VideoModelMapper } from '@/core/video/infra/db/sequelize/video-model.mapper';
import { VideoSequelizeRepository } from '@/core/video/infra/db/sequelize/video-sequelize.repository';
import {
  VideoCastMemberModel,
  VideoCategoryModel,
  VideoGenreModel,
  VideoModel,
} from '@/core/video/infra/db/sequelize/video.model';

describe('VideoSequelizeRepository Integration Tests', () => {
  const sequelizeHelper = setupSequelizeForVideo();
  let videoRepo: VideoSequelizeRepository;
  let categoryRepo: CategorySequelizeRepository;
  let genreRepo: GenreSequelizeRepository;
  let castMemberRepo: CastMemberSequelizeRepository;
  let uow: UnitOfWorkSequelize;

  beforeEach(async () => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    videoRepo = new VideoSequelizeRepository(VideoModel, uow);
    categoryRepo = new CategorySequelizeRepository(CategoryModel);
    genreRepo = new GenreSequelizeRepository(GenreModel, uow);
    castMemberRepo = new CastMemberSequelizeRepository(CastMemberModel);
  });

  it('should inserts a new entity without medias', async () => {
    const { category, genre, castMember } = await createRelations();

    const video = Video.fake()
      .aVideoWithoutMedias()
      .addCategoryId(category.id)
      .addGenreId(genre.id)
      .addCastMemberId(castMember.id)
      .build();
    await videoRepo.insert(video);
    const newVideo = await videoRepo.findById(video.id);
    expect(newVideo!.toJSON()).toStrictEqual(video.toJSON());
  });

  it('should inserts a new entity with medias', async () => {
    const { category, genre, castMember } = await createRelations();

    const video = Video.fake()
      .aVideoWithAllMedias()
      .addCategoryId(category.id)
      .addGenreId(genre.id)
      .addCastMemberId(castMember.id)
      .build();
    await videoRepo.insert(video);
    const newVideo = await videoRepo.findById(video.id);
    expect(newVideo!.toJSON()).toStrictEqual(video.toJSON());
  });

  it('should bulk inserts new entities without medias', async () => {
    const { category, genre, castMember } = await createRelations();

    const videos = Video.fake()
      .theVideosWithoutMedias(2)
      .addCategoryId(category.id)
      .addGenreId(genre.id)
      .addCastMemberId(castMember.id)
      .build();
    await videoRepo.bulkInsert(videos);
    const newVideos = await videoRepo.findAll();
    expect(newVideos.length).toBe(2);
    expect(newVideos[0].toJSON()).toStrictEqual(videos[0].toJSON());
    expect(newVideos[1].toJSON()).toStrictEqual(videos[1].toJSON());
  });

  it('should bulk inserts new entities with medias', async () => {
    const { category, genre, castMember } = await createRelations();

    const videos = Video.fake()
      .theVideosWithAllMedias(2)
      .addCategoryId(category.id)
      .addGenreId(genre.id)
      .addCastMemberId(castMember.id)
      .build();
    await videoRepo.bulkInsert(videos);
    const newVideos = await videoRepo.findAll();
    expect(newVideos.length).toBe(2);
    expect(newVideos[0].toJSON()).toStrictEqual(videos[0].toJSON());
    expect(newVideos[1].toJSON()).toStrictEqual(videos[1].toJSON());
  });

  it('should finds a entity by id without medias', async () => {
    const { category, genre, castMember } = await createRelations();
    const video = Video.fake()
      .aVideoWithoutMedias()
      .addCategoryId(category.id)
      .addGenreId(genre.id)
      .addCastMemberId(castMember.id)
      .build();
    await videoRepo.insert(video);

    const entityFound = await videoRepo.findById(video.id);
    expect(video.toJSON()).toStrictEqual(entityFound!.toJSON());
  });

  it('should finds a entity by id with medias', async () => {
    const { category, genre, castMember } = await createRelations();
    const video = Video.fake()
      .aVideoWithAllMedias()
      .addCategoryId(category.id)
      .addGenreId(genre.id)
      .addCastMemberId(castMember.id)
      .build();
    await videoRepo.insert(video);

    const entityFound = await videoRepo.findById(video.id);
    expect(video.toJSON()).toStrictEqual(entityFound!.toJSON());
  });

  it('should return all videos without medias', async () => {
    const { category, genre, castMember } = await createRelations();
    const video = Video.fake()
      .aVideoWithoutMedias()
      .addCategoryId(category.id)
      .addGenreId(genre.id)
      .addCastMemberId(castMember.id)
      .build();
    await videoRepo.insert(video);

    const videos = await videoRepo.findAll();
    expect([video.toJSON()]).toStrictEqual([videos[0].toJSON()]);
  });

  it('should return all videos with medias', async () => {
    const { category, genre, castMember } = await createRelations();
    const video = Video.fake()
      .aVideoWithAllMedias()
      .addCategoryId(category.id)
      .addGenreId(genre.id)
      .addCastMemberId(castMember.id)
      .build();
    await videoRepo.insert(video);

    const videos = await videoRepo.findAll();
    expect([video.toJSON()]).toStrictEqual([videos[0].toJSON()]);
  });

  it('should throw error on update when a entity not found', async () => {
    const entity = Video.fake().aVideoWithoutMedias().build();
    await expect(videoRepo.update(entity)).rejects.toThrow(new NotFoundError(entity.id.value, Video));
  });

  it('should update a entity', async () => {
    const categories = Category.fake().theCategories(3).build();
    await categoryRepo.bulkInsert(categories);
    const genres = Genre.fake().theGenres(3).addCategoryId(categories[0].id).build();
    await genreRepo.bulkInsert(genres);
    const castMembers = CastMember.fake().theCastMembers(3).build();
    await castMemberRepo.bulkInsert(castMembers);
    const fakerVideo = Video.fake().aVideoWithoutMedias();
    const video = Video.fake()
      .aVideoWithoutMedias()
      .addCategoryId(categories[0].id)
      .addGenreId(genres[0].id)
      .addCastMemberId(castMembers[0].id)
      .build();
    await videoRepo.insert(video);

    video.changeTitle('Title changed');
    video.syncCategoriesId([categories[1].id]);
    video.syncGenresId([genres[1].id]);
    video.syncCastMembersId([castMembers[1].id]);
    await videoRepo.update(video);

    let videoUpdated = await videoRepo.findById(video.id);
    expect(video.toJSON()).toStrictEqual(videoUpdated!.toJSON());
    await expect(VideoCategoryModel.count()).resolves.toBe(1);
    await expect(VideoGenreModel.count()).resolves.toBe(1);
    await expect(VideoCastMemberModel.count()).resolves.toBe(1);

    video.replaceBanner(fakerVideo.banner);
    video.replaceThumbnail(fakerVideo.thumbnail);
    video.replaceThumbnailHalf(fakerVideo.thumbnail_half);
    video.replaceTrailer(fakerVideo.trailer);
    video.replaceVideo(fakerVideo.video);

    await videoRepo.update(video);

    videoUpdated = await videoRepo.findById(video.id);
    expect(video.toJSON()).toStrictEqual(videoUpdated!.toJSON());
    await expect(VideoCategoryModel.count()).resolves.toBe(1);
    await expect(VideoGenreModel.count()).resolves.toBe(1);
    await expect(VideoCastMemberModel.count()).resolves.toBe(1);
    await expect(ImageMediaModel.count()).resolves.toBe(3);
    await expect(AudioVideoMediaModel.count()).resolves.toBe(2);

    video.replaceBanner(fakerVideo.banner);
    video.replaceThumbnail(fakerVideo.thumbnail);
    video.replaceThumbnailHalf(fakerVideo.thumbnail_half);
    video.replaceTrailer(fakerVideo.trailer);
    video.replaceVideo(fakerVideo.video);

    await videoRepo.update(video);

    videoUpdated = await videoRepo.findById(video.id);
    expect(video.toJSON()).toStrictEqual(videoUpdated!.toJSON());
    await expect(VideoCategoryModel.count()).resolves.toBe(1);
    await expect(VideoGenreModel.count()).resolves.toBe(1);
    await expect(VideoCastMemberModel.count()).resolves.toBe(1);
    await expect(ImageMediaModel.count()).resolves.toBe(3);
    await expect(AudioVideoMediaModel.count()).resolves.toBe(2);
  });

  it('should throw error on delete when a entity not found', async () => {
    const videoId = new VideoId();
    await expect(videoRepo.delete(videoId)).rejects.toThrow(new NotFoundError(videoId.value, Video));

    await expect(videoRepo.delete(new VideoId('9366b7dc-2d71-4799-b91c-c64adb205104'))).rejects.toThrow(
      new NotFoundError('9366b7dc-2d71-4799-b91c-c64adb205104', Video),
    );
  });

  it('should delete a entity', async () => {
    const { category, genre, castMember } = await createRelations();
    let video = Video.fake()
      .aVideoWithoutMedias()
      .addCategoryId(category.id)
      .addGenreId(genre.id)
      .addCastMemberId(castMember.id)
      .build();
    await videoRepo.insert(video);

    await videoRepo.delete(video.id);
    let videoFound = await VideoModel.findByPk(video.id.value);
    expect(videoFound).toBeNull();
    await expect(VideoCategoryModel.count()).resolves.toBe(0);
    await expect(VideoGenreModel.count()).resolves.toBe(0);
    await expect(VideoCastMemberModel.count()).resolves.toBe(0);

    video = Video.fake()
      .aVideoWithAllMedias()
      .addCategoryId(category.id)
      .addGenreId(genre.id)
      .addCastMemberId(castMember.id)
      .build();
    await videoRepo.insert(video);
    await videoRepo.delete(video.id);
    videoFound = await VideoModel.findByPk(video.id.value);
    expect(videoFound).toBeNull();
    await expect(VideoCategoryModel.count()).resolves.toBe(0);
    await expect(VideoGenreModel.count()).resolves.toBe(0);
    await expect(VideoCastMemberModel.count()).resolves.toBe(0);
    await expect(ImageMediaModel.count()).resolves.toBe(0);
    await expect(AudioVideoMediaModel.count()).resolves.toBe(0);
  });

  describe('search method tests', () => {
    it('should order by created_at DESC when search params are null', async () => {
      const { category, genre, castMember } = await createRelations();

      const videos = Video.fake()
        .theVideosWithAllMedias(16)
        .withCreatedAt((index) => new Date(new Date().getTime() + 100 + index))
        .addCategoryId(category.id)
        .addGenreId(genre.id)
        .addCastMemberId(castMember.id)
        .build();
      await videoRepo.bulkInsert(videos);
      const spyToEntity = jest.spyOn(VideoModelMapper, 'toEntity');
      const searchOutput = await videoRepo.search(VideoSearchParams.create());
      expect(searchOutput).toBeInstanceOf(VideoSearchResult);
      expect(spyToEntity).toHaveBeenCalledTimes(15);
      expect(searchOutput.toJSON()).toMatchObject({
        total: 16,
        current_page: 1,
        last_page: 2,
        per_page: 15,
      });

      [...videos.slice(1, 16)].reverse().forEach((item, index) => {
        expect(searchOutput.items[index]).toBeInstanceOf(Video);
        const expected = searchOutput.items[index].toJSON();
        expect(item.toJSON()).toStrictEqual({
          ...expected,
          categories_id: [category.id.value],
          genres_id: [genre.id.value],
          cast_members_id: [castMember.id.value],
        });
      });
    });

    it('should apply paginate and filter by title', async () => {
      const { category, genre, castMember } = await createRelations();
      const videos = [
        Video.fake()
          .aVideoWithAllMedias()
          .withTitle('test')
          .withCreatedAt(new Date(new Date().getTime() + 4000))
          .addCategoryId(category.id)
          .addGenreId(genre.id)
          .addCastMemberId(castMember.id)
          .build(),
        Video.fake()
          .aVideoWithAllMedias()
          .withTitle('a')
          .withCreatedAt(new Date(new Date().getTime() + 3000))
          .addCategoryId(category.id)
          .addGenreId(genre.id)
          .addCastMemberId(castMember.id)
          .build(),
        Video.fake()
          .aVideoWithAllMedias()
          .withTitle('TEST')
          .withCreatedAt(new Date(new Date().getTime() + 2000))
          .addCategoryId(category.id)
          .addGenreId(genre.id)
          .addCastMemberId(castMember.id)
          .build(),
        Video.fake()
          .aVideoWithAllMedias()
          .withTitle('TeSt')
          .withCreatedAt(new Date(new Date().getTime() + 1000))
          .addCategoryId(category.id)
          .addGenreId(genre.id)
          .addCastMemberId(castMember.id)
          .build(),
      ];
      await videoRepo.bulkInsert(videos);

      let searchOutput = await videoRepo.search(
        VideoSearchParams.create({
          page: 1,
          per_page: 2,
          filter: { title: 'TEST' },
        }),
      );

      let expected = new VideoSearchResult({
        items: [videos[0], videos[2]],
        total: 3,
        current_page: 1,
        per_page: 2,
      }).toJSON(true);
      expect(searchOutput.toJSON(true)).toMatchObject({
        ...expected,
        items: [
          {
            ...expected.items[0],
            categories_id: [category.id.value],
            genres_id: [genre.id.value],
            cast_members_id: [castMember.id.value],
          },
          {
            ...expected.items[1],
            categories_id: [category.id.value],
            genres_id: [genre.id.value],
            cast_members_id: [castMember.id.value],
          },
        ],
      });

      expected = new VideoSearchResult({
        items: [videos[3]],
        total: 3,
        current_page: 2,
        per_page: 2,
      }).toJSON(true);
      searchOutput = await videoRepo.search(
        VideoSearchParams.create({
          page: 2,
          per_page: 2,
          filter: { title: 'TEST' },
        }),
      );
      expect(searchOutput.toJSON(true)).toMatchObject({
        ...expected,
        items: [
          {
            ...expected.items[0],
            categories_id: [category.id.value],
          },
        ],
      });
    });
  });
  //TODO - fazer testes para buscas de categories_id, genres_id e cast_members
  //     const categories = Category.fake().theCategories(4).build();
  //     await categoryRepo.bulkInsert(categories);
  //     const genres = [
  //       Video.fake()
  //         .aVideo()
  //         .addCategoryId(categories[0].id)
  //         .withCreatedAt(new Date(new Date().getTime() + 1000))
  //         .build(),
  //       Video.fake()
  //         .aVideo()
  //         .addCategoryId(categories[0].id)
  //         .addCategoryId(categories[1].id)
  //         .withCreatedAt(new Date(new Date().getTime() + 2000))
  //         .build(),
  //       Video.fake()
  //         .aVideo()
  //         .addCategoryId(categories[0].id)
  //         .addCategoryId(categories[1].id)
  //         .addCategoryId(categories[2].id)
  //         .withCreatedAt(new Date(new Date().getTime() + 3000))
  //         .build(),
  //       Video.fake()
  //         .aVideo()
  //         .addCategoryId(categories[3].id)
  //         .withCreatedAt(new Date(new Date().getTime() + 4000))
  //         .build(),
  //       Video.fake()
  //         .aVideo()
  //         .addCategoryId(categories[1].id)
  //         .addCategoryId(categories[2].id)
  //         .withCreatedAt(new Date(new Date().getTime() + 5000))
  //         .build(),
  //     ];
  //     await video.bulkInsert(genres);

  //     const arrange = [
  //       {
  //         params: VideoSearchParams.create({
  //           page: 1,
  //           per_page: 2,
  //           filter: { categories_id: [categories[0].id.value] },
  //         }),
  //         result: {
  //           items: [genres[2], genres[1]],
  //           total: 3,
  //           current_page: 1,
  //           per_page: 2,
  //         },
  //       },
  //       {
  //         params: VideoSearchParams.create({
  //           page: 2,
  //           per_page: 2,
  //           filter: { categories_id: [categories[0].id.value] },
  //         }),
  //         result: {
  //           items: [genres[0]],
  //           total: 3,
  //           current_page: 2,
  //           per_page: 2,
  //         },
  //       },
  //       {
  //         params: VideoSearchParams.create({
  //           page: 1,
  //           per_page: 2,
  //           filter: {
  //             categories_id: [
  //               categories[0].id.value,
  //               categories[1].id.value,
  //             ],
  //           },
  //         }),
  //         result: {
  //           items: [genres[4], genres[2]],
  //           total: 4,
  //           current_page: 1,
  //           per_page: 2,
  //         },
  //       },
  //       {
  //         params: VideoSearchParams.create({
  //           page: 2,
  //           per_page: 2,
  //           filter: {
  //             categories_id: [
  //               categories[0].id.value,
  //               categories[1].id.value,
  //             ],
  //           },
  //         }),
  //         result: {
  //           items: [genres[1], genres[0]],
  //           total: 4,
  //           current_page: 2,
  //           per_page: 2,
  //         },
  //       },
  //     ];
  //     for (const arrangeItem of arrange) {
  //       const searchOutput = await video.search(arrangeItem.params);
  //       // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //       const { items, ...otherOutput } = searchOutput;
  //       const { items: itemsExpected, ...otherExpected } = arrangeItem.result;
  //       expect(otherOutput).toMatchObject(otherExpected);
  //       expect(searchOutput.items.length).toBe(itemsExpected.length);
  //       searchOutput.items.forEach((item, key) => {
  //         const expected = itemsExpected[key].toJSON();
  //         expect(item.toJSON()).toStrictEqual(
  //           expect.objectContaining({
  //             ...expected,
  //             categories_id: expect.arrayContaining(expected.categories_id),
  //           }),
  //         );
  //       });
  //     }
  //   });

  //   it('should apply paginate and sort', async () => {
  //     expect(video.sortableFields).toStrictEqual(['name', 'created_at']);

  //     const categories = Category.fake().theCategories(4).build();
  //     await categoryRepo.bulkInsert(categories);
  //     const genres = [
  //       Video.fake()
  //         .aVideo()
  //         .addCategoryId(categories[0].id)
  //         .addCategoryId(categories[1].id)
  //         .addCategoryId(categories[2].id)
  //         .withName('b')
  //         .build(),
  //       Video.fake()
  //         .aVideo()
  //         .addCategoryId(categories[0].id)
  //         .addCategoryId(categories[1].id)
  //         .addCategoryId(categories[2].id)
  //         .withName('a')
  //         .build(),
  //       Video.fake()
  //         .aVideo()
  //         .addCategoryId(categories[0].id)
  //         .addCategoryId(categories[1].id)
  //         .addCategoryId(categories[2].id)
  //         .withName('d')
  //         .build(),
  //       Video.fake()
  //         .aVideo()
  //         .addCategoryId(categories[0].id)
  //         .addCategoryId(categories[1].id)
  //         .addCategoryId(categories[2].id)
  //         .withName('e')
  //         .build(),
  //       Video.fake()
  //         .aVideo()
  //         .addCategoryId(categories[0].id)
  //         .addCategoryId(categories[1].id)
  //         .addCategoryId(categories[2].id)
  //         .withName('c')
  //         .build(),
  //     ];
  //     await video.bulkInsert(genres);

  //     const arrange = [
  //       {
  //         params: VideoSearchParams.create({
  //           page: 1,
  //           per_page: 2,
  //           sort: 'name',
  //         }),
  //         result: new VideoSearchResult({
  //           items: [genres[1], genres[0]],
  //           total: 5,
  //           current_page: 1,
  //           per_page: 2,
  //         }),
  //       },
  //       {
  //         params: VideoSearchParams.create({
  //           page: 2,
  //           per_page: 2,
  //           sort: 'name',
  //         }),
  //         result: new VideoSearchResult({
  //           items: [genres[4], genres[2]],
  //           total: 5,
  //           current_page: 2,
  //           per_page: 2,
  //         }),
  //       },
  //       {
  //         params: VideoSearchParams.create({
  //           page: 1,
  //           per_page: 2,
  //           sort: 'name',
  //           sort_dir: 'desc',
  //         }),
  //         result: new VideoSearchResult({
  //           items: [genres[3], genres[2]],
  //           total: 5,
  //           current_page: 1,
  //           per_page: 2,
  //         }),
  //       },
  //       {
  //         params: VideoSearchParams.create({
  //           page: 2,
  //           per_page: 2,
  //           sort: 'name',
  //           sort_dir: 'desc',
  //         }),
  //         result: new VideoSearchResult({
  //           items: [genres[4], genres[0]],
  //           total: 5,
  //           current_page: 2,
  //           per_page: 2,
  //         }),
  //       },
  //     ];

  //     for (const i of arrange) {
  //       const result = await video.search(i.params);
  //       const expected = i.result.toJSON(true);

  //       expect(result.toJSON(true)).toMatchObject({
  //         ...expected,
  //         items: expected.items.map((i) => ({
  //           ...i,
  //           categories_id: expect.arrayContaining(i.categories_id),
  //         })),
  //       });
  //     }
  //   });

  //   describe('should search using filter by name, sort and paginate', () => {
  //     const categories = Category.fake().theCategories(3).build();

  //     const genres = [
  //       Video.fake()
  //         .aVideo()
  //         .addCategoryId(categories[0].id)
  //         .addCategoryId(categories[1].id)
  //         .addCategoryId(categories[2].id)
  //         .withName('test')
  //         .build(),
  //       Video.fake()
  //         .aVideo()
  //         .addCategoryId(categories[0].id)
  //         .addCategoryId(categories[1].id)
  //         .addCategoryId(categories[2].id)
  //         .withName('a')
  //         .build(),
  //       Video.fake()
  //         .aVideo()
  //         .addCategoryId(categories[0].id)
  //         .addCategoryId(categories[1].id)
  //         .addCategoryId(categories[2].id)
  //         .withName('TEST')
  //         .build(),
  //       Video.fake()
  //         .aVideo()
  //         .addCategoryId(categories[0].id)
  //         .addCategoryId(categories[1].id)
  //         .addCategoryId(categories[2].id)
  //         .withName('e')
  //         .build(),
  //       Video.fake()
  //         .aVideo()
  //         .addCategoryId(categories[0].id)
  //         .addCategoryId(categories[1].id)
  //         .addCategoryId(categories[2].id)
  //         .withName('TeSt')
  //         .build(),
  //     ];

  //     const arrange = [
  //       {
  //         search_params: VideoSearchParams.create({
  //           page: 1,
  //           per_page: 2,
  //           sort: 'name',
  //           filter: { name: 'TEST' },
  //         }),
  //         search_result: new VideoSearchResult({
  //           items: [genres[2], genres[4]],
  //           total: 3,
  //           current_page: 1,
  //           per_page: 2,
  //         }),
  //       },
  //       {
  //         search_params: VideoSearchParams.create({
  //           page: 2,
  //           per_page: 2,
  //           sort: 'name',
  //           filter: { name: 'TEST' },
  //         }),
  //         search_result: new VideoSearchResult({
  //           items: [genres[0]],
  //           total: 3,
  //           current_page: 2,
  //           per_page: 2,
  //         }),
  //       },
  //     ];

  //     beforeEach(async () => {
  //       await categoryRepo.bulkInsert(categories);
  //       await video.bulkInsert(genres);
  //     });

  //     test.each(arrange)(
  //       'when value is $search_params',
  //       async ({ search_params, search_result: expected_result }) => {
  //         const result = await video.search(search_params);
  //         const expected = expected_result.toJSON(true);
  //         expect(result.toJSON(true)).toMatchObject({
  //           ...expected,
  //           items: expected.items.map((i) => ({
  //             ...i,
  //             categories_id: expect.arrayContaining(i.categories_id),
  //           })),
  //         });
  //       },
  //     );
  //   });

  //   describe('should search using filter by categories_id, sort and paginate', () => {
  //     const categories = Category.fake().theCategories(4).build();

  //     const genres = [
  //       Video.fake()
  //         .aVideo()
  //         .addCategoryId(categories[0].id)
  //         .withName('test')
  //         .build(),
  //       Video.fake()
  //         .aVideo()
  //         .addCategoryId(categories[0].id)
  //         .addCategoryId(categories[1].id)
  //         .withName('a')
  //         .build(),
  //       Video.fake()
  //         .aVideo()
  //         .addCategoryId(categories[0].id)
  //         .addCategoryId(categories[1].id)
  //         .addCategoryId(categories[2].id)
  //         .withName('TEST')
  //         .build(),
  //       Video.fake()
  //         .aVideo()
  //         .addCategoryId(categories[3].id)
  //         .withName('e')
  //         .build(),
  //       Video.fake()
  //         .aVideo()
  //         .addCategoryId(categories[1].id)
  //         .addCategoryId(categories[2].id)
  //         .withName('TeSt')
  //         .build(),
  //     ];

  //     const arrange = [
  //       {
  //         search_params: VideoSearchParams.create({
  //           page: 1,
  //           per_page: 2,
  //           sort: 'name',
  //           filter: { categories_id: [categories[0].id.value] },
  //         }),
  //         search_result: new VideoSearchResult({
  //           items: [genres[2], genres[1]],
  //           total: 3,
  //           current_page: 1,
  //           per_page: 2,
  //         }),
  //       },
  //       {
  //         search_params: VideoSearchParams.create({
  //           page: 2,
  //           per_page: 2,
  //           sort: 'name',
  //           filter: { categories_id: [categories[0].id.value] },
  //         }),
  //         search_result: new VideoSearchResult({
  //           items: [genres[0]],
  //           total: 3,
  //           current_page: 2,
  //           per_page: 2,
  //         }),
  //       },
  //     ];

  //     beforeEach(async () => {
  //       await categoryRepo.bulkInsert(categories);
  //       await video.bulkInsert(genres);
  //     });

  //     test.each(arrange)(
  //       'when value is $search_params',
  //       async ({ search_params, search_result: expected_result }) => {
  //         const result = await video.search(search_params);
  //         const expected = expected_result.toJSON(true);
  //         expect(result.toJSON(true)).toMatchObject({
  //           ...expected,
  //           items: expected.items.map((i) => ({
  //             ...i,
  //             categories_id: expect.arrayContaining(i.categories_id),
  //           })),
  //         });
  //       },
  //     );
  //   });

  //   describe('should search using filter by name and categories_id, sort and paginate', () => {
  //     const categories = Category.fake().theCategories(4).build();

  //     const genres = [
  //       Video.fake()
  //         .aVideo()
  //         .addCategoryId(categories[0].id)
  //         .addCategoryId(categories[1].id)
  //         .withName('test')
  //         .build(),
  //       Video.fake()
  //         .aVideo()
  //         .addCategoryId(categories[0].id)
  //         .addCategoryId(categories[1].id)
  //         .withName('a')
  //         .build(),
  //       Video.fake()
  //         .aVideo()
  //         .addCategoryId(categories[0].id)
  //         .addCategoryId(categories[1].id)
  //         .addCategoryId(categories[2].id)
  //         .withName('TEST')
  //         .build(),
  //       Video.fake()
  //         .aVideo()
  //         .addCategoryId(categories[3].id)
  //         .withName('e')
  //         .build(),
  //       Video.fake()
  //         .aVideo()
  //         .addCategoryId(categories[1].id)
  //         .addCategoryId(categories[2].id)
  //         .withName('TeSt')
  //         .build(),
  //     ];

  //     const arrange = [
  //       {
  //         search_params: VideoSearchParams.create({
  //           page: 1,
  //           per_page: 2,
  //           sort: 'name',
  //           filter: {
  //             name: 'TEST',
  //             categories_id: [categories[1].id],
  //           },
  //         }),
  //         search_result: new VideoSearchResult({
  //           items: [genres[2], genres[4]],
  //           total: 3,
  //           current_page: 1,
  //           per_page: 2,
  //         }),
  //       },
  //       {
  //         search_params: VideoSearchParams.create({
  //           page: 2,
  //           per_page: 2,
  //           sort: 'name',
  //           filter: {
  //             name: 'TEST',
  //             categories_id: [categories[1].id],
  //           },
  //         }),
  //         search_result: new VideoSearchResult({
  //           items: [genres[0]],
  //           total: 3,
  //           current_page: 2,
  //           per_page: 2,
  //         }),
  //       },
  //     ];

  //     beforeEach(async () => {
  //       await categoryRepo.bulkInsert(categories);
  //       await video.bulkInsert(genres);
  //     });

  //     test.each(arrange)(
  //       'when value is $search_params',
  //       async ({ search_params, search_result: expected_result }) => {
  //         const result = await video.search(search_params);
  //         const expected = expected_result.toJSON(true);
  //         expect(result.toJSON(true)).toMatchObject({
  //           ...expected,
  //           items: expected.items.map((i) => ({
  //             ...i,
  //             categories_id: expect.arrayContaining(i.categories_id),
  //           })),
  //         });
  //       },
  //     );
  //   });
  // });

  describe('transaction mode', () => {
    describe('insert method', () => {
      it('should insert a genre', async () => {
        const { category, genre, castMember } = await createRelations();
        const video = Video.fake()
          .aVideoWithAllMedias()
          .addCategoryId(category.id)
          .addGenreId(genre.id)
          .addCastMemberId(castMember.id)
          .build();
        uow.start();
        await videoRepo.insert(video);
        await uow.commit();

        const videoCreated = await videoRepo.findById(video.id);
        expect(video.id).toBeValueObject(videoCreated!.id);
      });

      it('rollback the insertion', async () => {
        const { category, genre, castMember } = await createRelations();
        const video = Video.fake()
          .aVideoWithAllMedias()
          .addCategoryId(category.id)
          .addGenreId(genre.id)
          .addCastMemberId(castMember.id)
          .build();

        await uow.start();
        await videoRepo.insert(video);
        await uow.rollback();

        await expect(videoRepo.findById(video.id)).resolves.toBeNull();
        await expect(VideoCategoryModel.count()).resolves.toBe(0);
        await expect(VideoGenreModel.count()).resolves.toBe(0);
        await expect(VideoCastMemberModel.count()).resolves.toBe(0);
        await expect(ImageMediaModel.count()).resolves.toBe(0);
        await expect(AudioVideoMediaModel.count()).resolves.toBe(0);
      });
    });

    describe('bulkInsert method', () => {
      it('should insert a list of videos', async () => {
        const { category, genre, castMember } = await createRelations();
        const videos = Video.fake()
          .theVideosWithAllMedias(2)
          .addCategoryId(category.id)
          .addGenreId(genre.id)
          .addCastMemberId(castMember.id)
          .build();
        await uow.start();
        await videoRepo.bulkInsert(videos);
        await uow.commit();

        const [video1, video2] = await Promise.all([
          videoRepo.findById(videos[0].id),
          videoRepo.findById(videos[1].id),
        ]);
        expect(video1!.id).toBeValueObject(videos[0].id);
        expect(video2!.id).toBeValueObject(videos[1].id);
      });

      it('rollback the bulk insertion', async () => {
        const { category, genre, castMember } = await createRelations();
        const videos = Video.fake()
          .theVideosWithAllMedias(2)
          .addCategoryId(category.id)
          .addGenreId(genre.id)
          .addCastMemberId(castMember.id)
          .build();
        await uow.start();
        await videoRepo.bulkInsert(videos);
        await uow.rollback();

        await expect(videoRepo.findById(videos[0].id)).resolves.toBeNull();
        await expect(videoRepo.findById(videos[1].id)).resolves.toBeNull();
        await expect(VideoCategoryModel.count()).resolves.toBe(0);
        await expect(VideoGenreModel.count()).resolves.toBe(0);
        await expect(VideoCastMemberModel.count()).resolves.toBe(0);
        await expect(ImageMediaModel.count()).resolves.toBe(0);
        await expect(AudioVideoMediaModel.count()).resolves.toBe(0);
      });
    });

    describe('findById method', () => {
      it('should return a video', async () => {
        const { category, genre, castMember } = await createRelations();
        const video = Video.fake()
          .aVideoWithAllMedias()
          .addCategoryId(category.id)
          .addGenreId(genre.id)
          .addCastMemberId(castMember.id)
          .build();
        await uow.start();
        await videoRepo.insert(video);
        const result = await videoRepo.findById(video.id);
        expect(result!.id).toBeValueObject(video.id);
        await uow.commit();
      });
    });

    describe('findAll method', () => {
      it('should return a list of videos', async () => {
        const { category, genre, castMember } = await createRelations();
        const videos = Video.fake()
          .theVideosWithAllMedias(2)
          .addCategoryId(category.id)
          .addGenreId(genre.id)
          .addCastMemberId(castMember.id)
          .build();
        await uow.start();
        await videoRepo.bulkInsert(videos);
        const result = await videoRepo.findAll();
        expect(result.length).toBe(2);
        await uow.commit();
      });
    });

    describe('findByIds method', () => {
      it('should return a list of videos', async () => {
        const { category, genre, castMember } = await createRelations();
        const videos = Video.fake()
          .theVideosWithAllMedias(2)
          .addCategoryId(category.id)
          .addGenreId(genre.id)
          .addCastMemberId(castMember.id)
          .build();
        await uow.start();
        await videoRepo.bulkInsert(videos);
        const result = await videoRepo.findByIds(videos.map((v) => v.id));
        expect(result.length).toBe(2);
        await uow.commit();
      });
    });

    describe('existsById method', () => {
      it('should return true if the video exists', async () => {
        const { category, genre, castMember } = await createRelations();
        const video = Video.fake()
          .aVideoWithAllMedias()
          .addCategoryId(category.id)
          .addGenreId(genre.id)
          .addCastMemberId(castMember.id)
          .build();
        await uow.start();
        await videoRepo.insert(video);
        const existsResult = await videoRepo.existsById([video.id]);
        expect(existsResult.exists[0]).toBeValueObject(video.id);
        await uow.commit();
      });
    });

    describe('update method', () => {
      it('should update a video', async () => {
        const { category, genre, castMember } = await createRelations();
        const video = Video.fake()
          .aVideoWithAllMedias()
          .addCategoryId(category.id)
          .addGenreId(genre.id)
          .addCastMemberId(castMember.id)
          .build();
        await videoRepo.insert(video);
        await uow.start();
        video.changeTitle('new title');
        await videoRepo.update(video);
        await uow.commit();
        const result = await videoRepo.findById(video.id);
        expect(result!.title).toBe(video.title);
      });

      it('rollback the update', async () => {
        const { category, genre, castMember } = await createRelations();
        const video = Video.fake()
          .aVideoWithAllMedias()
          .addCategoryId(category.id)
          .addGenreId(genre.id)
          .addCastMemberId(castMember.id)
          .build();
        await videoRepo.insert(video);
        await uow.start();
        video.changeTitle('new title');
        await videoRepo.update(video);
        await uow.rollback();
        const notChangeVideo = await videoRepo.findById(video.id);
        expect(notChangeVideo!.title).not.toBe(video.title);
      });
    });

    describe('delete method', () => {
      it('should delete a video', async () => {
        const { category, genre, castMember } = await createRelations();
        const video = Video.fake()
          .aVideoWithAllMedias()
          .addCategoryId(category.id)
          .addGenreId(genre.id)
          .addCastMemberId(castMember.id)
          .build();
        await videoRepo.insert(video);
        await uow.start();
        await videoRepo.delete(video.id);
        await uow.commit();
        await expect(videoRepo.findById(video.id)).resolves.toBeNull();
        await expect(VideoCategoryModel.count()).resolves.toBe(0);
        await expect(VideoGenreModel.count()).resolves.toBe(0);
        await expect(VideoCastMemberModel.count()).resolves.toBe(0);
        await expect(ImageMediaModel.count()).resolves.toBe(0);
        await expect(AudioVideoMediaModel.count()).resolves.toBe(0);
      });

      it('rollback the deletion', async () => {
        const { category, genre, castMember } = await createRelations();
        const video = Video.fake()
          .aVideoWithAllMedias()
          .addCategoryId(category.id)
          .addGenreId(genre.id)
          .addCastMemberId(castMember.id)
          .build();
        await videoRepo.insert(video);
        await uow.start();
        await videoRepo.delete(video.id);
        await uow.rollback();
        const result = await videoRepo.findById(video.id);
        expect(result!.id).toBeValueObject(video.id);
        await expect(VideoCategoryModel.count()).resolves.toBe(1);
        await expect(VideoGenreModel.count()).resolves.toBe(1);
        await expect(VideoCastMemberModel.count()).resolves.toBe(1);
        await expect(ImageMediaModel.count()).resolves.toBe(3);
        await expect(AudioVideoMediaModel.count()).resolves.toBe(2);
      });
    });

    describe('search method', () => {
      it('should return a list of genres', async () => {
        const { category, genre, castMember } = await createRelations();
        const genres = Video.fake()
          .theVideosWithAllMedias(2)
          .withTitle('movie')
          .addCategoryId(category.id)
          .addGenreId(genre.id)
          .addCastMemberId(castMember.id)
          .build();
        await uow.start();
        await videoRepo.bulkInsert(genres);
        const searchParams = VideoSearchParams.create({
          filter: { title: 'movie' },
        });
        const result = await videoRepo.search(searchParams);
        expect(result.items.length).toBe(2);
        expect(result.total).toBe(2);
        await uow.commit();
      });
    });
  });

  async function createRelations() {
    const category = Category.fake().aCategory().build();
    await categoryRepo.insert(category);
    const genre = Genre.fake().aGenre().addCategoryId(category.id).build();
    await genreRepo.insert(genre);
    const castMember = CastMember.fake().anActor().build();
    await castMemberRepo.insert(castMember);
    return { category, genre, castMember };
  }
});
