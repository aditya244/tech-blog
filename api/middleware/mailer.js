
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtpout.secureserver.net',
    port: 465,
    secure: true,
    auth: {
      user: 'info@debugtek.com',
      pass: 'Aditya@2024dummy',
    },
  });
  

module.exports = transporter;
