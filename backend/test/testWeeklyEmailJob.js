require('dotenv').config();
const admin = require('firebase-admin');
const serviceAccount = require('../firebase-service-account-key.json'); // Ensure the path is correct

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const { sendWeeklyEmails } = require('../utils/weeklyEmailJob');

(async () => {
  try {
    console.log('Starting weekly email job test...');
    await sendWeeklyEmails();
    console.log('Weekly email job test completed successfully.');
  } catch (error) {
    console.error('Error during weekly email job test:', error);
  }
})();