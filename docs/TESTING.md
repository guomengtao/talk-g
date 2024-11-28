# Testing Documentation for Talk-G Chrome Extension

## Overview

The Talk-G Chrome Extension implements a comprehensive testing strategy that includes unit tests, integration tests, and screenshot tests. This document details our testing approach and provides guidance for running and maintaining tests.

## Test Types

### 1. Unit Tests

Unit tests focus on testing individual components and functions in isolation.

**Location**: `js/*.test.js`

**Key Areas Tested**:
- Article loading and parsing
- Supabase client initialization
- Error handling
- UI component rendering

**Running Unit Tests**:
```bash
npm run test
```

### 2. Integration Tests

Integration tests verify the interaction between different components and the Supabase backend.

**Location**: `js/*.integration.test.js`

**Key Areas Tested**:
- Supabase connection and queries
- Article CRUD operations
- Error propagation
- State management

**Running Integration Tests**:
```bash
npm run test:integration
```

### 3. Screenshot Tests

Screenshot tests capture and verify the visual appearance of the extension's UI components.

**Location**: `js/screenshot.test.js`

**Key Areas Tested**:
- Article list view rendering
- Article detail view rendering
- Error state display
- Loading states
- UI consistency

**Running Screenshot Tests**:
```bash
npm run test:screenshot
```

## Test Configuration

### Jest Configuration

We use different Jest configurations for different test types:

1. **Unit Tests** (`jest.config.js`):
   - Fast execution
   - Mocked dependencies
   - In-memory DOM

2. **Integration Tests** (`jest.integration.config.js`):
   - Real Supabase connection
   - Longer timeouts
   - Test database

3. **Screenshot Tests** (`jest.screenshot.config.js`):
   - Puppeteer integration
   - Chrome extension loading
   - Screenshot comparison

### Puppeteer Configuration

Screenshot tests use Puppeteer with the following setup (`jest-puppeteer.config.js`):
- Non-headless mode for debugging
- Extension loading
- Custom viewport size
- Network request handling

## Test Examples

### 1. Unit Test Example

```javascript
describe('Article Loading', () => {
  test('should parse article data correctly', () => {
    const mockData = {
      title: 'Test Article',
      content: 'Test Content'
    };
    const article = parseArticle(mockData);
    expect(article.title).toBe('Test Article');
    expect(article.description).toBeDefined();
  });
});
```

### 2. Integration Test Example

```javascript
describe('Supabase Integration', () => {
  test('should load articles from database', async () => {
    const articles = await loadArticles();
    expect(articles).toBeInstanceOf(Array);
    expect(articles[0]).toHaveProperty('id');
  });
});
```

### 3. Screenshot Test Example

```javascript
describe('UI Screenshots', () => {
  test('should capture article list view', async () => {
    await page.goto(extensionUrl);
    await page.waitForSelector('.article-list');
    await page.screenshot({
      path: 'screenshots/article-list.png'
    });
  });
});
```

## Screenshot Examples

### Article List View
![Article List](../docs/images/screenshots/article-list.png)
- Shows connection status
- Displays article titles and descriptions
- Implements hover effects

### Article Detail View
![Article Detail](../docs/images/screenshots/article-detail.png)
- Shows full article content
- Provides navigation
- Maintains consistent styling

### Error State
![Error State](../docs/images/screenshots/error-state.png)
- Displays error messages
- Maintains user feedback
- Consistent error styling

## Best Practices

1. **Test Organization**
   - Group related tests
   - Use descriptive test names
   - Maintain test independence

2. **Screenshot Testing**
   - Use consistent viewport sizes
   - Wait for content to load
   - Handle dynamic content

3. **Error Handling**
   - Test error scenarios
   - Verify error messages
   - Check error states

4. **Test Maintenance**
   - Regular screenshot updates
   - Clean test data
   - Document test changes

## Continuous Integration

Our CI pipeline runs all tests on:
- Pull requests
- Main branch commits
- Release tags

### CI Configuration

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

## Troubleshooting

Common issues and solutions:

1. **Screenshot Mismatches**
   - Check viewport size
   - Verify content loading
   - Update baseline images

2. **Integration Test Failures**
   - Check Supabase connection
   - Verify test database
   - Review error logs

3. **Test Timeouts**
   - Increase timeout values
   - Check async operations
   - Review network requests

## Contributing

When adding new tests:

1. Follow existing patterns
2. Add documentation
3. Update baseline screenshots
4. Test error cases
5. Verify CI pipeline

## Future Improvements

1. Add visual regression testing
2. Implement performance testing
3. Add accessibility tests
4. Expand test coverage
5. Automate screenshot updates
