import { jest } from '@jest/globals';
import { initSupabase, testConnection, _resetSupabaseInstance } from './supabase.js';

// Mock createClient function
const mockCreateClient = jest.fn();
window.supabase = { createClient: mockCreateClient };

// Mock Supabase Client
const mockSelect = jest.fn();
const mockFrom = jest.fn(() => ({ select: mockSelect }));
const mockLimit = jest.fn();
const mockClient = {
    from: mockFrom
};

describe('Supabase API 状态测试', () => {
    beforeEach(() => {
        // 重置所有的 mock
        jest.clearAllMocks();
        
        // 设置基本的 mock
        mockCreateClient.mockReturnValue(mockClient);
        mockSelect.mockReturnValue({ limit: mockLimit });
        
        // 重置 Supabase 实例
        _resetSupabaseInstance();
    });

    describe('initSupabase', () => {
        test('应该正确初始化 Supabase 客户端', async () => {
            const client = await initSupabase();
            
            expect(mockCreateClient).toHaveBeenCalledWith(
                'https://tkcrnfgnspvtzwbbvyfv.supabase.co',
                expect.any(String),
                expect.any(Object)
            );
            expect(client).toBe(mockClient);
        });

        test('重复调用应该返回相同的客户端实例', async () => {
            const client1 = await initSupabase();
            const client2 = await initSupabase();
            
            expect(client1).toBe(client2);
            expect(mockCreateClient).toHaveBeenCalledTimes(1);
        });
    });

    describe('testConnection', () => {
        test('连接成功时应该返回 true', async () => {
            mockLimit.mockResolvedValue({
                data: [{ count: 1 }],
                error: null
            });

            const result = await testConnection();
            
            expect(result).toBe(true);
            expect(mockFrom).toHaveBeenCalledWith('articles');
            expect(mockSelect).toHaveBeenCalledWith('count');
            expect(mockLimit).toHaveBeenCalledWith(1);
            expect(console.log).toHaveBeenCalledWith('Connection test passed');
        });

        test('连接失败时应该返回 false', async () => {
            mockLimit.mockResolvedValue({
                data: null,
                error: new Error('数据库连接错误')
            });

            const result = await testConnection();
            
            expect(result).toBe(false);
            expect(console.error).toHaveBeenCalledWith(
                '数据库连接测试失败:',
                expect.any(Error)
            );
        });

        test('发生异常时应该返回 false', async () => {
            mockLimit.mockRejectedValue(new Error('网络错误'));

            const result = await testConnection();
            
            expect(result).toBe(false);
            expect(console.error).toHaveBeenCalledWith(
                '数据库连接测试失败:',
                expect.any(Error)
            );
        });

        test('初始化失败时应该返回 false', async () => {
            // 移除 window.supabase 来模拟初始化失败
            delete window.supabase;

            const result = await testConnection();
            
            expect(result).toBe(false);
            expect(console.error).toHaveBeenCalledWith(
                '初始化 Supabase 客户端失败:',
                expect.any(Error)
            );
            
            // 恢复 window.supabase
            window.supabase = { createClient: mockCreateClient };
        });
    });
});
