# Talk-G 开发文档

## 功能概述
Talk-G 是文章管理器，负责文章的管理、组织和维护。

### 核心功能
    - 文章列表管理
    - 分类标签系统
    - 批量操作功能
    - 搜索和过滤

### 技术栈
    - Chrome Extension API
    - Supabase API
    - JavaScript ES6+
    - IndexedDB
    - Full-text Search

## API 接口

### 文章管理
    // 获取文章列表
    const getArticles = async (filter = {}) => {
        try {
            let query = supabase
                .from('superbase_articles')
                .select('id, title, content, created_at, updated_at')
                .eq('is_deleted', false)
                .order('created_at', { ascending: false });

            // 添加过滤条件
            if (filter.category) {
                query = query.eq('category', filter.category);
            }
            if (filter.tags) {
                query = query.contains('tags', filter.tags);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('获取文章列表失败:', error);
            return [];
        }
    };

### 批量操作
    // 批量更新文章
    const batchUpdateArticles = async (ids, updates) => {
        try {
            const { data, error } = await supabase
                .from('superbase_articles')
                .update(updates)
                .in('id', ids)
                .select();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('批量更新失败:', error);
            return null;
        }
    };

## 数据结构

### 文章管理数据
    {
        articles: [{          // 文章列表
            id: number,
            title: string,
            status: string,
            category: string,
            tags: array
        }],
        categories: [{       // 分类列表
            id: number,
            name: string,
            count: number
        }],
        tags: [{            // 标签列表
            id: number,
            name: string,
            count: number
        }]
    }

## 开发规范

### 代码风格
    - 使用 ES6+ 语法
    - 异步操作使用 async/await
    - 错误处理使用 try/catch
    - 适当添加注释

### 命名规范
    - 文件名：小写字母，用横线分隔
    - 类名：大驼峰
    - 方法名：小驼峰
    - 常量：大写字母，下划线分隔

## 测试要点
1. 列表功能
    - 分页加载
    - 排序过滤
    - 搜索功能
    - 批量操作

2. 分类功能
    - 分类管理
    - 标签管理
    - 快速过滤
    - 统计信息 