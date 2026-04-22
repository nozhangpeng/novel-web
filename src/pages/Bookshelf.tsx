import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { BookOpen, Trash2, Clock, BookMarked, Upload, Pin, PinOff, History, Plus } from 'lucide-react';
import { useRef, useState, useMemo } from 'react';
import { importLocalNovel, removeLocalBookData } from '../utils/localBook';
import clsx from 'clsx';

export default function Bookshelf() {
  const { bookshelf, readingHistory, addToBookshelf, removeFromBookshelf, togglePinBook } = useStore();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [activeTab, setActiveTab] = useState<'bookshelf' | 'history'>('bookshelf');

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.txt')) {
      alert('请上传 .txt 格式的文本文件');
      return;
    }

    try {
      setIsImporting(true);
      const { book } = await importLocalNovel(file);
      addToBookshelf({
        bookId: book.id,
        bookInfo: book,
        lastReadChapterId: '',
        lastReadChapterTitle: '',
        addTimestamp: Date.now()
      });
      alert(`导入成功：《${book.title}》`);
    } catch (error) {
      console.error(error);
      alert('导入失败，请重试');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async (bookId: string, bookTitle: string) => {
    if (window.confirm(`确定要将《${bookTitle}》移出书架吗？`)) {
      removeFromBookshelf(bookId);
      if (bookId.startsWith('local_')) {
        await removeLocalBookData(bookId);
      }
    }
  };

  const renderEmpty = () => (
    <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-12 text-center border border-slate-100 min-h-[50vh] sm:min-h-[60vh] flex flex-col items-center justify-center">
      <div className="w-16 h-16 sm:w-24 sm:h-24 bg-slate-50 rounded-full flex items-center justify-center mb-4 sm:mb-6">
        <BookMarked className="w-8 h-8 sm:w-12 sm:h-12 text-slate-300" />
      </div>
      <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2 sm:mb-3">书架空空如也</h2>
      <p className="text-sm sm:text-base text-slate-500 mb-6 sm:mb-8 max-w-md px-4">去发现更多精彩好书，把它们加入书架吧！或者导入本地小说。</p>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0">
        <Link 
          to="/"
          className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-medium transition-colors shadow-md shadow-red-200"
        >
          去书城逛逛
        </Link>
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={isImporting}
          className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full font-medium transition-colors border border-slate-200 flex items-center justify-center gap-2"
        >
          <Upload className="w-4 h-4" /> {isImporting ? '导入中...' : '导入本地小说'}
        </button>
      </div>
      <input 
        type="file" 
        accept=".txt" 
        ref={fileInputRef} 
        onChange={handleImport} 
        className="hidden" 
      />
    </div>
  );

  const renderHistoryEmpty = () => (
    <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-slate-100 min-h-[50vh] flex flex-col items-center justify-center">
      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
        <History className="w-10 h-10 text-slate-300" />
      </div>
      <h2 className="text-xl font-bold text-slate-800 mb-2">暂无阅读历史</h2>
      <p className="text-slate-500">你还没有阅读过任何书籍，快去书城看看吧。</p>
    </div>
  );

  const sortedBookshelf = useMemo(() => {
    return [...bookshelf].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      if (a.isPinned && b.isPinned) {
        return (b.pinTimestamp || 0) - (a.pinTimestamp || 0);
      }
      return b.addTimestamp - a.addTimestamp;
    });
  }, [bookshelf]);

  const groupedHistory = useMemo(() => {
    const today = new Date();
    const todayStr = today.toDateString();
    
    const todayHistory: typeof readingHistory = [];
    const earlierHistory: typeof readingHistory = [];

    readingHistory.forEach(item => {
      const itemDate = new Date(item.readTimestamp);
      if (itemDate.toDateString() === todayStr) {
        todayHistory.push(item);
      } else {
        earlierHistory.push(item);
      }
    });

    return { todayHistory, earlierHistory };
  }, [readingHistory]);

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('bookshelf')}
          className={clsx(
            'text-lg font-bold pb-2 border-b-2 transition-colors',
            activeTab === 'bookshelf' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-600 hover:text-red-500'
          )}
        >
          我的书架
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={clsx(
            'text-lg font-bold pb-2 border-b-2 transition-colors',
            activeTab === 'history' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-600 hover:text-red-500'
          )}
        >
          阅读历史
        </button>
      </div>

      {activeTab === 'bookshelf' ? (
        bookshelf.length === 0 ? renderEmpty() : (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <BookMarked className="text-red-600" /> 书架
              </h2>
              <div className="flex items-center gap-4">
                <span className="text-slate-500 text-sm font-medium bg-slate-100 px-3 py-1 rounded-full">
                  共 {bookshelf.length} 本书
                </span>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isImporting}
                  className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-red-600 transition-colors bg-white px-4 py-2 rounded-full border shadow-sm hover:border-red-200 hover:bg-red-50"
                >
                  <Upload className="w-4 h-4" />
                  {isImporting ? '导入中...' : '导入本地'}
                </button>
                <input 
                  type="file" 
                  accept=".txt" 
                  ref={fileInputRef} 
                  onChange={handleImport} 
                  className="hidden" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedBookshelf.map((item) => {
                const { bookInfo, lastReadChapterId, lastReadChapterTitle, bookId, isPinned } = item;
                const readUrl = `/read/${bookId}/${lastReadChapterId || 'c1'}`;
                
                return (
                  <div 
                    key={bookId}
                    className={`bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-all duration-300 group flex flex-col transform hover:-translate-y-1 ${
                      isPinned ? 'border-red-200 ring-1 ring-red-50' : 'border-slate-100'
                    }`}
                  >
                    <div className="flex p-5 gap-4 flex-1 cursor-pointer relative" onClick={() => navigate(readUrl)}>
                      {isPinned && (
                        <div className="absolute top-0 left-0 bg-red-500 text-white p-1 rounded-br-lg shadow-sm z-10">
                          <Pin className="w-3.5 h-3.5" />
                        </div>
                      )}
                      
                      <div className="relative w-24 h-32 shrink-0 rounded-lg overflow-hidden shadow-sm group-hover:shadow transition-shadow">
                        <img 
                          src={bookInfo.coverUrl} 
                          alt={bookInfo.title} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <BookOpen className="text-white w-8 h-8" />
                        </div>
                        {bookId.startsWith('local_') && (
                          <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-bl-lg font-medium">
                            本地
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0 py-1 flex flex-col">
                        <h3 className="font-bold text-lg text-slate-800 mb-1 truncate group-hover:text-red-600 transition-colors">
                          {bookInfo.title}
                        </h3>
                        <p className="text-slate-500 text-sm mb-3 truncate">{bookInfo.author}</p>
                        
                        <div className="mt-auto">
                          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-md truncate border border-slate-100">
                            <Clock className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                            <span className="truncate font-medium">
                              {lastReadChapterTitle ? `读至：${lastReadChapterTitle}` : '未开始阅读'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-50 bg-slate-50/50 p-3 flex items-center justify-between gap-3">
                      <button
                        onClick={() => navigate(readUrl)}
                        className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
                      >
                        <BookOpen className="w-4 h-4" /> 继续阅读
                      </button>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePinBook(bookId);
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            isPinned 
                              ? 'text-red-500 hover:bg-red-50 bg-red-50/50' 
                              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200'
                          }`}
                          title={isPinned ? "取消置顶" : "置顶书籍"}
                        >
                          {isPinned ? <PinOff className="w-5 h-5" /> : <Pin className="w-5 h-5" />}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemove(bookId, bookInfo.title);
                          }}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="移出书架"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )
      ) : (
        readingHistory.length === 0 ? renderHistoryEmpty() : (
          <div className="space-y-8">
            {groupedHistory.todayHistory.length > 0 && (
              <section>
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-red-500 rounded-full"></span> 今天
                </h3>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-100">
                  {groupedHistory.todayHistory.map(item => <HistoryItemRow key={item.bookId} item={item} />)}
                </div>
              </section>
            )}

            {groupedHistory.earlierHistory.length > 0 && (
              <section>
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-slate-400 rounded-full"></span> 更早
                </h3>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-100">
                  {groupedHistory.earlierHistory.map(item => <HistoryItemRow key={item.bookId} item={item} />)}
                </div>
              </section>
            )}
          </div>
        )
      )}
    </div>
  );
}

// 提取的内部历史记录列表项组件
function HistoryItemRow({ item }: { item: any }) {
  const { bookId, bookInfo, lastReadChapterId, lastReadChapterTitle, readTimestamp } = item;
  const { bookshelf, addToBookshelf } = useStore();
  const navigate = useNavigate();

  const inBookshelf = bookshelf.some(b => b.bookId === bookId);
  const readUrl = `/read/${bookId}/${lastReadChapterId || 'c1'}`;

  const timeString = new Date(readTimestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 hover:bg-slate-50 transition-colors gap-4">
      <div className="flex items-center gap-4 cursor-pointer flex-1 min-w-0" onClick={() => navigate(readUrl)}>
        <img 
          src={bookInfo.coverUrl} 
          alt={bookInfo.title} 
          className="w-12 h-16 object-cover rounded-md shadow-sm shrink-0" 
        />
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h4 className="font-bold text-slate-800 truncate mb-1">{bookInfo.title}</h4>
          <p className="text-xs text-slate-500 truncate mb-1">读至：{lastReadChapterTitle}</p>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <Clock className="w-3 h-3" /> {timeString}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3 shrink-0 sm:ml-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
        <button 
          onClick={() => navigate(readUrl)}
          className="flex-1 sm:flex-none text-red-600 text-sm font-medium px-5 py-2 bg-red-50 rounded-full hover:bg-red-100 transition-colors"
        >
          继续阅读
        </button>
        {!inBookshelf ? (
          <button 
            onClick={() => {
              addToBookshelf({
                bookId,
                bookInfo,
                lastReadChapterId,
                lastReadChapterTitle,
                addTimestamp: Date.now()
              });
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1 text-slate-600 text-sm font-medium px-5 py-2 border border-slate-200 rounded-full hover:bg-slate-50 transition-colors"
          >
            <Plus className="w-4 h-4" /> 加入书架
          </button>
        ) : (
          <span className="flex-1 sm:flex-none text-center text-slate-400 text-sm px-5 py-2">
            已在书架
          </span>
        )}
      </div>
    </div>
  );
}
