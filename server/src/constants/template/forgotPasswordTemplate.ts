export const forgotPasswordTemplate = (passwordResetLink: string) =>
    `<!doctype html>
    <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0" />
            <title>Password Reset</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                }
                .email-container {
                    background-color: #ffffff;
                    padding: 40px;
                    border-radius: 10px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    max-width: 600px;
                    width: 100%;
                    text-align: center;
                }
                .company-header {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 30px;
                }
                .company-logo {
                    height: 50px;
                    margin-right: 15px;
                }
                .company-name {
                    font-size: 28px;
                    font-weight: bold;
                    color: #333333;
                }
                .email-header {
                    font-size: 24px;
                    margin-bottom: 20px;
                }
                .email-body {
                    font-size: 16px;
                    line-height: 1.6;
                    margin-bottom: 30px;
                }
                .reset-link {
                    display: inline-block;
                    padding: 12px 24px;
                    font-size: 16px;
                    color: #ffffff;
                    background-color: #007bff;
                    text-decoration: none;
                    border-radius: 5px;
                }
                .reset-link:hover {
                    background-color: #0056b3;
                }
                .footer {
                    font-size: 12px;
                    color: #666666;
                    margin-top: 30px;
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="company-header">
                    <img
                        src="https://my-projects-images.s3.ap-south-1.amazonaws.com/worknest/logo-transparent.png"
                        alt="Company Logo"
                        class="company-logo"
                        loading="lazy" />
                    <div class="company-name">Work Nest</div>
                </div>
                <div class="email-header">Password Reset Request</div>
                <div class="email-body">
                    <p>We received a request to reset your password.</p>
                    <p>If you requested this password reset, click the button below:</p>
                    <a
                        href=${passwordResetLink}
                        class="reset-link"
                        >Reset Password</a
                    >
                    <p>This link will expire in 15 minutes. If you didn’t request a password reset, you can ignore this email.</p>
                </div>
                <div class="footer">If you have any questions, feel free to contact our support team.</div>
            </div>
        </body>
    </html>
`
