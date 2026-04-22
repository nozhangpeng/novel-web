import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MOCK_BOOKS } from '../mock/data';
import clsx from 'clsx';
import { BookOpen } from 'lucide-react';

const FILTER_OPTIONS = {
  题材: ['全部', '玄幻', '仙侠', '奇幻', '科幻', '言情', '古代言情', '游戏'],
  热门: ['全部', '男生', '女生'],
  情节: ['全部', '热血', '升级流', '轻松', '复仇', '甜宠', '群像'],
  角色: ['全部', '大女主', '天才', '废柴流', '智商在线'],
  风格: ['全部', '慢热', '烧脑', '哲理', '探案']
};

export default function Category() {
  const [filters, setFilters] = useState<Record<string, string>>({
    题材: '全部',
    热门: '全部',
    情节: '全部',
    角色: '全部',
    风格: '全部'
  });

  const handleFilterChange = (category: string, value: string) => {
    setFilters(prev => ({ ...prev, [category]: value }));
  };

  const filteredBooks = useMemo(() => {
    return MOCK_BOOKS.filter(book => {
      // 题材过滤
      if (filters['题材'] !== '全部' && book.category !== filters['题材']) return false;
      
      // 热门过滤 (男女生)
      if (filters['热门'] === '男生' && !book.isMale) return false;
      if (filters['热门'] === '女生' && book.isMale) return false;

      // 情节、角色、风格过滤 (标签匹配)
      const tagsFilter = ['情节', '角色', '风格'];
      for (const filterKey of tagsFilter) {
        const selectedValue = filters[filterKey];
        if (selectedValue !== '全部') {
          if (!book.tags.includes(selectedValue)) return false;
        }
      }

      return true;
    });
  }, [filters]);

  return (
    <div className="space-y-6">
      {/* 筛选面板 */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
        {Object.entries(FILTER_OPTIONS).map(([category, options]) => (
          <div key={category} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <span className="text-slate-400 text-sm font-medium w-12 shrink-0">{category}</span>
            <div className="flex flex-wrap gap-2">
              {options.map(opt => (
                <button
                  key={opt}
                  onClick={() => handleFilterChange(category, opt)}
                  className={clsx(
                    'px-3 py-1 text-sm rounded-full transition-colors',
                    filters[category] === opt
                      ? 'bg-red-50 text-red-600 font-medium'
                      : 'text-slate-600 hover:bg-slate-50'
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 书籍列表 */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="font-bold text-lg text-slate-800">全部作品</h3>
          <span className="text-sm text-slate-500">共找到 {filteredBooks.length} 本书</span>
        </div>

        {filteredBooks.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            没有找到符合条件的作品，换个筛选条件试试吧
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredBooks.map(book => (
              <Link 
                key={book.id} 
                to={`/book/${book.id}`}
                className="flex gap-4 group hover:bg-slate-50 p-3 rounded-xl transition-colors border border-transparent hover:border-slate-100"
              >
                <img src={book.coverUrl} alt={book.title} className="w-20 h-28 object-cover rounded-lg shadow-sm shrink-0" />
                <div className="flex-1 min-w-0 flex flex-col">
                  <h4 className="font-bold text-slate-800 mb-1 group-hover:text-red-600 transition-colors truncate">{book.title}</h4>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-2 flex-1 leading-relaxed">{book.shortDesc}</p>
                  <div className="flex items-center justify-between text-xs text-slate-400 mt-auto">
                    <span className="flex items-center gap-1 font-medium text-slate-600"><BookOpen className="w-3 h-3"/> {book.author}</span>
                    <div className="flex gap-2">
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded">{book.category}</span>
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded">{book.status}</span>
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded hidden sm:inline">{book.wordCount}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
