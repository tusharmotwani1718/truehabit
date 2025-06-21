import nodemailer from 'nodemailer';
import envconf from '../conf/envconfig.js';

const sendEmail = async (content, receiverMail) => {
  try {
    // console.log(envconf.professionalMail, envconf.mailPassword);
    // console.log("Sending email to:", receiverMail);

    const transporter = nodemailer.createTransport({
      host: 'smtpout.secureserver.net', // GoDaddy SMTP
      port: 465, // SSL port
      secure: true, // true for port 465
      auth: {
        user: envconf.professionalMail,
        pass: envconf.mailPassword, // no app password needed for Workspace Email
      },
      tls: {
        rejectUnauthorized: false
      },
      logger: true,
      debug: true
    });

    await transporter.sendMail({
      from: `"trueHabit 👋" <${envconf.professionalMail}>`,
      to: receiverMail,
      subject: 'Verify Your Email',
      html: content
    });

    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
};

export default sendEmail;
