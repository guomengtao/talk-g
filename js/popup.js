import { createClient } from '@supabase/supabase-js';

let supabaseClient = null;

export function initSupabase() {
    if (supabaseClient) {
        return supabaseClient;
    }

    if (!window.SUPABASE_CONFIG) {
        throw new Error('Supabase configuration not found');
    }

    const { url, getApiKey } = window.SUPABASE_CONFIG;
    supabaseClient = createClient(url, getApiKey());
    return supabaseClient;
}

export async function loadArticles() {
    const { data, error } = await supabaseClient
        .from('articles')
        .select('id, title, content, created_at')
        .order('created_at', { ascending: false });

    if (error) {
        throw error;
    }

    // 将content作为描述，限制长度
    return data.map(article => ({
        ...article,
        description: article.content ? article.content.substring(0, 100) + '...' : '暂无描述'
    }));
}

export async function displayArticles(articles) {
    const app = document.getElementById('app');
    const articleList = document.createElement('div');
    articleList.className = 'article-list';

    articles.forEach(article => {
        const articleItem = document.createElement('div');
        articleItem.className = 'article-item';
        articleItem.setAttribute('data-id', article.id);
        articleItem.innerHTML = `
            <h3>${article.title || '无标题'}</h3>
            <p>${article.description}</p>
        `;
        articleItem.addEventListener('click', () => showArticleDetail(article.id));
        articleList.appendChild(articleItem);
    });

    app.appendChild(articleList);
}

export async function showArticleDetail(articleId) {
    const { data: article, error } = await supabaseClient
        .from('articles')
        .select('*')
        .eq('id', articleId)
        .single();

    if (error) {
        showError(error.message);
        return;
    }

    const app = document.getElementById('app');
    app.innerHTML = '';

    const articleDetail = document.createElement('div');
    articleDetail.className = 'article-detail';
    articleDetail.innerHTML = `
        <div class="article-header">
            <button class="back-button">返回</button>
            <h2>${article.title || '无标题'}</h2>
        </div>
        <div class="article-content">
            ${article.content || '暂无内容'}
        </div>
    `;

    const backButton = articleDetail.querySelector('.back-button');
    backButton.addEventListener('click', async () => {
        app.innerHTML = '';
        const statusElement = document.createElement('div');
        statusElement.className = 'connection-status success';
        statusElement.textContent = 'Connected to Supabase';
        app.appendChild(statusElement);
        const articles = await loadArticles();
        await displayArticles(articles);
    });

    app.appendChild(articleDetail);
}

export function showError(message) {
    const app = document.getElementById('app');
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.textContent = message;
    app.appendChild(errorMessage);
}

export async function initializeApp() {
    const app = document.getElementById('app');
    if (!app) return;

    const statusElement = document.createElement('div');
    statusElement.className = 'connection-status';
    statusElement.textContent = 'Connecting to Supabase...';
    app.appendChild(statusElement);

    try {
        initSupabase();
        await checkSupabaseConnection();
        const articles = await loadArticles();
        await displayArticles(articles);
    } catch (error) {
        if (statusElement) {
            statusElement.textContent = `Error: ${error.message}`;
            statusElement.className = 'connection-status error';
        }
        showError(error.message);
        console.error('Initialization error:', error);
        throw error;
    }
}

export async function checkSupabaseConnection() {
    const statusElement = document.querySelector('.connection-status');
    if (!statusElement) return;

    if (!supabaseClient) {
        statusElement.textContent = 'Error: Supabase client not initialized';
        statusElement.className = 'connection-status error';
        return;
    }

    try {
        const { data, error } = await supabaseClient.from('articles').select('count');
        if (error) throw error;

        statusElement.textContent = 'Connected to Supabase';
        statusElement.className = 'connection-status success';
    } catch (error) {
        statusElement.textContent = `Connection error: ${error.message}`;
        statusElement.className = 'connection-status error';
        throw error;
    }
}

// Initialize when popup is loaded
document.addEventListener('DOMContentLoaded', initializeApp);
