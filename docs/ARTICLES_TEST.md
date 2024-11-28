# 文章功能测试文档

本文档详细说明了 Talk-G Chrome 插件中文章功能相关的测试实现。

## 测试文件结构

项目包含四个测试文件：
1. `articles.test.js`: 数据访问层测试
2. `articles.ui.test.js`: UI 层测试
3. `articles.integration.test.js`: 集成测试
4. `screenshot.test.js`: 界面截图测试

## 数据访问层测试 (articles.test.js)

### 测试范围

1. 文章列表获取
   - 成功获取文章标题列表
   - 处理获取失败情况
   - 处理异常情况

2. 文章详情获取
   - 成功获取指定文章详情
   - 处理文章不存在情况
   - 处理获取失败情况
   - 处理无效参数情况

### 示例代码

```javascript
describe('获取文章列表', () => {
    test('应该成功获取文章标题列表', async () => {
        const result = await getArticleList();
        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockArticleList);
    });
});
```

### 运行测试

```bash
npm test js/articles.test.js
```

## UI 层测试 (articles.ui.test.js)

### 测试范围

1. 文章列表显示
   - 正确显示文章列表
   - 处理已删除文章的显示/隐藏
   - 文章排序和过滤

2. 文章详情交互
   - 点击文章显示详情
   - 编辑功能
   - 返回列表功能

3. 错误处理
   - 显示错误提示
   - 加载失败处理

### 示例代码

```javascript
describe('文章列表显示', () => {
    test('应该正确显示文章列表', async () => {
        await articleManager.loadArticles();
        expect(mockElements.articlesList.children.length).toBe(2);
    });
});
```

### 运行测试

```bash
npm test js/articles.ui.test.js
```

## 集成测试 (articles.integration.test.js)

### 测试范围

1. 文章列表功能
   - 成功获取所有文章
   - 验证文章数据结构
   - 确保返回必要字段（id, title）

2. 文章详情功能
   - 获取指定文章的完整信息
   - 处理不存在文章的错误情况
   - 验证文章数据完整性

### 测试数据结构

```javascript
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
```

### 运行集成测试

```bash
npm run test:integration
```

### 示例测试用例

```javascript
describe('文章管理集成测试', () => {
    describe('获取文章列表', () => {
        it('应该成功获取所有文章', async () => {
            const result = await getArticleList();
            expect(result.success).toBe(true);
            expect(Array.isArray(result.data)).toBe(true);
            expect(result.data.length).toBeGreaterThanOrEqual(2);
        });
    });
    
    describe('获取文章详情', () => {
        it('应该成功获取指定文章的详情', async () => {
            const result = await getArticleDetail(articleId);
            expect(result.success).toBe(true);
            expect(result.data).toMatchObject({
                title: '测试文章2',
                content: '这是测试内容2',
                url: 'https://example.com/test2'
            });
        });
    });
});
```

### 集成测试环境配置

1. Jest 配置文件：`jest.integration.config.js`
   - 使用 CommonJS 模块格式
   - 配置 Babel 转换
   - 设置适当的超时时间

2. 测试环境设置：`jest.integration.setup.js`
   - 初始化 Supabase 客户端
   - 设置全局测试环境
   - 管理测试数据

### 注意事项

1. 数据库交互
   - 使用真实的 Supabase 连接
   - 确保测试数据的隔离性
   - 适当的错误处理

2. 环境配置
   - 确保配置文件正确加载
   - 验证数据库连接
   - 检查必要的环境变量

## 截图测试 (screenshot.test.js)

### 测试范围

1. 文章列表页面
   - 捕获完整的列表视图
   - 验证列表布局和样式

2. 文章详情页面
   - 捕获文章详情视图
   - 验证详情页面布局

3. 错误状态页面
   - 捕获错误提示界面
   - 验证错误信息显示

### 测试环境配置

1. Jest 配置文件：`jest.screenshot.config.js`
   - 使用 jest-puppeteer 预设
   - 配置截图测试超时时间
   - 自定义测试环境

2. 环境设置：`jest.screenshot.setup.js`
   - 配置 Puppeteer
   - 管理扩展 ID
   - 设置截图目录

### 运行截图测试

```bash
npm run test:screenshot
```

### 截图保存位置

截图文件保存在 `screenshots` 目录下：
- `article-list.png`: 文章列表页面
- `article-detail.png`: 文章详情页面
- `error-state.png`: 错误状态页面

### 示例测试用例

```javascript
test('capture article list page', async () => {
    await page.goto('chrome-extension://[EXTENSION_ID]/popup.html');
    await page.waitForSelector('.article-list');
    await page.screenshot({
        path: 'screenshots/article-list.png',
        fullPage: true
    });
});
```

### 注意事项

1. 运行环境
   - 需要安装 Puppeteer
   - Chrome 浏览器必须可用
   - 扩展必须正确加载

2. 截图设置
   - 使用固定视口大小
   - 支持全页面截图
   - 可自定义等待时间

3. 调试技巧
   - 检查选择器是否正确
   - 确认页面加载完成
   - 验证扩展 ID 配置

## Mock 说明

### Supabase 客户端 Mock

```javascript
const mockSelect = jest.fn();
const mockFrom = jest.fn(() => ({ select: mockSelect }));
```

### DOM 元素 Mock

```javascript
const mockElements = {
    listView: document.createElement('div'),
    articlesList: document.createElement('div'),
    // ...
};
```

## 测试数据

### 文章列表数据

```javascript
const mockArticles = [
    { id: 1, title: '测试文章1', created_at: '2024-01-01' },
    { id: 2, title: '测试文章2', created_at: '2024-01-02' }
];
```

## 注意事项

1. 运行测试前确保：
   - 已安装所有依赖
   - Jest 配置正确
   - Babel 配置支持 ES 模块

2. 测试文件命名规范：
   - 数据访问层测试：`*.test.js`
   - UI 层测试：`*.ui.test.js`
   - 集成测试：`*.integration.test.js`

3. Mock 使用建议：
   - 使用 `jest.fn()` 创建 mock 函数
   - 使用 `jest.spyOn()` 监视方法调用
   - 每个测试前重置 mock 状态

## 常见问题

1. 测试失败排查：
   - 检查 mock 配置
   - 验证异步操作处理
   - 确认 DOM 元素模拟

2. 异步测试：
   - 使用 async/await
   - 确保等待所有异步操作完成
   - 处理 Promise rejection

## 未来改进

1. 测试覆盖：
   - 添加更多边缘情况测试
   - 增加性能测试
   - 扩展集成测试场景

2. 测试工具：
   - 考虑使用 Testing Library
   - 添加快照测试
   - 使用测试覆盖率工具

3. 集成测试改进：
   - 添加文章状态管理测试
   - 实现文章删除功能测试
   - 添加批量操作测试

## 相关资源

- [Jest 官方文档](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [Chrome Extension Testing](https://developer.chrome.com/docs/extensions/mv3/testing/)
