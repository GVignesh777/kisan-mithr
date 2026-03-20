// templates/otpTemplate.js

function otpTemplate(otp) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <style>
      body {
        font-family: "Poppins", sans-serif;
        background-color: #f4f6f8;
        margin: 0;
        padding: 0;
      }
      .container {
        background-color: #ffffff;
        max-width: 500px;
        margin: 40px auto;
        border-radius: 10px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        overflow: hidden;
      }
      .header {
        background-color: #25D366;
        color: white;
        text-align: center;
        padding: 15px 0;
        font-size: 22px;
        font-weight: 600;
      }
      .body {
        padding: 25px;
        text-align: center;
      }
      .otp {
        font-size: 32px;
        color: #128C7E;
        font-weight: bold;
        letter-spacing: 5px;
        margin: 20px 0;
      }
      .footer {
        font-size: 13px;
        color: #777;
        text-align: center;
        padding: 10px;
        border-top: 1px solid #eee;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">Kisan Mithr OTP Verification</div>
      <div class="body">
        <p>Hi <b>User</b>,</p>
        <p>Your OTP for login verification is:</p>
        <div class="otp">${otp}</div>
        <p>This OTP is valid for 10 minutes. Please do not share it with anyone.</p>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} Kisan Mithr — Secure Login System
      </div>
    </div>
  </body>
  </html>
  `;
}

module.exports = otpTemplate;
