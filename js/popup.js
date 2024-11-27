import { messageManager } from './background.js';

class PopupManager {
    constructor() {
        this.initUI();
        this.bindEvents();
        this.currentFilter = 'all';
        this.articles = [];
    }

    async initUI() {
        try {
            // 等待 Supabase 连接初始化
            await this.waitForConnection();
            await this.loadArticles();
        } catch (error) {
            console.error('初始化失败:', error);
            this.updateConnectionStatus(false, '连接失败');
        }
    }

    // 等待连接建立
    async waitForConnection(timeout = 5000) {
        console.log('等待数据库连接...');
        const startTime = Date.now();
        
        while (Date.now() - startTime < timeout) {
            if (messageManager.supabase) {
                const { data, error } = await messageManager.supabase
                    .from('articles')
                    .select('count');
                
                if (!error) {
                    console.log('数据库连接成功');
                    this.updateConnectionStatus(true, '数据库已连接');
                    return true;
                }
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        throw new Error('连接超时');
    }

    // 加载文章列表
    async loadArticles() {
        try {
            console.log('开始加载文章列表...');
            
            // 测试连接
            const { data: testData, error: testError } = await messageManager.supabase
                .from('articles')
                .select('count');
            
            console.log('测试查询结果:', testData, testError);

            // 获取文章列表
            const { data, error } = await messageManager.supabase
                .from('articles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('查询错误:', error);
                throw error;
            }

            console.log('加载到文章:', data);
            this.articles = data || [];
            this.renderArticles();
            
            // 更新统计数据
            this.updateStats({
                total: this.articles.length,
                today: this.filterTodayArticles().length,
                week: this.filterWeekArticles().length
            });
        } catch (error) {
            console.error('加载文章失败:', error);
            document.querySelector('.articles-container').innerHTML = 
                `<div class="error-message">加载文章失败: ${error.message}</div>`;
        }
    }

    // 过滤今日文章
    filterTodayArticles() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return this.articles.filter(article => 
            new Date(article.created_at) >= today
        );
    }

    // 过滤本周文章
    filterWeekArticles() {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        weekAgo.setHours(0, 0, 0, 0);
        return this.articles.filter(article => 
            new Date(article.created_at) >= weekAgo
        );
    }

    // 渲染文章列表
    renderArticles() {
        const container = document.querySelector('.articles-container');
        const filteredArticles = this.filterArticles();

        console.log('渲染文章列表:', filteredArticles);

        if (!filteredArticles || filteredArticles.length === 0) {
            container.innerHTML = '<div class="empty-message">暂无文章</div>';
            return;
        }

        container.innerHTML = filteredArticles.map(article => `
            <div class="article-item" data-id="${article.id}">
                <div class="article-title">${article.title || '无标题'}</div>
                <div class="article-content">${article.content || ''}</div>
                <div class="article-meta">
                    <span class="article-time">
                        ${new Date(article.created_at).toLocaleString()}
                    </span>
                    <div class="article-actions">
                        <button class="edit-btn">编辑</button>
                        <button class="delete-btn">删除</button>
                    </div>
                </div>
            </div>
        `).join('');

        this.bindArticleEvents();
    }

    bindEvents() {
        chrome.runtime.onMessage.addListener((message) => {
            console.log('收到消息:', message);
            if (message.type === 'CONNECTION_STATUS') {
                this.updateConnectionStatus(message.connected, message.message);
                // 连接成功时加载文章
                if (message.connected) {
                    this.loadArticles();
                }
            } else if (message.type === 'STATS_UPDATE') {
                this.updateStats(message.stats);
            }
        });

        // 添加过滤按钮事件
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.currentFilter = filter;
                this.updateFilterButtons();
                this.renderArticles();
            });
        });
    }

    updateConnectionStatus(connected, message) {
        console.log('更新状态显示:', connected, message);
        const statusElement = document.querySelector('.db-status');
        if (statusElement) {
            statusElement.innerHTML = `
                <span class="status-dot ${connected ? 'connected' : 'disconnected'}"></span>
                <span class="status-text">${message}</span>
            `;

            if (connected) {
                chrome.runtime.sendMessage({ type: 'GET_STATS' });
                // 连接成功时加载文章
                this.loadArticles();
            }
        }
    }

    updateStats(stats) {
        if (!stats) return;
        document.querySelector('.total-count').textContent = stats.total || 0;
        document.querySelector('.today-count').textContent = stats.today || 0;
        document.querySelector('.week-count').textContent = stats.week || 0;
    }

    // 过滤文章
    filterArticles() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        weekAgo.setHours(0, 0, 0, 0);

        switch (this.currentFilter) {
            case 'today':
                return this.articles.filter(article => 
                    new Date(article.created_at) >= today
                );
            case 'week':
                return this.articles.filter(article => 
                    new Date(article.created_at) >= weekAgo
                );
            default:
                return this.articles;
        }
    }

    // 更新过滤按钮状态
    updateFilterButtons() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === this.currentFilter);
        });
    }

    // 绑定文章操作事件
    bindArticleEvents() {
        document.querySelectorAll('.article-item').forEach(item => {
            const id = item.dataset.id;
            
            // 编辑按钮
            item.querySelector('.edit-btn').addEventListener('click', () => {
                this.editArticle(id);
            });

            // 删除按钮
            item.querySelector('.delete-btn').addEventListener('click', () => {
                this.deleteArticle(id);
            });
        });
    }

    // 编辑文章
    async editArticle(id) {
        // ... 实现编辑功能
    }

    // 删除文章
    async deleteArticle(id) {
        if (confirm('确定要删除这篇文章吗？')) {
            try {
                const { error } = await messageManager.supabase
                    .from('articles')
                    .delete()
                    .eq('id', id);

                if (error) throw error;

                await this.loadArticles();
                await messageManager.updateArticleStats();
            } catch (error) {
                console.error('删除文章失败:', error);
                alert('删除文章失败');
            }
        }
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
    const popupManager = new PopupManager();
}); 