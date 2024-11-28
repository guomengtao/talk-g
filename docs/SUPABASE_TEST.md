# Supabase 连接测试文档

本文档详细说明了 Talk-G Chrome 插件中 Supabase 连接测试的实现和使用方法。

## 测试文件概述

`supabase.test.js` 是针对 Supabase 数据库连接功能的单元测试文件，主要测试以下功能：

- Supabase 客户端的初始化
- 数据库连接状态检查
- 错误处理和异常情况

## 测试用例说明

### 1. Supabase 客户端初始化测试

```javascript
describe('initSupabase', () => {
    test('应该正确初始化 Supabase 客户端')
    test('重复调用应该返回相同的客户端实例')
})
```

这组测试验证：
- Supabase 客户端是否正确初始化
- 配置参数是否正确传递
- 单例模式是否正常工作

### 2. 数据库连接测试

```javascript
describe('testConnection', () => {
    test('连接成功时应该返回 true')
    test('连接失败时应该返回 false')
    test('发生异常时应该返回 false')
    test('初始化失败时应该返回 false')
})
```

这组测试验证：
- 成功连接到数据库的情况
- 数据库连接失败的处理
- 网络异常的处理
- 客户端初始化失败的处理

## 如何运行测试

### 前置条件

1. 确保已安装所需依赖：
```bash
npm install
```

2. 确保项目中包含以下文件：
   - `js/supabase.js`：被测试的主要代码文件
   - `js/supabase.test.js`：测试文件
   - `babel.config.js`：Babel 配置文件
   - `package.json`：包含必要的测试配置

### 运行测试命令

运行所有测试：
```bash
npm test
```

只运行 Supabase 测试：
```bash
npm test js/supabase.test.js
```

运行测试并查看覆盖率：
```bash
npm run test:coverage
```

### 观察模式

在开发过程中，可以使用观察模式自动运行测试：
```bash
npm run test:watch
```

## Mock 说明

测试使用了以下 mock 对象：

1. Supabase 客户端 Mock：
```javascript
const mockCreateClient = jest.fn();
window.supabase = { createClient: mockCreateClient };
```

2. 数据库操作 Mock：
```javascript
const mockSelect = jest.fn();
const mockFrom = jest.fn(() => ({ select: mockSelect }));
const mockLimit = jest.fn();
```

## 测试辅助函数

`_resetSupabaseInstance()`: 用于在测试之间重置 Supabase 客户端实例。

## 常见问题处理

1. 测试失败时的检查步骤：
   - 确认 mock 函数是否正确设置
   - 检查错误消息是否匹配
   - 验证异步操作是否正确处理

2. 环境问题：
   - 确保 Node.js 版本兼容（推荐 v14+）
   - 检查 Jest 和 Babel 配置是否正确

## 注意事项

1. 安全性：
   - 测试中使用的 Supabase URL 和 Key 应该是测试环境的
   - 不要在测试代码中暴露生产环境的凭据

2. 测试维护：
   - 定期更新测试用例以匹配新功能
   - 保持测试代码的可读性和可维护性
   - 确保错误消息清晰明确

## 未来改进建议

1. 测试覆盖率提升：
   - 添加更多边缘情况测试
   - 测试不同的数据库查询场景
   - 添加性能测试用例

2. 代码质量提升：
   - 添加更详细的测试注释
   - 实现更细粒度的错误处理
   - 添加集成测试用例

## 相关资源

- [Jest 官方文档](https://jestjs.io/docs/getting-started)
- [Supabase 官方文档](https://supabase.io/docs)
- [Chrome 插件开发文档](https://developer.chrome.com/docs/extensions/)
