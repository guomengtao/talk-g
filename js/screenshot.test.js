const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

describe('Chrome Plugin Screenshot Tests', () => {
    let browser;
    let page;
    let extensionId;
    const screenshotDir = path.join(__dirname, '../screenshots');
    const extensionPath = path.join(__dirname, '..');
    const WAIT_TIMEOUT = 10000; // 增加到10秒

    beforeAll(async () => {
        // Create screenshots directory if it doesn't exist
        if (!fs.existsSync(screenshotDir)) {
            fs.mkdirSync(screenshotDir, { recursive: true });
        }

        // Launch browser
        browser = await puppeteer.launch({
            headless: false,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                `--disable-extensions-except=${extensionPath}`,
                `--load-extension=${extensionPath}`
            ]
        });

        // Get extension ID by opening extensions page
        const setupPage = await browser.newPage();
        await setupPage.goto('chrome://extensions');
        
        // Wait for extensions to load and retry a few times if needed
        let attempts = 0;
        const maxAttempts = 5;
        
        while (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const targets = await browser.targets();
            const extensionTarget = targets.find(target => 
                target.type() === 'service_worker' && 
                target.url().includes('chrome-extension://')
            );
            
            if (extensionTarget) {
                const url = new URL(extensionTarget.url());
                extensionId = url.hostname;
                console.log('找到扩展ID:', extensionId);
                break;
            }
            
            console.log('尝试', attempts + 1, '/', maxAttempts, '- 扩展未找到');
            console.log('可用目标:', targets.map(t => ({ type: t.type(), url: t.url() })));
            attempts++;
        }
        
        if (!extensionId) {
            throw new Error('在' + maxAttempts + '次尝试后未找到扩展');
        }
        
        await setupPage.close();
    });

    beforeEach(async () => {
        page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });
    });

    afterEach(async () => {
        if (page) {
            try {
                await page.close();
            } catch (error) {
                console.log('关闭页面时出错:', error.message);
            }
        }
    });

    afterAll(async () => {
        if (browser) {
            await browser.close();
        }
    });

    test('capture article list page', async () => {
        if (!extensionId) {
            throw new Error('未找到扩展ID');
        }

        console.log('正在打开扩展页面...');
        await page.goto(`chrome-extension://${extensionId}/popup.html`);
        
        // 等待页面加载
        try {
            console.log('等待文章列表加载...');
            await page.waitForSelector('.article-list', { timeout: WAIT_TIMEOUT });
            console.log('文章列表已加载');
            
            // 等待具体内容加载
            await page.waitForFunction(
                () => document.querySelectorAll('.article-list .article-item').length > 0,
                { timeout: WAIT_TIMEOUT }
            );
            console.log('文章列表项已加载');
            
            // 等待一会儿确保样式都加载完成
            await new Promise(resolve => setTimeout(resolve, 1000));
            
        } catch (error) {
            console.log('等待文章列表时出错:', error.message);
            console.log('页面HTML:', await page.content());
        }
        
        // 截图
        const screenshotPath = path.join(screenshotDir, 'article-list.png');
        await page.screenshot({
            path: screenshotPath,
            fullPage: true
        });
        console.log('已保存截图:', screenshotPath);
    });

    test('capture article detail page', async () => {
        if (!extensionId) {
            throw new Error('未找到扩展ID');
        }

        console.log('正在打开扩展页面...');
        await page.goto(`chrome-extension://${extensionId}/popup.html`);
        
        try {
            console.log('等待文章列表加载...');
            await page.waitForSelector('.article-list .article-item', { timeout: WAIT_TIMEOUT });
            console.log('文章列表已加载');
            
            // 等待具体内容加载
            await page.waitForFunction(
                () => document.querySelectorAll('.article-list .article-item').length > 0,
                { timeout: WAIT_TIMEOUT }
            );
            console.log('文章列表项已加载');
            
            // 点击第一篇文章
            await page.click('.article-list .article-item');
            console.log('已点击文章');
            
            // 等待文章详情加载
            await page.waitForSelector('.article-detail', { timeout: WAIT_TIMEOUT });
            console.log('文章详情已加载');
            
            // 等待一会儿确保样式都加载完成
            await new Promise(resolve => setTimeout(resolve, 1000));
            
        } catch (error) {
            console.log('加载文章详情时出错:', error.message);
            console.log('页面HTML:', await page.content());
        }
        
        // 截图
        const screenshotPath = path.join(screenshotDir, 'article-detail.png');
        await page.screenshot({
            path: screenshotPath,
            fullPage: true
        });
        console.log('已保存截图:', screenshotPath);
    });

    test('capture error state', async () => {
        if (!extensionId) {
            throw new Error('未找到扩展ID');
        }

        console.log('正在打开错误页面...');
        await page.goto(`chrome-extension://${extensionId}/popup.html#article/999999`);
        
        try {
            console.log('等待错误信息显示...');
            await page.waitForSelector('.error-message', { timeout: WAIT_TIMEOUT });
            console.log('错误信息已显示');
            
            // 等待一会儿确保样式都加载完成
            await new Promise(resolve => setTimeout(resolve, 1000));
            
        } catch (error) {
            console.log('等待错误信息时出错:', error.message);
            console.log('页面HTML:', await page.content());
        }
        
        // 截图
        const screenshotPath = path.join(screenshotDir, 'error-state.png');
        await page.screenshot({
            path: screenshotPath,
            fullPage: true
        });
        console.log('已保存截图:', screenshotPath);
    });
});
