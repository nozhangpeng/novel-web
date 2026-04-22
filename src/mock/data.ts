export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  category: string;     // 一级题材
  tags: string[];       // 其他标签（情节、角色、风格等）
  status: '连载' | '完结';
  wordCount: string;
  shortDesc: string;
  latestChapter: string;
  updateTime: string;
  readers: number;      // 阅读人数
  rating: number;       // 评分
  isMale: boolean;      // 是否男生频道
}

export const MOCK_BOOKS: Book[] = [
  {
    id: '1',
    title: '星辰变纪',
    author: '我吃西红柿',
    coverUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&q=80',
    category: '玄幻',
    tags: ['热血', '升级流', '废柴流', '天才'],
    status: '连载',
    wordCount: '302.5万',
    shortDesc: '一名不甘平庸的少年，一部能够改变命运的神秘功法，开启了一段波澜壮阔的星际修真之旅。',
    latestChapter: '第1082章 破界而出',
    updateTime: '1小时前',
    readers: 1250000,
    rating: 9.2,
    isMale: true
  },
  {
    id: '2',
    title: '大奉打更人',
    author: '卖报小郎君',
    coverUrl: 'https://images.unsplash.com/photo-1599839619722-39751411ea63?w=400&q=80',
    category: '仙侠',
    tags: ['探案', '轻松', '群像', '智商在线'],
    status: '完结',
    wordCount: '482.1万',
    shortDesc: '在这个有妖魔鬼怪的世界里，他只是个普通的打更人。直到那天，他发现自己能看到别人看不到的东西。',
    latestChapter: '大结局 盛世长安',
    updateTime: '1个月前',
    readers: 3400000,
    rating: 9.6,
    isMale: true
  },
  {
    id: '3',
    title: '诡秘之主',
    author: '爱潜水的乌贼',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80',
    category: '奇幻',
    tags: ['克苏鲁', '蒸汽朋克', '群像', '烧脑'],
    status: '完结',
    wordCount: '520.4万',
    shortDesc: '在蒸汽与机械的浪潮中，谁能触及非凡？历史和黑暗的迷雾里，又是谁在耳语？我醒来，发现自己成了一个不该存在的人。',
    latestChapter: '尾声 愚者的沉睡',
    updateTime: '3个月前',
    readers: 5600000,
    rating: 9.8,
    isMale: true
  },
  {
    id: '4',
    title: '全职高手',
    author: '蝴蝶蓝',
    coverUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&q=80',
    category: '游戏',
    tags: ['电子竞技', '热血', '群像', '王者归来'],
    status: '完结',
    wordCount: '562.3万',
    shortDesc: '网游荣耀中被誉为教科书级别的顶尖高手，因为种种原因遭到俱乐部的驱逐，离开职业圈的他栖身于一家网吧成了一个小小的网管。',
    latestChapter: '冠军！',
    updateTime: '1年前',
    readers: 4200000,
    rating: 9.5,
    isMale: true
  },
  {
    id: '5',
    title: '剑来',
    author: '烽火戏诸侯',
    coverUrl: 'https://images.unsplash.com/photo-1533613220915-609f661a6fe1?w=400&q=80',
    category: '仙侠',
    tags: ['古典仙侠', '群像', '慢热', '哲理'],
    status: '连载',
    wordCount: '892.6万',
    shortDesc: '大千世界，无奇不有。我陈平安，唯有一剑，可搬山，倒海，降妖，镇魔，敕神，摘星，断江，摧城，开天！',
    latestChapter: '第1124章 登高望远',
    updateTime: '5分钟前',
    readers: 2800000,
    rating: 9.4,
    isMale: true
  },
  {
    id: '6',
    title: '深空彼岸',
    author: '辰东',
    coverUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&q=80',
    category: '科幻',
    tags: ['星际文明', '修真', '热血', '大宇宙'],
    status: '连载',
    wordCount: '415.8万',
    shortDesc: '浩瀚宇宙中，存在着无数神秘的彼岸。当人类的科技发展到极致，才发现修行的尽头，竟然是……',
    latestChapter: '第892章 星海彼岸',
    updateTime: '2小时前',
    readers: 1800000,
    rating: 9.1,
    isMale: true
  },
  {
    id: '7',
    title: '掌中之物',
    author: '贝昕',
    coverUrl: 'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=400&q=80',
    category: '言情',
    tags: ['现代言情', '虐恋', '复仇', '女强'],
    status: '完结',
    wordCount: '120.5万',
    shortDesc: '一个前期被男主虐得死去活来，后期绝地反击的故事。她不是菟丝花，她是能刺穿心脏的荆棘。',
    latestChapter: '番外 尾声',
    updateTime: '2年前',
    readers: 3100000,
    rating: 8.9,
    isMale: false
  },
  {
    id: '8',
    title: '知否知否应是绿肥红瘦',
    author: '关心则乱',
    coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&q=80',
    category: '古代言情',
    tags: ['宅斗', '种田', '穿越', '群像'],
    status: '完结',
    wordCount: '210.8万',
    shortDesc: '一个现代小职员穿越到古代成为庶女，在深宅大院中如履薄冰，步步为营的故事。',
    latestChapter: '大结局',
    updateTime: '3年前',
    readers: 4500000,
    rating: 9.5,
    isMale: false
  },
  {
    id: '9',
    title: '偏偏宠爱',
    author: '藤萝为枝',
    coverUrl: 'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=400&q=80',
    category: '言情',
    tags: ['校园', '甜宠', '救赎', '青春'],
    status: '完结',
    wordCount: '85.2万',
    shortDesc: '重生回到高二，她决定好好学习，顺便救赎那个上辈子为她而死的少年。',
    latestChapter: '番外 婚后日常',
    updateTime: '1年前',
    readers: 2200000,
    rating: 9.0,
    isMale: false
  },
  {
    id: '10',
    title: '第一侯',
    author: '希行',
    coverUrl: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?w=400&q=80',
    category: '古代言情',
    tags: ['女强', '权谋', '重生', '大女主'],
    status: '完结',
    wordCount: '156.4万',
    shortDesc: '惨死重生的她，这一世绝不再做任何人的棋子。她要手握权柄，做这天下第一侯！',
    latestChapter: '尾声 天下太平',
    updateTime: '半年内',
    readers: 1500000,
    rating: 9.2,
    isMale: false
  }
];

