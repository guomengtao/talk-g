const PuppeteerEnvironment = require('jest-environment-puppeteer');

class ScreenshotEnvironment extends PuppeteerEnvironment {
    async setup() {
        await super.setup();
        // Add any custom environment setup here
    }

    async teardown() {
        // Add any custom cleanup here
        await super.teardown();
    }
}

module.exports = ScreenshotEnvironment;
