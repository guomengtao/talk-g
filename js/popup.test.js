import './test-setup';
import { initializeApp, checkSupabaseConnection, initSupabase } from './popup';
import { createClient } from '@supabase/supabase-js';
import {
    createMockSupabaseClient,
    createMockStatusElement,
    setupDocument,
    mockConsole,
    restoreAllMocks,
    resetSupabaseClient,
    mockDocumentMethods,
    createErrorResponse,
    createSuccessResponse
} from './test-utils';

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
    createClient: jest.fn()
}));

describe('Talk-G Plugin Tests', () => {
    let mockSupabaseClient;
    let mockStatusElement;
    let appDiv;

    beforeEach(() => {
        // Reset state
        resetSupabaseClient();
        
        // Setup test environment
        appDiv = setupDocument();
        mockConsole();
        
        // Create mock status element
        mockStatusElement = createMockStatusElement();
        
        // Setup mock Supabase client
        mockSupabaseClient = createMockSupabaseClient();
        createClient.mockReturnValue(mockSupabaseClient);

        // Mock DOM methods
        mockDocumentMethods(mockStatusElement);
    });

    afterEach(() => {
        restoreAllMocks();
    });

    describe('initSupabase', () => {
        test('initializes client with correct config', () => {
            const client = initSupabase();
            expect(createClient).toHaveBeenCalledWith(
                'https://test.supabase.co',
                'test-key'
            );
            expect(client).toBe(mockSupabaseClient);
        });

        test('throws error when config is missing', () => {
            const originalConfig = window.SUPABASE_CONFIG;
            delete window.SUPABASE_CONFIG;

            expect(() => initSupabase()).toThrow('Supabase configuration not found');

            window.SUPABASE_CONFIG = originalConfig;
        });

        test('reuses existing client on subsequent calls', () => {
            const client1 = initSupabase();
            createClient.mockClear();
            const client2 = initSupabase();
            
            expect(createClient).not.toHaveBeenCalled();
            expect(client1).toBe(client2);
        });
    });

    describe('initializeApp', () => {
        test('creates and appends status element', async () => {
            const appendChildSpy = jest.spyOn(appDiv, 'appendChild');
            mockSupabaseClient.limit.mockResolvedValueOnce(createSuccessResponse([{ id: 1 }]));

            await initializeApp();

            expect(document.createElement).toHaveBeenCalledWith('div');
            expect(appendChildSpy).toHaveBeenCalledWith(mockStatusElement);
            expect(mockStatusElement.className).toBe('connection-status success');
            expect(mockStatusElement.textContent).toBe('Connected to Supabase');
        });

        test('handles missing app element gracefully', async () => {
            document.body.innerHTML = '';
            await initializeApp();
            expect(document.createElement).not.toHaveBeenCalled();
        });

        test('sets error status on initialization failure', async () => {
            const error = new Error('Init failed');
            createClient.mockImplementationOnce(() => {
                throw error;
            });

            await initializeApp();

            expect(mockStatusElement.textContent).toBe('Error initializing Supabase: Init failed');
            expect(mockStatusElement.className).toBe('connection-status error');
        });

        test('sets initial connecting status', async () => {
            // Create a new mock element for this test
            const statusElement = createMockStatusElement();
            mockDocumentMethods(statusElement);

            // Mock successful connection
            mockSupabaseClient.limit.mockResolvedValueOnce(createSuccessResponse([{ id: 1 }]));
            
            // Start initialization
            const promise = initializeApp();
            
            // Check initial status
            expect(statusElement.textContent).toBe('Connecting to Supabase...');
            
            // Wait for initialization to complete
            await promise;
        });

        test('handles network errors gracefully', async () => {
            const networkError = new Error('Network error');
            mockSupabaseClient.limit.mockRejectedValueOnce(networkError);

            await initializeApp();

            expect(mockStatusElement.textContent).toBe('Error connecting to Supabase: Network error');
            expect(mockStatusElement.className).toBe('connection-status error');
            expect(console.error).toHaveBeenCalledWith('Connection error:', networkError);
        });

        test('maintains error state after failed initialization', async () => {
            const error = new Error('Init failed');
            createClient.mockImplementationOnce(() => {
                throw error;
            });

            await initializeApp();
            
            // Try initializing again
            await initializeApp();

            expect(mockStatusElement.textContent).toBe('Error initializing Supabase: Init failed');
            expect(mockStatusElement.className).toBe('connection-status error');
        });
    });

    describe('checkSupabaseConnection', () => {
        beforeEach(async () => {
            resetSupabaseClient();
            mockSupabaseClient = createMockSupabaseClient();
            createClient.mockReturnValue(mockSupabaseClient);
        });

        test('shows success status on successful connection', async () => {
            initSupabase();
            mockSupabaseClient.limit.mockResolvedValueOnce(createSuccessResponse([{ id: 1 }]));

            await checkSupabaseConnection();

            expect(mockSupabaseClient.from).toHaveBeenCalledWith('articles');
            expect(mockStatusElement.textContent).toBe('Connected to Supabase');
            expect(mockStatusElement.className).toBe('connection-status success');
        });

        test('shows error status on connection failure', async () => {
            initSupabase();
            mockSupabaseClient.limit.mockRejectedValueOnce(new Error('Connection failed'));

            await checkSupabaseConnection();

            expect(mockStatusElement.textContent).toBe('Error connecting to Supabase: Connection failed');
            expect(mockStatusElement.className).toBe('connection-status error');
        });

        test('handles Supabase query error', async () => {
            initSupabase();
            mockSupabaseClient.limit.mockResolvedValueOnce(createErrorResponse('Query failed'));

            await checkSupabaseConnection();

            expect(mockStatusElement.textContent).toBe('Error connecting to Supabase: Query failed');
            expect(mockStatusElement.className).toBe('connection-status error');
        });

        test('handles missing status element', async () => {
            document.querySelector.mockReturnValueOnce(null);
            await checkSupabaseConnection();
            expect(mockSupabaseClient.from).not.toHaveBeenCalled();
        });

        test('handles missing Supabase client', async () => {
            await checkSupabaseConnection();
            
            expect(mockStatusElement.textContent).toBe('Error: Supabase client not initialized');
            expect(mockStatusElement.className).toBe('connection-status error');
        });
    });
});
