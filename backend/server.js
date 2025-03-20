// require('dotenv').config();  // loads in the env variables from .env
const express = require('express');
// const cors = require('cors');
// const session = require('express-session');
// const authRoutes = require('./routes/authRoutes');  // routes for OAuth API ~ have to find out if differing routes for different services
// const emailRoutes = require('./routes/emailRoutes');  // routes for SendGrid API

const app = express();

app.get('/', (req, res) => {
    res.send('Hello from the Express backend!');
  });

// middleware used
// app.use(cors());  // enable cross-origin requests ~ allows react to make reqs to our backend here
// app.use(express.json());  // parses request data ~ allows backend to handle JSON and form submissions
// app.use(express.urlencoded({ extended: true }));  // parsing URL-encoded data
// app.use(session({ secret: 'your-secret-key', resave: false, saveUninitialized: true }));  // Session management for user data

// // routes
// app.use('/auth', authRoutes);  // OAuth routes (Google, GitHub, GoSFU(?))
// app.use('/email', emailRoutes);  // routes for sending emails via SendGrid

// server port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on DOOP ${PORT}`);
});
