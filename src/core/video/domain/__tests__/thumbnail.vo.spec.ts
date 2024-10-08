import {
  InvalidMediaFileSizeError,
  InvalidMediaFileMimeTypeError,
} from '@/core/shared/domain/validators/media-file.validator';
import { Thumbnail } from '@/core/video/domain/thumbnail.vo';
import { VideoId } from '@/core/video/domain/video.aggregate';

describe('Thumbnail Unit Tests', () => {
  it('should create a thumbnail object from a valid file', () => {
    const data = Buffer.alloc(1024);
    const videoId = new VideoId();
    const [thumbnail, error] = Thumbnail.createFromFile({
      raw_name: 'test.png',
      mime_type: 'image/png',
      size: data.length,
      video_id: videoId,
    }).asArray();

    expect(error).toBeNull();
    expect(thumbnail).toBeInstanceOf(Thumbnail);
    expect(thumbnail.name).toMatch(/\.png$/);
    expect(thumbnail.location).toBe(`videos/${videoId.value}/images`);
  });

  it('should throw an error if the file size is too large', () => {
    const data = Buffer.alloc(Thumbnail.max_size + 1);
    const videoId = new VideoId();
    const [thumbnail, error] = Thumbnail.createFromFile({
      raw_name: 'test.png',
      mime_type: 'image/png',
      size: data.length,
      video_id: videoId,
    });

    expect(thumbnail).toBeNull();
    expect(error).toBeInstanceOf(InvalidMediaFileSizeError);
  });

  it('should throw an error if the file mime type is not valid', () => {
    const data = Buffer.alloc(1024);
    const videoId = new VideoId();
    const [thumbnail, error] = Thumbnail.createFromFile({
      raw_name: 'test.txt',
      mime_type: 'text/plain',
      size: data.length,
      video_id: videoId,
    });

    expect(thumbnail).toBeNull();
    expect(error).toBeInstanceOf(InvalidMediaFileMimeTypeError);
  });
});
