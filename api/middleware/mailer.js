
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false, // Ensure SSL certificate validation
      servername: process.env.EMAIL_HOST
    },
    connectionTimeout: 60000,
    socketTimeout: 60000
  });
  

module.exports = transporter;
