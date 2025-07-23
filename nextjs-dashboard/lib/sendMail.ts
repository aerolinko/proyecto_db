import nodemailer from 'nodemailer';

export async function sendMail({ to, subject, text, html }: { to: string, subject: string, text?: string, html?: string }) {
  // Configura aquí tu usuario y contraseña de Gmail o SMTP
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to,
    subject,
    text,
    html,
  };

  return transporter.sendMail(mailOptions);
}
