import context from './context.js';
import { Playlist } from './models.js';
import { parsePlaylist } from './parsers.js';
import axios from 'axios';

/**
 * Fetches and parses playlist data by playlist ID.
 * @param playlistId The ID of the playlist to fetch.
 * @param options Optional settings for language and country preferences.
 * @returns A promise resolving to the parsed playlist data or null if an error occurs.
 */
export async function getPlaylist(
  playlistId: string,
  options?: {
    lang: string;
    country: string;
  }
): Promise<Playlist | null> {
  const response = await axios.post(
    'https://music.youtube.com/youtubei/v1/browse?key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30',
    {
      ...context.body,
      browseId: playlistId,
    },
    {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept-Language': options?.lang ?? 'en',
        origin: 'https://music.youtube.com',
      },
    }
  );

  try {
    const data = parsePlaylist(response.data.contents);
    if (data) data.id = playlistId;
    return data;
  } catch (e) {
    console.error(e);
    return null;
  }
}
