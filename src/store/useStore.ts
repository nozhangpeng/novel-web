import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Book } from '../mock/data';

interface BookshelfItem {
  bookId: string;
  bookInfo: Book;
  lastReadChapterId: string;
  lastReadChapterTitle: string;
  addTimestamp: number;
  isPinned?: boolean;
  pinTimestamp?: number;
}

export interface HistoryItem {
  bookId: string;
  bookInfo: Book;
  lastReadChapterId: string;
  lastReadChapterTitle: string;
  readTimestamp: number;
}

interface ReaderSettings {
  theme: 'day' | 'night' | 'sepia';
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
}

interface User {
  id: string;
  username: string;
  email: string;
}

interface StoreState {
  user: User | null;
  bookshelf: BookshelfItem[];
  readingHistory: HistoryItem[];
  readerSettings: ReaderSettings;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  addToBookshelf: (item: BookshelfItem) => void;
  removeFromBookshelf: (bookId: string) => void;
  togglePinBook: (bookId: string) => void;
  updateReadProgress: (bookId: string, chapterId: string, chapterTitle: string) => void;
  addReadingHistory: (item: HistoryItem) => void;
  removeReadingHistory: (bookId: string) => void;
  clearReadingHistory: () => void;
  updateReaderSettings: (settings: Partial<ReaderSettings>) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      user: null,
      bookshelf: [],
      readingHistory: [],
      readerSettings: {
        theme: 'day',
        fontSize: 18,
        fontFamily: 'sans',
        lineHeight: 1.8,
      },
      login: async (email, password) => {
        // Mock API call
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            if (email && password.length >= 6) {
              set({
                user: {
                  id: '1',
                  username: email.split('@')[0],
                  email,
                },
              });
              resolve();
            } else {
              reject(new Error('邮箱或密码错误'));
            }
          }, 500);
        });
      },
      register: async (username, email, password) => {
        // Mock API call
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            if (username && email && password.length >= 6) {
              set({
                user: {
                  id: '1',
                  username,
                  email,
                },
              });
              resolve();
            } else {
              reject(new Error('注册失败，请检查输入'));
            }
          }, 500);
        });
      },
      logout: () => {
        set({ user: null });
      },
      addToBookshelf: (item) =>
        set((state) => ({
          bookshelf: state.bookshelf.some((b) => b.bookId === item.bookId)
            ? state.bookshelf
            : [...state.bookshelf, item],
        })),
      removeFromBookshelf: (bookId) =>
        set((state) => ({
          bookshelf: state.bookshelf.filter((b) => b.bookId !== bookId),
        })),
      togglePinBook: (bookId) =>
        set((state) => ({
          bookshelf: state.bookshelf.map((b) =>
            b.bookId === bookId
              ? { 
                  ...b, 
                  isPinned: !b.isPinned, 
                  pinTimestamp: !b.isPinned ? Date.now() : undefined 
                }
              : b
          ),
        })),
      updateReadProgress: (bookId, chapterId, chapterTitle) =>
        set((state) => {
          const book = state.bookshelf.find(b => b.bookId === bookId);
          if (book && book.lastReadChapterId === chapterId) {
            return state; // 如果章节没有改变，不进行状态更新，避免无限重绘
          }
          return {
            bookshelf: state.bookshelf.map((b) =>
              b.bookId === bookId
                ? { ...b, lastReadChapterId: chapterId, lastReadChapterTitle: chapterTitle }
                : b
            ),
          };
        }),
      addReadingHistory: (item) => 
        set((state) => {
          const existingHistory = state.readingHistory.filter(h => h.bookId !== item.bookId);
          return {
            readingHistory: [item, ...existingHistory]
          };
        }),
      removeReadingHistory: (bookId) =>
        set((state) => ({
          readingHistory: state.readingHistory.filter((h) => h.bookId !== bookId),
        })),
      clearReadingHistory: () =>
        set(() => ({
          readingHistory: [],
        })),
      updateReaderSettings: (settings) =>
        set((state) => ({
          readerSettings: { ...state.readerSettings, ...settings },
        })),
    }),
    {
      name: 'qidian-bookshelf-storage',
    }
  )
);
