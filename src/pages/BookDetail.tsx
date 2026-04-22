import { useParams, Link } from 'react-router-dom';
import { getBookById } from '../mock/data';
import { BookOpen, BookmarkPlus } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function BookDetail() {
  const { id } = useParams();
  const { addToBookshelf, bookshelf } = useStore();
  
  let book = getBookById(id || '');
  if (!book && id?.startsWith('local_')) {
    const localBookItem = bookshelf.find(b => b.bookId === id);
    if (localBookItem) {
      book = localBookItem.bookInfo;
    }
  }

  if (!book) return <div className="text-center py-20 text-slate-500">书籍不存在</div>;

  const isAdded = bookshelf.some(b => b.bookId === book.id);

  const handleAdd = () => {
    if (!isAdded) {
      addToBookshelf({
        bookId: book.id,
        bookInfo: book,
        lastReadChapterId: '',
        lastReadChapterTitle: '',
        addTimestamp: Date.now()
      });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="relative h-64 overflow-hidden bg-slate-900 hidden md:block">
        <img 
          src={book.coverUrl} 
          alt="bg" 
          className="w-full h-full object-cover opacity-30 blur-xl scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent" />
      </div>

      <div className="px-4 sm:px-6 md:px-10 pb-6 sm:pb-10 relative -mt-0 md:-mt-32">
        <div className="flex flex-col md:flex-row gap-4 sm:gap-8 pt-6 md:pt-0">
          <img 
            src={book.coverUrl} 
            alt={book.title} 
            className="w-32 sm:w-40 md:w-56 h-44 sm:h-56 md:h-80 object-cover rounded-xl shadow-lg border-2 sm:border-4 border-white mx-auto md:mx-0 z-10"
          />
          <div className="flex-1 pt-2 sm:pt-4 md:pt-36 z-10 flex flex-col items-center md:items-start text-center md:text-left">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 mb-3 sm:mb-4">{book.title}</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-4 text-xs sm:text-sm font-medium mb-4 sm:mb-6">
              <span className="text-red-600 bg-red-50 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">{book.author}</span>
              <span className="text-slate-600 bg-slate-100 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">{book.category}</span>
              <span className={book.status === '连载' ? 'text-red-500 bg-red-50 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full' : 'text-emerald-500 bg-emerald-50 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full'}>{book.status}</span>
              <span className="text-slate-500 bg-slate-50 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">{book.wordCount}</span>
            </div>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl mb-6 sm:mb-8 px-2 sm:px-0 text-justify break-words">{book.shortDesc}</p>
            
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0 justify-center">
              <Link 
                to={`/read/${book.id}/c1`}
                className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white px-4 sm:px-8 py-2.5 sm:py-3 rounded-full font-bold transition-colors shadow-md shadow-red-200 flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base"
              >
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" /> 立即阅读
              </Link>
              <button 
                onClick={handleAdd}
                className={`flex-1 sm:flex-none px-4 sm:px-8 py-2.5 sm:py-3 rounded-full font-bold transition-colors border-2 flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base ${
                  isAdded 
                    ? 'border-slate-200 text-slate-400 bg-slate-50 cursor-default' 
                    : 'border-slate-200 text-slate-700 hover:border-red-600 hover:text-red-600 bg-white'
                }`}
              >
                <BookmarkPlus className="w-4 h-4 sm:w-5 sm:h-5" /> {isAdded ? '已在书架' : '加入书架'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
