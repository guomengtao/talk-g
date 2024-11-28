// Mock Chrome API
global.chrome = {
    runtime: {
        sendMessage: jest.fn(),
        onMessage: {
            addListener: jest.fn()
        }
    },
    tabs: {
        query: jest.fn(),
        create: jest.fn(),
        sendMessage: jest.fn()
    }
};

// Mock console methods for testing
global.console = {
    ...console,
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
};

// Mock fetch API
global.fetch = jest.fn();

// Mock TextEncoder and TextDecoder
const util = require('util');
global.TextEncoder = util.TextEncoder;
global.TextDecoder = util.TextDecoder;

const { JSDOM } = require('jsdom');

// Create a basic DOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body><div id="app"></div></body></html>', {
    url: 'http://localhost',
    pretendToBeVisual: true,
    runScripts: 'dangerously'
});

// Set up a basic browser-like environment
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.HTMLElement = dom.window.HTMLElement;
global.Element = dom.window.Element;
global.localStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn()
};

// Mock Supabase configuration
global.window.SUPABASE_CONFIG = {
    url: 'https://test.supabase.co',
    getApiKey: () => 'test-key'
};

// Reset mocks between tests
beforeEach(() => {
    jest.clearAllMocks();
    global.supabaseClient = null;
    window.SUPABASE_CONFIG = {
        url: 'https://test.supabase.co',
        getApiKey: () => 'test-key'
    };
    document.body.innerHTML = '<div id="app"></div>';
});

afterEach(() => {
    jest.restoreAllMocks();
    global.supabaseClient = null;
});
