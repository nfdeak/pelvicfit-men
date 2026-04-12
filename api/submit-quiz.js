export default async function handler(req, res) {
  // CORS headers
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

    // 1. Add contact to Brevo with quiz data as attributes
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
          EXPERIENCE: quizData?.experience || '',
          SCORE: quizData?.score || '',
          QUIZ_DATE: new Date().toISOString(),
          QUIZ_ANSWERS: JSON.stringify(quizData?.answers || {}),
        },
        listIds: [2], // Default list — update after creating your list in Brevo
        updateEnabled: true, // Update if contact already exists
      }),
    });

    // 2. Send immediate confirmation email
    const confirmResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'PelvicFit Men', email: 'support@pelvicfit.xyz' },
        to: [{ email: email }],
        subject: '✅ Your personalized plan is being prepared',
        htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#0a0e2a;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 24px;">
    
    <!-- Logo -->
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="color:#ffffff;font-size:24px;margin:0;">PelvicFit Men</h1>
    </div>

    <!-- Main Card -->
    <div style="background:#111640;border-radius:16px;padding:32px 24px;border:1px solid #2e3566;">
      
      <h2 style="color:#ffffff;font-size:20px;text-align:center;margin:0 0 8px;">
        🎉 Thank you for your purchase!
      </h2>
      <p style="color:#8892b0;font-size:14px;text-align:center;margin:0 0 24px;line-height:1.6;">
        Your order has been confirmed and our team has started working on your personalized plan.
      </p>

      <!-- Timeline -->
      <div style="border-left:2px solid #2e3566;padding-left:20px;margin:24px 0;">
        <div style="margin-bottom:20px;">
          <div style="color:#27ae60;font-size:13px;font-weight:bold;">✅ COMPLETED</div>
          <div style="color:#ffffff;font-size:15px;font-weight:600;">Quiz Assessment Analyzed</div>
          <div style="color:#8892b0;font-size:13px;">Your answers have been processed</div>
        </div>
        <div style="margin-bottom:20px;">
          <div style="color:#27ae60;font-size:13px;font-weight:bold;">✅ COMPLETED</div>
          <div style="color:#ffffff;font-size:15px;font-weight:600;">Payment Confirmed</div>
          <div style="color:#8892b0;font-size:13px;">Receipt sent to ${email}</div>
        </div>
        <div style="margin-bottom:20px;">
          <div style="color:#f59e0b;font-size:13px;font-weight:bold;">⏳ IN PROGRESS</div>
          <div style="color:#ffffff;font-size:15px;font-weight:600;">Expert Review & Personalization</div>
          <div style="color:#8892b0;font-size:13px;">Our specialists are customizing your plan based on your unique profile</div>
        </div>
        <div>
          <div style="color:#8892b0;font-size:13px;font-weight:bold;">📧 NEXT</div>
          <div style="color:#ffffff;font-size:15px;font-weight:600;">Plan Delivered to Your Inbox</div>
          <div style="color:#8892b0;font-size:13px;">Expected within 24–48 hours</div>
        </div>
      </div>

      <!-- What to expect -->
      <div style="background:#0a0e2a;border-radius:12px;padding:20px;margin-top:24px;">
        <h3 style="color:#ffffff;font-size:16px;margin:0 0 12px;">📋 What's in your plan:</h3>
        <ul style="color:#c8d0e8;font-size:14px;line-height:1.8;padding-left:20px;margin:0;">
          <li>Personalized daily exercise routine</li>
          <li>Progressive training schedule</li>
          <li>Technique instructions with illustrations</li>
          <li>Progress tracking guidelines</li>
        </ul>
      </div>
    </div>

    <!-- Footer -->
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
      message: 'Contact saved and confirmation email sent',
      emailId: emailResult.messageId,
    });

  } catch (error) {
    console.error('Submit quiz error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
