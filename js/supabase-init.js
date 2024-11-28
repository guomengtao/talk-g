// 初始化 Supabase 客户端
async function initSupabase() {
    try {
        const { createClient } = supabase;
        window.supabase = createClient(
            window.SUPABASE_CONFIG.url,
            window.SUPABASE_CONFIG.getApiKey()
        );
        
        // 测试连接
        const { data, error } = await window.supabase
            .from('articles')
            .select('count')
            .single();
            
        if (error) {
            console.error('Supabase connection error:', error);
            return false;
        }
        
        console.log('Successfully connected to Supabase');
        return true;
    } catch (error) {
        console.error('Failed to initialize Supabase:', error);
        return false;
    }
}

// 当页面加载时初始化
document.addEventListener('DOMContentLoaded', initSupabase);
