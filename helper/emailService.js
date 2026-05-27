const transporter = require("../app/config/emailVerify");

const sendVerificationEmail=async(user,token)=>{
  
  const link = `${process.env.BASE_URL}/api/auth/verify/${token}`;
    await transporter.sendMail({
        from:process.env.EMAIL_FROM,
        to:user.email,
        subject: "OTP - Verify You Account",
        html:`<p>Dear ${user.name},</p><p>Thank you for signing up with our website. To complete you registration,</p>
        <p>Click <a href="${link}">here</a> to verify your email.</p>`
        
    })
} 
    
    
module.exports=sendVerificationEmail



