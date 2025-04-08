const sgMail = require('@sendgrid/mail');
const { sendEmail } = require('../services/sendGridService');

jest.mock('@sendgrid/mail');

describe('sendEmail', () => {
    const mockEmailData = {
        to: 'test@example.com',
        subject: 'Test Subject',
        text: 'Test plain text content',
        html: '<p>Test HTML content</p>',
    };

    beforeEach(() => {
        sgMail.send.mockClear();
        jest.spyOn(console, 'error').mockImplementation(() => {}); // Mock console.error
    });

    afterEach(() => {
        jest.restoreAllMocks(); // Restore original console.error after each test
    });

    it('should send an email successfully with plain text content', async () => {
        sgMail.send.mockResolvedValueOnce();

        await expect(
            sendEmail(mockEmailData.to, mockEmailData.subject, mockEmailData.text)
        ).resolves.not.toThrow();

        expect(sgMail.send).toHaveBeenCalledWith({
            to: mockEmailData.to,
            from: 'tabmarkservices@gmail.com',
            subject: mockEmailData.subject,
            text: mockEmailData.text,
        });
    });

    it('should send an email successfully with HTML content', async () => {
        sgMail.send.mockResolvedValueOnce();

        await expect(
            sendEmail(mockEmailData.to, mockEmailData.subject, mockEmailData.text, mockEmailData.html)
        ).resolves.not.toThrow();

        expect(sgMail.send).toHaveBeenCalledWith({
            to: mockEmailData.to,
            from: 'tabmarkservices@gmail.com',
            subject: mockEmailData.subject,
            text: mockEmailData.text,
            html: mockEmailData.html,
        });
    });

    it('should throw an error if sending email fails', async () => {
        const mockError = new Error('SendGrid error');
        sgMail.send.mockRejectedValueOnce(mockError);

        await expect(
            sendEmail(mockEmailData.to, mockEmailData.subject, mockEmailData.text)
        ).rejects.toThrow('SendGrid error');

        expect(sgMail.send).toHaveBeenCalledWith({
            to: mockEmailData.to,
            from: 'tabmarkservices@gmail.com',
            subject: mockEmailData.subject,
            text: mockEmailData.text,
        });
    });
});