const express = require('express');
const { sendEmail } = require('../services/sendGridService');

const router = express.Router();

// Route to send an email
router.post('/send', async (req, res) => {
    const { subject, text } = req.body;

    // Hardcoded recipient email for testing
    const to = 'trihodac66@gmail.com';

    if (!subject || !text) {
        return res.status(400).json({ error: 'Missing required fields: to, subject, text'});
    }

    try {
        await sendEmail(to, subject, text);
        res.status(200).json({ message: 'Email sent successfully '});
    } 
    catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send email'});
    }
});

module.exports = router;