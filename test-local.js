const text = `第一章 序言
这是一本测试小说。
第二章 开始
正式开始。
`;
const chapterRegex = /(第[零一二三四五六七八九十百千万0-9]+[章节卷回][^\n]*)/g;
const matches = [...text.matchAll(chapterRegex)];
console.log(matches.length);
for (let i = 0; i < matches.length; i++) {
  const match = matches[i];
  console.log(match[0], match.index);
}
