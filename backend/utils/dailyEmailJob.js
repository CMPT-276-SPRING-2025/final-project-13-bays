const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const cron = require('node-cron');
const { sendEmail } = require('../services/sendGridService');

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      type: process.env.FIREBASE_TYPE,
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI,
      token_uri: process.env.FIREBASE_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    }),
  });
}

const db = getFirestore();

/**
 * Fetches users and their "Urgent" projects, and sends daily emails.
 */
const sendDailyEmails = async () => {
  try {
    // Fetch all user documents from the "projects" collection
    const usersSnapshot = await db.collection('projects').get();

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const userEmail = userData.userMail;
      const userName = userData.userName;

      if (!userEmail) continue; // Skip if no email is found

      // Fetch "Urgent" projects for the user
      const projectsRef = db.collection(`projects/${userDoc.id}/userProjects`);
      const urgentProjectsSnapshot = await projectsRef.where('category', '==', 'Urgent').get();

      if (urgentProjectsSnapshot.empty) continue; // Skip if no "Urgent" projects

      // Prepare email content
      const projectList = urgentProjectsSnapshot.docs
        .map((doc) => `<li>${doc.data().name} - Due: ${doc.data().dueDate}</li>`)
        .join('');
      const emailHtml = `
        <h1>Daily Reminder: Urgent Projects</h1>
        <p>Hi ${userName},</p>
        <p>Here are your upcoming urgent projects:</p>
        <ul>${projectList}</ul>
        <p>Stay on track and complete them on time!</p>
      `;

      // Send email
      await sendEmail(
        userEmail,
        'Daily Reminder: Urgent Projects',
        'You have urgent projects to complete. Check your email for details.',
        emailHtml
      );
    }

    console.log('Daily emails sent successfully.');
  } catch (error) {
    console.error('Error sending daily emails:', error);
  }
};

// Schedule the job to run daily at 8:00 AM
cron.schedule('0 8 * * *', sendDailyEmails, {
  timezone: 'America/Los_Angeles', // Adjust timezone as needed
});

module.exports = { sendDailyEmails };