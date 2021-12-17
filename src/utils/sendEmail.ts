import nodemailer from "nodemailer";
// https://velog.io/@jiwon/-Nodemailer%EB%A1%9C-%EC%9D%B8%EC%A6%9D-%EA%B4%80%EB%A0%A8-%EC%9D%B4%EB%A9%94%EC%9D%BC-%EB%B3%B4%EB%82%B4%EA%B8%B0-d4k4pqoot4

export async function sendEmail({ to, html }: { to: string; html: string }) {
  let mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: "ranchat Email 인증을 위한 Email",
    text: html,
  };

  let transporter = nodemailer.createTransport({
    service: "naver",
    host: "smtp.naver.com",
    port: 587,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) return console.log(error);
    console.log(info);
  });
}
