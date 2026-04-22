import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MOCK_BOOKS } from '../mock/data';
import { Search, BookOpen, Flame, History, X } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

const HOT_SEARCHES = ['星辰变纪', '剑来', '诡秘之主', '大奉打更人', '女强', '热血'];
const MAX_HISTORY = 8;

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [inputValue, setInputValue] = useState(query);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('qidian_search_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 同步 URL 参数到输入框
  useEffect(() => {
    setInputValue(query);
  }, [query]);

  // 保存历史记录
  const saveHistory = (keyword: string) => {
    if (!keyword.trim()) return;
    const newHistory = [keyword.trim(), ...searchHistory.filter(h => h !== keyword.trim())].slice(0, MAX_HISTORY);
    setSearchHistory(newHistory);
    localStorage.setItem('qidian_search_history', JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('qidian_search_history');
  };

  const removeHistoryItem = (e: React.MouseEvent, keyword: string) => {
    e.preventDefault();
    e.stopPropagation();
    const newHistory = searchHistory.filter(h => h !== keyword);
    setSearchHistory(newHistory);
    localStorage.setItem('qidian_search_history', JSON.stringify(newHistory));
  };

  const handleSearch = (e: React.FormEvent | string) => {
    if (typeof e !== 'string') e.preventDefault();
    const keyword = typeof e === 'string' ? e : inputValue;
    if (keyword.trim()) {
      setSearchParams({ q: keyword.trim() });
      saveHistory(keyword.trim());
    }
  };

  // 搜索逻辑：书名、作者、简介、标签 模糊匹配
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    
    const lowerQuery = query.toLowerCase();
    return MOCK_BOOKS.filter(book => 
      book.title.toLowerCase().includes(lowerQuery) ||
      book.author.toLowerCase().includes(lowerQuery) ||
      book.shortDesc.toLowerCase().includes(lowerQuery) ||
      book.category.toLowerCase().includes(lowerQuery) ||
      book.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    ).sort((a, b) => b.readers - a.readers); // 按阅读人数排序
  }, [query]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 搜索框区域 */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100 z-40 relative">
        <form onSubmit={handleSearch} className="relative flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="搜索书籍、作者、标签或关键词..."
              className="w-full pl-12 pr-10 py-3 sm:py-4 bg-slate-50 border border-slate-100 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-red-100 focus:bg-white focus:border-red-200 transition-all"
              autoFocus
            />
            {inputValue && (
              <button
                type="button"
                onClick={() => setInputValue('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button 
            type="submit"
            className="w-full sm:w-auto px-8 py-3 sm:py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors shadow-sm shrink-0 flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            搜索
          </button>
        </form>
      </div>

      {!query ? (
        // 未搜索时显示：搜索历史 & 热搜推荐
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 搜索历史 */}
          {searchHistory.length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <History className="w-5 h-5 text-blue-500" /> 搜索历史
                </h3>
                <button 
                  onClick={clearHistory}
                  className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                >
                  清空历史
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSearch(item)}
                    className="group relative px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-sm rounded-lg transition-colors pr-8 border border-slate-100"
                  >
                    {item}
                    <div 
                      onClick={(e) => removeHistoryItem(e, item)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 热门搜索 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 md:col-span-1">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Flame className="w-5 h-5 text-red-500" /> 热门搜索
            </h3>
            <div className="flex flex-wrap gap-2">
              {HOT_SEARCHES.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSearch(item)}
                  className="px-4 py-2 bg-red-50/50 hover:bg-red-50 text-red-600 hover:text-red-700 text-sm rounded-lg transition-colors border border-red-100/50 font-medium"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // 搜索结果列表
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg text-slate-700">
              包含 <span className="font-bold text-red-600 px-1">"{query}"</span> 的搜索结果
              <span className="text-sm text-slate-400 ml-3 font-normal">共 {searchResults.length} 条</span>
            </h2>
          </div>

          {searchResults.length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center text-center">
              <Search className="w-16 h-16 text-slate-200 mb-4" />
              <h3 className="text-lg font-bold text-slate-700 mb-2">没有找到相关作品</h3>
              <p className="text-slate-500 max-w-sm">
                建议尝试缩短关键词，或者搜索作者、题材（如：剑来、玄幻、重生）
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {searchResults.map((book, idx) => (
                <motion.div 
                  key={book.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                >
                  <Link 
                    to={`/book/${book.id}`}
                    className="flex items-center gap-4 p-5 sm:p-6 hover:bg-slate-50 transition-colors group"
                  >
                    <img 
                      src={book.coverUrl} 
                      alt={book.title} 
                      className="w-16 h-24 sm:w-20 sm:h-28 object-cover rounded-lg shadow-sm shrink-0 group-hover:shadow-md transition-shadow" 
                    />

                    <div className="flex-1 min-w-0 flex flex-col justify-center min-h-[6rem] sm:min-h-[7rem]">
                      <div className="flex items-start justify-between gap-4 mb-1 sm:mb-2">
                        <h4 className="font-bold text-base sm:text-lg text-slate-800 group-hover:text-red-600 transition-colors truncate">
                          {book.title}
                        </h4>
                        <span className="text-amber-500 font-bold text-sm shrink-0">{book.rating}分</span>
                      </div>
                      
                      <p className="text-[13px] sm:text-sm text-slate-500 leading-relaxed mb-2 sm:mb-3 line-clamp-2">
                        {book.shortDesc}
                      </p>

                      <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-slate-500 mt-auto flex-wrap">
                        <span className="font-medium text-slate-600 flex items-center gap-1">
                          <BookOpen className="w-3 h-3" /> {book.author}
                        </span>
                        <span className="text-slate-300 hidden sm:inline">|</span>
                        <span className="truncate">{book.category}</span>
                        <span className="text-slate-300">|</span>
                        <span className={clsx("shrink-0", book.status === '连载' ? 'text-red-500' : 'text-emerald-500')}>{book.status}</span>
                        <span className="text-slate-300 hidden sm:inline">|</span>
                        <span className="text-slate-400 hidden sm:inline">{book.wordCount}</span>
                        
                        <div className="ml-auto hidden sm:flex gap-1.5">
                          {book.tags?.slice(0, 3).map(tag => (
                            <span key={tag} className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-sm">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}