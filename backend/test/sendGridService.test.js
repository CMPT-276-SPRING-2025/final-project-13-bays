const request = require('supertest')
const app = require('../server');
const { sendEmail } = require('../services/sendGridService');

jest.mock('@sendgrid/mail', () => ({
    setApiKey: jest.fn(),
    send: jest.fn(),
}));

describe('GET /test-email', () => {
    // Success
    it('should send an email and return success', async () => {
        // Mock the sendEmail function to resolve successfully
        sendEmail.mockResolvedValueOnce();

        // Make a resquest to the /test-email route
        const res = await request(app).get('/test-email');
        
        // Assertions
        expect(res.statusCode).toEqual(200);
        expect(res.text).toBe('Emails sent successfully!')
    });

    // Error
    it('should handle errors when sending an email', async () => {
        // Mock the sendEmail function to reject with an error
        sendEmail.mockRejectedValueOnce(new Error('SendGrid Error'));
    
        // Make a request to the /test-email route
        const res = await request(app).get('/test-email');
    
        // Assertions
        expect(res.statusCode).toEqual(500);
        expect(res.text).toBe('Failed to send emails');
    });
})