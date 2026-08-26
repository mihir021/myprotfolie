#!/usr/bin/env python3
"""
=============================================================================
THE MIHIR RATHOD TIMES - PORTFOLIO DEV SERVER & DISPATCH API
=============================================================================
Serves static portfolio files and handles POST /api/contact inquiries
by dispatching rich HTML telegram notices directly to rathodmihir1113@gmail.com
via Gmail SMTP SSL (manushyop@gmail.com).
"""

import os
import sys
import json
import smtplib
import http.server
import socketserver
from html import escape
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

# Port configuration
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 43210

# Gmail SMTP Configuration
GMAIL_USER = os.environ.get("GMAIL_USER")
GMAIL_APP_PASSWORD = os.environ.get("GMAIL_APP_PASSWORD")
RECIPIENT_EMAIL = os.environ.get("RECIPIENT_EMAIL")


class PortfolioRequestHandler(http.server.SimpleHTTPRequestHandler):
    """
    Custom HTTP request handler serving static files and routing /api/contact requests.
    """

    def do_POST(self):
        """Handle POST requests for dispatch form submissions."""
        if self.path in ("/api/contact", "/api/send-email"):
            content_length = int(self.headers.get("Content-Length", 0))
            post_data = self.rfile.read(content_length)

            try:
                if not all((GMAIL_USER, GMAIL_APP_PASSWORD, RECIPIENT_EMAIL)):
                    self._send_json_response(503, {"success": False, "error": "Contact service is not configured. Please use the email link."})
                    return
                data = json.loads(post_data.decode("utf-8"))
                sender_name = data.get("name", "Anonymous Sender").strip()
                sender_email = data.get("email", "No Email Provided").strip()
                subject = data.get("subject", "Portfolio Telegram Dispatch").strip()
                message_body = data.get("message", "").strip()

                if not message_body:
                    self._send_json_response(400, {"success": False, "error": "Message body cannot be empty."})
                    return

                # Send email via Gmail SMTP
                send_dispatch_email(sender_name, sender_email, subject, message_body)

                self._send_json_response(200, {
                    "success": True,
                    "message": "Dispatch transmitted successfully to Mihir Rathod's terminal."
                })

            except Exception as e:
                print(f"[ERROR] Failed to process dispatch: {e}")
                self._send_json_response(500, {"success": False, "error": "Unable to send your message right now. Please use the email link."})
        else:
            self.send_error(404, "Endpoint not found.")

    def _send_json_response(self, status_code, payload):
        """Helper to send JSON HTTP responses with proper CORS headers."""
        response_bytes = json.dumps(payload).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(response_bytes)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(response_bytes)

    def do_OPTIONS(self):
        """Handle CORS pre-flight requests."""
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()


