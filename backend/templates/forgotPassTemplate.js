function forgotPassword(resetURL) {
    return `
    <!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <title>Password Reset Request</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style type="text/css">
        /* Base Resets */
        body,
        table,
        td,
        a {
            -ms-text-size-adjust: 100%;
            /* Prevent Windows zooming */
            -webkit-text-size-adjust: 100%;
            /* Prevent iOS zooming */
        }

        body {
            background-color: #f4f5f7;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
        }

        /* Container Styles */
        .email-wrapper {
            width: 100%;
            background-color: #f4f5f7;
            padding: 40px 0;
        }

        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        }

        /* Header Styles */
        .header {
            background-color: #4fc970;
            color: #ffffff;
            text-align: center;
            padding: 30px 20px;
        }

        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
            letter-spacing: 0.5px;
        }

        /* Body Styles */
        .body-content {
            padding: 40px 30px;
            color: #333333;
            line-height: 1.6;
        }

        .body-content p {
            margin: 0 0 20px 0;
            font-size: 16px;
        }

        /* Button Styles */
        .btn-wrapper {
            text-align: center;
            margin: 35px 0;
        }

        .btn {
            background-color: #4fc970;
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 30px;
            border-radius: 5px;
            font-size: 16px;
            font-weight: bold;
            display: inline-block;
            transition: background-color 0.3s ease;
        }

        .btn:hover {
            background-color: #45ac61;
        }

        /* Fallback Link Styles */
        .fallback {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
            margin-top: 30px;
        }

        .fallback p {
            margin: 0 0 10px 0;
            font-size: 14px;
            color: #555555;
        }

        .fallback-link {
            font-size: 14px;
            color: #4A90E2;
            word-break: break-all;
        }

        /* Footer Styles */
        .footer {
            background-color: #ffffff;
            border-top: 1px solid #eeeeee;
            color: #888888;
            text-align: center;
            padding: 20px;
            font-size: 13px;
        }

        /* Mobile Responsiveness */
        @media screen and (max-width: 600px) {
            .email-wrapper {
                padding: 20px 10px;
            }

            .email-container {
                width: 100% !important;
            }

            .body-content {
                padding: 30px 20px;
            }
        }
    </style>
</head>

<body>

    <!-- <div style="display: none; max-height: 0px; overflow: hidden;">
    Reset your password for [Your Company Name].
  </div> -->

    <div class="email-wrapper">
        <table class="email-container" border="0" cellpadding="0" cellspacing="0" width="100%">

            <tr>
                <td class="header">
                    <h1>Kisan Mithr</h1>
                </td>
            </tr>

            <tr>
                <td class="body-content">
                    <p>Hi <strong>{username}</strong>,</p>
                    <p>We received a request to reset the password for your account associated with this email address.
                        If you made this request, please click the button below to set up a new password:</p>

                    <div class="btn-wrapper">
                        <a href="${resetURL}" class="btn">Reset Password</a>
                    </div>

                    <p>For security reasons, this link will expire in <strong>15 minutes</strong>.</p>
                    <p>If you did not request a password reset, you can safely ignore this email. Your account remains
                        secure and your current password has not been changed.</p>

                    <div class="fallback">
                        <p>If the button above doesn't work, copy and paste the following link into your browser:</p>
                        <a href="${resetURL}" class="fallback-link">${resetURL}</a>
                    </div>
                </td>
            </tr>

            <tr>
                <td class="footer">
                    <p>&copy; 2026 Kisan Mithr. All rights reserved.</p>
                    <p>123 Company Address, City, State, Zip</p>
                </td>
            </tr>

        </table>
    </div>

</body>

</html>
    `;
}



module.exports = forgotPassword;