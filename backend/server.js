require('dotenv').config();
const express = require('express');
const { sendDailyEmails } = require('./utils/dailyEmailJob'); // Import the daily email job
const { sendWeeklyEmails } = require('./utils/weeklyEmailJob'); // Import the weekly email job

// Initialize Firebase Admin SDK
const admin = require('firebase-admin');

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

const app = express();
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the backend server!');
});

// Routes
const emailRoutes = require('./routes/emailRoutes');
app.use('/email', emailRoutes);

// Start the daily and weekly email jobs
sendDailyEmails(); // Ensure the daily job starts when the server runs
sendWeeklyEmails(); // Ensure the weekly job starts when the server runs

// Server port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});