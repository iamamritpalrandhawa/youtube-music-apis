import context from './context.js';
import { MusicItem } from './models.js';
import { parseAlbumHeader, parseMusicInAlbumItem } from './parsers.js';
import axios from 'axios';

/**
 * Parses the music items from the album response body.
 * @param body The response body containing the album data.
 * @returns An array of music items parsed from the album.
 */
export const parseAlbumBody = (body: any): MusicItem[] => {
  const { contents } =
    body.contents.twoColumnBrowseResultsRenderer.secondaryContents
      .sectionListRenderer.contents[0].musicShelfRenderer;
  const songs: MusicItem[] = [];
  const { thumbnailUrl, artist, album } = parseAlbumHeader(
    body.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content
      .sectionListRenderer.contents[0]
  );
  contents.forEach((element: any) => {
    try {
      const song = parseMusicInAlbumItem(element);
      if (song) {
        song.album = album;
        if (song.artists?.length === 0) song.artists = [{ name: artist }];
        song.thumbnailUrl = thumbnailUrl;
        songs.push(song);
      }
    } catch (err) {
      console.error(err);
    }
  });
  return songs;
};

/**
 * Fetches and parses music items from an album by its ID.
 * @param albumId The ID of the album to fetch music items from.
 * @returns A promise resolving to an array of music items.
 */
export async function listMusicFromAlbum(
  albumId: string
): Promise<MusicItem[]> {
  try {
    const response = await axios.post(
      'https://music.youtube.com/youtubei/v1/browse',
      {
        ...context.body,
        browseId: albumId,
      },
      {
        params: {
          alt: 'json',
          key: 'AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30',
        },
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
          origin: 'https://music.youtube.com',
        },
      }
    );

    return parseAlbumBody(response.data);
  } catch (e) {
    console.error(e);
    return [];
  }
}
