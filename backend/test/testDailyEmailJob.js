require('dotenv').config();
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account-key.json.json'); // Ensure the path is correct

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const { sendDailyEmails } = require('./utils/dailyEmailJob');

(async () => {
  try {
    console.log('Starting daily email job test...');
    await sendDailyEmails();
    console.log('Daily email job test completed successfully.');
  } catch (error) {
    console.error('Error during daily email job test:', error);
  }
})();