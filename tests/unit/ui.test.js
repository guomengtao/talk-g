import '../../js/test-setup';
import { initializeApp } from '../../js/popup';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
    createClient: jest.fn()
}));

describe('UI Tests', () => {
    let mockSupabaseClient;

    beforeEach(() => {
        // Clear the document body before each test
        document.body.innerHTML = '';
        
        // Reset all mocks
        jest.clearAllMocks();

        // Setup mock Supabase client
        mockSupabaseClient = {
            from: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue({
                data: [{ id: 1 }],
                error: null
            })
        };
        
        // Mock createClient to return our mock client
        createClient.mockReturnValue(mockSupabaseClient);
    });

    test('initializeApp should create status element', async () => {
        // Setup test DOM
        document.body.innerHTML = '<div id="app"></div>';

        // Run initialization
        await initializeApp();

        // Check if status element was created
        const statusElement = document.querySelector('.connection-status');
        expect(statusElement).toBeTruthy();
        expect(statusElement.textContent).toBe('Connected to Supabase');
        expect(statusElement.className).toBe('connection-status success');
    });

    test('initializeApp should handle missing app element', async () => {
        // Don't create app element in DOM
        document.body.innerHTML = '';

        // Run initialization
        await initializeApp();

        // Verify no status element was created
        const statusElement = document.querySelector('.connection-status');
        expect(statusElement).toBeFalsy();
    });

    test('status element should show correct styles for different states', async () => {
        // Setup test DOM
        document.body.innerHTML = '<div id="app"></div>';

        // Run initialization with success response
        await initializeApp();

        const statusElement = document.querySelector('.connection-status');

        // Success state
        expect(statusElement.className).toBe('connection-status success');
        expect(statusElement.textContent).toBe('Connected to Supabase');

        // Mock error response for next test
        mockSupabaseClient.limit.mockResolvedValueOnce({
            data: null,
            error: new Error('Connection failed')
        });

        // Check connection again
        await initializeApp();

        // Error state
        expect(statusElement.className).toBe('connection-status error');
        expect(statusElement.textContent).toContain('Error');
    });
});
