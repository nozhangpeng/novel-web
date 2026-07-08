import { get, set, del } from 'idb-keyval';
import { Book, Chapter } from '../mock/data';

const isGarbage = (text: string): boolean => {
  const garbagePatterns = [
    /[\uFFFD]/g,
    /[\x80-\xFF]/g,
  ];
  let garbageCount = 0;
  for (const pattern of garbagePatterns) {
    const matches = text.match(pattern);
    if (matches) {
      garbageCount += matches.length;
    }
  }
  return garbageCount / text.length > 0.1;
};

const decodeFile = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  
  const utf8Decoder = new TextDecoder('utf-8');
  const utf8Text = utf8Decoder.decode(arrayBuffer);
  
  if (!isGarbage(utf8Text)) {
    return utf8Text;
  }
  
  const gbkDecoder = new TextDecoder('gb18030');
  const gbkText = gbkDecoder.decode(arrayBuffer);
  
  if (!isGarbage(gbkText)) {
    return gbkText;
  }
  
  return utf8Text;
};

export const importLocalNovel = async (file: File): Promise<{ book: Book, chapters: Chapter[] }> => {
  const text = await decodeFile(file);
  const bookId = `local_${Date.now()}`;
  const title = file.name.replace(/\.txt$/i, '');
  
  const book: Book = {
    id: bookId,
    title,
    author: '本地导入',
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80',
    category: '本地',
    tags: ['本地'],
    status: '完结',
    wordCount: `${(text.length / 10000).toFixed(1)}万`,
    shortDesc: '用户从本地导入的小说文件。',
    latestChapter: '',
    updateTime: new Date().toLocaleDateString(),
    readers: 1,
    rating: 10.0,
    isMale: true, // 默认分配，仅作占位
  };

  const chapters: Chapter[] = [];
  
  // 匹配类似：第X章、第X回、第X卷
  const chapterRegex = /(第[零一二三四五六七八九十百千万0-9]+[章节卷回][^\n]*)/g;
  const matches = [...text.matchAll(chapterRegex)];
  
  if (matches.length === 0) {
    // 若无匹配章节，则按固定行数切分
    const lines = text.split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0 && l !== '\r' && l !== '\u2028');
    const chunkSize = 500;
    for (let i = 0; i < lines.length; i += chunkSize) {
      const chunkLines = lines.slice(i, i + chunkSize);
      chapters.push({
        id: `c${chapters.length + 1}`,
        bookId,
        title: `第 ${chapters.length + 1} 部分`,
        content: chunkLines,
        index: chapters.length + 1,
      });
    }
  } else {
    // 处理带章节标题的文本
    // 检查第一章之前是否有前言/序章
    const firstMatchIndex = matches[0].index!;
    if (firstMatchIndex > 100) { // 如果前置内容较多
      const preambleText = text.slice(0, firstMatchIndex);
      const preambleLines = preambleText.split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0 && l !== '\r' && l !== '\u2028');
      if (preambleLines.length > 0) {
        chapters.push({
          id: `c1`,
          bookId,
          title: '序章 / 前言',
          content: preambleLines,
          index: 1,
        });
      }
    }

    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const nextMatch = matches[i + 1];
      
      const chapterTitle = match[0].trim();
      const startIndex = match.index! + match[0].length;
      const endIndex = nextMatch ? nextMatch.index! : text.length;
      
      const contentText = text.slice(startIndex, endIndex);
      // 处理连续的换行符和空行，只保留有效的段落内容
      const contentLines = contentText.split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0 && l !== '\r' && l !== '\u2028');
      
      const chapterIndex = chapters.length + 1;
      chapters.push({
        id: `c${chapterIndex}`,
        bookId,
        title: chapterTitle,
        content: contentLines,
        index: chapterIndex,
      });
    }
  }
  
  if (chapters.length > 0) {
    book.latestChapter = chapters[chapters.length - 1].title;
  }
  
  // 将章节数据存储至 IndexedDB
  await set(`chapters_${bookId}`, chapters);
  return { book, chapters };
};

export const getLocalChapters = async (bookId: string): Promise<Chapter[]> => {
  const chapters = await get<Chapter[]>(`chapters_${bookId}`);
  return chapters || [];
};

export const removeLocalBookData = async (bookId: string): Promise<void> => {
  await del(`chapters_${bookId}`);
};
