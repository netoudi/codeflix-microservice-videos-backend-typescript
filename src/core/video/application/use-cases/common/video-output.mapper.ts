import { CastMember } from '@/core/cast-member/domain/cast-member.entity';
import { Category } from '@/core/category/domain/category.entity';
import { Genre } from '@/core/genre/domain/genre.aggregate';
import { Video } from '@/core/video/domain/video.aggregate';

export type VideoCategoryOutput = {
  id: string;
  name: string;
  created_at: Date;
};

export type VideoGenreOutput = {
  id: string;
  name: string;
  created_at: Date;
};

export type VideoCastMemberOutput = {
  id: string;
  name: string;
  created_at: Date;
};

export type VideoOutput = {
  id: string;
  title: string;
  description: string;
  year_launched: number;
  duration: number;
  rating: string;
  is_opened: boolean;
  is_published: boolean;

  categories: VideoCategoryOutput[];
  categories_id: string[];

  genres: VideoGenreOutput[];
  genres_id: string[];

  cast_members: VideoCastMemberOutput[];
  cast_members_id: string[];

  created_at: Date;
};

export class VideoOutputMapper {
  static toOutput(
    video: Video,
    categories: Category[] = [],
    genres: Genre[] = [],
    cast_members: CastMember[] = [],
  ): VideoOutput {
    return {
      id: video.id.value,
      title: video.title,
      description: video.description,
      year_launched: video.year_launched,
      duration: video.duration,
      rating: video.rating.value,
      is_opened: video.is_opened,
      is_published: video.is_published,

      categories: categories
        .filter((c) => video.categories_id.has(c.id.value))
        .map((c) => ({
          id: c.id.value,
          name: c.name,
          created_at: c.created_at,
        })),
      categories_id: [...video.categories_id.values()].map((e) => e.value),

      genres: genres
        .filter((c) => video.genres_id.has(c.id.value))
        .map((c) => ({
          id: c.id.value,
          name: c.name,
          created_at: c.created_at,
        })),
      genres_id: [...video.genres_id.values()].map((e) => e.value),

      cast_members: cast_members
        .filter((c) => video.cast_members_id.has(c.id.value))
        .map((c) => ({
          id: c.id.value,
          name: c.name,
          created_at: c.created_at,
        })),
      cast_members_id: [...video.cast_members_id.values()].map((e) => e.value),

      created_at: video.created_at,
    };
  }
}