def send_dispatch_email(name, email, subject, message):
    """
    Sends a styled HTML telegram dispatch to rathodmihir1113@gmail.com using Gmail SMTP SSL.
    """
    timestamp = datetime.now().strftime("%d %B %Y · %I:%M %p IST")
    safe_name = escape(name)
    safe_email = escape(email)
    safe_subject = escape(subject)
    safe_message = escape(message)
    
    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"📰 DISPATCH: {subject} — from {name}"
    msg["From"] = f"Portfolio Telegram <{GMAIL_USER}>"
    msg["To"] = RECIPIENT_EMAIL
    msg["Reply-To"] = email

    # Plaintext fallback
    plain_text = f"""
=============================================================================
THE MIHIR RATHOD TIMES - TELEGRAM DISPATCH NOTICE
=============================================================================
Sender:  {name}
Email:   {email}
Subject: {subject}
Time:    {timestamp}
-----------------------------------------------------------------------------
Message:
{message}
=============================================================================
"""

    # Rich Newspaper-themed HTML Email
    html_content = f"""
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body {{
    font-family: Georgia, 'Times New Roman', serif;
    background-color: #f6f1e7;
    color: #14151e;
    padding: 30px 15px;
    margin: 0;
  }}
  .container {{
    max-width: 600px;
    margin: 0 auto;
    background: #ffffff;
    border: 2px solid #14151e;
    padding: 30px;
    box-shadow: 6px 6px 0px rgba(20, 21, 30, 0.15);
  }}
  .masthead {{
    text-align: center;
    border-bottom: 2px solid #14151e;
    padding-bottom: 12px;
    margin-bottom: 20px;
  }}
  .masthead-title {{
    font-size: 24px;
    font-weight: 900;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    margin: 0;
  }}
  .masthead-sub {{
    font-family: monospace;
    font-size: 11px;
    color: #706e68;
    letter-spacing: 0.15em;
    margin-top: 4px;
  }}
  .meta-grid {{
    background: #faf8f5;
    border: 1px solid #d5cfc4;
    padding: 16px;
    margin-bottom: 24px;
    font-size: 14px;
    line-height: 1.6;
  }}
  .meta-grid strong {{
    color: #b3261e;
    font-family: monospace;
    font-size: 12px;
  }}
  .message-box {{
    border-left: 4px solid #b3261e;
    background: #ffffff;
    padding: 18px 20px;
    font-size: 15px;
    line-height: 1.7;
    color: #222;
    white-space: pre-wrap;
    margin-bottom: 24px;
  }}
  .footer {{
    border-top: 1px dashed #14151e;
    padding-top: 12px;
    font-family: monospace;
    font-size: 11px;
    color: #706e68;
    text-align: center;
  }}
  .reply-btn {{
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
  }}
</style>
</head>
<body>
  <div class="container">
    <div class="masthead">
      <h1 class="masthead-title">The Mihir Rathod Times</h1>
      <div class="masthead-sub">OFFICIAL DISPATCH TRANSMISSION · NO. 849-MR</div>
    </div>

    <div class="meta-grid">
      <div><strong>SENDER:</strong> {safe_name}</div>
      <div><strong>RETURN ADDRESS:</strong> <a href="mailto:{safe_email}" style="color: #14151e; font-weight: bold;">{safe_email}</a></div>
      <div><strong>SUBJECT:</strong> {safe_subject}</div>
      <div><strong>TIMESTAMP:</strong> {timestamp}</div>
    </div>

    <div style="font-family: monospace; font-size: 12px; font-weight: bold; margin-bottom: 8px; color: #14151e;">
      TRANSMISSION CONTENT:
    </div>

    <div class="message-box">
{safe_message}
    </div>

    <div style="text-align: center; margin-bottom: 20px;">
      <a href="mailto:{safe_email}?subject=Re: {safe_subject}" class="reply-btn">REPLY TO {safe_name} →</a>
    </div>

    <div class="footer">
      FILED DIRECTLY FROM PORTFOLIO CONTACT TERMINAL · DESTINATION: RATHODMIHIR1113@GMAIL.COM
    </div>
  </div>
</body>
</html>
"""

    msg.attach(MIMEText(plain_text, "plain"))
    msg.attach(MIMEText(html_content, "html"))

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
        server.sendmail(GMAIL_USER, RECIPIENT_EMAIL, msg.as_string())
    
    print(f"[SUCCESS] Dispatched email from '{name}' <{email}> to <{RECIPIENT_EMAIL}>")


if __name__ == "__main__":
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), PortfolioRequestHandler) as httpd:
        print(f"=================================================================")
        print(f" THE MIHIR RATHOD TIMES - PORTFOLIO SERVER RUNNING ON PORT {PORT}")
        print(f" Contact API: POST http://localhost:{PORT}/api/contact")
        print(" Contact email configured: " + ("yes" if all((GMAIL_USER, GMAIL_APP_PASSWORD, RECIPIENT_EMAIL)) else "no"))
        print(f"=================================================================")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server...")
            httpd.server_close()
