import nodemailer from 'nodemailer';
import envconf from '../conf/envconfig.js';

const sendEmail = async (content, receiverMail) => {
  try {

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: "tusharmotwani89@gmail.com",     
        pass: "hfml ayre eqzp xknw",
      },
      secure: true,
      logger: true,
      debug: true,
      tls: {
        rejectUnauthorized: false
      }
    });

    await transporter.sendMail({
      from: `"trueHabit 👋" <${envconf.gmailAddress}>`,
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
