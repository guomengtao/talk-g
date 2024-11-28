# Talk-G Chrome拡張機能テストドキュメント

## 概要

Talk-G Chrome拡張機能は、ユニットテスト、統合テスト、スクリーンショットテストを含む包括的なテスト戦略を実装しています。本ドキュメントでは、テストアプローチの詳細と、テストの実行・保守のガイダンスを提供します。

## テストの種類

### 1. ユニットテスト

ユニットテストは、個々のコンポーネントと関数を独立してテストすることに焦点を当てています。

**場所**: `js/*.test.js`

**テスト対象の主要領域**:
- 記事の読み込みと解析
- Supabaseクライアントの初期化
- エラー処理
- UIコンポーネントのレンダリング

**ユニットテストの実行**:
```bash
npm run test
```

### 2. 統合テスト

統合テストは、異なるコンポーネント間およびSupabaseバックエンドとの相互作用を検証します。

**場所**: `js/*.integration.test.js`

**テスト対象の主要領域**:
- Supabase接続とクエリ
- 記事のCRUD操作
- エラー伝播
- 状態管理

**統合テストの実行**:
```bash
npm run test:integration
```

### 3. スクリーンショットテスト

スクリーンショットテストは、拡張機能のUIコンポーネントの視覚的な外観をキャプチャして検証します。

**場所**: `js/screenshot.test.js`

**テスト対象の主要領域**:
- 記事一覧ビューのレンダリング
- 記事詳細ビューのレンダリング
- エラー状態の表示
- ローディング状態
- UIの一貫性

**スクリーンショットテストの実行**:
```bash
npm run test:screenshot
```

## テスト設定

### Jest設定

異なるテストタイプに対して異なるJest設定を使用しています：

1. **ユニットテスト** (`jest.config.js`):
   - 高速実行
   - モック依存関係
   - インメモリDOM

2. **統合テスト** (`jest.integration.config.js`):
   - 実際のSupabase接続
   - 長いタイムアウト
   - テストデータベース

3. **スクリーンショットテスト** (`jest.screenshot.config.js`):
   - Puppeteer統合
   - Chrome拡張機能の読み込み
   - スクリーンショット比較

### Puppeteer設定

スクリーンショットテストは以下の設定でPuppeteerを使用します (`jest-puppeteer.config.js`):
- デバッグ用のヘッドレスモード無効
- 拡張機能の読み込み
- カスタムビューポートサイズ
- ネットワークリクエスト処理

## テスト例

### 1. ユニットテスト例

```javascript
describe('記事読み込み', () => {
  test('記事データを正しく解析すべき', () => {
    const mockData = {
      title: 'テスト記事',
      content: 'テスト内容'
    };
    const article = parseArticle(mockData);
    expect(article.title).toBe('テスト記事');
    expect(article.description).toBeDefined();
  });
});
```

### 2. 統合テスト例

```javascript
describe('Supabase統合', () => {
  test('データベースから記事を読み込むべき', async () => {
    const articles = await loadArticles();
    expect(articles).toBeInstanceOf(Array);
    expect(articles[0]).toHaveProperty('id');
  });
});
```

### 3. スクリーンショットテスト例

```javascript
describe('UIスクリーンショット', () => {
  test('記事一覧ビューをキャプチャすべき', async () => {
    await page.goto(extensionUrl);
    await page.waitForSelector('.article-list');
    await page.screenshot({
      path: 'screenshots/article-list.png'
    });
  });
});
```

## スクリーンショット例

### 記事一覧ビュー
![記事一覧](../docs/images/screenshots/article-list.png)
- 接続状態の表示
- 記事タイトルと説明の表示
- ホバーエフェクトの実装

### 記事詳細ビュー
![記事詳細](../docs/images/screenshots/article-detail.png)
- 記事全文の表示
- ナビゲーションの提供
- 一貫したスタイリング

### エラー状態
![エラー状態](../docs/images/screenshots/error-state.png)
- エラーメッセージの表示
- ユーザーフィードバックの維持
- 一貫したエラースタイリング

## ベストプラクティス

1. **テストの整理**
   - 関連するテストのグループ化
   - 説明的なテスト名の使用
   - テストの独立性の維持

2. **スクリーンショットテスト**
   - 一貫したビューポートサイズの使用
   - コンテンツの読み込み待機
   - 動的コンテンツの処理

3. **エラー処理**
   - エラーシナリオのテスト
   - エラーメッセージの検証
   - エラー状態の確認

4. **テストの保守**
   - 定期的なスクリーンショットの更新
   - テストデータのクリーンアップ
   - テスト変更の文書化

## 継続的インテグレーション

CIパイプラインは以下の場合にすべてのテストを実行します：
- プルリクエスト
- メインブランチのコミット
- リリースタグ

### CI設定

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

## トラブルシューティング

一般的な問題と解決策：

1. **スクリーンショットの不一致**
   - ビューポートサイズの確認
   - コンテンツ読み込みの確認
   - ベースライン画像の更新

2. **統合テストの失敗**
   - Supabase接続の確認
   - テストデータベースの確認
   - エラーログの確認

3. **テストのタイムアウト**
   - タイムアウト値の増加
   - 非同期操作の確認
   - ネットワークリクエストの確認

## 貢献

新しいテストを追加する際：

1. 既存のパターンに従う
2. ドキュメントを追加
3. ベースラインスクリーンショットを更新
4. エラーケースをテスト
5. CIパイプラインを検証

## 今後の改善点

1. ビジュアルリグレッションテストの追加
2. パフォーマンステストの実装
3. アクセシビリティテストの追加
4. テストカバレッジの拡大
5. スクリーンショット更新の自動化
