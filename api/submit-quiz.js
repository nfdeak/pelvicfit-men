/**
 * Stage 1: Lead Capture (Pre-payment)
 * 
 * Called when user submits their email at Step 22 of the quiz.
 * Saves contact to Brevo as STATUS=lead on the "Unpaid Leads" list.
 * Appends quiz data to Google Sheet for analytics.
 * Sends a neutral "results ready" email (NOT a purchase confirmation).
 */
import { google } from 'googleapis';

async function appendToSheet(rowData) {
  const SHEET_ID = (process.env.GOOGLE_SHEETS_ID || '').trim();
  const rawCreds = process.env.GOOGLE_SERVICE_ACCOUNT;

  if (!SHEET_ID) return { ok: false, error: 'GOOGLE_SHEETS_ID not set' };
  if (!rawCreds) return { ok: false, error: 'GOOGLE_SERVICE_ACCOUNT not set' };

  let SERVICE_ACCOUNT;
  try {
    SERVICE_ACCOUNT = JSON.parse(rawCreds);
  } catch (parseErr) {
    return { ok: false, error: 'JSON parse failed: ' + parseErr.message, rawLength: rawCreds.length };
  }

  if (!SERVICE_ACCOUNT.client_email) return { ok: false, error: 'No client_email in parsed creds' };

  // Fix Vercel env var double-escaping of newlines in private_key
  if (SERVICE_ACCOUNT.private_key) {
    SERVICE_ACCOUNT.private_key = SERVICE_ACCOUNT.private_key.replace(/\\n/g, '\n');
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: SERVICE_ACCOUNT,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const result = await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:K',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [rowData],
      },
    });

    return { ok: true, range: result.data.updates?.updatedRange };
  } catch (err) {
    return { ok: false, error: 'Sheets API error: ' + err.message };
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  if (!BREVO_API_KEY) return res.status(500).json({ error: 'Email service not configured' });

  try {
    const { email, quizData } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const UNPAID_LIST_ID = parseInt(process.env.BREVO_LIST_UNPAID || '4');

    // 1. Save contact to Brevo — LEAD ONLY (unpaid)
    await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        attributes: {
          GOAL: quizData?.goal || '',
          PRIMARY_FOCUS: quizData?.primary_focus || '',
          EXPERIENCE: quizData?.experience || '',
          DAILY_TIME: quizData?.daily_time || '',
          SCORE: quizData?.score || '',
          QUIZ_DATE: new Date().toISOString(),
          QUIZ_ANSWERS: JSON.stringify(quizData?.answers || {}),
          LANDING_PAGE: quizData?.landing_page || '',
          UTM_SOURCE: quizData?.utm_source || '',
          UTM_CONTENT: quizData?.utm_content || '',
          REFERRER: quizData?.referrer || '',
          STATUS: 'lead',
        },
        listIds: [UNPAID_LIST_ID],
        updateEnabled: true,
      }),
    });

    // 2. Append to Google Sheet for analytics
    const sheetResult = await appendToSheet([
      quizData?.timestamp || new Date().toISOString(),
      email,
      quizData?.goal || '',
      quizData?.primary_focus || '',
      quizData?.experience || '',
      quizData?.daily_time || '',
      quizData?.score || '',
      quizData?.landing_page || '',
      quizData?.utm_content || '',
      quizData?.referrer || '',
      'lead',  // STATUS
    ]);
    console.log('📊 Sheet result:', JSON.stringify(sheetResult));

    // 3. Send neutral "results ready" email (NOT purchase confirmation)
    const goal = quizData?.goal || 'your goal';
    const score = quizData?.score || '—';

    const confirmResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'PelvicFit Men', email: 'support@pelvicfit.xyz' },
        to: [{ email: email }],
        subject: '📊 Your Pelvic Floor Assessment Results',
        htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#0a0e2a;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 24px;">
    
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="color:#ffffff;font-size:24px;margin:0;">PelvicFit Men</h1>
    </div>

    <div style="background:#111640;border-radius:16px;padding:32px 24px;border:1px solid #2e3566;">
      
      <h2 style="color:#ffffff;font-size:20px;text-align:center;margin:0 0 8px;">
        📊 Your Assessment Results
      </h2>
      <p style="color:#8892b0;font-size:14px;text-align:center;margin:0 0 24px;line-height:1.6;">
        Your pelvic floor assessment is complete. Here's what we found.
      </p>

      <div style="background:#0a0e2a;border-radius:12px;padding:20px;margin:24px 0;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="color:#8892b0;font-size:14px;padding:8px 0;">Goal</td>
            <td style="color:#ffffff;font-size:14px;font-weight:600;text-align:right;padding:8px 0;">${goal}</td>
          </tr>
          <tr>
            <td style="color:#8892b0;font-size:14px;padding:8px 0;">Current Score</td>
            <td style="color:#f59e0b;font-size:14px;font-weight:600;text-align:right;padding:8px 0;">${score} / 10</td>
          </tr>
          <tr>
            <td style="color:#8892b0;font-size:14px;padding:8px 0;">Recommended</td>
            <td style="color:#27ae60;font-size:14px;font-weight:600;text-align:right;padding:8px 0;">28-Day Protocol</td>
          </tr>
        </table>
      </div>

      <p style="color:#c8d0e8;font-size:14px;line-height:1.7;margin:16px 0;">
        Based on your answers, we've identified specific areas where a structured 28-day protocol can significantly improve your pelvic floor function.
      </p>
      <p style="color:#c8d0e8;font-size:14px;line-height:1.7;margin:16px 0;">
        Your personalized protocol is ready to be activated. Complete your order to get instant access.
      </p>

      <div style="text-align:center;margin:24px 0;">
        <a href="https://buy.stripe.com/9B66oI7Q111H8vd81yb3q01?prefilled_email=${encodeURIComponent(email)}" style="display:inline-block;background:linear-gradient(135deg,#1abc9c,#2ecc71);color:white;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:700;font-size:16px;">
          Activate My Protocol →
        </a>
      </div>
    </div>

    <div style="text-align:center;margin-top:32px;">
      <p style="color:#6c7a99;font-size:12px;line-height:1.6;">
        Questions? Reply to this email or contact us at<br>
        <a href="mailto:support@pelvicfit.xyz" style="color:#5b8dee;">support@pelvicfit.xyz</a>
      </p>
      <p style="color:#4a5568;font-size:11px;margin-top:16px;">
        © ${new Date().getFullYear()} PelvicFit Men. All rights reserved.<br>
        <a href="https://pelvicfit.xyz/privacy.html" style="color:#4a5568;">Privacy Policy</a> · 
        <a href="https://pelvicfit.xyz/terms.html" style="color:#4a5568;">Terms of Service</a>
      </p>
    </div>
  </div>
</body>
</html>`,
      }),
    });

    const emailResult = await confirmResponse.json();

    return res.status(200).json({
      success: true,
      message: 'Lead captured',
      emailId: emailResult.messageId,
      sheet: sheetResult || { ok: false, error: 'no result' },
    });

  } catch (error) {
    console.error('Submit quiz error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
