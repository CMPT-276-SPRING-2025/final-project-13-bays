const { sendWeeklyEmails } = require('../utils/weeklyEmailJob');
const { sendEmail } = require('../services/sendGridService');
const admin = require('firebase-admin');

describe('sendWeeklyEmails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send weekly emails successfully', async () => {
    admin.firestore().collection().get.mockResolvedValueOnce({
      docs: [
        { id: 'user1', data: () => ({ userMail: 'test@example.com', userName: 'Test User' }) },
      ],
    });

    admin.firestore().collection().where().get.mockResolvedValueOnce({
      docs: [
        { data: () => ({ name: 'Project 1', completionDate: '2025-04-01' }) },
      ],
    });

    await sendWeeklyEmails();

    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(sendEmail).toHaveBeenCalledWith(
      'test@example.com',
      'Weekly Congratulations: Completed Projects',
      expect.any(String),
      expect.stringContaining('<li>Project 1 - Completed on: 2025-04-01</li>')
    );
  });

  it('should handle no users gracefully', async () => {
    admin.firestore().collection().get.mockResolvedValueOnce({ docs: [] });

    await sendWeeklyEmails();

    expect(sendEmail).not.toHaveBeenCalled();
  });
});