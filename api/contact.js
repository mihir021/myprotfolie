/**
 * ============================================================================
 * VERCEL SERVERLESS FUNCTION - CONTACT DISPATCH API
 * ============================================================================
 * Handles POST requests from the portfolio contact terminal and dispatches
 * rich HTML telegram notices to rathodmihir1113@gmail.com via Gmail SMTP.
 */

const nodemailer = require('nodemailer');

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
const RECIPIENT_EMAIL = process.env.RECIPIENT_EMAIL;
const MAX_FIELD_LENGTH = 160;
const MAX_MESSAGE_LENGTH = 5000;

// Warning if environment variables are not properly configured
if (!GMAIL_USER || !GMAIL_APP_PASSWORD || !RECIPIENT_EMAIL) {
    console.warn("⚠️ Vercel Environment Variables Missing: GMAIL_USER, GMAIL_APP_PASSWORD, or RECIPIENT_EMAIL are not defined.");
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function cleanText(value, fallback, maxLength) {
    const text = typeof value === 'string' ? value.trim() : '';
    return (text || fallback).slice(0, maxLength);
}

async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }

    try {
        const { name, email, subject, message, website } = req.body || {};

        // Honeypot field: bots often fill fields that real visitors never see.
        if (website) {
            return res.status(400).json({ success: false, error: 'Invalid submission.' });
        }

        const senderName = cleanText(name, 'Anonymous Sender', MAX_FIELD_LENGTH);
        const senderEmail = cleanText(email, '', 254);
        const dispatchSubject = cleanText(subject, 'Portfolio Telegram Dispatch', MAX_FIELD_LENGTH);
        const messageBody = cleanText(message, '', MAX_MESSAGE_LENGTH);

        if (!senderEmail || !/^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(senderEmail)) {
            return res.status(400).json({ success: false, error: 'Please provide a valid email address.' });
        }

        if (!messageBody) {
            return res.status(400).json({ success: false, error: 'Message body cannot be empty.' });
        }

        if (!GMAIL_USER || !GMAIL_APP_PASSWORD || !RECIPIENT_EMAIL) {
            console.error('Contact API environment variables are not configured.');
            return res.status(503).json({ success: false, error: 'The contact service is temporarily unavailable. Please use the email link.' });
        }

        const safeName = escapeHtml(senderName);
        const safeEmail = escapeHtml(senderEmail);
        const safeSubject = escapeHtml(dispatchSubject);
        const safeMessage = escapeHtml(messageBody);
        const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';

        // Configure Nodemailer transporter with Gmail SMTP
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: GMAIL_USER,
                pass: GMAIL_APP_PASSWORD,
            },
        });

        // Rich Newspaper-themed HTML Email template
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body {
    font-family: Georgia, 'Times New Roman', serif;
    background-color: #f6f1e7;
    color: #14151e;
    padding: 30px 15px;
    margin: 0;
  }
  .container {
    max-width: 600px;
    margin: 0 auto;
    background: #ffffff;
    border: 2px solid #14151e;
    padding: 30px;
    box-shadow: 6px 6px 0px rgba(20, 21, 30, 0.15);
  }
  .masthead {
    text-align: center;
    border-bottom: 2px solid #14151e;
    padding-bottom: 12px;
    margin-bottom: 20px;
  }
  .masthead-title {
    font-size: 24px;
    font-weight: 900;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    margin: 0;
  }
  .masthead-sub {
    font-family: monospace;
    font-size: 11px;
    color: #706e68;
    letter-spacing: 0.15em;
    margin-top: 4px;
  }
  .meta-grid {
    background: #faf8f5;
    border: 1px solid #d5cfc4;
    padding: 16px;
    margin-bottom: 24px;
    font-size: 14px;
    line-height: 1.6;
  }
  .meta-grid strong {
    color: #b3261e;
    font-family: monospace;
    font-size: 12px;
  }
  .message-box {
    border-left: 4px solid #b3261e;
    background: #ffffff;
    padding: 18px 20px;
    font-size: 15px;
    line-height: 1.7;
    color: #222;
    white-space: pre-wrap;
    margin-bottom: 24px;
  }
  .footer {
    border-top: 1px dashed #14151e;
    padding-top: 12px;
    font-family: monospace;
    font-size: 11px;
    color: #706e68;
    text-align: center;
  }
  .reply-btn {
    display: inline-block;
    background: #14151e;
    color: #ffffff !important;
    text-decoration: none;
    padding: 10px 20px;
    font-family: monospace;
    font-size: 12px;
    font-weight: bold;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    border-radius: 2px;
    margin-top: 10px;
  }
</style>
</head>
<body>
  <div class="container">
    <div class="masthead">
      <h1 class="masthead-title">The Mihir Rathod Times</h1>
      <div class="masthead-sub">OFFICIAL DISPATCH TRANSMISSION · NO. 849-MR</div>
    </div>

    <div class="meta-grid">
      <div><strong>SENDER:</strong> ${safeName}</div>
      <div><strong>RETURN ADDRESS:</strong> <a href="mailto:${safeEmail}" style="color: #14151e; font-weight: bold;">${safeEmail}</a></div>
      <div><strong>SUBJECT:</strong> ${safeSubject}</div>
      <div><strong>TIMESTAMP:</strong> ${timestamp}</div>
    </div>

    <div style="font-family: monospace; font-size: 12px; font-weight: bold; margin-bottom: 8px; color: #14151e;">
      TRANSMISSION CONTENT:
    </div>

    <div class="message-box">
${safeMessage}
    </div>

    <div style="text-align: center; margin-bottom: 20px;">
      <a href="mailto:${safeEmail}?subject=Re: ${encodeURIComponent(dispatchSubject)}" class="reply-btn">REPLY TO ${safeName} →</a>
    </div>

    <div class="footer">
      FILED DIRECTLY FROM PORTFOLIO CONTACT TERMINAL · DESTINATION: RATHODMIHIR1113@GMAIL.COM
    </div>
  </div>
</body>
</html>
        `;

        await transporter.sendMail({
            from: `"Portfolio Telegram" <${GMAIL_USER}>`,
            to: RECIPIENT_EMAIL,
            replyTo: senderEmail,
            subject: `📰 DISPATCH: ${dispatchSubject} — from ${senderName}`,
            text: `Sender: ${senderName} (${senderEmail})\nSubject: ${dispatchSubject}\nTime: ${timestamp}\n\nMessage:\n${messageBody}`,
            html: htmlContent,
        });

        return res.status(200).json({
            success: true,
            message: "Dispatch transmitted successfully to Mihir Rathod's terminal.",
        });
    } catch (error) {
        console.error('Error dispatching contact email:', error);
        return res.status(500).json({
            success: false,
            error: 'Unable to send your message right now. Please use the email link.',
        });
    }
}

module.exports = handler;
