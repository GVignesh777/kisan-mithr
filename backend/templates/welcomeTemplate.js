const welcomeTemplate = (username) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Kisan Mithr</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4fdf8; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; padding: 0; border-radius: 12px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); overflow: hidden; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px 20px; text-align: center; color: white; }
            .header h1 { margin: 0; font-size: 28px; letter-spacing: 1px; }
            .content { padding: 40px 30px; color: #374151; line-height: 1.6; }
            .content h2 { color: #065f46; margin-top: 0; }
            .button-wrapper { text-align: center; margin: 30px 0; }
            .btn { display: inline-block; background-color: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; transition: background-color 0.3s; }
            .features { background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 25px 0; }
            .features ul { padding-left: 20px; margin: 0; color: #047857; }
            .features li { margin-bottom: 10px; }
            .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 14px; color: #6b7280; border-top: 1px solid #e5e7eb; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Kisan Mithr 🌱</h1>
            </div>
            <div class="content">
                <h2>Welcome aboard, ${username}!</h2>
                <p>We are absolutely thrilled to have you join <strong>Kisan Mithr</strong>. You've just taken the first step towards smarter, more profitable, and data-driven farming.</p>
                
                <div class="features">
                    <p><strong>Here is what you can do right now:</strong></p>
                    <ul>
                        <li>View Live Market Prices for crops across the country.</li>
                        <li>Talk to our dedicated AI Assistant for crop health algorithms.</li>
                        <li>Monitor Satellite Weather explicitly tuned for your plots.</li>
                    </ul>
                </div>
                
                <p>Please enter your OTP on the verification screen to finalize your account and step into the Dashboard!</p>
                
                <div class="button-wrapper">
                    <a href="https://kisan-mithr.vercel.app/" class="btn">Explore Kisan Mithr</a>
                </div>
                
                <p>If you have any questions, our support team is always here for you.</p>
                <p>Happy Farming,<br><strong>The Kisan Mithr Team</strong></p>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Kisan Mithr. All rights reserved.</p>
                <p>This is an automated message, please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = welcomeTemplate;
