/**
 * FILE: lib/email/templates.js
 * PURPOSE: Shared HTML wrappers for notification emails.
 */

export function emailTemplate(content) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #C6A15B 0%, #E0C98A 100%);
      color: black;
      padding: 20px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .content {
      background: white;
      padding: 30px;
      border: 1px solid #eee;
    }
    .footer {
      background: #f5f5f5;
      padding: 15px;
      text-align: center;
      font-size: 12px;
      color: #666;
      border-radius: 0 0 10px 10px;
    }
    .button {
      background: #C6A15B;
      color: black;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 5px;
      display: inline-block;
      margin: 10px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    td {
      padding: 10px;
      border: 1px solid #ddd;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>BM Wealth</h1>
    <p>Automated Notification System</p>
  </div>
  <div class="content">
    ${content}
  </div>
  <div class="footer">
    <p>BM Wealth | AMFI ARN-90008 | IRDAI 277925</p>
    <p>This is an automated notification. Do not reply to this email.</p>
  </div>
</body>
</html>
`.trim();
}
