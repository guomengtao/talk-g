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
    console.log('Fetching articles...');
    const url = `${window.SUPABASE_CONFIG.url}/rest/v1/${window.SUPABASE_CONFIG.tableName}?select=*&is_deleted=eq.false&order=created_at.desc`;
    console.log('Request URL:', url);
    
    const apiKey = window.SUPABASE_CONFIG.getApiKey();
    console.log('API Key available:', !!apiKey);

    const response = await fetch(url, {
      headers: {
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`
      }
    });

    console.log('Response status:', response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`获取文章失败: ${response.status} ${errorText}`);
    }

    const articles = await response.json();
    console.log('Fetched articles:', articles);
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
    console.log('Updating article:', id);
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
      const errorText = await response.text();
      console.error('Error updating article:', errorText);
      throw new Error(`更新文章失败: ${response.status} ${errorText}`);
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
    console.log('Deleting article:', id);
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
      const errorText = await response.text();
      console.error('Error deleting article:', errorText);
      throw new Error(`删除文章失败: ${response.status} ${errorText}`);
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
  
  if (!articles || articles.length === 0) {
    articleList.innerHTML = '<div class="empty-message">暂无文章</div>';
    return;
  }

  articleList.innerHTML = articles.map(article => `
    <div class="article-item" data-id="${article.id}">
      <div class="article-title">${article.title || ''}</div>
      <div class="article-content">${article.content || ''}</div>
      <div class="article-meta">
        <span>创建时间: ${formatDate(article.created_at)}</span>
        <span>更新时间: ${formatDate(article.updated_at)}</span>
      </div>
      <div class="article-actions">
        <button class="edit-btn" onclick="startEdit(${article.id}, this)">编辑</button>
        <button class="delete-btn" onclick="confirmDelete(${article.id})">删除</button>
      </div>
    </div>
  `).join('');
}

// 开始编辑文章
function startEdit(id, button) {
  const articleItem = button.closest('.article-item');
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
  console.log('Refreshing articles...');
  const articles = await fetchArticles();
  renderArticles(articles);
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  console.log('Popup loaded, initializing...');
  refreshArticles();
});

// 将函数暴露到全局作用域
window.startEdit = startEdit;
window.saveEdit = saveEdit;
window.confirmDelete = confirmDelete;
window.refreshArticles = refreshArticles; 