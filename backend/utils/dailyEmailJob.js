const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const cron = require('node-cron');
const { sendEmail } = require('../services/sendGridService');

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  const serviceAccount = require('../firebase-service-account-key.json'); // Ensure the path is correct
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
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