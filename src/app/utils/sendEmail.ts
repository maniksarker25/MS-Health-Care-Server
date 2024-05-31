import nodemailer from "nodemailer";
import config from "../config";
export const sendEmail = async (to: string, html: string) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: config.env === "production",
    auth: {
      //   TODO: replace `user` and `pass` values from <https://forwardemail.net>
      user: config.emailSender.email,
      pass: config.emailSender.app_password,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
  await transporter.sendMail({
    from: "devsmanik@gmail.com", // sender address
    to, // list of receivers
    subject: "Reset your password within 10 mins!", // Subject line
    text: "", // plain text body
    html, // html body
  });
};
