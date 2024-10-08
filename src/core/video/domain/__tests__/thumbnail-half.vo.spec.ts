import {
  InvalidMediaFileSizeError,
  InvalidMediaFileMimeTypeError,
} from '@/core/shared/domain/validators/media-file.validator';
import { ThumbnailHalf } from '@/core/video/domain/thumbnail-half.vo';
import { VideoId } from '@/core/video/domain/video.aggregate';

describe('ThumbnailHalf Unit Tests', () => {
  it('should create a thumbnail half object from a valid file', () => {
    const data = Buffer.alloc(1024);
    const videoId = new VideoId();
    const [thumbnailHalf, error] = ThumbnailHalf.createFromFile({
      raw_name: 'test.png',
      mime_type: 'image/png',
      size: data.length,
      video_id: videoId,
    }).asArray();

    expect(error).toBeNull();
    expect(thumbnailHalf).toBeInstanceOf(ThumbnailHalf);
    expect(thumbnailHalf.name).toMatch(/\.png$/);
    expect(thumbnailHalf.location).toBe(`videos/${videoId.value}/images`);
  });

  it('should throw an error if the file size is too large', () => {
    const data = Buffer.alloc(ThumbnailHalf.max_size + 1);
    const videoId = new VideoId();
    const [thumbnailHalf, error] = ThumbnailHalf.createFromFile({
      raw_name: 'test.png',
      mime_type: 'image/png',
      size: data.length,
      video_id: videoId,
    });

    expect(thumbnailHalf).toBeNull();
    expect(error).toBeInstanceOf(InvalidMediaFileSizeError);
  });

  it('should throw an error if the file mime type is not valid', () => {
    const data = Buffer.alloc(1024);
    const videoId = new VideoId();
    const [thumbnailHalf, error] = ThumbnailHalf.createFromFile({
      raw_name: 'test.txt',
      mime_type: 'text/plain',
      size: data.length,
      video_id: videoId,
    });

    expect(thumbnailHalf).toBeNull();
    expect(error).toBeInstanceOf(InvalidMediaFileMimeTypeError);
  });
});
