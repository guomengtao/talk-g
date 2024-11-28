// 数据访问层函数
export async function getArticleList() {
    try {
        const { data, error } = await window.supabase
            .from('articles')
            .select('id, title');

        if (error) {
            console.error('获取文章列表失败:', error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error('获取文章列表异常:', error);
        return { success: false, error };
    }
}

export async function getArticleDetail(articleId) {
    if (!articleId) {
        return { success: false, error: '无效的文章ID' };
    }

    try {
        const { data, error } = await window.supabase
            .from('articles')
            .select('*')
            .single()
            .eq('id', articleId);

        if (error) {
            console.error('获取文章详情失败:', error);
            return { success: false, error };
        }

        if (!data) {
            return { success: false, error: '文章不存在' };
        }

        return { success: true, data };
    } catch (error) {
        console.error('获取文章详情异常:', error);
        return { success: false, error };
    }
}

// UI 类
export class ArticleManager {
    constructor() {
        this.currentArticle = null;
        this.listView = document.getElementById('listView');
        this.editView = document.getElementById('editView');
        this.articlesList = document.getElementById('articlesList');
        this.showDeletedCheckbox = document.getElementById('showDeleted');
        this.refreshBtn = document.getElementById('refreshBtn');
        this.backToList = document.getElementById('backToList');
        this.saveBtn = document.getElementById('saveBtn');
        this.deleteBtn = document.getElementById('deleteBtn');

        this.titleInput = document.getElementById('titleInput');
        this.urlInput = document.getElementById('urlInput');
        this.contentInput = document.getElementById('contentInput');
        this.priorityInput = document.getElementById('priorityInput');

        this.initializeEventListeners();
        this.loadArticles();
    }

    initializeEventListeners() {
        this.showDeletedCheckbox.addEventListener('change', () => this.loadArticles());
        this.refreshBtn.addEventListener('click', () => this.loadArticles());
        this.backToList.addEventListener('click', () => this.showListView());
        this.saveBtn.addEventListener('click', () => this.saveArticle());
        this.deleteBtn.addEventListener('click', () => this.toggleDeleteArticle());
    }

    async loadArticles() {
        try {
            const result = await getArticleList();
            if (!result.success) {
                throw new Error(result.error);
            }

            const showDeleted = this.showDeletedCheckbox.checked;
            this.renderArticles(result.data, showDeleted);
        } catch (error) {
            this.showNotification('Error loading articles', true);
            console.error('Error:', error);
        }
    }

    async editArticle(articleId) {
        try {
            const result = await getArticleDetail(articleId);
            if (!result.success) {
                throw new Error(result.error);
            }

            this.currentArticle = result.data;
            this.titleInput.value = result.data.title || '';
            this.urlInput.value = result.data.url || '';
            this.contentInput.value = result.data.content || '';
            this.priorityInput.value = result.data.priority || 'low';
            
            this.deleteBtn.textContent = result.data.is_deleted ? 'Restore Article' : 'Delete Article';
            this.showEditView();
        } catch (error) {
            this.showNotification('Error loading article details', true);
            console.error('Error:', error);
        }
    }

    renderArticles(articles, showDeleted) {
        this.articlesList.innerHTML = '';
        
        articles
            .filter(article => showDeleted || !article.is_deleted)
            .forEach(article => {
                const articleElement = document.createElement('div');
                articleElement.className = `article-item${article.is_deleted ? ' deleted' : ''}`;
                
                articleElement.innerHTML = `
                    <div class="article-content">
                        <div class="article-title">${article.title || 'Untitled'}</div>
                        <div class="article-meta">
                            ${new Date(article.created_at).toLocaleString()}
                            ${article.is_deleted ? ' • Deleted' : ''}
                        </div>
                    </div>
                    <div class="article-priority priority-${article.priority || 'low'}">
                        ${article.priority || 'low'}
                    </div>
                `;

                articleElement.addEventListener('click', () => this.editArticle(article.id));
                this.articlesList.appendChild(articleElement);
            });
    }

    showListView() {
        this.editView.classList.add('hidden');
        this.listView.classList.remove('hidden');
        this.currentArticle = null;
    }

    showEditView() {
        this.listView.classList.add('hidden');
        this.editView.classList.remove('hidden');
    }

    showNotification(message, isError = false) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification${isError ? ' error' : ''} show`;

        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    async saveArticle() {
        if (!this.currentArticle) return;

        try {
            const updatedArticle = {
                title: this.titleInput.value,
                url: this.urlInput.value,
                content: this.contentInput.value,
                priority: this.priorityInput.value,
                updated_at: new Date().toISOString()
            };

            const response = await fetch(
                `${window.SUPABASE_CONFIG.url}/rest/v1/articles?id=eq.${this.currentArticle.id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'apikey': window.SUPABASE_CONFIG.getApiKey(),
                        'Authorization': `Bearer ${window.SUPABASE_CONFIG.getApiKey()}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify(updatedArticle)
                }
            );

            if (!response.ok) {
                throw new Error('Failed to update article');
            }

            this.showNotification('Article saved successfully');
            await this.loadArticles();
            this.showListView();
        } catch (error) {
            this.showNotification('Error saving article', true);
            console.error('Error:', error);
        }
    }

    async toggleDeleteArticle() {
        if (!this.currentArticle) return;

        try {
            const isDeleted = !this.currentArticle.is_deleted;
            const response = await fetch(
                `${window.SUPABASE_CONFIG.url}/rest/v1/articles?id=eq.${this.currentArticle.id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'apikey': window.SUPABASE_CONFIG.getApiKey(),
                        'Authorization': `Bearer ${window.SUPABASE_CONFIG.getApiKey()}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify({
                        is_deleted: isDeleted,
                        updated_at: new Date().toISOString()
                    })
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to ${isDeleted ? 'delete' : 'restore'} article`);
            }

            this.showNotification(`Article ${isDeleted ? 'deleted' : 'restored'} successfully`);
            await this.loadArticles();
            this.showListView();
        } catch (error) {
            this.showNotification(`Error ${this.currentArticle.is_deleted ? 'restoring' : 'deleting'} article`, true);
            console.error('Error:', error);
        }
    }
}

// Initialize the article manager when the DOM is loaded
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        new ArticleManager();
    });
}