export const getFeaturedBooks = () => MOCK_BOOKS.slice(0, 3);
export const getHotBooks = () => MOCK_BOOKS.slice(0, 6);
export const getBookById = (id: string) => MOCK_BOOKS.find(b => b.id === id);

export interface Chapter {
  id: string;
  bookId: string;
  title: string;
  content: string[];
  index: number;
}

export const MOCK_CHAPTERS: Record<string, Chapter[]> = {
  '1': Array.from({ length: 10 }).map((_, i) => ({
    id: `c${i + 1}`,
    bookId: '1',
    title: `第${i + 1}章 开启征程`,
    index: i + 1,
    content: [
      '清晨的阳光透过云层，洒在安静的小镇上。',
      '少年缓缓睁开双眼，感受到体内流淌的微弱真气。',
      '“终于突破了第一层！”他握紧拳头，眼中闪烁着坚定的光芒。',
      '从今天起，他不再是那个任人欺凌的废物。他要让所有看不起他的人知道，什么才是真正的天才！',
      '窗外，微风吹过树叶，发出沙沙的声音，仿佛在为他欢呼。'
    ]
  }))
};

MOCK_BOOKS.forEach(book => {
  if (!MOCK_CHAPTERS[book.id]) {
    MOCK_CHAPTERS[book.id] = Array.from({ length: 10 }).map((_, i) => ({
      id: `c${i + 1}`,
      bookId: book.id,
      title: `第${i + 1}章 精彩内容`,
      index: i + 1,
      content: [
        `这是《${book.title}》的第${i + 1}章内容。`,
        '主角在这里经历了一场惊心动魄的冒险。',
        '随着故事的深入，更多的谜团逐渐被揭开。',
        '在这一章的结尾，主角做出了一个重要的决定，这将影响他未来的命运。',
        '敬请期待下一章的精彩内容。'
      ]
    }));
  }
});

export const getChaptersByBookId = (bookId: string) => MOCK_CHAPTERS[bookId] || [];
export const getChapter = (bookId: string, chapterId: string) => 
  (MOCK_CHAPTERS[bookId] || []).find(c => c.id === chapterId);

export const getNextChapter = (bookId: string, currentChapterId: string) => {
  const chapters = MOCK_CHAPTERS[bookId] || [];
  const currentIndex = chapters.findIndex(c => c.id === currentChapterId);
  if (currentIndex !== -1 && currentIndex < chapters.length - 1) {
    return chapters[currentIndex + 1];
  }
  return null;
};

export const getPrevChapter = (bookId: string, currentChapterId: string) => {
  const chapters = MOCK_CHAPTERS[bookId] || [];
  const currentIndex = chapters.findIndex(c => c.id === currentChapterId);
  if (currentIndex > 0) {
    return chapters[currentIndex - 1];
  }
  return null;
};
