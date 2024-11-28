module.exports = {
    preset: 'jest-puppeteer',
    testMatch: ['**/screenshot.test.js'],
    testTimeout: 30000,
    setupFilesAfterEnv: ['./jest.screenshot.setup.js']
};
