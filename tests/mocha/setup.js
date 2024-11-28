import { JSDOM } from 'jsdom';

// Create a new JSDOM instance
const dom = new JSDOM(`
<!DOCTYPE html>
<html>
    <body>
        <div id="app">
            <div class="connection-status"></div>
        </div>
    </body>
</html>
`);

// Set up global variables that would normally be available in the browser
global.window = dom.window;
global.document = dom.window.document;

// Set up Supabase configuration
global.window.SUPABASE_CONFIG = {
    url: 'https://test.supabase.co',
    getApiKey: () => 'test-key'
};

// Mock createClient function
global.createClient = () => ({
    from: () => ({
        select: () => ({
            limit: () => Promise.resolve({ data: [{ id: 1 }], error: null })
        })
    })
});
