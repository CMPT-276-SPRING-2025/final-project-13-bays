require('dotenv').config();
const express = require('express');
const { sendDailyEmails } = require('./utils/dailyEmailJob'); // Import the daily email job
const { sendWeeklyEmails } = require('./utils/weeklyEmailJob'); // Import the weekly email job

// Initialize Firebase Admin SDK
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account-key.json'); // Replace with your service account key path

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
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