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

export interface ReaderBookmark {
  id: string;
  bookId: string;
  chapterId: string;
  paragraphIndex: number;
  excerpt: string;
  createdAt: number;
}

export interface ReadingPosition {
  bookId: string;
  chapterId: string;
  paragraphIndex: number;
  updatedAt: number;
}

export interface ReadingStats {
  bookId: string;
  totalMs: number;
  updatedAt: number;
}

export interface TextHighlight {
  id: string;
  bookId: string;
  chapterId: string;
  paragraphIndex: number;
  startOffset: number;
  endOffset: number;
  text: string;
  color: 'yellow';
  note?: string;
  createdAt: number;
}

interface ReaderSettings {
  theme: 'day' | 'night' | 'sepia' | 'green';
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  turnMode: 'slide' | 'cover' | 'simulate' | 'scroll';
  fontWeight: 'normal' | 'bold';
  contrast: 'low' | 'normal' | 'high';
  contentWidth: 'narrow' | 'medium' | 'wide';
  pagePadding: 'sm' | 'md' | 'lg';
  paragraphSpacing: 'sm' | 'md' | 'lg';
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
  bookmarksByBookId: Record<string, ReaderBookmark[]>;
  readingPositionByBookId: Record<string, ReadingPosition>;
  readingStatsByBookId: Record<string, ReadingStats>;
  highlightsByBookId: Record<string, TextHighlight[]>;
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
  toggleBookmark: (bookId: string, chapterId: string, paragraphIndex: number, excerpt: string) => void;
  removeBookmark: (bookId: string, bookmarkId: string) => void;
  setReadingPosition: (bookId: string, chapterId: string, paragraphIndex: number) => void;
  addReadingTime: (bookId: string, deltaMs: number) => void;
  addHighlight: (highlight: Omit<TextHighlight, 'id' | 'createdAt'> & Partial<Pick<TextHighlight, 'id' | 'createdAt'>>) => void;
  removeHighlight: (bookId: string, highlightId: string) => void;
  updateHighlightNote: (bookId: string, highlightId: string, note: string) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      user: null,
      bookshelf: [],
      readingHistory: [],
      bookmarksByBookId: {},
      readingPositionByBookId: {},
      readingStatsByBookId: {},
      highlightsByBookId: {},
      readerSettings: {
        theme: 'day',
        fontSize: 18,
        fontFamily: 'sans',
        lineHeight: 1.8,
        turnMode: 'scroll',
        fontWeight: 'normal',
        contrast: 'normal',
        contentWidth: 'medium',
        pagePadding: 'md',
        paragraphSpacing: 'md',
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
      toggleBookmark: (bookId, chapterId, paragraphIndex, excerpt) =>
        set((state) => {
          const current = state.bookmarksByBookId[bookId] || [];
          const id = `${chapterId}:${paragraphIndex}`;
          const exists = current.some((b) => b.id === id);
          const next = exists
            ? current.filter((b) => b.id !== id)
            : [
                {
                  id,
                  bookId,
                  chapterId,
                  paragraphIndex,
                  excerpt,
                  createdAt: Date.now(),
                },
                ...current,
              ];
          return {
            bookmarksByBookId: {
              ...state.bookmarksByBookId,
              [bookId]: next,
            },
          };
        }),
      removeBookmark: (bookId, bookmarkId) =>
        set((state) => {
          const current = state.bookmarksByBookId[bookId] || [];
          return {
            bookmarksByBookId: {
              ...state.bookmarksByBookId,
              [bookId]: current.filter((b) => b.id !== bookmarkId),
            },
          };
        }),
      setReadingPosition: (bookId, chapterId, paragraphIndex) =>
        set((state) => ({
          readingPositionByBookId: {
            ...state.readingPositionByBookId,
            [bookId]: {
              bookId,
              chapterId,
              paragraphIndex,
              updatedAt: Date.now(),
            },
          },
        })),
      addReadingTime: (bookId, deltaMs) =>
        set((state) => {
          const current = state.readingStatsByBookId[bookId];
          const totalMs = Math.max(0, (current?.totalMs || 0) + Math.max(0, deltaMs));
          return {
            readingStatsByBookId: {
              ...state.readingStatsByBookId,
              [bookId]: {
                bookId,
                totalMs,
                updatedAt: Date.now(),
              },
            },
          };
        }),
      addHighlight: (highlight) =>
        set((state) => {
          const bookId = highlight.bookId;
          const current = state.highlightsByBookId[bookId] || [];
          const createdAt = highlight.createdAt ?? Date.now();
          const id = highlight.id ?? `${highlight.chapterId}:${highlight.paragraphIndex}:${highlight.startOffset}-${highlight.endOffset}:${createdAt}`;
          const next: TextHighlight[] = [
            {
              id,
              bookId,
              chapterId: highlight.chapterId,
              paragraphIndex: highlight.paragraphIndex,
              startOffset: highlight.startOffset,
              endOffset: highlight.endOffset,
              text: highlight.text,
              color: 'yellow',
              note: highlight.note,
              createdAt,
            },
            ...current,
          ];
          return {
            highlightsByBookId: {
              ...state.highlightsByBookId,
              [bookId]: next,
            },
          };
        }),
      removeHighlight: (bookId, highlightId) =>
        set((state) => {
          const current = state.highlightsByBookId[bookId] || [];
          return {
            highlightsByBookId: {
              ...state.highlightsByBookId,
              [bookId]: current.filter((h) => h.id !== highlightId),
            },
          };
        }),
      updateHighlightNote: (bookId, highlightId, note) =>
        set((state) => {
          const current = state.highlightsByBookId[bookId] || [];
          return {
            highlightsByBookId: {
              ...state.highlightsByBookId,
              [bookId]: current.map((h) => (h.id === highlightId ? { ...h, note } : h)),
            },
          };
        }),
    }),
    {
      name: 'qidian-bookshelf-storage',
    }
  )
);
