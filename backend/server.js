require('dotenv').config();  // loads in the env variables from .env
const express = require('express');
// const cors = require('cors');
// const session = require('express-session');
const { sendEmail } = require('./services/sendGridService')
const emailRoutes = require('./routes/emailRoutes');  // routes for SendGrid API

const app = express();


// // middleware used
// app.use(cors());  // enable cross-origin requests ~ allows react to make reqs to our backend here
app.use(express.json());  // parses request data ~ allows backend to handle JSON and form submissions
// app.use(express.urlencoded({ extended: true }));  // parsing URL-encoded data
// app.use(session({ secret: 'your-secret-key', resave: false, saveUninitialized: true }));  // Session management for user data

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the backend server!');
});


// // Email routes
app.use('/email', emailRoutes);  // routes for sending emails via SendGrid

// Test route to send emails
app.get('/test-email', async (req, res) => {
  try {
    const to = 'saadausmani123@gmail.com';
    const subject = 'Sendgriddy Email';
    const text = 'This is a test email sent to sendgridders.';
    await sendEmail(to, subject, text);
    res.send('Emails sent successfully!');
  } catch (error) {
    console.error('Error sending emails:', error.response ? error.response.body : error);
    res.status(500).send('Failed to send emails');
  }
});

// server port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});