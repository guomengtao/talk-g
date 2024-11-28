// 设置测试环境
process.env.NODE_ENV = 'test';

// 模拟浏览器环境
global.window = {
    location: {
        href: 'http://localhost'
    }
};

// 模拟 console.error，以便捕获错误
global.console.error = jest.fn();

// 模拟 localStorage
global.localStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn()
};
