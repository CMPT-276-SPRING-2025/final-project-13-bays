const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
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

const sendWeeklyEmails = async () => {
  try {
    const usersSnapshot = await db.collection('projects').get();

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const userEmail = userData.userMail;
      const userName = userData.userName;

      if (!userEmail) continue;

      const projectsRef = db.collection(`projects/${userDoc.id}/userProjects`);
      const completedProjectsSnapshot = await projectsRef.where('systemCategory', '==', 'Completed').get();

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const recentCompletedProjects = completedProjectsSnapshot.docs
        .map((doc) => doc.data())
        .filter((project) => {
          if (!project.completionDate) return false;

          const completionDate = new Date(project.completionDate);
          return completionDate >= oneWeekAgo && completionDate <= new Date();
        });

      if (recentCompletedProjects.length === 0) continue;

      const projectList = recentCompletedProjects
        .map((project) => `<li>${project.name} - Completed on: ${project.completionDate}</li>`)
        .join('');
      const emailHtml = `
        <h1>Congratulations on Completing Your Projects!</h1>
        <p>Hi ${userName},</p>
        <p>Here are the projects you completed this week:</p>
        <ul>${projectList}</ul>
        <p>Keep up the great work!</p>
      `;

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

module.exports = { sendWeeklyEmails };