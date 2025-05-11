const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  //   secure: false, // true for port 465, false for other ports
  auth: {
    user: process.env.EMAIL_SERVICE_USER ,
    pass: process.env.EMAIL_SERVICE_PASSWORD,
  },
});

const sendMail = async ({ emails, subejct, html }) => {
  try {
    const info = await transporter.sendMail({
      from: '"Admin@App" <jay@gmail.com>', // sender address
      to: emails, // list of receivers
      subject: subejct, // Subject line
      html: html, // html body
      // text: "Hello world?", // plain text body only one of the plain text or html can be send at a time
    });
  } catch (err) {
    console.log("----------------");
    console.log("Could not send email to ", emails);
    console.log(err.message);
    throw err ;
  }
};

const sendOtpMail = async ({ otp, email }) => {
  await sendMail({
    subject: "Otp verification @ Admin App",
    emails: [email]  ,
    html: `
        <html>
           <body>
              <div style="text-align: center; padding: 20px;">
                <div style="padding:2rem">
                  <h2> OTP Verification</h2>
                  <p> Your otp for verification is ${otp}</p>
                </div>
              </div>
            </body>
        </html>
        `,
  });
};

module.exports = {
    sendOtpMail,
    sendMail, 
}