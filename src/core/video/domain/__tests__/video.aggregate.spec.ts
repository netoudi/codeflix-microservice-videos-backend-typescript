import { CastMemberId } from '@/core/cast-member/domain/cast-member.entity';
import { CategoryId } from '@/core/category/domain/category.entity';
import { GenreId } from '@/core/genre/domain/genre.aggregate';
import { Uuid } from '@/core/shared/domain/value-objects/uuid.vo';
import { Banner } from '@/core/video/domain/banner.vo';
import { Rating } from '@/core/video/domain/rating.vo';
import { ThumbnailHalf } from '@/core/video/domain/thumbnail-half.vo';
import { Thumbnail } from '@/core/video/domain/thumbnail.vo';
import { TrailerMedia } from '@/core/video/domain/trailer-media.vo';
import { VideoMedia } from '@/core/video/domain/video-media.vo';
import { Video, VideoId } from '@/core/video/domain/video.aggregate';

describe('Video Unit Tests', () => {
  beforeEach(() => {
    Video.prototype.validate = jest.fn().mockImplementation(Video.prototype.validate);
  });
  test('constructor of video', () => {
    const categoryId = new CategoryId();
    const categoriesId = new Map<string, CategoryId>([[categoryId.value, categoryId]]);
    const genreId = new GenreId();
    const genresId = new Map<string, GenreId>([[genreId.value, genreId]]);
    const castMemberId = new CastMemberId();
    const castMembersId = new Map<string, CastMemberId>([[castMemberId.value, castMemberId]]);
    const rating = Rating.createRL();
    let video = new Video({
      title: 'test title',
      description: 'test description',
      year_launched: 2020,
      duration: 90,
      rating,
      is_opened: true,
      is_published: true,
      categories_id: categoriesId,
      genres_id: genresId,
      cast_members_id: castMembersId,
    });
    expect(video).toBeInstanceOf(Video);
    expect(video.entityId).toBeInstanceOf(VideoId);
    expect(video.id).toBeInstanceOf(VideoId);
    expect(video.title).toBe('test title');
    expect(video.description).toBe('test description');
    expect(video.year_launched).toBe(2020);
    expect(video.duration).toBe(90);
    expect(video.rating).toBeInstanceOf(Rating);
    expect(video.is_opened).toBe(true);
    expect(video.is_published).toBe(true);
    expect(video.banner).toBeNull();
    expect(video.thumbnail).toBeNull();
    expect(video.thumbnail_half).toBeNull();
    expect(video.trailer).toBeNull();
    expect(video.video).toBeNull();
    expect(video.categories_id).toEqual(categoriesId);
    expect(video.genres_id).toEqual(genresId);
    expect(video.cast_members_id).toEqual(castMembersId);
    expect(video.created_at).toBeInstanceOf(Date);

    const banner = new Banner({
      name: 'test name banner',
      location: 'test location banner',
    });

    const thumbnail = new Thumbnail({
      name: 'test name thumbnail',
      location: 'test location thumbnail',
    });

    const thumbnailHalf = new ThumbnailHalf({
      name: 'test name thumbnail half',
      location: 'test location thumbnail half',
    });

    const trailer = TrailerMedia.create({
      name: 'test name trailer',
      raw_location: 'test raw location trailer',
    });

    const videoMedia = VideoMedia.create({
      name: 'test name video',
      raw_location: 'test raw location video',
    });

    video = new Video({
      title: 'test title',
      description: 'test description',
      year_launched: 2020,
      duration: 90,
      rating,
      is_opened: true,
      is_published: true,
      banner,
      thumbnail,
      thumbnail_half: thumbnailHalf,
      trailer,
      video: videoMedia,
      categories_id: categoriesId,
      genres_id: genresId,
      cast_members_id: castMembersId,
    });

    expect(video).toBeInstanceOf(Video);
    expect(video.id).toBeInstanceOf(VideoId);
    expect(video.title).toBe('test title');
    expect(video.description).toBe('test description');
    expect(video.year_launched).toBe(2020);
    expect(video.duration).toBe(90);
    expect(video.rating).toBeInstanceOf(Rating);
    expect(video.is_opened).toBe(true);
    expect(video.is_published).toBe(true);
    expect(video.banner).toEqual(banner);
    expect(video.thumbnail).toEqual(thumbnail);
    expect(video.thumbnail_half).toEqual(thumbnailHalf);
    expect(video.trailer).toEqual(trailer);
    expect(video.video).toEqual(videoMedia);
    expect(video.categories_id).toEqual(categoriesId);
    expect(video.genres_id).toEqual(genresId);
    expect(video.cast_members_id).toEqual(castMembersId);
    expect(video.created_at).toBeInstanceOf(Date);
  });

  describe('video_id field', () => {
    const arrange = [{}, { id: null }, { id: undefined }, { id: new VideoId() }];

    test.each(arrange)('when props is %j', (item) => {
      const genre = new Video(item as any);
      expect(genre.id).toBeInstanceOf(VideoId);
    });
  });

  describe('create command', () => {
    test('should create a video and no publish video media', () => {
      const categories_id = [new CategoryId()];
      const genres_id = [new GenreId()];
      const cast_members_id = [new CastMemberId()];

      const markAsPublished = jest.spyOn(Video.prototype as any, 'markAsPublished');
      const video = Video.create({
        title: 'test title',
        description: 'test description',
        year_launched: 2020,
        duration: 90,
        rating: Rating.createRL(),
        is_opened: true,
        categories_id,
        genres_id,
        cast_members_id,
      });
      expect(video.id).toBeInstanceOf(VideoId);
      expect(video.title).toBe('test title');
      expect(video.description).toBe('test description');
      expect(video.year_launched).toBe(2020);
      expect(video.duration).toBe(90);
      expect(video.rating).toBeInstanceOf(Rating);
      expect(video.is_opened).toBe(true);
      expect(video.is_published).toBe(false);
      expect(video.banner).toBeNull();
      expect(video.thumbnail).toBeNull();
      expect(video.thumbnail_half).toBeNull();
      expect(video.trailer).toBeNull();
      expect(video.video).toBeNull();
      expect(video.categories_id).toEqual(new Map(categories_id.map((id) => [id.value, id])));
      expect(video.genres_id).toEqual(new Map(genres_id.map((id) => [id.value, id])));
      expect(video.cast_members_id).toEqual(new Map(cast_members_id.map((id) => [id.value, id])));
      expect(video.created_at).toBeInstanceOf(Date);
      expect(video.is_published).toBeFalsy();
      expect(markAsPublished).toHaveBeenCalledTimes(1);
    });

    test('should create a video and published video', () => {
      const categories_id = [new CategoryId()];
      const genres_id = [new GenreId()];
      const cast_members_id = [new CastMemberId()];

      const markAsPublished = jest.spyOn(Video.prototype as any, 'markAsPublished');

      const trailer = TrailerMedia.create({
        name: 'test name trailer',
        raw_location: 'test raw location trailer',
      }).complete('test encoded_location trailer');
      const videoMedia = VideoMedia.create({
        name: 'test name video',
        raw_location: 'test raw location video',
      }).complete('test encoded_location video');

      const video = Video.create({
        title: 'test title',
        description: 'test description',
        year_launched: 2020,
        duration: 90,
        rating: Rating.createRL(),
        is_opened: true,
        trailer,
        video: videoMedia,
        categories_id,
        genres_id,
        cast_members_id,
      });
      expect(video.id).toBeInstanceOf(VideoId);
      expect(video.title).toBe('test title');
      expect(video.description).toBe('test description');
      expect(video.year_launched).toBe(2020);
      expect(video.duration).toBe(90);
      expect(video.rating).toBeInstanceOf(Rating);
      expect(video.is_opened).toBe(true);
      expect(video.is_published).toBe(true);
      expect(video.banner).toBeNull();
      expect(video.thumbnail).toBeNull();
      expect(video.thumbnail_half).toBeNull();
      expect(video.trailer).toEqual(trailer);
      expect(video.video).toEqual(videoMedia);
      expect(video.categories_id).toEqual(new Map(categories_id.map((id) => [id.value, id])));
      expect(video.genres_id).toEqual(new Map(genres_id.map((id) => [id.value, id])));
      expect(video.cast_members_id).toEqual(new Map(cast_members_id.map((id) => [id.value, id])));
      expect(video.created_at).toBeInstanceOf(Date);
      expect(video.is_published).toBeTruthy();
      expect(markAsPublished).toHaveBeenCalledTimes(1);
    });
  });

  describe('changeTitle method', () => {
    test('should change title', () => {
      const video = Video.fake().aVideoWithoutMedias().build();
      video.changeTitle('test title');
      expect(video.title).toBe('test title');
      expect(Video.prototype.validate).toHaveBeenCalledTimes(3);
    });
  });

  describe('changeDescription method', () => {
    test('should change description', () => {
      const video = Video.fake().aVideoWithoutMedias().build();
      video.changeDescription('test description');
      expect(video.description).toBe('test description');
    });
  });

  describe('changeYearLaunched method', () => {
    test('should change year launched', () => {
      const video = Video.fake().aVideoWithoutMedias().build();
      video.changeYearLaunched(2020);
      expect(video.year_launched).toBe(2020);
    });
  });

  describe('changeDuration method', () => {
    test('should change duration', () => {
      const video = Video.fake().aVideoWithoutMedias().build();
      video.changeDuration(90);
      expect(video.duration).toBe(90);
    });
  });

  describe('changeRating method', () => {
    test('should change rating', () => {
      const video = Video.fake().aVideoWithoutMedias().build();
      const rating = Rating.createRL();
      video.changeRating(rating);
      expect(video.rating).toBe(rating);
    });
  });

  describe('markAsOpened method', () => {
    test('should mark as opened', () => {
      const video = Video.fake().aVideoWithoutMedias().build();
      video.markAsOpened();
      expect(video.is_opened).toBeTruthy();
    });
  });

  describe('markAsNotOpened method', () => {
    test('should mark as not opened', () => {
      const video = Video.fake().aVideoWithoutMedias().build();
      video.markAsNotOpened();
      expect(video.is_opened).toBeFalsy();
    });
  });

  describe('replaceBanner method', () => {
    test('should replace banner', () => {
      const video = Video.fake().aVideoWithoutMedias().build();
      const banner = new Banner({
        name: 'test name banner',
        location: 'test location banner',
      });
      video.replaceBanner(banner);
      expect(video.banner).toEqual(banner);
    });
  });

  describe('replaceThumbnail method', () => {
    test('should replace thumbnail', () => {
      const video = Video.fake().aVideoWithoutMedias().build();
      const thumbnail = new Thumbnail({
        name: 'test name thumbnail',
        location: 'test location thumbnail',
      });
      video.replaceThumbnail(thumbnail);
      expect(video.thumbnail).toEqual(thumbnail);
    });
  });

  describe('replaceThumbnailHalf method', () => {
    test('should replace thumbnail half', () => {
      const video = Video.fake().aVideoWithoutMedias().build();
      const thumbnailHalf = new ThumbnailHalf({
        name: 'test name thumbnail half',
        location: 'test location thumbnail half',
      });
      video.replaceThumbnailHalf(thumbnailHalf);
      expect(video.thumbnail_half).toEqual(thumbnailHalf);
    });
  });

  describe('replaceTrailer method', () => {
    test('should replace trailer', () => {
      const video = Video.fake().aVideoWithoutMedias().build();
      const trailer = TrailerMedia.create({
        name: 'test name trailer',
        raw_location: 'test raw location trailer',
      });
      video.replaceTrailer(trailer);
      expect(video.trailer).toEqual(trailer);
    });
  });

  describe('replaceVideo method', () => {
    test('should replace video', () => {
      const video = Video.fake().aVideoWithoutMedias().build();
      const videoMedia = VideoMedia.create({
        name: 'test name video',
        raw_location: 'test raw location video',
      });
      video.replaceVideo(videoMedia);
      expect(video.video).toEqual(videoMedia);
    });
  });

  describe('categories_id field', () => {
    test('should add category id', () => {
      const categoryId = new CategoryId();
      const video = Video.fake().aVideoWithoutMedias().build();
      video.addCategoryId(categoryId);
      expect(video.categories_id.size).toBe(2);
      expect(video.categories_id.get(categoryId.value)).toBe(categoryId);
    });

    test('should remove category id', () => {
      const video = Video.fake().aVideoWithoutMedias().build();
      expect(video.categories_id.size).toBe(1);
      video.removeCategoryId([...video.categories_id.values()][0]);
      expect(video.categories_id.size).toBe(0);
    });

    test('should sync categories id', () => {
      const categoryId1 = new CategoryId();
      const categoryId2 = new CategoryId();
      const video = Video.fake().aVideoWithoutMedias().build();
      video.syncCategoriesId([]);
      expect(video.categories_id.size).toBe(1);
      video.syncCategoriesId([categoryId1, categoryId2]);
      expect(video.categories_id.size).toBe(2);
      expect(video.categories_id.get(categoryId1.value)).toBe(categoryId1);
      expect(video.categories_id.get(categoryId2.value)).toBe(categoryId2);
    });
  });

  describe('genres_id field', () => {
    test('should add genre id', () => {
      const genreId = new GenreId();
      const video = Video.fake().aVideoWithoutMedias().build();
      video.addGenreId(genreId);
      expect(video.genres_id.size).toBe(2);
      expect(video.genres_id.get(genreId.value)).toBe(genreId);
    });

    test('should remove genre id', () => {
      const video = Video.fake().aVideoWithoutMedias().build();
      expect(video.genres_id.size).toBe(1);
      video.removeGenreId([...video.genres_id.values()][0]);
      expect(video.genres_id.size).toBe(0);
    });

    test('should sync genres id', () => {
      const genreId1 = new GenreId();
      const genreId2 = new GenreId();
      const video = Video.fake().aVideoWithoutMedias().build();
      video.syncGenresId([]);
      expect(video.genres_id.size).toBe(1);
      video.syncGenresId([genreId1, genreId2]);
      expect(video.genres_id.size).toBe(2);
      expect(video.genres_id.get(genreId1.value)).toBe(genreId1);
      expect(video.genres_id.get(genreId2.value)).toBe(genreId2);
    });
  });

  describe('cast_members_id field', () => {
    test('should add cast member id', () => {
      const castMemberId = new CastMemberId();
      const video = Video.fake().aVideoWithoutMedias().build();
      video.addCastMemberId(castMemberId);
      expect(video.cast_members_id.size).toBe(2);
      expect(video.cast_members_id.get(castMemberId.value)).toBe(castMemberId);
    });

    test('should remove cast member id', () => {
      const video = Video.fake().aVideoWithoutMedias().build();
      expect(video.cast_members_id.size).toBe(1);
      video.removeCastMemberId([...video.cast_members_id.values()][0]);
      expect(video.cast_members_id.size).toBe(0);
    });

    test('should sync cast members id', () => {
      const castMemberId1 = new CastMemberId();
      const castMemberId2 = new CastMemberId();
      const video = Video.fake().aVideoWithoutMedias().build();
      video.syncCastMemberId([]);
      expect(video.cast_members_id.size).toBe(1);
      video.syncCastMemberId([castMemberId1, castMemberId2]);
      expect(video.cast_members_id.size).toBe(2);
      expect(video.cast_members_id.get(castMemberId1.value)).toBe(castMemberId1);
      expect(video.cast_members_id.get(castMemberId2.value)).toBe(castMemberId2);
    });
  });

  test('markAsPublished method', () => {
    let video = Video.fake().aVideoWithoutMedias().build();
    video['markAsPublished']();
    expect(video.is_published).toBeFalsy();

    video = Video.fake().aVideoWithoutMedias().build();
    const trailer = TrailerMedia.create({
      name: 'test name trailer',
      raw_location: 'test raw location trailer',
    }).complete('test encoded_location trailer');
    const videoMedia = VideoMedia.create({
      name: 'test name video',
      raw_location: 'test raw location video',
    }).complete('test encoded_location video');

    video.replaceTrailer(trailer);
    video.replaceVideo(videoMedia);
    video['markAsPublished']();
    expect(video.is_published).toBeTruthy();
  });

  test('entity to json', () => {
    const get_values = (ids: Map<string, Uuid>) => [...ids.values()].map((id) => id.value);
    const video1 = Video.fake().aVideoWithoutMedias().build();
    expect(video1.toJSON()).toStrictEqual({
      id: video1.id.value,
      title: video1.title,
      description: video1.description,
      year_launched: video1.year_launched,
      duration: video1.duration,
      rating: video1.rating.value,
      is_opened: video1.is_opened,
      is_published: video1.is_published,
      banner: null,
      thumbnail: null,
      thumbnail_half: null,
      trailer: null,
      video: null,
      categories_id: get_values(video1.categories_id),
      genres_id: get_values(video1.genres_id),
      cast_members_id: get_values(video1.cast_members_id),
      created_at: video1.created_at,
    });
    const video2 = Video.fake().aVideoWithAllMedias().build();
    expect(video2.toJSON()).toStrictEqual({
      id: video2.id.value,
      title: video2.title,
      description: video2.description,
      year_launched: video2.year_launched,
      duration: video2.duration,
      rating: video2.rating.value,
      is_opened: video2.is_opened,
      is_published: video2.is_published,
      banner: video2.banner?.toJSON(),
      thumbnail: video2.thumbnail?.toJSON(),
      thumbnail_half: video2.thumbnail_half?.toJSON(),
      trailer: video2.trailer?.toJSON(),
      video: video2.video?.toJSON(),
      categories_id: get_values(video2.categories_id),
      genres_id: get_values(video2.genres_id),
      cast_members_id: get_values(video2.cast_members_id),
      created_at: video2.created_at,
    });
  });
});

describe('Video Validator', () => {
  describe('create command', () => {
    test('should an invalid video with title property', () => {
      const video = Video.create({
        title: 't'.repeat(256),
        categories_id: [new CategoryId()],
        genres_id: [new GenreId()],
        cast_members_id: [new CastMemberId()],
      } as any);
      expect(video.notification.hasErrors()).toBe(true);
      expect(video.notification).notificationContainsErrorMessages([
        {
          title: ['title must be shorter than or equal to 255 characters'],
        },
      ]);
    });
  });
  describe('changeTitle method', () => {
    it('should a invalid video using title property', () => {
      const video = Video.fake().aVideoWithoutMedias().build();
      video.changeTitle('t'.repeat(256));
      expect(video.notification.hasErrors()).toBe(true);
      expect(video.notification).notificationContainsErrorMessages([
        {
          title: ['title must be shorter than or equal to 255 characters'],
        },
      ]);
    });
  });
});
