import {
  InvalidMediaFileMimeTypeError,
  InvalidMediaFileSizeError,
} from '@/core/shared/domain/validators/media-file.validator';
import { AudioVideoMediaStatus } from '@/core/shared/domain/value-objects/audio-video-media.vo';
import { VideoMedia } from '@/core/video/domain/video-media.vo';
import { VideoId } from '@/core/video/domain/video.aggregate';

describe('VideoMedia Unit Tests', () => {
  it('should create a video media object from a valid file', () => {
    const data = Buffer.alloc(1024);
    const videoId = new VideoId();
    const [videoMedia, error] = VideoMedia.createFromFile({
      raw_name: 'test.mp4',
      mime_type: 'video/mp4',
      size: data.length,
      video_id: videoId,
    }).asArray();

    expect(error).toBeNull();
    expect(videoMedia).toBeInstanceOf(VideoMedia);
    expect(videoMedia.name).toMatch(/\.mp4$/);
    expect(videoMedia.raw_location).toBe(`videos/${videoId.value}/videos`);
    expect(videoMedia.encoded_location).toBeNull();
    expect(videoMedia.status).toBe(AudioVideoMediaStatus.PENDING);
  });

  it('should throw an error if the file size is too large', () => {
    // const data = Buffer.alloc(VideoMedia.max_size + 1);
    const videoId = new VideoId();
    const [videoMedia, error] = VideoMedia.createFromFile({
      raw_name: 'test.png',
      mime_type: 'image/png',
      // size: data.length,
      size: VideoMedia.max_size + 1,
      video_id: videoId,
    });

    expect(videoMedia).toBeNull();
    expect(error).toBeInstanceOf(InvalidMediaFileSizeError);
  });

  it('should throw an error if the file mime type is not valid', () => {
    const data = Buffer.alloc(1024);
    const videoId = new VideoId();
    const [videoMedia, error] = VideoMedia.createFromFile({
      raw_name: 'test.txt',
      mime_type: 'text/plain',
      size: data.length,
      video_id: videoId,
    });

    expect(videoMedia).toBeNull();
    expect(error).toBeInstanceOf(InvalidMediaFileMimeTypeError);
  });

  it('should create a new video media object with status processing', () => {
    const data = Buffer.alloc(1024);
    const videoId = new VideoId();
    const [videoMedia, error] = VideoMedia.createFromFile({
      raw_name: 'test.mp4',
      mime_type: 'video/mp4',
      size: data.length,
      video_id: videoId,
    }).asArray();

    expect(error).toBeNull();
    expect(videoMedia).toBeInstanceOf(VideoMedia);
    expect(videoMedia.name).toMatch(/\.mp4$/);
    expect(videoMedia.raw_location).toBe(`videos/${videoId.value}/videos`);
    expect(videoMedia.encoded_location).toBeNull();
    expect(videoMedia.status).toBe(AudioVideoMediaStatus.PENDING);

    const newVideoMedia = videoMedia.process();

    expect(newVideoMedia).toBeInstanceOf(VideoMedia);
    expect(newVideoMedia.name).toMatch(/\.mp4$/);
    expect(newVideoMedia.raw_location).toBe(`videos/${videoId.value}/videos`);
    expect(newVideoMedia.encoded_location).toBeNull();
    expect(newVideoMedia.status).toBe(AudioVideoMediaStatus.PROCESSING);
  });

  it('should create a new video media object with status completed', () => {
    const data = Buffer.alloc(1024);
    const videoId = new VideoId();
    const [videoMedia, error] = VideoMedia.createFromFile({
      raw_name: 'test.mp4',
      mime_type: 'video/mp4',
      size: data.length,
      video_id: videoId,
    }).asArray();

    expect(error).toBeNull();
    expect(videoMedia).toBeInstanceOf(VideoMedia);
    expect(videoMedia.name).toMatch(/\.mp4$/);
    expect(videoMedia.raw_location).toBe(`videos/${videoId.value}/videos`);
    expect(videoMedia.encoded_location).toBeNull();
    expect(videoMedia.status).toBe(AudioVideoMediaStatus.PENDING);

    const newVideoMedia = videoMedia.complete('path/to/video/encoded');

    expect(newVideoMedia).toBeInstanceOf(VideoMedia);
    expect(newVideoMedia.name).toMatch(/\.mp4$/);
    expect(newVideoMedia.raw_location).toBe(`videos/${videoId.value}/videos`);
    expect(newVideoMedia.encoded_location).toBe('path/to/video/encoded');
    expect(newVideoMedia.status).toBe(AudioVideoMediaStatus.COMPLETED);
  });

  it('should create a new video media object with status failed', () => {
    const data = Buffer.alloc(1024);
    const videoId = new VideoId();
    const [videoMedia, error] = VideoMedia.createFromFile({
      raw_name: 'test.mp4',
      mime_type: 'video/mp4',
      size: data.length,
      video_id: videoId,
    }).asArray();

    expect(error).toBeNull();
    expect(videoMedia).toBeInstanceOf(VideoMedia);
    expect(videoMedia.name).toMatch(/\.mp4$/);
    expect(videoMedia.raw_location).toBe(`videos/${videoId.value}/videos`);
    expect(videoMedia.encoded_location).toBeNull();
    expect(videoMedia.status).toBe(AudioVideoMediaStatus.PENDING);

    const newVideoMedia = videoMedia.fail();

    expect(newVideoMedia).toBeInstanceOf(VideoMedia);
    expect(newVideoMedia.name).toMatch(/\.mp4$/);
    expect(newVideoMedia.raw_location).toBe(`videos/${videoId.value}/videos`);
    expect(newVideoMedia.encoded_location).toBeNull();
    expect(newVideoMedia.status).toBe(AudioVideoMediaStatus.FAILED);
  });
});
