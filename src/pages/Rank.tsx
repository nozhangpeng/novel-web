import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MOCK_BOOKS } from '../mock/data';
import clsx from 'clsx';
import { Trophy, Star, BookOpen, Flame, Clock, Heart, ThumbsUp, Search } from 'lucide-react';
import { motion } from 'framer-motion';

type RankType = '推荐榜' | '完结榜' | '阅读榜' | '人气榜' | '口碑榜' | '新书榜' | '热搜榜' | '收藏榜';

const RANK_MENUS: { id: RankType; icon: React.ReactNode; label: string }[] = [
  { id: '推荐榜', icon: <Star className="w-4 h-4" />, label: '推荐榜' },
  { id: '完结榜', icon: <BookOpen className="w-4 h-4" />, label: '完结榜' },
  { id: '阅读榜', icon: <Flame className="w-4 h-4" />, label: '阅读榜' },
  { id: '人气榜', icon: <Trophy className="w-4 h-4" />, label: '人气榜' },
  { id: '口碑榜', icon: <ThumbsUp className="w-4 h-4" />, label: '口碑榜' },
  { id: '新书榜', icon: <Clock className="w-4 h-4" />, label: '新书榜' },
  { id: '热搜榜', icon: <Search className="w-4 h-4" />, label: '热搜榜' },
  { id: '收藏榜', icon: <Heart className="w-4 h-4" />, label: '收藏榜' },
];

