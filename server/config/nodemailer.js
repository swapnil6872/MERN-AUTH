import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: process.env.PORT,
  secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export default transporter;