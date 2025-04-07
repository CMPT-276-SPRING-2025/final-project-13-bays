const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Function to send an email via SendGrid
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Plain text content
 * @param {string} html - HTML content (optional)
 */
const sendEmail = async (to, subject, text, html = null) => {
  const msg = {
    to,
    from: 'tabmarkservices@gmail.com', // Verified sender email on SendGrid
    subject,
    text,
    ...(html && { html }), // Include HTML content if provided
  };

  try {
    await sgMail.send(msg);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error.response ? error.response.body : error);
    throw error;
  }
};

module.exports = { sendEmail };