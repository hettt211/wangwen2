const WeReadApi = require('./mcp-server-weread/build/WeReadApi').WeReadApi;

// 忽略 SSL 证书验证（仅用于开发环境）
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// 设置环境变量
process.env.CC_URL = 'https://cc.chenge.ink';
process.env.CC_ID = '5uxX4Zo8e5qHcymTuyNMqQ';
process.env.CC_PASSWORD = 'f1pVwJHx1kypPQh5XSWLxM';

async function getPopularHighlights() {
  const api = new WeReadApi();
  
  try {
    // 初始化
    await api.ensureInitialized();
    
    const bookId = '20868264'; // 诡秘之主
    
    // 获取书籍信息
    const bookInfo = await api.getBookinfo(bookId);
    console.log('书籍信息:', bookInfo.title, '-', bookInfo.author);
    console.log('');
    
    // 获取章节信息
    const chapterInfo = await api.getChapterInfo(bookId);
    
    // 获取热门划线
    const highlightsData = await api.getPopularHighlights(bookId, 30, 0);
    
    if (highlightsData && highlightsData.highlights && Array.isArray(highlightsData.highlights)) {
      const processedHighlights = highlightsData.highlights
        .filter(highlight => highlight && highlight.markText)
        .map(highlight => ({
          highlight_id: highlight.bookmarkId || "",
          text: highlight.markText || "",
          range: highlight.range || "",
          style: highlight.colorStyle || highlight.style || 0,
          create_time: highlight.createTime ? new Date(highlight.createTime * 1000).toISOString() : "",
          chapter_uid: highlight.chapterUid || 0,
          chapter_title: chapterInfo[highlight.chapterUid]?.title || "未知章节",
          likes_count: highlight.likesCount || 0,
          comments_count: highlight.commentsCount || 0
        }))
        .sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0)); // 按点赞数排序
      
      console.log(`共获取到 ${processedHighlights.length} 条热门划线\n`);
      
      // 保存到文件
      const fs = require('fs');
      const result = {
        book_id: bookId,
        book_title: bookInfo.title || "",
        book_author: bookInfo.author || "",
        total_highlights: processedHighlights.length,
        highlights: processedHighlights
      };
      
      fs.writeFileSync(
        '/Users/tong.he/Documents/喜马拉雅/网文小说服务/诡秘之主微信读书热门划线.json',
        JSON.stringify(result, null, 2),
        'utf8'
      );
      
      console.log('热门划线已保存到: 诡秘之主微信读书热门划线.json');
      
      // 显示前5条
      console.log('\n前5条热门划线：');
      processedHighlights.slice(0, 5).forEach((h, i) => {
        console.log(`\n${i + 1}. [${h.chapter_title}] 👍 ${h.likes_count}`);
        console.log(`   ${h.text.substring(0, 100)}${h.text.length > 100 ? '...' : ''}`);
      });
      
    } else {
      console.log('未获取到热门划线数据');
    }
    
  } catch (error) {
    console.error('错误:', error.message);
  }
}

getPopularHighlights();

