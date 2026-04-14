/**
 * Stage 2: Customer Activation (Post-payment)
 * 
 * Called from the Thank You page after Stripe redirects back.
 * 1. Generates a unique access token
 * 2. Updates Brevo: move to Customers list, set STATUS=customer, store token
 * 3. Sends delivery email with dashboard link
 * 
 * No external DB required — Brevo stores the profile, localStorage stores progress.
 */

function generateToken() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 12; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

function mapGoalToPlan(goal) {
  const map = {
    'Stop PE': 'endurance',
    'Firmness': 'firmness',
    'Libido': 'libido',
    'Bladder': 'bladder',
  };
  return map[goal] || 'firmness';
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
    const { email, goal, experience, score, tier, quizAnswers } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const UNPAID_LIST_ID = parseInt(process.env.BREVO_LIST_UNPAID || '4');
    const CUSTOMER_LIST_ID = parseInt(process.env.BREVO_LIST_CUSTOMERS || '5');

    // 1. Generate unique token
    const token = generateToken();
    const plan = mapGoalToPlan(goal);
    const accessUrl = `https://pelvicfit.xyz/plan/${token}?plan=${plan}`;

    // 2. Update Brevo: move from Unpaid → Customers, store token + profile
    await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        attributes: {
          STATUS: 'customer',
          TIER: tier || 'premium',
          PROTOCOL_URL: accessUrl,
          PROTOCOL_DATE: new Date().toISOString(),
        },
        listIds: [CUSTOMER_LIST_ID],
        unlinkListIds: [UNPAID_LIST_ID],
        updateEnabled: true,
      }),
    });

    // 3. Send delivery email with dashboard link
    const planNames = {
      firmness: 'Firmness Enhancement',
      endurance: 'Endurance Mastery',
      libido: 'Desire & Vitality',
      bladder: 'Bladder Control',
    };
    const planName = planNames[plan] || 'Firmness Enhancement';

    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'PelvicFit Men', email: 'support@pelvicfit.xyz' },
        to: [{ email: email }],
        subject: '🚀 Your protocol is live — start Day 1 now',
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
      
      <h2 style="color:#ffffff;font-size:22px;text-align:center;margin:0 0 8px;">
        🚀 Your Protocol Is Ready
      </h2>
      <p style="color:#8892b0;font-size:14px;text-align:center;margin:0 0 24px;line-height:1.6;">
        Your 28-Day ${planName} Protocol is live and waiting for you.
      </p>

      <div style="text-align:center;margin:32px 0;">
        <a href="${accessUrl}" style="display:inline-block;background:linear-gradient(135deg,#1abc9c,#2ecc71);color:white;text-decoration:none;padding:16px 40px;border-radius:8px;font-weight:700;font-size:18px;">
          Access My Protocol →
        </a>
      </div>

      <div style="background:#0a0e2a;border-radius:12px;padding:20px;margin:24px 0;">
        <p style="color:#ffffff;font-size:14px;font-weight:600;margin:0 0 12px;">📋 Your 28-Day Roadmap:</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="color:#3b82f6;font-size:13px;padding:6px 0;font-weight:600;">Phase 1 (Days 1-7)</td>
            <td style="color:#c8d0e8;font-size:13px;text-align:right;padding:6px 0;">Foundation & Reset</td>
          </tr>
          <tr>
            <td style="color:#3b82f6;font-size:13px;padding:6px 0;font-weight:600;">Phase 2 (Days 8-14)</td>
            <td style="color:#c8d0e8;font-size:13px;text-align:right;padding:6px 0;">Activation</td>
          </tr>
          <tr>
            <td style="color:#3b82f6;font-size:13px;padding:6px 0;font-weight:600;">Phase 3 (Days 15-21)</td>
            <td style="color:#c8d0e8;font-size:13px;text-align:right;padding:6px 0;">Integration</td>
          </tr>
          <tr>
            <td style="color:#3b82f6;font-size:13px;padding:6px 0;font-weight:600;">Phase 4 (Days 22-28)</td>
            <td style="color:#c8d0e8;font-size:13px;text-align:right;padding:6px 0;">Mastery</td>
          </tr>
        </table>
      </div>

      <p style="color:#8892b0;font-size:13px;line-height:1.7;margin:16px 0;text-align:center;">
        ⭐ <strong style="color:#ffffff;">Bookmark the link above</strong> — you'll return to it every day for the next 28 days.
      </p>
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

    return res.status(200).json({
      success: true,
      token,
      accessUrl,
      plan,
      tier: tier || 'premium',
      message: 'Protocol created, customer activated, delivery email sent',
    });

  } catch (error) {
    console.error('Create protocol error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
