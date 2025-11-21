#!/usr/bin/env node
/**
 * 测试获取热门划线
 */

// 设置环境变量
process.env.CC_URL = "https://cc.chenge.ink";
process.env.CC_ID = "5uxX4Zo8e5qHcymTuyNMqQ";
process.env.CC_PASSWORD = "f1pVwJHx1kypPQh5XSWLxM";

const { WeReadApi } = require('./mcp-server-weread/build/WeReadApi.js');
const fs = require('fs');

async function getPopularHighlights() {
  try {
    console.log('正在初始化微信读书API...');
    const api = new WeReadApi();
    
    // 等待初始化完成
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('正在获取《诡秘之主》的书籍信息...');
    const bookId = '20868264';
    const bookInfo = await api.getBookinfo(bookId);
    console.log(`书名: ${bookInfo.title}`);
    console.log(`作者: ${bookInfo.author}`);
    
    console.log('\n正在获取章节信息...');
    const chapterInfo = await api.getChapterInfo(bookId);
    console.log(`章节数: ${Object.keys(chapterInfo).length}`);
    
    console.log('\n正在获取热门划线...');
    const highlightsData = await api.getPopularHighlights(bookId, 30, 0);
    
    if (highlightsData && highlightsData.highlights && Array.isArray(highlightsData.highlights)) {
      const processedHighlights = highlightsData.highlights
        .filter(h => h && h.markText)
        .map((h, idx) => ({
          id: idx + 1,
          划线内容: h.markText || '',
          点赞数: h.likesCount || 0,
          评论数: h.commentsCount || 0,
          创建时间: h.createTime ? new Date(h.createTime * 1000).toISOString() : '',
          章节UID: h.chapterUid || 0,
          章节标题: chapterInfo[h.chapterUid]?.title || '未知章节',
          划线样式: h.colorStyle || h.style || 0
        }))
        .sort((a, b) => b.点赞数 - a.点赞数); // 按点赞数降序排序
      
      // 重新分配ID
      processedHighlights.forEach((h, idx) => h.id = idx + 1);
      
      const result = {
        书籍ID: bookId,
        书名: bookInfo.title,
        作者: bookInfo.author,
        热门划线总数: processedHighlights.length,
        热门划线: processedHighlights
      };
      
      // 保存到文件
      const outputFile = '诡秘之主微信读书热门划线.json';
      fs.writeFileSync(outputFile, JSON.stringify(result, null, 2), 'utf-8');
      
      console.log(`\n✅ 成功获取 ${result.热门划线总数} 条热门划线`);
      console.log(`📁 已保存到: ${outputFile}`);
      
      // 显示前5条
      console.log('\n🔥 点赞数最高的前5条划线：');
      processedHighlights.slice(0, 5).forEach((h, idx) => {
        console.log(`\n${idx + 1}. 【${h.点赞数}个赞】 ${h.章节标题}`);
        const text = h.划线内容.length > 100 ? h.划线内容.substring(0, 100) + '...' : h.划线内容;
        console.log(`   ${text}`);
      });
    } else {
      console.log('❌ 未获取到热门划线数据');
      console.log('返回数据:', JSON.stringify(highlightsData, null, 2));
    }
    
  } catch (error) {
    console.error('❌ 获取失败:', error.message);
    console.error(error);
  }
}

getPopularHighlights();

