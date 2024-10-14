import { CastMember } from '@/core/cast-member/domain/cast-member.entity';
import { Category } from '@/core/category/domain/category.entity';
import { Genre } from '@/core/genre/domain/genre.aggregate';
import { VideoOutputMapper } from '@/core/video/application/use-cases/common/video-output.mapper';
import { Video } from '@/core/video/domain/video.aggregate';

describe('VideoOutputMapper Unit Tests', () => {
  it('should convert a video in output', () => {
    const categories = Category.fake().theCategories(2).build();
    const genres = Genre.fake().theGenres(2).build();
    genres[0].syncCategoriesId([categories[0].id]);
    genres[1].syncCategoriesId([categories[1].id]);
    const cast_members = CastMember.fake().theCastMembers(2).build();
    const created_at = new Date();
    const entity = Video.fake()
      .aVideoWithoutMedias()
      .withTitle('test')
      .addCategoryId(categories[0].id)
      .addCategoryId(categories[1].id)
      .addGenreId(genres[0].id)
      .addGenreId(genres[1].id)
      .addCastMemberId(cast_members[0].id)
      .addCastMemberId(cast_members[1].id)
      .withCreatedAt(created_at)
      .build();
    const output = VideoOutputMapper.toOutput(entity, categories, genres, cast_members);
    expect(output).toStrictEqual({
      id: entity.id.value,
      title: entity.title,
      description: entity.description,
      year_launched: entity.year_launched,
      duration: entity.duration,
      rating: entity.rating.value,
      is_opened: entity.is_opened,
      is_published: entity.is_published,
      categories: [
        {
          id: categories[0].id.value,
          name: categories[0].name,
          created_at: categories[0].created_at,
        },
        {
          id: categories[1].id.value,
          name: categories[1].name,
          created_at: categories[1].created_at,
        },
      ],
      categories_id: [categories[0].id.value, categories[1].id.value],
      genres: [
        {
          id: genres[0].id.value,
          name: genres[0].name,
          created_at: genres[0].created_at,
        },
        {
          id: genres[1].id.value,
          name: genres[1].name,
          created_at: genres[1].created_at,
        },
      ],
      genres_id: [genres[0].id.value, genres[1].id.value],
      cast_members: [
        {
          id: cast_members[0].id.value,
          name: cast_members[0].name,
          created_at: cast_members[0].created_at,
        },
        {
          id: cast_members[1].id.value,
          name: cast_members[1].name,
          created_at: cast_members[1].created_at,
        },
      ],
      cast_members_id: [cast_members[0].id.value, cast_members[1].id.value],
      created_at: entity.created_at,
    });
  });
});