export default function Rank() {
  const [activeRank, setActiveRank] = useState<RankType>('推荐榜');
  const [expandedDescId, setExpandedDescId] = useState<string | null>(null);

  // 获取不同榜单的排序逻辑
  const rankList = useMemo(() => {
    let list = [...MOCK_BOOKS];
    
    switch (activeRank) {
      case '推荐榜':
        // 推荐：综合评分排序
        list.sort((a, b) => b.rating - a.rating);
        break;
      case '完结榜':
        // 完结：筛选完结状态，按阅读人数排序
        list = list.filter(b => b.status === '完结').sort((a, b) => b.readers - a.readers);
        break;
      case '阅读榜':
        // 阅读：按阅读人数排序
        list.sort((a, b) => b.readers - a.readers);
        break;
      case '人气榜':
        // 人气：综合计算 (阅读数 * 评分)
        list.sort((a, b) => (b.readers * b.rating) - (a.readers * a.rating));
        break;
      case '口碑榜':
        // 口碑：严格按评分排序
        list.sort((a, b) => b.rating - a.rating);
        break;
      case '新书榜':
        // 新书：筛选字数较少的书，按更新时间/阅读数排序（此处简单以倒序模拟）
        list = list.reverse(); 
        break;
      case '热搜榜':
        // 热搜：随机打乱模拟热度波动
        list = list.sort(() => 0.5 - Math.random());
        break;
      case '收藏榜':
        // 收藏：用阅读数的 10% 模拟收藏量排序
        list.sort((a, b) => b.readers - a.readers);
        break;
    }
    return list.slice(0, 20); // 只取前20名
  }, [activeRank]);

  // 渲染特定的排行数值标识
  const renderRankBadge = (book: any, rankId: RankType) => {
    switch (rankId) {
      case '推荐榜':
      case '口碑榜':
        return <span className="text-amber-500 font-bold">{book.rating} 分</span>;
      case '阅读榜':
      case '人气榜':
      case '热搜榜':
        return <span className="text-orange-500 font-medium flex items-center gap-1"><Flame className="w-3 h-3" /> {(book.readers / 10000).toFixed(1)}万</span>;
      case '收藏榜':
        return <span className="text-rose-500 font-medium flex items-center gap-1"><Heart className="w-3 h-3" /> {((book.readers * 0.1) / 10000).toFixed(1)}万</span>;
      default:
        return <span className="text-slate-400">{book.wordCount}</span>;
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-3 sm:gap-6">
      {/* 导航 (移动端为顶部横向滚动，PC端为左侧固定) */}
      <div className="w-full md:w-48 lg:w-56 shrink-0">
        <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-100 p-2 md:p-3 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible sticky top-14 md:top-24 z-20 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {RANK_MENUS.map(menu => (
            <button
              key={menu.id}
              onClick={() => setActiveRank(menu.id)}
              className={clsx(
                'flex items-center justify-center md:justify-start gap-1.5 md:gap-4 px-3 md:px-5 py-2 md:py-4 rounded-lg md:rounded-xl transition-all shrink-0 md:w-full md:text-left',
                activeRank === menu.id
                  ? 'bg-red-50 text-red-600 font-bold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
              )}
            >
              <div className={clsx(
                'p-1.5 md:p-2 rounded-lg shrink-0 flex items-center justify-center',
                activeRank === menu.id ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-400'
              )}>
                {menu.icon}
              </div>
              <span className="text-[13px] md:text-base whitespace-nowrap">{menu.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 右侧榜单列表 */}
      <div className="flex-1 bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-w-0">
        <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Trophy className="text-amber-500 w-5 h-5 sm:w-6 sm:h-6" /> {activeRank}
          </h2>
        </div>

        <div className="divide-y divide-slate-100">
          {rankList.map((book, idx) => (
            <motion.div 
              key={`${activeRank}-${book.id}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.05 }}
            >
              <Link 
                to={`/book/${book.id}`}
                className="flex items-center gap-2 sm:gap-4 p-3 sm:p-5 hover:bg-slate-50 transition-colors group"
              >
                {/* 排名数字 */}
                <div className={clsx(
                  'w-6 h-6 sm:w-10 sm:h-10 flex items-center justify-center rounded-md sm:rounded-xl font-bold text-sm sm:text-lg shrink-0',
                  idx === 0 ? 'bg-amber-100 text-amber-600' :
                  idx === 1 ? 'bg-slate-200 text-slate-600' :
                  idx === 2 ? 'bg-orange-100 text-orange-600' :
                  'text-slate-400'
                )}>
                  {idx + 1}
                </div>

                {/* 封面 */}
                <img 
                  src={book.coverUrl} 
                  alt={book.title} 
                  className="w-20 h-28 object-cover rounded-md shadow-sm shrink-0 group-hover:shadow-md transition-shadow" 
                />

                {/* 信息 */}
                <div className="flex-1 min-w-0 py-0.5 flex flex-col justify-center min-h-[7rem]">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h4 className="font-bold text-lg text-slate-800 group-hover:text-red-600 transition-colors truncate">
                      {book.title}
                    </h4>
                    <div className="shrink-0 text-sm hidden lg:block ml-2">
                      {renderRankBadge(book, activeRank)}
                    </div>
                  </div>
                  
                  <div 
                    className="relative cursor-pointer group/desc"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setExpandedDescId(expandedDescId === book.id ? null : book.id);
                    }}
                  >
                    <p className={clsx(
                      "text-sm text-slate-500 leading-relaxed mb-3",
                      expandedDescId === book.id ? "" : "line-clamp-2"
                    )}>
                      {book.shortDesc}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-auto flex-wrap">
                    <span className="font-medium text-slate-600">{book.author}</span>
                    <span className="text-slate-300">|</span>
                    <span className="truncate">{book.category}</span>
                    <span className="text-slate-300">|</span>
                    <span className={clsx("shrink-0", book.status === '连载' ? 'text-red-500' : 'text-emerald-500')}>{book.status}</span>
                    <span className="text-slate-300 hidden sm:inline">|</span>
                    <span className="text-slate-400 hidden sm:inline">{book.wordCount}</span>
                    
                    <div className="ml-auto hidden sm:flex gap-1.5">
                      {book.tags?.slice(0, 2).map(tag => (
                        <span key={tag} className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-sm">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 移动/小屏端辅助展示 */}
                <div className="lg:hidden text-[10px] sm:text-[11px] shrink-0 ml-1 sm:ml-2">
                  {renderRankBadge(book, activeRank)}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}