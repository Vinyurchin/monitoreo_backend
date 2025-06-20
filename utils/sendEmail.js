const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.ALERT_EMAIL,
    pass: process.env.ALERT_PASS,
  },
});

async function sendAlert(subject, text) {
  try {
    await transporter.sendMail({
      from: `"Monitor" <${process.env.ALERT_EMAIL}>`,
      to: process.env.ALERT_EMAIL,
      subject,
      text,
    });
    console.log('📨 Alerta enviada');
  } catch (err) {
    console.error('❌ Error al enviar correo:', err);
  }
}

module.exports = sendAlert;
