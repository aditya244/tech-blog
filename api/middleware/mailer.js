
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtpout.secureserver.net',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false, // Ensure SSL certificate validation
      servername: 'smtpout.secureserver.net'
    },
    connectionTimeout: 20000,
    socketTimeout: 20000
  });
  

module.exports = transporter;
