// 格式化时间戳
function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// 显示状态消息
function showStatus(message, isError = false) {
  const statusDiv = document.getElementById('status');
  statusDiv.textContent = message;
  statusDiv.className = 'status ' + (isError ? 'error' : 'success');
  setTimeout(() => {
    statusDiv.textContent = '';
    statusDiv.className = 'status';
  }, 3000);
}

// 获取文章列表
async function fetchArticles() {
  try {
    const url = `${window.SUPABASE_CONFIG.url}/rest/v1/${window.SUPABASE_CONFIG.tableName}?select=*&order=created_at.desc`;
    
    const response = await fetch(url, {
      headers: {
        'apikey': window.SUPABASE_CONFIG.getApiKey(),
        'Authorization': `Bearer ${window.SUPABASE_CONFIG.getApiKey()}`
      }
    });

    if (!response.ok) {
      throw new Error('获取文章失败');
    }

    const articles = await response.json();
    return articles;
  } catch (error) {
    console.error('Error fetching articles:', error);
    showStatus(error.message, true);
    return [];
  }
}

// 更新文章
async function updateArticle(id, title, content) {
  try {
    const url = `${window.SUPABASE_CONFIG.url}/rest/v1/${window.SUPABASE_CONFIG.tableName}?id=eq.${id}`;
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'apikey': window.SUPABASE_CONFIG.getApiKey(),
        'Authorization': `Bearer ${window.SUPABASE_CONFIG.getApiKey()}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        title,
        content,
        updated_at: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error('更新文章失败');
    }

    showStatus('文章更新成功');
    return true;
  } catch (error) {
    console.error('Error updating article:', error);
    showStatus(error.message, true);
    return false;
  }
}

// 软删除文章
async function deleteArticle(id) {
  try {
    const url = `${window.SUPABASE_CONFIG.url}/rest/v1/${window.SUPABASE_CONFIG.tableName}?id=eq.${id}`;
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'apikey': window.SUPABASE_CONFIG.getApiKey(),
        'Authorization': `Bearer ${window.SUPABASE_CONFIG.getApiKey()}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        is_deleted: true,
        updated_at: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error('删除文章失败');
    }

    showStatus('文章已删除');
    return true;
  } catch (error) {
    console.error('Error deleting article:', error);
    showStatus(error.message, true);
    return false;
  }
}

// 渲染文章列表
function renderArticles(articles) {
  const articleList = document.getElementById('articleList');
  
  if (articles.length === 0) {
    articleList.innerHTML = '<div class="empty-message">暂无文章</div>';
    return;
  }

  articleList.innerHTML = articles.map(article => `
    <div class="article-item" data-id="${article.id}">
      <div class="article-title">${article.title}</div>
      <div class="article-content">${article.content}</div>
      <div class="article-meta">
        <span>创建时间: ${formatDate(article.created_at)}</span>
        <span>更新时间: ${formatDate(article.updated_at)}</span>
      </div>
      <div class="article-actions">
        <button class="edit-btn" onclick="startEdit(${article.id})">编辑</button>
        <button class="delete-btn" onclick="confirmDelete(${article.id})">删除</button>
      </div>
    </div>
  `).join('');
}

// 开始编辑文章
function startEdit(id) {
  const articleItem = document.querySelector(`.article-item[data-id="${id}"]`);
  const title = articleItem.querySelector('.article-title').textContent;
  const content = articleItem.querySelector('.article-content').textContent;

  articleItem.innerHTML = `
    <div class="edit-mode">
      <input type="text" class="edit-title" value="${title}">
      <textarea class="edit-content">${content}</textarea>
      <div class="article-actions">
        <button class="save-btn" onclick="saveEdit(${id})">保存</button>
        <button class="cancel-btn" onclick="refreshArticles()">取消</button>
      </div>
    </div>
  `;
}

// 保存编辑
async function saveEdit(id) {
  const articleItem = document.querySelector(`.article-item[data-id="${id}"]`);
  const title = articleItem.querySelector('.edit-title').value.trim();
  const content = articleItem.querySelector('.edit-content').value.trim();

  if (!title || !content) {
    showStatus('标题和内容不能为空', true);
    return;
  }

  const success = await updateArticle(id, title, content);
  if (success) {
    refreshArticles();
  }
}

// 确认删除
function confirmDelete(id) {
  if (confirm('确定要删除这篇文章吗？')) {
    deleteArticle(id).then(success => {
      if (success) {
        refreshArticles();
      }
    });
  }
}

// 刷新文章列表
async function refreshArticles() {
  const articles = await fetchArticles();
  renderArticles(articles.filter(article => !article.is_deleted));
}

// 初始化
document.addEventListener('DOMContentLoaded', refreshArticles); 