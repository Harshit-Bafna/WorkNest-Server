export const organisationRegistrationConfirmationTemplate = (
    adminName: string,
    organisationName: string,
    registrationNumber: string
) =>
    `<!doctype html>
    <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0" />
            <title>Organization Registered</title>
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
                    text-align: center;
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
                <div class="email-header">Organization Registered</div>
                <div class="email-body">
                    <p>We are excited to inform you that your organization has been successfully registered with Work Nest.</p>
                    <p><strong>Admin Name:</strong> ${adminName}</p>
                    <p><strong>Organization Name:</strong> ${organisationName}</p>
                    <p><strong>Registration Number:</strong> ${registrationNumber}</p>
                    <p>If you have any questions or need assistance, please feel free to reach out to our support team.</p>
                </div>
                <div class="footer">Thank you for choosing Work Nest!</div>
            </div>
        </body>
    </html>`
