const { sendWeeklyEmails } = require('../utils/weeklyEmailJob');
const { sendEmail } = require('../services/sendGridService');
const admin = require('firebase-admin');

// Mock Firebase Admin SDK
jest.mock('firebase-admin', () => {
  const firestoreMock = {
    collection: jest.fn().mockReturnThis(),
    get: jest.fn(),
    where: jest.fn().mockReturnThis(),
  };
  return {
    initializeApp: jest.fn(),
    credential: { cert: jest.fn() },
    firestore: jest.fn(() => firestoreMock),
    apps: [{}], // Mock the apps array
  };
});

// Mock SendGrid Service
jest.mock('../services/sendGridService', () => ({
  sendEmail: jest.fn(),
}));

describe('sendWeeklyEmails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send weekly emails successfully', async () => {
    const mockUsers = [
      { id: 'user1', data: () => ({ userMail: 'test1@example.com', userName: 'User1' }) },
    ];
    const mockProjects = [
      { id: 'project1', data: () => ({ name: 'Project1', completionDate: '2025-04-05' }) },
    ];

    admin.firestore().collection().get.mockResolvedValueOnce({ docs: mockUsers });
    admin.firestore().collection().where().get.mockResolvedValueOnce({ docs: mockProjects });

    await sendWeeklyEmails();

    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(sendEmail).toHaveBeenCalledWith(
      'test1@example.com',
      'Weekly Congratulations: Completed Projects',
      expect.any(String),
      expect.stringContaining('<li>Project1 - Completed on: 2025-04-05</li>')
    );
  });

  it('should handle no users gracefully', async () => {
    admin.firestore().collection().get.mockResolvedValueOnce({ docs: [] });

    await sendWeeklyEmails();

    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('should handle errors gracefully', async () => {
    admin.firestore().collection().get.mockRejectedValueOnce(new Error('Firestore Error'));

    await expect(sendWeeklyEmails()).rejects.toThrow('Firestore Error');
  });
});