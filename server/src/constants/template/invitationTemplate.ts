export const invitationTemplate = (invitationURL: string, password: string, organizationName: string) =>
    `<!doctype html>
    <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Invitation to Join Work Nest</title>
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
                .action-button {
                    display: inline-block;
                    padding: 12px 24px;
                    font-size: 16px;
                    color: #ffffff;
                    background-color: #007bff;
                    text-decoration: none;
                    border-radius: 5px;
                }
                .action-button:hover {
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
                        loading="lazy"
                    />
                    <div class="company-name">Work Nest</div>
                </div>
                <div class="email-header">You're Invited to Join ${organizationName}</div>
                <div class="email-body">
                    <p>${organizationName} has invited you to join their workspace on Work Nest.</p>
                    <p>Use the following password to complete your registration:</p>
                    <p><strong>${password}</strong></p>
                    <p>Click the button below to accept the invitation and set up your account:</p>
                    <a
                        href="${invitationURL}"
                        class="action-button"
                        >Accept Invitation</a
                    >
                </div>
                <div class="footer">If you did not expect this invitation, you can ignore this email.</div>
            </div>
        </body>
    </html>
`
