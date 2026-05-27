const transporter = require("../app/config/emailVerify");


const sendMail=async(to, subject, html)=>{
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html
  });
}

module.exports = { sendMail };