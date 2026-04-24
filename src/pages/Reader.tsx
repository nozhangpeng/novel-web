import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { getBookById, getChaptersByBookId, Book, Chapter } from '../mock/data';
import { getLocalChapters } from '../utils/localBook';
import { exportBookToHtml } from '../utils/exportHtml';
import { 
  Settings, List, ChevronLeft, ChevronRight, 
  ArrowLeft, Moon, Sun, Loader2, ArrowUpDown, Download
} from 'lucide-react';
import clsx from 'clsx';

export default function Reader() {
  const { id, chapterId } = useParams<{ id: string; chapterId: string }>();
  const navigate = useNavigate();
  
  const { readerSettings, updateReaderSettings, updateReadProgress, bookshelf, addReadingHistory } = useStore();
  const [showControls, setShowControls] = useState(false);
  const [showToc, setShowToc] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tocAscending, setTocAscending] = useState(true);

  const [book, setBook] = useState<Book | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  const isInBookshelf = bookshelf.some(b => b.bookId === id);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        let loadedBook: Book | null = null;
        let loadedChapters: Chapter[] = [];
        
        if (id?.startsWith('local_')) {
          const currentBookshelf = useStore.getState().bookshelf;
          const localBookItem = currentBookshelf.find(b => b.bookId === id);
          loadedBook = localBookItem ? localBookItem.bookInfo : null;
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

  // 根据翻页模式设置不同的容器样式
  const getContainerStyle = () => {
    if (readerSettings.turnMode === 'scroll') {
      return "max-w-3xl mx-auto px-6 py-12 pb-32 min-h-screen flex flex-col cursor-pointer";
    }
    // 非上下翻页模式（如平移、覆盖、仿真等）时，将页面限制为全屏高度并隐藏超出内容，模拟阅读器单页效果
    return "max-w-3xl mx-auto px-6 py-12 h-screen overflow-hidden flex flex-col cursor-pointer";
  };

  return (
    <div 
      className={clsx(
        'min-h-screen relative overflow-x-hidden select-none',
        themeStyles[readerSettings.theme]
      )}
      onClick={handleScreenClick}
    >
      {/* Content */}
      <div 
        className={getContainerStyle()}
        style={{ 
          fontSize: `${readerSettings.fontSize}px`,
          lineHeight: readerSettings.lineHeight,
          fontFamily: readerSettings.fontFamily === 'serif' ? 'serif' : 'sans-serif'
        }}
      >
        <h1 className="text-2xl font-bold mb-12 text-center shrink-0">{chapter.title}</h1>
        
        {readerSettings.turnMode === 'scroll' ? (
          // 上下翻页（滚动模式）
          <div className="flex-1 min-h-[50vh]">
            {chapter.content.map((p, idx) => (
              <p key={idx} className="mb-6 indent-8 text-justify break-words leading-relaxed tracking-wide">{p}</p>
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
          // 单页翻页（平移、覆盖、仿真等） - 使用 CSS Column 实现自动分页布局
          <div 
            className="flex-1 w-full overflow-hidden"
            style={{
              columnWidth: '100vw',
              columnGap: '0',
              height: '100%',
              // 这里简化处理：通过多栏布局将长文本自动分割为屏幕宽度的横向“页面”
              // 实际的翻页手势控制需要更复杂的 Touch Event 或引入第三方库，目前我们用点击左右区域触发章节切换
            }}
          >
            {chapter.content.map((p, idx) => (
              <p key={idx} className="mb-6 indent-8 text-justify break-words leading-relaxed tracking-wide">{p}</p>
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
          </div>

          {/* Footer */}
          <div 
            className="absolute bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur shadow-[0_-1px_10px_rgba(0,0,0,0.1)] flex items-center justify-around p-2 pb-safe pointer-events-auto"
            onClick={e => e.stopPropagation()}
          >
            <button 
              className="flex flex-col items-center p-3 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-16"
              onClick={() => { setShowToc(!showToc); setShowSettings(false); }}
            >
              <List size={22} />
              <span className="text-[11px] mt-1.5">目录</span>
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
              onClick={() => { setShowSettings(!showSettings); setShowToc(false); }}
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
                      onClick={() => {
                        navigate(`/read/${id}/${c.id}`, { replace: true });
                        setShowToc(false);
                        setShowControls(false);
                      }}
                      className={clsx(
                        'w-full text-left px-5 py-4 text-sm border-b dark:border-slate-800/50 transition-colors',
                        c.id === chapterId 
                          ? 'text-blue-600 dark:text-blue-400 font-medium bg-blue-50/50 dark:bg-blue-900/10' 
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
        </div>
      )}
    </div>
  );
}
