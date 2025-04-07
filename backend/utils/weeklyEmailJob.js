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
 * Fetches users and their "Archived" projects completed within the last week, and sends weekly emails.
 */
const sendWeeklyEmails = async () => {
  try {
    // Fetch all user documents from the "projects" collection
    const usersSnapshot = await db.collection('projects').get();

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const userEmail = userData.userMail;
      const userName = userData.userName;

      if (!userEmail) continue; // Skip if no email is found

      // Fetch "Archived" projects completed within the last week
      const projectsRef = db.collection(`projects/${userDoc.id}/userProjects`);
      const archivedProjectsSnapshot = await projectsRef
        .where('systemCategory', '==', 'Archived')
        .get();

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const recentArchivedProjects = archivedProjectsSnapshot.docs
        .map((doc) => doc.data())
        .filter((project) => {
          const completionDate = new Date(project.completionDate); // Use completionDate instead of dueDate
          return completionDate >= oneWeekAgo && completionDate <= new Date();
        });

      if (recentArchivedProjects.length === 0) continue; // Skip if no recent archived projects

      // Prepare email content
      const projectList = recentArchivedProjects
        .map((project) => `<li>${project.name} - Completed on: ${project.completionDate}</li>`)
        .join('');
      const emailHtml = `
        <h1>Congratulations on Completing Your Projects!</h1>
        <p>Hi ${userName},</p>
        <p>Here are the projects you completed this week:</p>
        <ul>${projectList}</ul>
        <p>Keep up the great work!</p>
      `;

      // Send email
      await sendEmail(
        userEmail,
        'Weekly Congratulations: Completed Projects',
        'Congratulations on completing your projects this week!',
        emailHtml
      );
    }

    console.log('Weekly emails sent successfully.');
  } catch (error) {
    console.error('Error sending weekly emails:', error);
  }
};

// Schedule the job to run every Monday at 8:00 AM
cron.schedule('0 8 * * 1', sendWeeklyEmails, {
  timezone: 'America/Los_Angeles', // Adjust timezone as needed
});

module.exports = { sendWeeklyEmails };