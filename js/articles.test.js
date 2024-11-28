import { jest } from '@jest/globals';
import { getArticleList, getArticleDetail } from './articles.js';

// Mock Supabase 客户端
const mockSelect = jest.fn();
const mockFrom = jest.fn(() => ({ select: mockSelect }));
const mockSingle = jest.fn();
const mockEq = jest.fn();

// 模拟文章数据
const mockArticles = [
    { id: 1, title: '文章一', content: '内容一' },
    { id: 2, title: '文章二', content: '内容二' },
    { id: 3, title: '文章三', content: '内容三' }
];

describe('文章功能测试', () => {
    beforeEach(() => {
        // 重置所有的 mock
        jest.clearAllMocks();
        
        // 设置基本的 mock 返回值
        mockSelect.mockReturnValue({ single: mockSingle });
        mockSingle.mockReturnValue({ eq: mockEq });
        
        // 模拟 window.supabase
        window.supabase = {
            from: mockFrom
        };
    });

    describe('获取文章列表', () => {
        test('应该成功获取文章标题列表', async () => {
            // 模拟成功响应
            const mockArticleList = mockArticles.map(({ id, title }) => ({ id, title }));
            mockSelect.mockResolvedValue({
                data: mockArticleList,
                error: null
            });

            const result = await getArticleList();
            
            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockArticleList);
            expect(mockFrom).toHaveBeenCalledWith('articles');
            expect(mockSelect).toHaveBeenCalledWith('id, title');
        });

        test('获取失败时应该返回错误信息', async () => {
            // 模拟失败响应
            mockSelect.mockResolvedValue({
                data: null,
                error: new Error('获取文章列表失败')
            });

            const result = await getArticleList();
            
            expect(result.success).toBe(false);
            expect(result.error).toBeTruthy();
            expect(console.error).toHaveBeenCalled();
        });

        test('发生异常时应该正确处理', async () => {
            // 模拟网络错误
            mockSelect.mockRejectedValue(new Error('网络错误'));

            const result = await getArticleList();
            
            expect(result.success).toBe(false);
            expect(result.error).toBeTruthy();
            expect(console.error).toHaveBeenCalled();
        });
    });

    describe('获取文章详情', () => {
        test('应该成功获取指定文章的详情', async () => {
            const articleId = 1;
            const mockArticle = mockArticles[0];
            
            // 模拟成功响应
            mockEq.mockResolvedValue({
                data: mockArticle,
                error: null
            });

            const result = await getArticleDetail(articleId);
            
            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockArticle);
            expect(mockFrom).toHaveBeenCalledWith('articles');
            expect(mockSelect).toHaveBeenCalledWith('*');
            expect(mockSingle).toHaveBeenCalled();
            expect(mockEq).toHaveBeenCalledWith('id', articleId);
        });

        test('文章不存在时应该返回错误信息', async () => {
            const articleId = 999;
            
            // 模拟文章不存在的响应
            mockEq.mockResolvedValue({
                data: null,
                error: null
            });

            const result = await getArticleDetail(articleId);
            
            expect(result.success).toBe(false);
            expect(result.error).toBe('文章不存在');
        });

        test('获取失败时应该返回错误信息', async () => {
            const articleId = 1;
            
            // 模拟失败响应
            mockEq.mockResolvedValue({
                data: null,
                error: new Error('获取文章详情失败')
            });

            const result = await getArticleDetail(articleId);
            
            expect(result.success).toBe(false);
            expect(result.error).toBeTruthy();
            expect(console.error).toHaveBeenCalled();
        });

        test('参数无效时应该返回错误信息', async () => {
            const result = await getArticleDetail();
            
            expect(result.success).toBe(false);
            expect(result.error).toBe('无效的文章ID');
        });
    });
});
