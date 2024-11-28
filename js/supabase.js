// Supabase 配置
const SUPABASE_URL = 'https://tkcrnfgnspvtzwbbvyfv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrY3JuZmduc3B2dHp3YmJ2eWZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTg5MDg5NDcsImV4cCI6MjAxNDQ4NDk0N30.ZG9LD6cXtTXWn7UxKjWqE8oL-8gL-YJnFwKxGcGN2cA';

let supabaseInstance = null;

// 初始化 Supabase 客户端
async function initSupabase() {
    if (supabaseInstance) return supabaseInstance;
    
    if (!window.supabase || !window.supabase.createClient) {
        throw new Error('Supabase client not available');
    }
    
    supabaseInstance = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false
        }
    });
    
    return supabaseInstance;
}

// 测试数据库连接
async function testConnection() {
    try {
        if (!supabaseInstance) {
            supabaseInstance = await initSupabase();
        }
    } catch (error) {
        console.error('初始化 Supabase 客户端失败:', error);
        return false;
    }
    
    try {
        const { data, error } = await supabaseInstance
            .from('articles')
            .select('count')
            .limit(1);

        if (error) throw error;
        
        console.log('Connection test passed');
        return true;
    } catch (error) {
        console.error('数据库连接测试失败:', error);
        return false;
    }
}

// 用于测试的辅助函数
function _resetSupabaseInstance() {
    supabaseInstance = null;
}

export { initSupabase, testConnection, _resetSupabaseInstance };
