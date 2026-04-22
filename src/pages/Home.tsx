import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MOCK_BOOKS, Book } from '../mock/data';
import { BookOpen, Star, TrendingUp, ChevronRight, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import Category from './Category';

type PrimaryTab = '精选' | '分类' | '男生' | '女生';
type FeaturedTab = '推荐榜' | '完结榜' | '阅读榜';

export default function Home() {
  const [activePrimaryTab, setActivePrimaryTab] = useState<PrimaryTab>('精选');
  const [activeFeaturedTab, setActiveFeaturedTab] = useState<FeaturedTab>('推荐榜');
  const [carouselIndex, setCarouselIndex] = useState(0);
  
  // 触摸滑动相关状态
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    const n = featured.length;
    if (isLeftSwipe) {
      setCarouselIndex(prev => (prev + 1) % n);
    } else if (isRightSwipe) {
      setCarouselIndex(prev => (prev - 1 + n) % n);
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };
  
  // 猜你喜欢 分页状态
  const [guessList, setGuessList] = useState<Book[]>([]);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  // 根据二级Tab获取对应榜单数据
  const getFeaturedList = () => {
    let list = [...MOCK_BOOKS];
    if (activePrimaryTab === '男生') list = list.filter(b => b.isMale);
    if (activePrimaryTab === '女生') list = list.filter(b => !b.isMale);

    if (activeFeaturedTab === '推荐榜') {
      return list.sort((a, b) => b.rating - a.rating).slice(0, 6);
    } else if (activeFeaturedTab === '完结榜') {
      return list.filter(b => b.status === '完结').sort((a, b) => b.readers - a.readers).slice(0, 6);
    } else {
      return list.sort((a, b) => b.readers - a.readers).slice(0, 6);
    }
  };

  const featured = getFeaturedList();

  // 切换Tab时重置轮播图
  useEffect(() => {
    setCarouselIndex(0);
  }, [activePrimaryTab, activeFeaturedTab]);

  // 轮播图自动播放
  useEffect(() => {
    if (activePrimaryTab === '分类') return;
    const timer = setInterval(() => {
      setCarouselIndex(prev => (prev + 1) % featured.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [activePrimaryTab, activeFeaturedTab, featured.length]);

  // 初始化猜你喜欢数据
  useEffect(() => {
    if (activePrimaryTab === '分类') return;
    
    let baseList = [...MOCK_BOOKS];
    if (activePrimaryTab === '男生') baseList = baseList.filter(b => b.isMale);
    if (activePrimaryTab === '女生') baseList = baseList.filter(b => !b.isMale);
    
    // 随机打乱作为猜你喜欢的基础
    const shuffled = baseList.sort(() => 0.5 - Math.random());
    setGuessList(shuffled.slice(0, 6));
    setPage(1);
  }, [activePrimaryTab]);

  // 模拟无限滚动加载
  const loadMore = useCallback(() => {
    if (loadingMore || activePrimaryTab === '分类') return;
    setLoadingMore(true);
    
    setTimeout(() => {
      let baseList = [...MOCK_BOOKS];
      if (activePrimaryTab === '男生') baseList = baseList.filter(b => b.isMale);
      if (activePrimaryTab === '女生') baseList = baseList.filter(b => !b.isMale);
      
      const moreBooks = baseList.sort(() => 0.5 - Math.random()).slice(0, 4);
      setGuessList(prev => [...prev, ...moreBooks]);
      setPage(p => p + 1);
      setLoadingMore(false);
    }, 800);
  }, [loadingMore, activePrimaryTab]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [loadMore]);

  const PRIMARY_TABS: PrimaryTab[] = ['精选', '分类', '男生', '女生'];
  const FEATURED_TABS: FeaturedTab[] = ['推荐榜', '完结榜', '阅读榜'];

  return (
    <div className="space-y-8">
      {/* 一级导航 */}
      <div className="flex items-center gap-6 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        {PRIMARY_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActivePrimaryTab(tab)}
            className={clsx(
              'text-lg font-bold pb-2 border-b-2 transition-colors whitespace-nowrap',
              activePrimaryTab === tab 
                ? 'border-red-600 text-red-600' 
                : 'border-transparent text-slate-600 hover:text-red-500'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {activePrimaryTab === '分类' ? (
        <Category />
      ) : (
        <>
          {/* 精选榜单模块 */}
          <section className="bg-slate-50 rounded-2xl p-4 sm:p-6 border border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                  {activePrimaryTab === '男生' ? '男生强推' : activePrimaryTab === '女生' ? '女生必读' : '主编力荐'}
                </h2>
              </div>
              
              {/* 二级导航 */}
              <div className="flex flex-wrap justify-end gap-2 mt-4 sm:mt-0">
                {FEATURED_TABS.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveFeaturedTab(tab)}
                    className={clsx(
                      'px-4 py-1.5 text-xs sm:text-sm font-medium rounded-full transition-all border',
                      activeFeaturedTab === tab 
                        ? 'bg-red-50 border-red-200 text-red-600' 
                        : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            
            <div 
              className="relative h-[340px] md:h-[380px] w-full flex items-center justify-center overflow-visible sm:overflow-hidden mt-4"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {featured.map((book, idx) => {
                const n = featured.length;
                const diff = idx - carouselIndex;
                let offset = diff;
                if (diff < -Math.floor(n / 2)) offset += n;
                if (diff > Math.floor(n / 2)) offset -= n;

                const isCenter = offset === 0;
                const isLeft = offset === -1 || (offset === -2 && n === 4); // Handle even number edges
                const isRight = offset === 1 || (offset === 2 && n === 4);
                const isHidden = !isCenter && !isLeft && !isRight;

                return (
                  <div
                    key={`${activeFeaturedTab}-${book.id}-${idx}`}
                    className={clsx(
                      "absolute w-[85%] sm:w-[50%] md:w-[32%] h-full transition-all duration-500 ease-out",
                      isCenter ? "z-20 opacity-100 scale-100 translate-x-0" : "",
                      isLeft ? "z-10 opacity-0 md:opacity-60 scale-90 -translate-x-[20%] md:-translate-x-[105%] cursor-pointer md:pointer-events-auto pointer-events-none" : "",
                      isRight ? "z-10 opacity-0 md:opacity-60 scale-90 translate-x-[20%] md:translate-x-[105%] cursor-pointer md:pointer-events-auto pointer-events-none" : "",
                      isHidden ? "z-0 opacity-0 scale-75 translate-x-0 pointer-events-none" : ""
                    )}
                    onClick={() => {
                      if (isLeft) setCarouselIndex((carouselIndex - 1 + n) % n);
                      else if (isRight) setCarouselIndex((carouselIndex + 1) % n);
                    }}
                  >
                    <Link 
                      to={`/book/${book.id}`} 
                      className={clsx(
                        "block bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 h-full flex flex-col",
                        !isCenter && "pointer-events-none"
                      )}
                    >
                      <div className="h-44 md:h-52 overflow-hidden relative shrink-0">
                        <img 
                          src={book.coverUrl} 
                          alt={book.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded font-medium shadow-sm">{book.category}</span>
                          {activeFeaturedTab === '阅读榜' && (
                            <span className="text-white text-xs font-medium flex items-center gap-1">
                              <Flame className="w-3 h-3 text-orange-400" />
                              {(book.readers / 10000).toFixed(1)}万 人在读
                            </span>
                          )}
                          {activeFeaturedTab === '推荐榜' && (
                            <span className="text-amber-400 font-bold text-sm">{book.rating}分</span>
                          )}
                        </div>
                      </div>
                      <div className="p-4 md:p-5 flex flex-col flex-1 bg-white">
                        <h3 className="text-base md:text-lg font-bold text-slate-800 mb-2 truncate">{book.title}</h3>
                        <p className="text-xs md:text-sm text-slate-500 mb-3 line-clamp-2 md:line-clamp-3 leading-relaxed flex-1">{book.shortDesc}</p>
                        <div className="flex items-center justify-between text-xs text-slate-400 mt-auto pt-3 border-t border-slate-50 shrink-0">
                          <span className="flex items-center gap-1 truncate max-w-[60%]"><BookOpen className="w-3 h-3 shrink-0"/> {book.author}</span>
                          <span className="shrink-0">{book.wordCount}</span>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* 轮播图指示器 */}
            <div className="flex justify-center items-center gap-2 mt-6">
              {featured.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCarouselIndex(idx)}
                  className={clsx(
                    "h-1.5 rounded-full transition-all",
                    carouselIndex === idx ? "w-6 bg-red-500" : "w-1.5 bg-slate-300 hover:bg-slate-400"
                  )}
                />
              ))}
            </div>
          </section>

          {/* 猜你喜欢 (无限下滑) */}
          <section className="pt-4">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-6 h-6 text-red-500" />
              <h2 className="text-2xl font-bold">猜你喜欢</h2>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              {guessList.map((book, idx) => (
                <Link 
                  key={`${book.id}-${idx}`} 
                  to={`/book/${book.id}`}
                  className="flex gap-3 sm:gap-4 p-4 sm:p-5 hover:bg-slate-50 transition-colors border-b last:border-0 border-slate-100 group"
                >
                  <img src={book.coverUrl} alt={book.title} className="w-16 h-24 sm:w-20 sm:h-28 object-cover rounded-md shadow-sm shrink-0" />
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-start justify-between gap-2 sm:gap-4 mb-1 sm:mb-2">
                      <h4 className="font-bold text-base sm:text-lg text-slate-800 group-hover:text-red-600 transition-colors truncate">{book.title}</h4>
                      <span className="text-amber-500 font-bold shrink-0 text-sm sm:text-base">{book.rating}分</span>
                    </div>
                    <p className="text-[13px] sm:text-sm text-slate-500 line-clamp-2 mb-2 sm:mb-3 leading-relaxed">{book.shortDesc}</p>
                    <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs mt-auto flex-wrap">
                      <span className="text-slate-600 font-medium truncate max-w-[80px] sm:max-w-none">{book.author}</span>
                      <span className="text-slate-300">|</span>
                      <span className="text-slate-500">{book.category}</span>
                      <span className="text-slate-300">|</span>
                      <span className={book.status === '连载' ? 'text-red-500' : 'text-emerald-500'}>{book.status}</span>
                      <span className="text-slate-300 hidden sm:inline">|</span>
                      <span className="text-slate-400 hidden sm:inline">{book.wordCount}</span>
                      
                      <div className="ml-auto hidden sm:flex gap-1.5">
                        {book.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-sm">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* 无限加载触底探测器 */}
            <div ref={observerTarget} className="py-8 flex justify-center">
              {loadingMore ? (
                <div className="flex items-center gap-2 text-slate-400">
                  <div className="w-4 h-4 border-2 border-slate-300 border-t-red-500 rounded-full animate-spin" />
                  <span className="text-sm">加载更多...</span>
                </div>
              ) : (
                <span className="text-slate-400 text-sm">下拉加载更多</span>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
