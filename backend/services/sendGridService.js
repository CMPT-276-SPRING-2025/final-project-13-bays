// const sgMail = require('@sendgrid/mail');
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);  // Use environment variable for API key

// /**
//  * Function to send an email via SendGrid
//  * @param {string} to - Recipient email address
//  * @param {string} subject - Email subject
//  * @param {string} text - Email body content
//  */
// const sendEmail = async (to, subject, text) => {
//   const msg = {
//     to: to, // Email from OAuth
//     from: 'support@tabmark.com', // Verified sender email on SendGrid
//     subject: subject,
//     text: text, // Body of the email
//   };

//   try {
//     await sgMail.send(msg);
//     console.log('Email sent successfully');
//   } catch (error) {
//     console.error('Error sending email:', error);
//   }
// };

// module.exports = { sendEmail };
