import { expect } from 'chai';
import sinon from 'sinon';
import { JSDOM } from 'jsdom';
import { initSupabase, checkSupabaseConnection } from '../../js/popup.js';

describe('Supabase Connection Status Tests', () => {
    let statusElement;
    let mockClient;
    let createClientStub;

    beforeEach(() => {
        // Get the status element from the DOM (setup in setup.js)
        statusElement = document.querySelector('.connection-status');
        
        // Create a mock Supabase client
        mockClient = {
            from: sinon.stub().returnsThis(),
            select: sinon.stub().returnsThis(),
            limit: sinon.stub()
        };
        
        // Create a stub for createClient
        createClientStub = sinon.stub().returns(mockClient);
        global.createClient = createClientStub;
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('Connection Status Updates', () => {
        it('should update status to success on successful connection', async () => {
            mockClient.limit.resolves({ data: [{ id: 1 }], error: null });
            
            await checkSupabaseConnection();

            expect(statusElement.textContent).to.equal('Connected to Supabase');
            expect(statusElement.className).to.equal('connection-status success');
        });

        it('should update status to error on connection failure', async () => {
            mockClient.limit.rejects(new Error('Connection failed'));
            
            await checkSupabaseConnection();

            expect(statusElement.textContent).to.equal('Error connecting to Supabase: Connection failed');
            expect(statusElement.className).to.equal('connection-status error');
        });

        it('should handle Supabase query errors', async () => {
            mockClient.limit.resolves({ data: null, error: { message: 'Query failed' } });
            
            await checkSupabaseConnection();

            expect(statusElement.textContent).to.equal('Error connecting to Supabase: Query failed');
            expect(statusElement.className).to.equal('connection-status error');
        });

        it('should handle missing Supabase client', async () => {
            // Reset the Supabase client
            global.supabaseClient = null;
            
            await checkSupabaseConnection();

            expect(statusElement.textContent).to.equal('Error: Supabase client not initialized');
            expect(statusElement.className).to.equal('connection-status error');
        });
    });

    describe('Supabase Initialization', () => {
        it('should throw error when config is missing', () => {
            const originalConfig = window.SUPABASE_CONFIG;
            delete window.SUPABASE_CONFIG;

            expect(() => initSupabase()).to.throw('Supabase configuration not found');

            window.SUPABASE_CONFIG = originalConfig;
        });

        it('should initialize client with correct config', () => {
            const client = initSupabase();

            expect(createClientStub.calledWith(
                'https://test.supabase.co',
                'test-key'
            )).to.be.true;
            expect(client).to.equal(mockClient);
        });

        it('should reuse existing client on subsequent calls', () => {
            const client1 = initSupabase();
            createClientStub.reset();
            const client2 = initSupabase();

            expect(createClientStub.called).to.be.false;
            expect(client1).to.equal(client2);
        });
    });
});
