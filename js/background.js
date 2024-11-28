import { supabase } from './supabase.js';

class ArticleBrowser {
    constructor() {
        console.log('ArticleBrowser 初始化开始');
        this.initSupabase();
        this.isConnected = false;
        console.log('ArticleBrowser 初始化完成');
    }

    async initSupabase() {
        try {
            console.log('开始测试数据库连接');
            // 测试连接
            const { data, error } = await supabase
                .from('articles')
                .select('count')
                .eq('is_deleted', false);

            if (error) {
                console.error('数据库连接测试失败:', error);
                throw error;
            }
            this.isConnected = true;
            console.log('数据库连接成功，文章数量:', data[0].count);
        } catch (error) {
            this.isConnected = false;
            console.error('数据库连接失败:', error);
        }
    }

    // 获取文章列表
    async getArticles(filter = {}) {
        try {
            let query = supabase
                .from('articles')
                .select('id, title, created_at')
                .eq('is_deleted', false)
                .order('created_at', { ascending: false });

            if (filter.today) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                query = query.gte('created_at', today.toISOString());
            } else if (filter.week) {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                query = query.gte('created_at', weekAgo.toISOString());
            }

            const { data, error } = await query;
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('获取文章失败:', error);
            return [];
        }
    }

    // 获取文章详情
    async getArticle(id) {
        try {
            const { data, error } = await supabase
                .from('articles')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('获取文章详情失败:', error);
            return null;
        }
    }
}

// 创建实例
const browser = new ArticleBrowser();

// 监听消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('收到消息:', request);
    if (request.type === 'getArticles') {
        browser.getArticles(request.filter).then(sendResponse);
        return true;
    } else if (request.type === 'getArticle') {
        browser.getArticle(request.id).then(sendResponse);
        return true;
    } else if (request.type === 'checkConnection') {
        console.log('收到连接检查请求，当前连接状态:', browser.isConnected);
        sendResponse({ connected: browser.isConnected });
        return false;
    }
});

// 检查数据库连接状态
async function checkConnection() {
    try {
        console.log('开始检查数据库连接');
        const { data, error } = await supabase
            .from('articles')
            .select('count');
        
        if (error) {
            console.error('数据库连接失败，准备重试:', error);
            browser.isConnected = false;
            // 广播连接状态
            chrome.runtime.sendMessage({ type: 'connectionStatus', connected: false });
            await retryConnection();
        } else {
            console.log('数据库连接正常');
            browser.isConnected = true;
            // 广播连接状态
            chrome.runtime.sendMessage({ type: 'connectionStatus', connected: true });
        }
    } catch (error) {
        console.error('连接检查失败:', error);
        browser.isConnected = false;
        // 广播连接状态
        chrome.runtime.sendMessage({ type: 'connectionStatus', connected: false });
        await retryConnection();
    }
}

// 重试连接
async function retryConnection(maxRetries = 3) {
    console.log('开始重试连接');
    for (let i = 0; i < maxRetries; i++) {
        try {
            console.log(`第 ${i + 1} 次尝试重新连接`);
            const { error } = await supabase.from('articles').select('count');
            if (!error) {
                console.log('重新连接成功');
                browser.isConnected = true;
                // 广播连接状态
                chrome.runtime.sendMessage({ type: 'connectionStatus', connected: true });
                return;
            }
        } catch (error) {
            console.error(`第 ${i + 1} 次重试失败:`, error);
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
    console.error('达到最大重试次数，连接失败');
    browser.isConnected = false;
    // 广播连接状态
    chrome.runtime.sendMessage({ type: 'connectionStatus', connected: false });
}

// 初始化时检查连接
console.log('开始初始化连接检查');
checkConnection();
