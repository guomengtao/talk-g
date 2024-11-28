module.exports = {
    // 指定集成测试文件模式
    testMatch: [
        "**/**.integration.test.js"
    ],
    
    // 增加测试超时时间，因为集成测试可能需要更长时间
    testTimeout: 10000,
    
    // 设置测试环境
    testEnvironment: 'jsdom',
    
    // 在运行测试之前设置
    setupFiles: ['./jest.integration.setup.js'],
    
    // 支持 ESM
    transform: {
        '^.+\\.js$': ['babel-jest', { configFile: './babel.config.js' }]
    },
    
    // 转换设置
    transformIgnorePatterns: [
        '/node_modules/(?!@supabase)'
    ]
};
