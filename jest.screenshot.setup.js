const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Increase timeout for screenshot tests
jest.setTimeout(30000);

// Replace placeholder in test file
const testFilePath = path.join(__dirname, 'js/screenshot.test.js');
try {
    let content = fs.readFileSync(testFilePath, 'utf8');
    content = content.replace(/\[EXTENSION_ID\]/g, 'talk-g');
    fs.writeFileSync(testFilePath, content);
} catch (error) {
    console.error('Error updating test file:', error);
}
