import { get, set, del } from 'idb-keyval';
import { Chapter } from '../mock/data';

const cacheKey = (bookId: string) => `cache_chapters_${bookId}`;

export const getCachedChapters = async (bookId: string): Promise<Chapter[] | null> => {
  const chapters = await get<Chapter[]>(cacheKey(bookId));
  return chapters && chapters.length > 0 ? chapters : null;
};

export const setCachedChapters = async (bookId: string, chapters: Chapter[]): Promise<void> => {
  await set(cacheKey(bookId), chapters);
};

export const removeCachedChapters = async (bookId: string): Promise<void> => {
  await del(cacheKey(bookId));
};

