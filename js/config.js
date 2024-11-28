// Supabase API Key (encrypted)
const ENCRYPTED_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrY3JuZmduc3B2dHp3YmJ2eWZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA5ODgwMTgsImV4cCI6MjA0NjU2NDAxOH0.o4kZY3X0XxcpM3OHO3yw7O3of2PPtXdQ4CBFgp3CMO8';

// 解密函数 (这里为了演示，直接返回加密的key)
function decrypt(encryptedKey) {
    return encryptedKey;
}

// Supabase 配置
const SUPABASE_CONFIG = {
    url: 'https://tkcrnfgnspvtzwbbvyfv.supabase.co',
    getApiKey: () => decrypt(ENCRYPTED_API_KEY),
    tableName: 'articles'
};

// 导出配置
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
