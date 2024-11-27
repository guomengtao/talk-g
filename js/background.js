import { supabase } from './supabase.js';

class ArticleManager {
    constructor() {
        this.unreadCount = 0;
        this.dbConnected = false;
        this.initBadge();
        this.initSupabase();
        this.setupMessageListeners();
    }

    // 初始化徽章
    initBadge() {
        chrome.action.setBadgeBackgroundColor({ color: '#9e9e9e' });
        this.updateBadge(0);
    }

    // 初始化 Supabase
    async initSupabase() {
        try {
            console.log('开始初始化 Supabase...');
            this.updateConnectionStatus('正在连接数据库...');

            // 测试连接
            const { data, error } = await supabase
                .from('superbase_articles')
                .select('count')
                .eq('is_deleted', false);

            if (error) throw error;

            console.log('数据库连接成功，有效文章数量:', data[0].count);
            this.dbConnected = true;
            this.updateConnectionStatus('数据库连接成功');

            // 设置实时订阅
            await this.setupSubscription();
            // 初始化统计
            await this.updateArticleStats();

            return true;
        } catch (error) {
            console.error('数据库连接失败:', error);
            this.dbConnected = false;
            this.updateConnectionStatus('数据库连接失败');
            setTimeout(() => this.initSupabase(), 5000);
            return false;
        }
    }

    // 设置消息监听
    setupMessageListeners() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.type === 'GET_CONNECTION_STATUS') {
                sendResponse(this.getConnectionStatus());
                return true;
            }
            if (message.type === 'getArticles') {
                this.getArticles(message.filter).then(sendResponse);
                return true;
            }
            if (message.type === 'updateArticle') {
                this.updateArticle(message.id, message.updates).then(sendResponse);
                return true;
            }
            if (message.type === 'deleteArticle') {
                this.deleteArticle(message.id).then(sendResponse);
                return true;
            }
            if (message.type === 'getStats') {
                this.updateArticleStats().then(sendResponse);
                return true;
            }
        });
    }

    // 设置实时订阅
    setupSubscription() {
        const channel = supabase.channel('articles-manager')
            .on(
                'postgres_changes',
                { 
                    event: '*', 
                    schema: 'public', 
                    table: 'superbase_articles',
                    filter: 'is_deleted=eq.false'
                },
                (payload) => {
                    console.log('文章变更:', payload);
                    this.handleArticleChange(payload);
                }
            )
            .subscribe();

        channel.onError((error) => {
            console.error('订阅错误:', error);
            this.updateConnectionStatus('数据库连接失败');
            setTimeout(() => this.setupSubscription(), 5000);
        });
    }

    // 处理文章变更
    async handleArticleChange(payload) {
        switch (payload.eventType) {
            case 'INSERT':
                console.log('新文章:', payload.new);
                this.updateBadge(this.unreadCount + 1);
                this.showNotification(payload.new);
                break;
            case 'UPDATE':
                console.log('文章更新:', payload.new);
                break;
            case 'DELETE':
                console.log('文章删除:', payload.old);
                break;
        }
        await this.updateArticleStats();
    }

    // 获取文章列表
    async getArticles(filter = {}) {
        try {
            let query = supabase
                .from('superbase_articles')
                .select('id, title, content, created_at, updated_at')
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

            if (filter.page) {
                const pageSize = 20;
                const start = (filter.page - 1) * pageSize;
                const end = start + pageSize - 1;
                query = query.range(start, end);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('获取文章失败:', error);
            return [];
        }
    }

    // 更新文章
    async updateArticle(id, updates) {
        try {
            const { data, error } = await supabase
                .from('superbase_articles')
                .update(updates)
                .eq('id', id)
                .select();

            if (error) throw error;
            await this.updateArticleStats();
            return data[0];
        } catch (error) {
            console.error('更新文章失败:', error);
            return null;
        }
    }

    // 删除文章（软删除）
    async deleteArticle(id) {
        try {
            const { data, error } = await supabase
                .from('superbase_articles')
                .update({ is_deleted: true })
                .eq('id', id)
                .select();

            if (error) throw error;
            await this.updateArticleStats();
            return true;
        } catch (error) {
            console.error('删除文章失败:', error);
            return false;
        }
    }

    // 更新统计数据
    async updateArticleStats() {
        try {
            const [totalData, todayData, weekData] = await Promise.all([
                supabase
                    .from('superbase_articles')
                    .select('count')
                    .eq('is_deleted', false),
                supabase
                    .from('superbase_articles')
                    .select('count')
                    .eq('is_deleted', false)
                    .gte('created_at', new Date().setHours(0, 0, 0, 0)),
                supabase
                    .from('superbase_articles')
                    .select('count')
                    .eq('is_deleted', false)
                    .gte('created_at', new Date().setDate(new Date().getDate() - 7))
            ]);

            const stats = {
                total: totalData.data[0].count,
                today: todayData.data[0].count,
                week: weekData.data[0].count
            };

            chrome.runtime.sendMessage({
                type: 'statsUpdate',
                stats: stats
            }).catch(() => {});

            return stats;
        } catch (error) {
            console.error('获取统计数据失败:', error);
            return { total: 0, today: 0, week: 0 };
        }
    }

    // 更新连接状态
    updateConnectionStatus(message) {
        console.log('更新连接状态:', message, this.dbConnected);
        chrome.runtime.sendMessage({
            type: 'CONNECTION_STATUS',
            connected: this.dbConnected,
            message: message
        }).catch(() => {});
    }

    // 获取连接状态
    getConnectionStatus() {
        return {
            connected: this.dbConnected,
            message: this.dbConnected ? '数据库连接成功' : '数据库连接失败'
        };
    }

    // 更新徽章
    updateBadge(count) {
        this.unreadCount = count;
        chrome.action.setBadgeText({
            text: count > 0 ? count.toString() : ''
        });
    }

    // 显示通知
    showNotification(article) {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'images/icon128.png',
            title: '新文章提醒',
            message: article.title || '新文章'
        });
    }
}

// 创建实例
const manager = new ArticleManager(); 