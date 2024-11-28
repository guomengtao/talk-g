const { getArticleList, getArticleDetail } = require('./articles.js');

// 在测试开始前初始化 Supabase 客户端
beforeAll(async () => {
    // 加载配置
    require('./config.js');
    
    // 初始化 Supabase 客户端
    const { createClient } = require('@supabase/supabase-js');
    global.window.supabase = createClient(
        global.window.SUPABASE_CONFIG.url,
        global.window.SUPABASE_CONFIG.getApiKey()
    );
    
    // 准备测试数据
    await prepareTestData();
});

// 准备测试数据
async function prepareTestData() {
    const testArticles = [
        {
            title: '测试文章1',
            content: '这是测试内容1',
            url: 'https://example.com/test1'
        },
        {
            title: '测试文章2',
            content: '这是测试内容2',
            url: 'https://example.com/test2'
        }
    ];

    const { error } = await global.window.supabase
        .from('articles')
        .insert(testArticles);

    if (error) {
        console.error('准备测试数据失败:', error);
        throw error;
    }
}

describe('文章管理集成测试', () => {
    describe('获取文章列表', () => {
        it('应该成功获取所有文章', async () => {
            const result = await getArticleList();
            
            expect(result.success).toBe(true);
            expect(Array.isArray(result.data)).toBe(true);
            expect(result.data.length).toBeGreaterThanOrEqual(2);
            
            // 验证返回的文章格式
            const testArticle = result.data.find(article => article.title === '测试文章1');
            expect(testArticle).toBeTruthy();
            expect(testArticle).toHaveProperty('id');
            expect(testArticle).toHaveProperty('title');
        });
    });
    
    describe('获取文章详情', () => {
        it('应该成功获取指定文章的详情', async () => {
            // 先获取测试文章的ID
            const { data: articles } = await global.window.supabase
                .from('articles')
                .select('id')
                .eq('title', '测试文章2')
                .single();
            
            if (!articles?.id) {
                throw new Error('未找到测试文章');
            }
            
            const result = await getArticleDetail(articles.id);
            
            expect(result.success).toBe(true);
            expect(result.data).toMatchObject({
                title: '测试文章2',
                content: '这是测试内容2',
                url: 'https://example.com/test2'
            });
        });
        
        it('获取不存在的文章应该返回错误', async () => {
            const result = await getArticleDetail(99999);
            
            expect(result.success).toBe(false);
            expect(result.error).toBeTruthy();
        });
    });
});
