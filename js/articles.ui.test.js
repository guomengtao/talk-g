import { jest } from '@jest/globals';
import * as articlesModule from './articles.js';

// Mock DOM elements
function createMockElement(type = 'div') {
    const element = document.createElement(type);
    element.setAttribute = jest.fn();
    element.addEventListener = jest.fn();
    
    // 创建 classList mock
    const add = jest.fn();
    const remove = jest.fn();
    element.classList = {
        add,
        remove,
        mockClear: () => {
            add.mockClear();
            remove.mockClear();
        }
    };
    
    return element;
}

const mockElements = {
    listView: createMockElement(),
    editView: createMockElement(),
    articlesList: createMockElement(),
    showDeleted: Object.assign(createMockElement('input'), {
        type: 'checkbox',
        checked: false
    }),
    refreshBtn: createMockElement('button'),
    backToList: createMockElement('button'),
    saveBtn: createMockElement('button'),
    deleteBtn: createMockElement('button'),
    titleInput: Object.assign(createMockElement('input'), {
        type: 'text',
        value: ''
    }),
    urlInput: Object.assign(createMockElement('input'), {
        type: 'text',
        value: ''
    }),
    contentInput: Object.assign(createMockElement('textarea'), {
        value: ''
    }),
    priorityInput: Object.assign(createMockElement('select'), {
        value: ''
    }),
    notification: createMockElement()
};

describe('文章管理器 UI 测试', () => {
    let articleManager;
    let mockSupabaseSelect;
    let mockSupabaseEq;
    let mockSupabaseFrom;
    let mockSupabaseSingle;
    
    beforeEach(() => {
        // 重置 modules
        jest.resetModules();
        
        // 设置 Supabase mock
        mockSupabaseSelect = jest.fn();
        mockSupabaseEq = jest.fn();
        mockSupabaseFrom = jest.fn();
        mockSupabaseSingle = jest.fn();
        
        // 构建 mock 链
        mockSupabaseFrom.mockReturnValue({
            select: mockSupabaseSelect
        });
        
        mockSupabaseSelect.mockReturnValue({
            single: mockSupabaseSingle
        });
        
        mockSupabaseSingle.mockReturnValue({
            eq: mockSupabaseEq
        });
        
        // 设置全局 window.supabase
        global.window = {
            supabase: {
                from: mockSupabaseFrom
            }
        };
        
        // 设置 document.getElementById mock
        document.getElementById = jest.fn((id) => mockElements[id]);
        
        // 重置所有 mock 元素的状态
        Object.values(mockElements).forEach(element => {
            if (element.value !== undefined) {
                element.value = '';
            }
            if (element.checked !== undefined) {
                element.checked = false;
            }
            if (element.classList) {
                element.classList.mockClear();
            }
            if (element.setAttribute) {
                element.setAttribute.mockClear();
            }
            if (element.addEventListener) {
                element.addEventListener.mockClear();
            }
        });
        
        // 创建 ArticleManager 实例
        articleManager = new articlesModule.ArticleManager();
    });

    describe('文章列表显示', () => {
        const mockArticles = [
            { id: 1, title: '测试文章1', created_at: '2024-01-01', priority: 'high' },
            { id: 2, title: '测试文章2', created_at: '2024-01-02', priority: 'medium', is_deleted: true },
            { id: 3, title: '测试文章3', created_at: '2024-01-03', priority: 'low' }
        ];

        test('应该正确初始化事件监听器', () => {
            // 验证事件监听器设置
            expect(mockElements.showDeleted.addEventListener)
                .toHaveBeenCalledWith('change', expect.any(Function));
            expect(mockElements.refreshBtn.addEventListener)
                .toHaveBeenCalledWith('click', expect.any(Function));
            expect(mockElements.backToList.addEventListener)
                .toHaveBeenCalledWith('click', expect.any(Function));
            expect(mockElements.saveBtn.addEventListener)
                .toHaveBeenCalledWith('click', expect.any(Function));
            expect(mockElements.deleteBtn.addEventListener)
                .toHaveBeenCalledWith('click', expect.any(Function));
        });

        test('应该正确加载文章列表', async () => {
            // Mock Supabase 响应
            mockSupabaseSelect.mockResolvedValue({
                data: mockArticles,
                error: null
            });

            // 加载文章列表
            await articleManager.loadArticles();

            // 验证 Supabase 调用
            expect(mockSupabaseFrom).toHaveBeenCalledWith('articles');
            expect(mockSupabaseSelect).toHaveBeenCalledWith('id, title');
        });

        test('应该正确处理文章详情查看', async () => {
            const mockArticle = mockArticles[0];
            
            // Mock Supabase 响应
            mockSupabaseEq.mockResolvedValue({
                data: {
                    ...mockArticle,
                    content: '文章内容',
                    url: 'https://example.com'
                },
                error: null
            });

            // 查看文章详情
            await articleManager.editArticle(mockArticle.id);

            // 验证 Supabase 调用
            expect(mockSupabaseFrom).toHaveBeenCalledWith('articles');
            expect(mockSupabaseSelect).toHaveBeenCalledWith('*');
            expect(mockSupabaseSingle).toHaveBeenCalled();
            expect(mockSupabaseEq).toHaveBeenCalledWith('id', mockArticle.id);
            
            // 验证表单值
            expect(mockElements.titleInput.value).toBe('测试文章1');
            expect(mockElements.priorityInput.value).toBe('high');
            
            // 验证视图切换
            expect(mockElements.listView.classList.add)
                .toHaveBeenCalledWith('hidden');
            expect(mockElements.editView.classList.remove)
                .toHaveBeenCalledWith('hidden');
        });

        test('应该正确处理错误情况', async () => {
            // Mock Supabase 错误响应
            mockSupabaseSelect.mockResolvedValue({
                data: null,
                error: new Error('加载失败')
            });

            // 加载文章列表
            await articleManager.loadArticles();

            // 验证错误处理
            expect(mockSupabaseFrom).toHaveBeenCalledWith('articles');
            expect(mockElements.notification.setAttribute)
                .toHaveBeenCalledWith('class', expect.stringContaining('error'));
        });
    });
});
