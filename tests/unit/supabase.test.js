import '../../js/test-setup';
import { initSupabase, checkSupabaseConnection } from '../../js/popup';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
    createClient: jest.fn()
}));

describe('Supabase Connection Tests', () => {
    let mockSupabaseClient;

    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();
        
        // Setup mock Supabase client
        mockSupabaseClient = {
            from: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis()
        };
        
        // Mock createClient to return our mock client
        createClient.mockReturnValue(mockSupabaseClient);
        
        // Create mock DOM elements
        document.body.innerHTML = `
            <div class="connection-status">Initial status</div>
        `;
    });

    test('initSupabase should create Supabase client with correct config', () => {
        const client = initSupabase();
        
        expect(createClient).toHaveBeenCalledWith(
            'https://test.supabase.co',
            'test-key'
        );
        expect(client).toBe(mockSupabaseClient);
    });

    test('checkSupabaseConnection should handle successful connection', async () => {
        // Mock successful response
        mockSupabaseClient.limit.mockResolvedValue({
            data: [{ id: 1 }],
            error: null
        });

        await checkSupabaseConnection();

        const statusElement = document.querySelector('.connection-status');
        expect(statusElement.textContent).toBe('Connected to Supabase');
        expect(statusElement.className).toBe('connection-status success');
    });

    test('checkSupabaseConnection should handle connection error', async () => {
        // Mock error response
        mockSupabaseClient.limit.mockResolvedValue({
            data: null,
            error: new Error('Connection failed')
        });

        await checkSupabaseConnection();

        const statusElement = document.querySelector('.connection-status');
        expect(statusElement.textContent).toBe('Error connecting to Supabase: Connection failed');
        expect(statusElement.className).toBe('connection-status error');
    });
});
