import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { getBookById, getChaptersByBookId, Book, Chapter } from '../mock/data';
import { getLocalChapters } from '../utils/localBook';
import { exportBookToHtml } from '../utils/exportHtml';
import { 
  Settings, List, ChevronLeft, ChevronRight, 
  ArrowLeft, Moon, Sun, Loader2, ArrowUpDown, Download, Bookmark, Trash2
} from 'lucide-react';
import clsx from 'clsx';

export default function Reader() {
  const { id, chapterId } = useParams<{ id: string; chapterId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const paragraphParam = searchParams.get('p');
  
  const { 
    readerSettings, 
    updateReaderSettings, 
    updateReadProgress, 
    bookshelf, 
    addReadingHistory,
    bookmarksByBookId,
    toggleBookmark,
    removeBookmark,
    setReadingPosition,
    readingStatsByBookId,
    addReadingTime
  } = useStore();
  const [showControls, setShowControls] = useState(false);
  const [showToc, setShowToc] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tocAscending, setTocAscending] = useState(true);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [activeParagraphIndex, setActiveParagraphIndex] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [sessionMs, setSessionMs] = useState(0);

  const [book, setBook] = useState<Book | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  const isInBookshelf = bookshelf.some(b => b.bookId === id);
  const toastTimerRef = useRef<number | null>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const longPressTriggeredRef = useRef(false);
  const pagedContainerRef = useRef<HTMLDivElement | null>(null);
  const contentContainerRef = useRef<HTMLDivElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const [pendingScrollTarget, setPendingScrollTarget] = useState<{ chapterId: string; paragraphIndex: number } | null>(null);
  const latestPositionRef = useRef<{ bookId: string; chapterId: string; paragraphIndex: number } | null>(null);
  const saveTimerRef = useRef<number | null>(null);
  const restoreAppliedRef = useRef<string | null>(null);
  const sessionStartRef = useRef<number | null>(null);
  const sessionAccumulatedRef = useRef(0);
  const totalReadingMs = useMemo(() => (id ? (readingStatsByBookId[id]?.totalMs || 0) : 0), [readingStatsByBookId, id]);

  const bookmarks = useMemo(() => {
    if (!id) return [];
    return bookmarksByBookId[id] || [];
  }, [bookmarksByBookId, id]);

  const bookmarkedParagraphsInChapter = useMemo(() => {
    if (!chapterId) return new Set<number>();
    const set = new Set<number>();
    for (const b of bookmarks) {
      if (b.chapterId === chapterId) {
        set.add(b.paragraphIndex);
      }
    }
    return set;
  }, [bookmarks, chapterId]);

  const chapterTitleById = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of chapters) {
      map.set(c.id, c.title);
    }
    return map;
  }, [chapters]);

  useEffect(() => {
    if (toast == null) return;
    if (toastTimerRef.current != null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => setToast(null), 1200);
    return () => {
      if (toastTimerRef.current != null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, [toast]);

  useEffect(() => {
    if (!id) return;
    restoreAppliedRef.current = null;
    const pos = useStore.getState().readingPositionByBookId[id];
    if (!pos) return;
    const key = `${pos.chapterId}:${pos.paragraphIndex}`;
    if (restoreAppliedRef.current === key) return;
    restoreAppliedRef.current = key;
    navigate(`/read/${id}/${pos.chapterId}?p=${pos.paragraphIndex}`, { replace: true });
  }, [id, navigate]);

  useEffect(() => {
    if (!chapterId || paragraphParam == null) return;
    if (pendingScrollTarget?.chapterId === chapterId && pendingScrollTarget.paragraphIndex === Number(paragraphParam)) {
      return;
    }
    const idx = Number(paragraphParam);
    if (!Number.isFinite(idx) || idx < 0) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete('p');
        return next;
      }, { replace: true });
      return;
    }
    setPendingScrollTarget({ chapterId, paragraphIndex: idx });
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('p');
      return next;
    }, { replace: true });
  }, [chapterId, paragraphParam, pendingScrollTarget, setSearchParams]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        let loadedBook: Book | null = null;
        let loadedChapters: Chapter[] = [];
        
        if (id?.startsWith('local_')) {
          const state = useStore.getState();
          const localBookItem = state.bookshelf.find(b => b.bookId === id);
          
          if (localBookItem) {
            loadedBook = localBookItem.bookInfo;
          } else {
            // 如果不在书架上，尝试从阅读历史中恢复数据
            const historyItem = state.readingHistory.find(h => h.bookId === id);
            loadedBook = historyItem ? historyItem.bookInfo : null;
          }
          
          loadedChapters = await getLocalChapters(id);
        } else {
          loadedBook = getBookById(id!) || null;
          loadedChapters = getChaptersByBookId(id!);
        }
        
        setBook(loadedBook);
        setChapters(loadedChapters);
        setChapter(loadedChapters.find(c => c.id === chapterId) || null);
      } catch (error) {
        console.error('Failed to load chapter data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, chapterId]);

  useEffect(() => {
    if (chapter && book) {
      addReadingHistory({
        bookId: id!,
        bookInfo: book,
        lastReadChapterId: chapter.id,
        lastReadChapterTitle: chapter.title,
        readTimestamp: Date.now()
      });
      
      if (isInBookshelf) {
        updateReadProgress(id!, chapter.id, chapter.title);
      }
    }
    window.scrollTo(0, 0);
  }, [chapter, book, id, isInBookshelf, updateReadProgress, addReadingHistory]);

  useEffect(() => {
    if (!id) return;
    sessionStartRef.current = Date.now();
    sessionAccumulatedRef.current = 0;
    setSessionMs(0);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const settle = () => {
      if (sessionStartRef.current == null) return;
      const now = Date.now();
      const delta = now - sessionStartRef.current;
      if (delta <= 0) return;
      sessionAccumulatedRef.current += delta;
      setSessionMs(sessionAccumulatedRef.current);
      addReadingTime(id, delta);
      sessionStartRef.current = now;
    };

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        settle();
        sessionStartRef.current = null;
      } else {
        sessionStartRef.current = Date.now();
      }
    };

    window.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('visibilitychange', onVisibility);
      settle();
    };
  }, [id, addReadingTime]);

  useEffect(() => {
    if (!id || !chapterId) return;
    if (!chapter) return;
    const idx = Math.max(0, Math.min(activeParagraphIndex, chapter.content.length - 1));
    latestPositionRef.current = { bookId: id, chapterId, paragraphIndex: idx };
    if (saveTimerRef.current != null) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      const cur = latestPositionRef.current;
      if (!cur) return;
      setReadingPosition(cur.bookId, cur.chapterId, cur.paragraphIndex);
    }, 1500);
    return () => {
      if (saveTimerRef.current != null) window.clearTimeout(saveTimerRef.current);
    };
  }, [id, chapterId, chapter, activeParagraphIndex, setReadingPosition]);

  useEffect(() => {
    return () => {
      const cur = latestPositionRef.current;
      if (!cur) return;
      setReadingPosition(cur.bookId, cur.chapterId, cur.paragraphIndex);
    };
  }, [setReadingPosition]);

  useEffect(() => {
    if (showToc && chapterId) {
      setTimeout(() => {
        const activeItem = document.getElementById(`toc-item-${chapterId}`);
        if (activeItem) {
          activeItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [showToc, chapterId]);

  useEffect(() => {
    if (!pendingScrollTarget) return;
    if (pendingScrollTarget.chapterId !== chapterId) return;
    if (!chapter) return;
    const targetId = `p-${pendingScrollTarget.chapterId}-${pendingScrollTarget.paragraphIndex}`;
    const scrollContainer = readerSettings.turnMode === 'scroll' ? null : pagedContainerRef.current;
    setTimeout(() => {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'start' });
      } else {
        window.scrollTo(0, 0);
        if (scrollContainer) {
          scrollContainer.scrollTo({ left: 0, behavior: 'smooth' });
        }
      }
      setPendingScrollTarget(null);
    }, 60);
  }, [pendingScrollTarget, chapterId, chapter, readerSettings.turnMode]);

  useEffect(() => {
    if (!chapterId) return;
    if (!chapter) return;
    const root = readerSettings.turnMode === 'scroll' ? null : pagedContainerRef.current;
    const container = contentContainerRef.current;
    if (!container) return;

    const nodes = Array.from(container.querySelectorAll<HTMLElement>(`[data-paragraph="true"][data-chapter-id="${chapterId}"]`));
    if (nodes.length === 0) return;

    const pickBest = (entries: IntersectionObserverEntry[]) => {
      let best: { idx: number; ratio: number; dist: number } | null = null;
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        const idxStr = el.dataset.paragraphIndex;
        if (!idxStr) continue;
        const idx = Number(idxStr);
        if (!Number.isFinite(idx)) continue;
        const rect = entry.boundingClientRect;
        const rootRect = entry.rootBounds;
        const centerY = rect.top + rect.height / 2;
        const baseCenterY = rootRect ? rootRect.top + rootRect.height / 2 : window.innerHeight / 2;
        const dist = Math.abs(centerY - baseCenterY);
        const ratio = entry.intersectionRatio;
        if (!best || ratio > best.ratio || (ratio === best.ratio && dist < best.dist)) {
          best = { idx, ratio, dist };
        }
      }
      if (best) setActiveParagraphIndex(best.idx);
    };

    const observer = new IntersectionObserver(pickBest, {
      root,
      threshold: [0.25, 0.5, 0.75],
    });

    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [chapterId, chapter, readerSettings.turnMode, readerSettings.fontSize, readerSettings.lineHeight]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
        <p className="text-slate-500">加载中...</p>
      </div>
    );
  }


  if (!book || !chapter) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
        <p className="text-slate-500 mb-4">章节未找到</p>
        <button 
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          返回
        </button>
      </div>
    );
  }

  const currentChapterIndex = chapters.findIndex(c => c.id === chapter.id);
  const prevChapter = currentChapterIndex > 0 ? chapters[currentChapterIndex - 1] : null;
  const nextChapter = currentChapterIndex >= 0 && currentChapterIndex < chapters.length - 1 ? chapters[currentChapterIndex + 1] : null;

  const handlePrev = () => {
    if (prevChapter) navigate(`/read/${id}/${prevChapter.id}`, { replace: true });
  };

  const handleNext = () => {
    if (nextChapter) navigate(`/read/${id}/${nextChapter.id}`, { replace: true });
  };

  const handleScreenClick = (e: React.MouseEvent) => {
    // 只有点击阅读器主内容区域才触发手势，如果是点击了菜单等不处理
    const { clientX } = e;
    const width = window.innerWidth;
    const ratio = clientX / width;

    if (showControls) {
      // 如果菜单已经打开，点击任何地方都关闭菜单
      setShowControls(false);
      setShowSettings(false);
      setShowToc(false);
      return;
    }

    if (ratio < 0.3) {
      // 左侧 30% 区域，上一章
      if (prevChapter) handlePrev();
    } else if (ratio > 0.7) {
      // 右侧 30% 区域，下一章
      if (nextChapter) handleNext();
    } else {
      // 中间 40% 区域，呼出菜单
      setShowControls(true);
    }
  };

  const themeStyles = {
    day: 'bg-[#f8f9fa] text-slate-900',
    night: 'bg-slate-900 text-slate-300',
    sepia: 'bg-[#f4ebd9] text-[#5c4b37]',
    green: 'bg-[#cce8cf] text-[#2c5234]',
  };

  const bookmarkHighlightStyles = {
    day: 'bg-amber-200/40',
    night: 'bg-slate-700/40',
    sepia: 'bg-amber-300/35',
    green: 'bg-emerald-200/50',
  };

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const chapterProgressRatio = (() => {
    const len = chapter?.content.length || 0;
    if (len <= 0) return 0;
    return Math.max(0, Math.min(1, (activeParagraphIndex + 1) / len));
  })();

  // 根据翻页模式设置不同的容器样式
  const getContainerStyle = () => {
    if (readerSettings.turnMode === 'scroll' || !readerSettings.turnMode) {
      return "max-w-3xl mx-auto px-6 py-12 pb-32 min-h-screen flex flex-col cursor-pointer";
    }
    // 非上下翻页模式（如平移、覆盖、仿真等）时，使用横向滚动容器
    return "w-full mx-auto px-6 py-12 h-[100dvh] flex flex-col cursor-pointer relative";
  };

  return (
    <div 
      className={clsx(
        'min-h-screen relative overflow-x-hidden select-none',
        themeStyles[readerSettings.theme]
      )}
      onClick={handleScreenClick}
    >
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] pointer-events-none">
          <div className="px-4 py-2 rounded-full bg-black/70 text-white text-sm backdrop-blur">
            {toast}
          </div>
        </div>
      )}
      <div className="fixed left-0 right-0 bottom-0 z-40 pointer-events-none">
        <div className="px-4 pb-safe pointer-events-auto" onClick={(e) => e.stopPropagation()}>
          <div
            ref={progressBarRef}
            className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden"
            onClick={(e) => {
              if (!id || !chapterId || !chapter) return;
              const el = progressBarRef.current;
              if (!el) return;
              const rect = el.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const ratio = rect.width <= 0 ? 0 : Math.max(0, Math.min(1, x / rect.width));
              const targetIdx = Math.max(0, Math.min(chapter.content.length - 1, Math.round((chapter.content.length - 1) * ratio)));
              setPendingScrollTarget({ chapterId, paragraphIndex: targetIdx });
            }}
          >
            <div className="h-full bg-blue-500/70 dark:bg-blue-400/70" style={{ width: `${chapterProgressRatio * 100}%` }} />
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 flex justify-between">
            <span>{Math.round(chapterProgressRatio * 100)}%</span>
            <span>{activeParagraphIndex + 1}/{chapter?.content.length || 0}</span>
          </div>
        </div>
      </div>
      {/* Content */}
      <div 
        className={getContainerStyle()}
        ref={contentContainerRef}
        style={{ 
          fontSize: `${readerSettings.fontSize}px`,
          lineHeight: readerSettings.lineHeight,
          fontFamily: readerSettings.fontFamily === 'serif' ? 'serif' : 'sans-serif'
        }}
      >
        <h1 className="text-2xl font-bold mb-12 text-center shrink-0">{chapter.title}</h1>
        
        {readerSettings.turnMode === 'scroll' || !readerSettings.turnMode ? (
          // 上下翻页（滚动模式）
          <div className="flex-1 min-h-[50vh]">
            {chapter.content.map((p, idx) => (
              <p
                key={idx}
                id={`p-${chapterId}-${idx}`}
                data-paragraph="true"
                data-chapter-id={chapterId}
                data-paragraph-index={idx}
                className={clsx(
                  'mb-6 indent-8 text-justify break-words leading-relaxed tracking-wide rounded-lg px-2 py-1 -mx-2',
                  bookmarkedParagraphsInChapter.has(idx) ? bookmarkHighlightStyles[readerSettings.theme] : ''
                )}
              >
                {p}
              </p>
            ))}
            <div className="flex justify-between items-center mt-16 pt-8 border-t border-current/10">
              <button 
                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                disabled={!prevChapter}
                className="px-6 py-3 rounded-full border border-current/20 disabled:opacity-30 flex items-center gap-2 hover:bg-current/5 transition-colors"
              >
                <ChevronLeft size={20} /> 上一章
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                disabled={!nextChapter}
                className="px-6 py-3 rounded-full border border-current/20 disabled:opacity-30 flex items-center gap-2 hover:bg-current/5 transition-colors"
              >
                下一章 <ChevronRight size={20} />
              </button>
            </div>
          </div>
        ) : (
          // 单页翻页（平移、覆盖、仿真等） - 使用 CSS Column 实现横向滚动分页
          <div 
            className="flex-1 w-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            ref={pagedContainerRef}
            style={{
              columnWidth: '100vw',
              columnGap: '1.5rem',
              height: '100%',
              paddingBottom: '2rem'
            }}
          >
            {chapter.content.map((p, idx) => (
              <p
                key={idx}
                id={`p-${chapterId}-${idx}`}
                data-paragraph="true"
                data-chapter-id={chapterId}
                data-paragraph-index={idx}
                className={clsx(
                  'mb-6 indent-8 text-justify break-words leading-relaxed tracking-wide snap-center max-w-[100vw] rounded-lg px-2 py-1 -mx-2',
                  bookmarkedParagraphsInChapter.has(idx) ? bookmarkHighlightStyles[readerSettings.theme] : ''
                )}
              >
                {p}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Controls Overlay */}
      {showControls && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          {/* Header */}
          <div 
            className="absolute top-0 left-0 right-0 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur shadow-sm flex items-center px-4 pointer-events-auto transition-transform"
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => navigate(`/book/${id}`)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <ArrowLeft size={24} className="text-slate-800 dark:text-slate-200" />
            </button>
            <span className="ml-4 font-medium text-slate-800 dark:text-slate-200 line-clamp-1">{book.title}</span>
            <div className="ml-auto text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
              <span>本次 {formatDuration(sessionMs)}</span>
              <span className="mx-2">·</span>
              <span>累计 {formatDuration(totalReadingMs)}</span>
            </div>
          </div>

          {/* Footer */}
          <div 
            className="absolute bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur shadow-[0_-1px_10px_rgba(0,0,0,0.1)] flex items-center justify-around p-2 pb-safe pointer-events-auto"
            onClick={e => e.stopPropagation()}
          >
            <button 
              className="flex flex-col items-center p-3 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-16"
              onClick={() => { setShowToc(!showToc); setShowSettings(false); setShowBookmarks(false); }}
            >
              <List size={22} />
              <span className="text-[11px] mt-1.5">目录</span>
            </button>
            <button 
              className="flex flex-col items-center p-3 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-16"
              onPointerDown={() => {
                if (!id || !chapterId || !chapter) return;
                longPressTriggeredRef.current = false;
                if (longPressTimerRef.current != null) window.clearTimeout(longPressTimerRef.current);
                longPressTimerRef.current = window.setTimeout(() => {
                  const idx = Math.max(0, Math.min(activeParagraphIndex, chapter.content.length - 1));
                  const raw = chapter.content[idx] || '';
                  const excerpt = raw.trim().slice(0, 30);
                  toggleBookmark(id, chapterId, idx, excerpt);
                  const exists = bookmarkedParagraphsInChapter.has(idx);
                  setToast(exists ? '已取消书签' : '已添加书签');
                  longPressTriggeredRef.current = true;
                }, 450);
              }}
              onPointerUp={() => {
                if (longPressTimerRef.current != null) window.clearTimeout(longPressTimerRef.current);
                if (longPressTriggeredRef.current) return;
                setShowBookmarks(!showBookmarks);
                setShowToc(false);
                setShowSettings(false);
              }}
              onPointerCancel={() => {
                if (longPressTimerRef.current != null) window.clearTimeout(longPressTimerRef.current);
              }}
            >
              <Bookmark size={22} />
              <span className="text-[11px] mt-1.5">书签</span>
            </button>
            <button 
              className="flex flex-col items-center p-3 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-16"
              onClick={() => {
                const newTheme = readerSettings.theme === 'day' ? 'night' : 'day';
                updateReaderSettings({ theme: newTheme });
              }}
            >
              {readerSettings.theme === 'night' ? <Sun size={22} /> : <Moon size={22} />}
              <span className="text-[11px] mt-1.5">{readerSettings.theme === 'night' ? '日间' : '夜间'}</span>
            </button>
            <button 
              className="flex flex-col items-center p-3 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-16"
              onClick={() => { setShowSettings(!showSettings); setShowToc(false); setShowBookmarks(false); }}
            >
              <Settings size={22} />
              <span className="text-[11px] mt-1.5">设置</span>
            </button>
            <button 
              className="flex flex-col items-center p-3 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-16"
              onClick={() => exportBookToHtml(book, chapters)}
            >
              <Download size={22} />
              <span className="text-[11px] mt-1.5">导出</span>
            </button>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div 
              className="absolute bottom-24 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white/95 dark:bg-slate-800/95 backdrop-blur rounded-2xl shadow-xl p-6 pointer-events-auto border border-slate-200 dark:border-slate-700"
              onClick={e => e.stopPropagation()}
            >
              <div className="space-y-6">
                {/* Theme */}
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 w-10">背景</span>
                  <div className="flex flex-1 gap-2 sm:gap-3">
                    {[
                      { id: 'day', name: '日间', color: 'bg-[#f8f9fa] border-slate-200 text-slate-800' },
                      { id: 'night', name: '夜间', color: 'bg-slate-900 border-slate-700 text-slate-300' },
                      { id: 'sepia', name: '护眼', color: 'bg-[#f4ebd9] border-[#e4dbc9] text-[#5c4b37]' },
                      { id: 'green', name: '绿色', color: 'bg-[#cce8cf] border-[#b0d1b4] text-[#2c5234]' },
                    ].map(t => (
                      <button
                        key={t.id}
                        onClick={() => updateReaderSettings({ theme: t.id as 'day' | 'night' | 'sepia' | 'green' })}
                        className={clsx(
                          'flex-1 py-1.5 sm:py-2 rounded-full border-2 text-xs sm:text-sm font-medium transition-all',
                          t.color,
                          readerSettings.theme === t.id ? 'border-blue-500 scale-105' : 'hover:scale-105'
                        )}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Turn Mode (翻页方式) */}
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 w-10">翻页</span>
                  <div className="flex flex-1 gap-2 sm:gap-3">
                    {[
                      { id: 'scroll', name: '上下' },
                      { id: 'slide', name: '平移' },
                      { id: 'cover', name: '覆盖' },
                      { id: 'simulate', name: '仿真' },
                    ].map(mode => (
                      <button
                        key={mode.id}
                        onClick={() => updateReaderSettings({ turnMode: mode.id as 'scroll' | 'slide' | 'cover' | 'simulate' })}
                        className={clsx(
                          'flex-1 py-1.5 rounded-full text-xs sm:text-sm font-medium border transition-colors',
                          readerSettings.turnMode === mode.id 
                            ? 'border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400' 
                            : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                        )}
                      >
                        {mode.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Size */}
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 w-10">字号</span>
                  <div className="flex flex-1 items-center gap-2 bg-slate-100 dark:bg-slate-700/50 rounded-full p-1">
                    <button 
                      onClick={() => updateReaderSettings({ fontSize: Math.max(14, readerSettings.fontSize - 2) })}
                      className="w-10 h-8 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                    >
                      A-
                    </button>
                    <span className="flex-1 text-center text-sm font-medium text-slate-700 dark:text-slate-200">
                      {readerSettings.fontSize}
                    </span>
                    <button 
                      onClick={() => updateReaderSettings({ fontSize: Math.min(32, readerSettings.fontSize + 2) })}
                      className="w-10 h-8 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                    >
                      A+
                    </button>
                  </div>
                </div>

                {/* Line Height */}
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 w-10">间距</span>
                  <div className="flex flex-1 gap-3">
                    {[1.5, 1.8, 2.0].map(lh => (
                      <button
                        key={lh}
                        onClick={() => updateReaderSettings({ lineHeight: lh })}
                        className={clsx(
                          'flex-1 py-1.5 rounded-full text-sm font-medium border transition-colors',
                          readerSettings.lineHeight === lh 
                            ? 'border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400' 
                            : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                        )}
                      >
                        {lh}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Family */}
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 w-10">字体</span>
                  <div className="flex flex-1 gap-3">
                    {[
                      { id: 'sans', name: '黑体' },
                      { id: 'serif', name: '宋体' },
                    ].map(f => (
                      <button
                        key={f.id}
                        onClick={() => updateReaderSettings({ fontFamily: f.id })}
                        className={clsx(
                          'flex-1 py-1.5 rounded-full text-sm font-medium border transition-colors',
                          readerSettings.fontFamily === f.id 
                            ? 'border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400' 
                            : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                        )}
                      >
                        <span style={{ fontFamily: f.id === 'serif' ? 'serif' : 'sans-serif' }}>{f.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TOC Sidebar */}
          {showToc && (
            <>
              {/* Backdrop */}
              <div 
                className="absolute inset-0 bg-black/20 pointer-events-auto"
                onClick={() => setShowToc(false)}
              />
              <div 
                className="absolute top-0 left-0 bottom-0 w-80 max-w-[80vw] bg-white dark:bg-slate-900 shadow-2xl pointer-events-auto flex flex-col transform transition-transform"
                onClick={e => e.stopPropagation()}
              >
                <div className="p-5 border-b dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">{book.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">共 {chapters.length} 章</p>
                  </div>
                  <button 
                    onClick={() => setTocAscending(!tocAscending)}
                    className="p-2 text-slate-500 hover:text-blue-500 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex flex-col items-center"
                  >
                    <ArrowUpDown size={18} />
                    <span className="text-[10px] mt-1">{tocAscending ? '正序' : '逆序'}</span>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto overscroll-contain">
                  {(tocAscending ? chapters : [...chapters].reverse()).map(c => (
                    <button
                      key={c.id}
                      id={`toc-item-${c.id}`}
                      onClick={() => {
                        navigate(`/read/${id}/${c.id}`, { replace: true });
                        setShowToc(false);
                        setShowControls(false);
                      }}
                      className={clsx(
                        'w-full text-left px-5 py-4 text-sm border-b dark:border-slate-800/50 transition-colors',
                        c.id === chapterId 
                          ? 'text-red-600 dark:text-red-500 font-bold bg-red-50 dark:bg-red-900/20' 
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      )}
                    >
                      {c.title}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {showBookmarks && (
            <>
              <div 
                className="absolute inset-0 bg-black/20 pointer-events-auto"
                onClick={() => setShowBookmarks(false)}
              />
              <div 
                className="absolute top-0 left-0 bottom-0 w-80 max-w-[80vw] bg-white dark:bg-slate-900 shadow-2xl pointer-events-auto flex flex-col transform transition-transform"
                onClick={e => e.stopPropagation()}
              >
                <div className="p-5 border-b dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">书签</h3>
                  <p className="text-sm text-slate-500 mt-1">共 {bookmarks.length} 条</p>
                </div>
                <div className="flex-1 overflow-y-auto overscroll-contain">
                  {bookmarks.length === 0 ? (
                    <div className="p-6 text-sm text-slate-500">长按底部“书签”可添加当前段落书签</div>
                  ) : (
                    bookmarks.map((b) => (
                      <div key={b.id} className="border-b dark:border-slate-800/50 px-5 py-4">
                        <button
                          className="w-full text-left"
                          onClick={() => {
                            const url = `/read/${id}/${b.chapterId}?p=${b.paragraphIndex}`;
                            navigate(url, { replace: true });
                            setShowBookmarks(false);
                            setShowControls(false);
                          }}
                        >
                          <div className="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-1">
                            {chapterTitleById.get(b.chapterId) || b.chapterId}
                          </div>
                          <div className="text-xs text-slate-500 mt-1 line-clamp-2">
                            {b.excerpt}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-2">
                            {new Date(b.createdAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </button>
                        <div className="mt-3 flex justify-end">
                          <button
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            onClick={() => {
                              if (!id) return;
                              removeBookmark(id, b.id);
                              setToast('已删除书签');
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
