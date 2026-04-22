import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Home, Library, Bookmark, Search, TrendingUp } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useStore((state) => state.user);
  const logout = useStore((state) => state.logout);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isReaderPage = location.pathname.startsWith('/read/');

  if (isReaderPage) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-red-600">
            <BookOpen className="w-8 h-8" />
            <span className="text-2xl font-bold tracking-tight">残阳中文网</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className={`font-medium transition-colors ${location.pathname === '/' ? 'text-red-600' : 'text-slate-600 hover:text-red-600'}`}>首页</Link>
            <Link to="/category" className={`font-medium transition-colors ${location.pathname === '/category' ? 'text-red-600' : 'text-slate-600 hover:text-red-600'}`}>全部作品</Link>
            <Link to="/rank" className={`font-medium transition-colors ${location.pathname === '/rank' ? 'text-red-600' : 'text-slate-600 hover:text-red-600'}`}>排行榜</Link>
          </nav>

          <div className="flex items-center gap-4">
            <form onSubmit={handleSearch} className="relative hidden md:block">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索书籍、作者、标签..." 
                className="pl-10 pr-4 py-2 bg-slate-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:bg-white transition-all w-64"
              />
              <button type="submit" className="absolute left-4 top-1/2 -translate-y-1/2">
                <Search className="w-4 h-4 text-slate-400 hover:text-red-500 transition-colors" />
              </button>
            </form>
            
            <div className="flex items-center gap-4 ml-4">
              <Link to="/bookshelf" className="flex items-center gap-2 text-slate-600 hover:text-red-600 font-medium transition-colors">
                <Bookmark className="w-5 h-5" />
                <span className="hidden sm:inline">我的书架</span>
              </Link>
              
              <div className="w-px h-4 bg-slate-300 hidden sm:block"></div>
              
              {user ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-700 hidden sm:inline">{user.username}</span>
                  <button 
                    onClick={() => logout()}
                    className="text-sm text-slate-500 hover:text-red-600 transition-colors"
                  >
                    退出
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-red-600 transition-colors">登录</Link>
                  <span className="text-slate-300">/</span>
                  <Link to="/register" className="text-sm font-medium text-slate-600 hover:text-red-600 transition-colors">注册</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 pb-24 md:pb-6">
        <Outlet />
      </main>

      <footer className="bg-white border-t mt-12 py-8 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>© 2024 残阳中文网 (演示项目). All rights reserved.</p>
        </div>
      </footer>

      {/* 移动端底部导航 */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-2 z-50 pb-safe">
        <Link to="/" className={`flex flex-col items-center p-2 ${location.pathname === '/' ? 'text-red-600' : 'text-slate-500'}`}>
          <Home className="w-6 h-6" />
          <span className="text-[10px] mt-1">首页</span>
        </Link>
        <Link to="/rank" className={`flex flex-col items-center p-2 ${location.pathname === '/rank' ? 'text-red-600' : 'text-slate-500'}`}>
          <TrendingUp className="w-6 h-6" />
          <span className="text-[10px] mt-1">榜单</span>
        </Link>
        <Link to="/category" className={`flex flex-col items-center p-2 ${location.pathname === '/category' ? 'text-red-600' : 'text-slate-500'}`}>
          <Library className="w-6 h-6" />
          <span className="text-[10px] mt-1">书库</span>
        </Link>
        <Link to={user ? "/bookshelf" : "/login"} className={`flex flex-col items-center p-2 ${location.pathname === '/bookshelf' ? 'text-red-600' : 'text-slate-500'}`}>
          <Bookmark className="w-6 h-6" />
          <span className="text-[10px] mt-1">书架</span>
        </Link>
      </div>
    </div>
  );
}
