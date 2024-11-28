# Talk-G Chrome 扩展测试文档

## 概述

Talk-G Chrome 扩展实现了全面的测试策略，包括单元测试、集成测试和截图测试。本文档详细说明了我们的测试方法，并提供了运行和维护测试的指导。

## 测试类型

### 1. 单元测试

单元测试专注于独立测试各个组件和函数。

**位置**: `js/*.test.js`

**测试关键领域**:
- 文章加载和解析
- Supabase 客户端初始化
- 错误处理
- UI 组件渲染

**运行单元测试**:
```bash
npm run test
```

### 2. 集成测试

集成测试验证不同组件之间以及与 Supabase 后端的交互。

**位置**: `js/*.integration.test.js`

**测试关键领域**:
- Supabase 连接和查询
- 文章 CRUD 操作
- 错误传播
- 状态管理

**运行集成测试**:
```bash
npm run test:integration
```

### 3. 截图测试

截图测试捕获并验证扩展 UI 组件的视觉外观。

**位置**: `js/screenshot.test.js`

**测试关键领域**:
- 文章列表视图渲染
- 文章详情视图渲染
- 错误状态显示
- 加载状态
- UI 一致性

**运行截图测试**:
```bash
npm run test:screenshot
```

## 测试配置

### Jest 配置

我们为不同类型的测试使用不同的 Jest 配置：

1. **单元测试** (`jest.config.js`):
   - 快速执行
   - 模拟依赖
   - 内存 DOM

2. **集成测试** (`jest.integration.config.js`):
   - 真实 Supabase 连接
   - 较长超时时间
   - 测试数据库

3. **截图测试** (`jest.screenshot.config.js`):
   - Puppeteer 集成
   - Chrome 扩展加载
   - 截图比较

### Puppeteer 配置

截图测试使用以下设置的 Puppeteer (`jest-puppeteer.config.js`):
- 非无头模式用于调试
- 扩展加载
- 自定义视口大小
- 网络请求处理

## 测试示例

### 1. 单元测试示例

```javascript
describe('文章加载', () => {
  test('应正确解析文章数据', () => {
    const mockData = {
      title: '测试文章',
      content: '测试内容'
    };
    const article = parseArticle(mockData);
    expect(article.title).toBe('测试文章');
    expect(article.description).toBeDefined();
  });
});
```

### 2. 集成测试示例

```javascript
describe('Supabase 集成', () => {
  test('应从数据库加载文章', async () => {
    const articles = await loadArticles();
    expect(articles).toBeInstanceOf(Array);
    expect(articles[0]).toHaveProperty('id');
  });
});
```

### 3. 截图测试示例

```javascript
describe('UI 截图', () => {
  test('应捕获文章列表视图', async () => {
    await page.goto(extensionUrl);
    await page.waitForSelector('.article-list');
    await page.screenshot({
      path: 'screenshots/article-list.png'
    });
  });
});
```

## 截图示例

### 文章列表视图
![文章列表](../docs/images/screenshots/article-list.png)
- 显示连接状态
- 显示文章标题和描述
- 实现悬停效果

### 文章详情视图
![文章详情](../docs/images/screenshots/article-detail.png)
- 显示完整文章内容
- 提供导航功能
- 保持一致的样式

### 错误状态
![错误状态](../docs/images/screenshots/error-state.png)
- 显示错误消息
- 维持用户反馈
- 一致的错误样式

## 最佳实践

1. **测试组织**
   - 分组相关测试
   - 使用描述性测试名称
   - 保持测试独立性

2. **截图测试**
   - 使用一致的视口大小
   - 等待内容加载
   - 处理动态内容

3. **错误处理**
   - 测试错误场景
   - 验证错误消息
   - 检查错误状态

4. **测试维护**
   - 定期更新截图
   - 清理测试数据
   - 记录测试变更

## 持续集成

我们的 CI 管道在以下情况下运行所有测试：
- Pull requests
- 主分支提交
- 发布标签

### CI 配置

```yaml
test:
  script:
    - npm install
    - npm run test
    - npm run test:integration
    - npm run test:screenshot
  artifacts:
    paths:
      - screenshots/
```

## 故障排除

常见问题和解决方案：

1. **截图不匹配**
   - 检查视口大小
   - 验证内容加载
   - 更新基准图片

2. **集成测试失败**
   - 检查 Supabase 连接
   - 验证测试数据库
   - 查看错误日志

3. **测试超时**
   - 增加超时值
   - 检查异步操作
   - 查看网络请求

## 参与贡献

添加新测试时：

1. 遵循现有模式
2. 添加文档
3. 更新基准截图
4. 测试错误情况
5. 验证 CI 管道

## 未来改进

1. 添加视觉回归测试
2. 实现性能测试
3. 添加可访问性测试
4. 扩展测试覆盖率
5. 自动化截图更新
