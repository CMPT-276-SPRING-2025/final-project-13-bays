module.exports = {
    initializeApp: jest.fn(),
    credential: {
      cert: jest.fn(),
    },
    firestore: jest.fn(() => ({
      collection: jest.fn(() => ({
        get: jest.fn().mockResolvedValue({ docs: [] }),
        where: jest.fn(() => ({
          get: jest.fn().mockResolvedValue({ docs: [] }),
        })),
      })),
    })),
    apps: [{}], // Simulate an initialized Firebase app
  };