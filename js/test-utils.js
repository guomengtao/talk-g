// Mock Supabase client creation
export function createMockSupabaseClient() {
    return {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        limit: jest.fn()
    };
}

// Create a mock status element
export function createMockStatusElement() {
    return {
        className: '',
        textContent: '',
        style: {}
    };
}

// Setup document with app div
export function setupDocument() {
    const appDiv = document.createElement('div');
    appDiv.id = 'app';
    document.body.appendChild(appDiv);
    return appDiv;
}

// Mock console methods
export function mockConsole() {
    console.error = jest.fn();
    console.log = jest.fn();
    console.warn = jest.fn();
}

// Reset all mocks
export function restoreAllMocks() {
    jest.restoreAllMocks();
    document.body.innerHTML = '';
    resetSupabaseClient();
}

// Reset Supabase client
export function resetSupabaseClient() {
    // Reset the module state
    jest.resetModules();
    global.supabaseClient = null;
    delete window.SUPABASE_CONFIG;
    
    // Set default config
    window.SUPABASE_CONFIG = {
        url: 'https://test.supabase.co',
        getApiKey: () => 'test-key'
    };
}

// Mock document methods
export function mockDocumentMethods(mockElement) {
    document.createElement = jest.fn().mockReturnValue(mockElement);
    document.querySelector = jest.fn().mockReturnValue(mockElement);
    document.getElementById = jest.fn().mockReturnValue(document.body.querySelector('#app'));
}

// Create error response
export function createErrorResponse(message) {
    return {
        data: null,
        error: { message }
    };
}

// Create success response
export function createSuccessResponse(data) {
    return {
        data,
        error: null
    };
}
