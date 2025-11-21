#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
获取微信读书热门划线
"""

import requests
import json
from datetime import datetime

def get_popular_highlights(book_id, count=20):
    """获取书籍的热门划线"""
    url = "https://weread.qq.com/web/book/publicBookmark"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': f'https://weread.qq.com/web/reader/{book_id}',
    }
    
    params = {
        'bookId': book_id,
        'count': count,
        'maxIdx': 0
    }
    
    try:
        response = requests.get(url, params=params, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        # 处理热门划线数据
        highlights = []
        if 'highlights' in data and isinstance(data['highlights'], list):
            for item in data['highlights']:
                if item and 'markText' in item:
                    highlight = {
                        'id': len(highlights) + 1,
                        '划线内容': item.get('markText', ''),
                        '点赞数': item.get('likesCount', 0),
                        '评论数': item.get('commentsCount', 0),
                        '创建时间': datetime.fromtimestamp(item.get('createTime', 0)).strftime('%Y-%m-%d %H:%M:%S') if item.get('createTime') else '',
                        '章节UID': item.get('chapterUid', 0),
                        '划线样式': item.get('colorStyle', 0)
                    }
                    highlights.append(highlight)
        
        # 按点赞数降序排序
        highlights.sort(key=lambda x: x['点赞数'], reverse=True)
        
        # 重新分配ID
        for idx, h in enumerate(highlights, 1):
            h['id'] = idx
        
        return {
            '书籍ID': book_id,
            '热门划线总数': len(highlights),
            '热门划线': highlights
        }
        
    except Exception as e:
        print(f"获取热门划线失败: {e}")
        return None

if __name__ == '__main__':
    # 诡秘之主的书籍ID
    book_id = '20868264'
    
    print(f"正在获取《诡秘之主》的热门划线...")
    result = get_popular_highlights(book_id, count=30)
    
    if result:
        # 保存到JSON文件
        output_file = '诡秘之主微信读书热门划线.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
        
        print(f"\n✅ 成功获取 {result['热门划线总数']} 条热门划线")
        print(f"📁 已保存到: {output_file}")
        
        # 显示前5条
        print("\n🔥 点赞数最高的前5条划线：")
        for i, h in enumerate(result['热门划线'][:5], 1):
            print(f"\n{i}. 【{h['点赞数']}个赞】")
            text = h['划线内容']
            if len(text) > 100:
                text = text[:100] + '...'
            print(f"   {text}")
    else:
        print("❌ 获取失败")

