import {
  InvalidMediaFileMimeTypeError,
  InvalidMediaFileSizeError,
} from '@/core/shared/domain/validators/media-file.validator';
import { AudioVideoMediaStatus } from '@/core/shared/domain/value-objects/audio-video-media.vo';
import { TrailerMedia } from '@/core/video/domain/trailer-media.vo';
import { VideoId } from '@/core/video/domain/video.aggregate';

describe('TrailerMedia Unit Tests', () => {
  it('should create a trailer media object from a valid file', () => {
    const data = Buffer.alloc(1024);
    const videoId = new VideoId();
    const [trailerMedia, error] = TrailerMedia.createFromFile({
      raw_name: 'test.mp4',
      mime_type: 'video/mp4',
      size: data.length,
      video_id: videoId,
    }).asArray();

    expect(error).toBeNull();
    expect(trailerMedia).toBeInstanceOf(TrailerMedia);
    expect(trailerMedia.name).toMatch(/\.mp4$/);
    expect(trailerMedia.raw_location).toBe(`videos/${videoId.value}/videos`);
    expect(trailerMedia.encoded_location).toBeNull();
    expect(trailerMedia.status).toBe(AudioVideoMediaStatus.PENDING);
  });

  it('should throw an error if the file size is too large', () => {
    const data = Buffer.alloc(TrailerMedia.max_size + 1);
    const videoId = new VideoId();
    const [trailerMedia, error] = TrailerMedia.createFromFile({
      raw_name: 'test.png',
      mime_type: 'image/png',
      size: data.length,
      video_id: videoId,
    });

    expect(trailerMedia).toBeNull();
    expect(error).toBeInstanceOf(InvalidMediaFileSizeError);
  });

  it('should throw an error if the file mime type is not valid', () => {
    const data = Buffer.alloc(1024);
    const videoId = new VideoId();
    const [trailerMedia, error] = TrailerMedia.createFromFile({
      raw_name: 'test.txt',
      mime_type: 'text/plain',
      size: data.length,
      video_id: videoId,
    });

    expect(trailerMedia).toBeNull();
    expect(error).toBeInstanceOf(InvalidMediaFileMimeTypeError);
  });

  it('should create a new trailer media object with status processing', () => {
    const data = Buffer.alloc(1024);
    const videoId = new VideoId();
    const [trailerMedia, error] = TrailerMedia.createFromFile({
      raw_name: 'test.mp4',
      mime_type: 'video/mp4',
      size: data.length,
      video_id: videoId,
    }).asArray();

    expect(error).toBeNull();
    expect(trailerMedia).toBeInstanceOf(TrailerMedia);
    expect(trailerMedia.name).toMatch(/\.mp4$/);
    expect(trailerMedia.raw_location).toBe(`videos/${videoId.value}/videos`);
    expect(trailerMedia.encoded_location).toBeNull();
    expect(trailerMedia.status).toBe(AudioVideoMediaStatus.PENDING);

    const newTrailerMedia = trailerMedia.process();

    expect(newTrailerMedia).toBeInstanceOf(TrailerMedia);
    expect(newTrailerMedia.name).toMatch(/\.mp4$/);
    expect(newTrailerMedia.raw_location).toBe(`videos/${videoId.value}/videos`);
    expect(newTrailerMedia.encoded_location).toBeNull();
    expect(newTrailerMedia.status).toBe(AudioVideoMediaStatus.PROCESSING);
  });

  it('should create a new trailer media object with status completed', () => {
    const data = Buffer.alloc(1024);
    const videoId = new VideoId();
    const [trailerMedia, error] = TrailerMedia.createFromFile({
      raw_name: 'test.mp4',
      mime_type: 'video/mp4',
      size: data.length,
      video_id: videoId,
    }).asArray();

    expect(error).toBeNull();
    expect(trailerMedia).toBeInstanceOf(TrailerMedia);
    expect(trailerMedia.name).toMatch(/\.mp4$/);
    expect(trailerMedia.raw_location).toBe(`videos/${videoId.value}/videos`);
    expect(trailerMedia.encoded_location).toBeNull();
    expect(trailerMedia.status).toBe(AudioVideoMediaStatus.PENDING);

    const newTrailerMedia = trailerMedia.complete('path/to/video/encoded');

    expect(newTrailerMedia).toBeInstanceOf(TrailerMedia);
    expect(newTrailerMedia.name).toMatch(/\.mp4$/);
    expect(newTrailerMedia.raw_location).toBe(`videos/${videoId.value}/videos`);
    expect(newTrailerMedia.encoded_location).toBe('path/to/video/encoded');
    expect(newTrailerMedia.status).toBe(AudioVideoMediaStatus.COMPLETED);
  });

  it('should create a new trailer media object with status failed', () => {
    const data = Buffer.alloc(1024);
    const videoId = new VideoId();
    const [trailerMedia, error] = TrailerMedia.createFromFile({
      raw_name: 'test.mp4',
      mime_type: 'video/mp4',
      size: data.length,
      video_id: videoId,
    }).asArray();

    expect(error).toBeNull();
    expect(trailerMedia).toBeInstanceOf(TrailerMedia);
    expect(trailerMedia.name).toMatch(/\.mp4$/);
    expect(trailerMedia.raw_location).toBe(`videos/${videoId.value}/videos`);
    expect(trailerMedia.encoded_location).toBeNull();
    expect(trailerMedia.status).toBe(AudioVideoMediaStatus.PENDING);

    const newTrailerMedia = trailerMedia.fail();

    expect(newTrailerMedia).toBeInstanceOf(TrailerMedia);
    expect(newTrailerMedia.name).toMatch(/\.mp4$/);
    expect(newTrailerMedia.raw_location).toBe(`videos/${videoId.value}/videos`);
    expect(newTrailerMedia.encoded_location).toBeNull();
    expect(newTrailerMedia.status).toBe(AudioVideoMediaStatus.FAILED);
  });
});
