/**
 * PelvicFit — Email Template Provisioner (Vercel API Route)
 * 
 * Hit this ONCE to create all email templates in Brevo.
 * URL: https://pelvicfit.xyz/api/setup-emails?key=pelvicfit2026
 * 
 * Creates:
 * - 3 abandoned cart emails (for quiz leads who didn't buy)
 * - 5 post-purchase nurture emails (for customers)
 */
export default async function handler(req, res) {
  // Simple auth guard — prevent random hits
  if (req.query.key !== 'pelvicfit2026') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  if (!BREVO_API_KEY) {
    return res.status(500).json({ error: 'BREVO_API_KEY not set' });
  }

  async function createTemplate(name, subject, htmlContent) {
    const resp = await fetch('https://api.brevo.com/v3/smtp/templates', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'PelvicFit Men', email: 'support@pelvicfit.xyz' },
        templateName: name,
        subject,
        htmlContent,
        isActive: true,
      }),
    });
    const data = await resp.json();
    return { name, status: resp.status, id: data.id, error: data.message };
  }

  // ─── Email Wrapper ──────────────────────────────────────
  function wrap(content) {
    return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a0e2a;font-family:Arial,Helvetica,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:32px 24px;">
<div style="text-align:center;margin-bottom:32px;">
<h1 style="color:#ffffff;font-size:24px;margin:0;">PelvicFit Men</h1>
</div>
<div style="background:#111640;border-radius:16px;padding:32px 24px;border:1px solid #2e3566;">
${content}
</div>
<div style="text-align:center;margin-top:32px;">
<p style="color:#6c7a99;font-size:12px;line-height:1.6;">Questions? Reply to this email or contact us at<br><a href="mailto:support@pelvicfit.xyz" style="color:#5b8dee;">support@pelvicfit.xyz</a></p>
<p style="color:#4a5568;font-size:11px;margin-top:16px;">© 2026 PelvicFit Men. All rights reserved.<br><a href="https://pelvicfit.xyz/privacy.html" style="color:#4a5568;">Privacy Policy</a> · <a href="https://pelvicfit.xyz/terms.html" style="color:#4a5568;">Terms of Service</a><br><a href="{{ unsubscribe }}" style="color:#4a5568;">Unsubscribe</a></p>
</div>
</div>
</body>
</html>`;
  }

  // ─── CTA Button ──────────────────────────────────────────
  function cta(text, url, gradient = 'linear-gradient(135deg,#1abc9c,#2ecc71)') {
    return `<div style="text-align:center;margin:32px 0;"><a href="${url}" style="display:inline-block;background:${gradient};color:white;text-decoration:none;padding:16px 40px;border-radius:8px;font-weight:700;font-size:16px;">${text}</a></div>`;
  }

  try {
    const results = [];

    // ─── ABANDONED CART EMAIL 1: Score Reminder ─────────────
    results.push(await createTemplate(
      'PF_ABANDON_1_results_waiting',
      "Your pelvic floor score: {{ contact.SCORE }}/10 — here's what it means",
      wrap(`
<h2 style="color:#ffffff;font-size:20px;text-align:center;margin:0 0 8px;">Your Results Are Waiting</h2>
<p style="color:#8892b0;font-size:14px;text-align:center;margin:0 0 24px;line-height:1.6;">You completed our pelvic floor assessment earlier today. Here's what we found.</p>
<div style="background:#0a0e2a;border-radius:12px;padding:20px;margin:24px 0;text-align:center;">
<div style="font-size:48px;font-weight:800;color:#f59e0b;margin-bottom:4px;">{{ contact.SCORE }}</div>
<div style="font-size:14px;color:#8892b0;">out of 10 — Current PF Muscle Strength</div>
</div>
<p style="color:#c8d0e8;font-size:14px;line-height:1.7;margin:16px 0;">A score below 6 means your pelvic floor muscles aren't functioning at their potential. But here's the good news: <strong style="color:white;">most men see measurable improvements within 7-14 days</strong> of targeted training.</p>
<div style="background:#0a0e2a;border-radius:12px;padding:20px;margin:24px 0;">
<p style="color:#ffffff;font-size:14px;font-weight:600;margin:0 0 12px;">🔬 What the research shows:</p>
<ul style="color:#c8d0e8;font-size:13px;line-height:1.8;margin:0;padding-left:20px;">
<li>A 2005 clinical trial found 12 weeks of pelvic floor training <strong style="color:white;">improved erectile function in 75% of participants</strong></li>
<li>The bulbospongiosus muscle — responsible for blood trapping during erections — responds to targeted training like any other muscle</li>
<li>Most men carry chronic tension they can't feel. Phase 1 teaches relaxation first, then strength</li>
</ul>
</div>
<p style="color:#c8d0e8;font-size:14px;line-height:1.7;margin:16px 0;">Your personalized 28-day protocol is ready. It starts with breathing — not Kegels — because <strong style="color:white;">strengthening a tight muscle just makes it tighter</strong>.</p>
${cta('Get My Protocol — $19.97 →', 'https://pelvicfit.xyz')}
<p style="color:#6c7a99;font-size:12px;text-align:center;line-height:1.6;">🛡️ 14-day money-back guarantee. No questions asked.</p>
`)
    ));

    // ─── ABANDONED CART EMAIL 2: Education ──────────────────
    results.push(await createTemplate(
      'PF_ABANDON_2_common_mistakes',
      "The #1 mistake men make with pelvic floor training",
      wrap(`
<h2 style="color:#ffffff;font-size:20px;text-align:center;margin:0 0 16px;">The #1 Mistake That Makes Things Worse</h2>
<p style="color:#c8d0e8;font-size:14px;line-height:1.7;margin:0 0 20px;">Most men who Google "Kegels for men" start squeezing as hard as they can. <strong style="color:#ef4444;">This is the worst thing you can do.</strong></p>
<div style="background:#0a0e2a;border-radius:12px;padding:20px;margin:24px 0;">
<p style="color:#ffffff;font-size:15px;font-weight:600;margin:0 0 16px;">Here's why:</p>
<div style="border-left:3px solid #ef4444;padding-left:16px;margin-bottom:16px;">
<p style="color:#c8d0e8;font-size:13px;line-height:1.7;margin:0;">A <strong style="color:white;">"hypertonic" pelvic floor</strong> — muscles stuck in partial contraction — is the hidden cause of many issues. When these muscles can't fully relax, blood flow is impaired. A tight muscle can't trap blood effectively.</p>
</div>
<div style="border-left:3px solid #2ecc71;padding-left:16px;">
<p style="color:#c8d0e8;font-size:13px;line-height:1.7;margin:0;"><strong style="color:white;">The correct approach:</strong> Learn to fully relax first (Days 1-7), then activate with precision (Days 8-14), then integrate with full-body movements (Days 15-28). This is the protocol used by pelvic floor physiotherapists.</p>
</div>
</div>
<div style="background:#0a0e2a;border-radius:12px;padding:16px;margin:24px 0;">
<p style="color:#ffffff;font-size:14px;font-weight:600;margin:0 0 8px;">Try this right now (30 seconds):</p>
<ol style="color:#c8d0e8;font-size:13px;line-height:1.8;margin:0;padding-left:20px;">
<li>Sit back. Place one hand on your chest, one on your belly.</li>
<li>Inhale through your nose for 4 seconds — expand your ribs sideways and backward. Your chest hand should barely move.</li>
<li>Exhale through pursed lips for 6 seconds — like blowing through a straw.</li>
<li>Notice your pelvic floor. Does it soften on the inhale? That's the foundation.</li>
</ol>
</div>
<p style="color:#c8d0e8;font-size:14px;line-height:1.7;margin:16px 0;">This one technique is Day 1 of your protocol. There are 27 more days of progressive, guided training waiting for you.</p>
${cta('Start My 28-Day Protocol →', 'https://pelvicfit.xyz')}
<p style="color:#6c7a99;font-size:12px;text-align:center;line-height:1.6;">🛡️ 14-day money-back guarantee · One-time payment · No subscription</p>
`)
    ));

    // ─── ABANDONED CART EMAIL 3: Downsell ──────────────────
    results.push(await createTemplate(
      'PF_ABANDON_3_downsell',
      "We reduced the price for you — $9.97 starter plan",
      wrap(`
<h2 style="color:#ffffff;font-size:20px;text-align:center;margin:0 0 8px;">We Want You to Start — At Any Price</h2>
<p style="color:#8892b0;font-size:14px;text-align:center;margin:0 0 24px;line-height:1.6;">We noticed you haven't grabbed your protocol yet. No pressure — but we don't want cost to be the reason.</p>
<div style="background:#0a0e2a;border-radius:12px;padding:24px;margin:24px 0;text-align:center;border:1px solid #3b5bdb;">
<div style="font-size:12px;color:#5b8dee;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">SPECIAL OFFER — 50% OFF</div>
<div style="font-size:28px;font-weight:800;color:#ffffff;margin-bottom:4px;">Starter Plan</div>
<div style="margin:12px 0;">
<span style="font-size:16px;color:#6c7a99;text-decoration:line-through;">$19.97</span>
<span style="font-size:32px;font-weight:800;color:#5b8dee;margin-left:8px;">$9.97</span>
</div>
<div style="font-size:13px;color:#8892b0;">One-time payment · Instant access</div>
</div>
<div style="background:#0a0e2a;border-radius:12px;padding:20px;margin:24px 0;">
<p style="color:#ffffff;font-size:14px;font-weight:600;margin:0 0 12px;">What's included:</p>
<div style="color:#c8d0e8;font-size:13px;line-height:2;">
✅ 2-Week Foundation Training Plan<br>
✅ Daily guided exercises (7 min/day)<br>
✅ Progress tracking built in<br>
✅ The "Umbrella Breath" relaxation technique<br>
✅ The "Flick" activation exercise<br>
✅ 14-day money-back guarantee
</div>
</div>
${cta('Get the Starter Plan — $9.97 →', 'https://pelvicfit.xyz', 'linear-gradient(135deg,#3b5bdb,#5c35ac)')}
<p style="color:#8892b0;font-size:13px;text-align:center;line-height:1.6;margin-top:24px;">This is the last email we'll send about pricing.<br>We respect your inbox.</p>
`)
    ));

    // ─── NURTURE EMAIL 1: Day 1 Tip ────────────────────────
    results.push(await createTemplate(
      'PF_NURTURE_1_day1_tip',
      "Day 1 tip — most men skip this (don't)",
      wrap(`
<h2 style="color:#ffffff;font-size:20px;text-align:center;margin:0 0 16px;">🎯 The One Thing to Focus On Today</h2>
<p style="color:#c8d0e8;font-size:14px;line-height:1.7;margin:0 0 20px;">You've started your 28-day protocol. Here's the key to making Day 1 count:</p>
<div style="background:#0a0e2a;border-radius:12px;padding:24px;margin:24px 0;border-left:4px solid #2ecc71;">
<p style="color:#ffffff;font-size:16px;font-weight:700;margin:0 0 8px;">Don't try to "do Kegels" yet.</p>
<p style="color:#c8d0e8;font-size:14px;line-height:1.7;margin:0;">Phase 1 is about <strong style="color:white;">learning to relax</strong>, not squeeze. A tight pelvic floor can't trap blood effectively. Think of it like stretching a rubber band before using it — you need full range of motion first.</p>
</div>
<p style="color:#c8d0e8;font-size:14px;line-height:1.7;margin:20px 0;"><strong style="color:white;">The "Bike Seat Rule":</strong> Most tension is held in the muscles that would touch a bicycle seat — the perineum. You can't feel this tension until you learn to release it.</p>
<div style="background:#0a0e2a;border-radius:12px;padding:16px;margin:24px 0;">
<p style="color:#ffffff;font-size:14px;font-weight:600;margin:0 0 8px;">🧪 Quick self-check:</p>
<p style="color:#c8d0e8;font-size:13px;line-height:1.7;margin:0;">Rate your perineal tension right now (0 = completely soft, 10 = rock hard). Write it down. By Day 7, this number should drop 2-4 points.</p>
</div>
${cta('Open My Day 1 Protocol →', 'https://pelvicfit.xyz')}
`)
    ));

    // ─── NURTURE EMAIL 2: Relaxation ───────────────────────
    results.push(await createTemplate(
      'PF_NURTURE_2_relaxation',
      "Why relaxation matters more than strength",
      wrap(`
<h2 style="color:#ffffff;font-size:20px;text-align:center;margin:0 0 16px;">🧘 The Paradox of Pelvic Health</h2>
<p style="color:#c8d0e8;font-size:14px;line-height:1.7;margin:0 0 20px;">You're 3 days into your protocol. By now, you should be feeling the first signs of relaxation — maybe a subtle warmth after the tennis ball release, or the ability to feel the pelvic floor "drop" during breathing.</p>
<div style="background:#0a0e2a;border-radius:12px;padding:20px;margin:24px 0;">
<p style="color:#ffffff;font-size:15px;font-weight:600;margin:0 0 16px;">Why we don't start with Kegels:</p>
<table style="width:100%;border-collapse:collapse;">
<tr><td style="color:#ef4444;font-size:13px;padding:8px 0;font-weight:600;width:50%;">❌ Generic approach</td><td style="color:#2ecc71;font-size:13px;padding:8px 0;font-weight:600;">✅ PelvicFit approach</td></tr>
<tr><td style="color:#8892b0;font-size:12px;padding:6px 0;">Start squeezing immediately</td><td style="color:#c8d0e8;font-size:12px;padding:6px 0;">Reset resting tone first (Days 1-7)</td></tr>
<tr><td style="color:#8892b0;font-size:12px;padding:6px 0;">Max effort from day 1</td><td style="color:#c8d0e8;font-size:12px;padding:6px 0;">30-50% effort, build with control</td></tr>
<tr><td style="color:#8892b0;font-size:12px;padding:6px 0;">Squeeze & hold, that's it</td><td style="color:#c8d0e8;font-size:12px;padding:6px 0;">Contract + relax ratio (always relax longer)</td></tr>
<tr><td style="color:#8892b0;font-size:12px;padding:6px 0;">Lying down only</td><td style="color:#c8d0e8;font-size:12px;padding:6px 0;">Progressive: lying → sitting → standing</td></tr>
</table>
</div>
<p style="color:#c8d0e8;font-size:14px;line-height:1.7;margin:20px 0;"><strong style="color:white;">Fun fact:</strong> The "Blossoming" technique targets the external anal sphincter, which shares fascial connections with the <strong style="color:#f59e0b;">bulbospongiosus</strong> — the muscle directly responsible for blood trapping. When this sphincter fully releases, relaxation cascades through the entire pelvic floor.</p>
<p style="color:#c8d0e8;font-size:14px;line-height:1.7;">Keep going. Phase 2 starts on Day 8 — that's when you'll learn "The Flick," the single most important exercise for erectile firmness.</p>
${cta('Continue My Protocol →', 'https://pelvicfit.xyz')}
`)
    ));

    // ─── NURTURE EMAIL 3: Week 1 Check-in ──────────────────
    results.push(await createTemplate(
      'PF_NURTURE_3_week1_checkin',
      "📊 Week 1 complete — how do you compare?",
      wrap(`
<h2 style="color:#ffffff;font-size:20px;text-align:center;margin:0 0 16px;">Week 1: The Results Are In</h2>
<p style="color:#c8d0e8;font-size:14px;line-height:1.7;margin:0 0 20px;">You've completed Phase 1 — Foundation & Reset. Let's see where you stand.</p>
<div style="background:#0a0e2a;border-radius:12px;padding:20px;margin:24px 0;">
<p style="color:#ffffff;font-size:14px;font-weight:600;margin:0 0 16px;">📈 Typical Day 7 results from our users:</p>
<table style="width:100%;border-collapse:collapse;">
<tr><td style="color:#8892b0;font-size:13px;padding:8px 0;">Perineal tension</td><td style="color:#2ecc71;font-size:13px;font-weight:600;text-align:right;">↓ 2-4 points</td></tr>
<tr><td style="color:#8892b0;font-size:13px;padding:8px 0;">Breath coordination</td><td style="color:#2ecc71;font-size:13px;font-weight:600;text-align:right;">↑ 2-3 points</td></tr>
<tr><td style="color:#8892b0;font-size:13px;padding:8px 0;">Body awareness</td><td style="color:#2ecc71;font-size:13px;font-weight:600;text-align:right;">↑ 3-5 points</td></tr>
</table>
</div>
<p style="color:#c8d0e8;font-size:14px;line-height:1.7;margin:20px 0;"><strong style="color:#f59e0b;">Phase 2 starts now.</strong> This week, you'll learn <strong style="color:white;">"The Flick"</strong> — a targeted contraction of the bulbospongiosus muscle. This is the muscle that wraps around the base of your penis and compresses the veins to trap blood.</p>
<div style="background:#0a0e2a;border-radius:12px;padding:16px;margin:24px 0;border-left:4px solid #f59e0b;">
<p style="color:#ffffff;font-size:14px;font-weight:600;margin:0 0 8px;">The confirmation check:</p>
<p style="color:#c8d0e8;font-size:13px;line-height:1.7;margin:0;">When you do a Flick correctly, your penis should retract slightly (pull toward your body). If your butt lifts off the surface, you're using glutes — not pelvic floor.</p>
</div>
${cta('Start Phase 2 — Day 8 →', 'https://pelvicfit.xyz', 'linear-gradient(135deg,#f59e0b,#d97706)')}
`)
    ));

    // ─── NURTURE EMAIL 4: Phase 2 Unlocked ─────────────────
    results.push(await createTemplate(
      'PF_NURTURE_4_phase2_flick',
      "🏋️ Phase 2 unlocked — meet 'The Flick'",
      wrap(`
<h2 style="color:#ffffff;font-size:20px;text-align:center;margin:0 0 16px;">Halfway There — Phase 2 Check-In</h2>
<p style="color:#c8d0e8;font-size:14px;line-height:1.7;margin:0 0 20px;">Two weeks in. You've trained your pelvic floor to relax AND contract on demand. That's a skill most men never develop.</p>
<div style="background:#0a0e2a;border-radius:12px;padding:20px;margin:24px 0;">
<p style="color:#ffffff;font-size:14px;font-weight:600;margin:0 0 12px;">🧪 Day 14 Self-Assessment:</p>
<p style="color:#c8d0e8;font-size:13px;line-height:1.8;margin:0;">Rate yourself and compare to Day 1:<br>
1. Perineal tension (0-10)<br>
2. Flick isolation quality — can you contract without glutes/abs? (0-10)<br>
3. Longest endurance hold with perfect form (seconds)<br>
4. Release speed — how fast can you fully relax after contraction? (0-10)</p>
</div>
<p style="color:#c8d0e8;font-size:14px;line-height:1.7;margin:20px 0;"><strong style="color:white;">Phase 3 starts now</strong> — Testicular Bridges, Squat + Flick combos, and a 7-minute HIT circuit clinically proven to improve vascular health.</p>
<p style="color:#c8d0e8;font-size:14px;line-height:1.7;"><strong style="color:#2ecc71;">Why this matters:</strong> Large leg muscle activation increases systemic Nitric Oxide — the molecule that initiates erections. Squats + Flicks = vascular benefit AND local strengthening in one.</p>
${cta('Start Phase 3 →', 'https://pelvicfit.xyz')}
`)
    ));

    // ─── NURTURE EMAIL 5: Completion ───────────────────────
    results.push(await createTemplate(
      'PF_NURTURE_5_completion',
      "🏆 28 days complete — your transformation + what's next",
      wrap(`
<h2 style="color:#ffffff;font-size:20px;text-align:center;margin:0 0 16px;">🏆 Protocol Complete — You Did It</h2>
<p style="color:#c8d0e8;font-size:14px;line-height:1.7;margin:0 0 20px;">28 days. 4 phases. You've built neuromuscular control from scratch.</p>
<div style="background:#0a0e2a;border-radius:12px;padding:20px;margin:24px 0;">
<p style="color:#ffffff;font-size:14px;font-weight:600;margin:0 0 12px;">📊 Your Journey:</p>
<table style="width:100%;border-collapse:collapse;">
<tr><td style="color:#8892b0;font-size:13px;padding:8px 0;font-weight:600;">Phase 1</td><td style="color:#2ecc71;font-size:13px;padding:8px 0;">Foundation & Reset ✅</td></tr>
<tr><td style="color:#8892b0;font-size:13px;padding:8px 0;font-weight:600;">Phase 2</td><td style="color:#2ecc71;font-size:13px;padding:8px 0;">Activation — The Flick ✅</td></tr>
<tr><td style="color:#8892b0;font-size:13px;padding:8px 0;font-weight:600;">Phase 3</td><td style="color:#2ecc71;font-size:13px;padding:8px 0;">Integration — Full Body ✅</td></tr>
<tr><td style="color:#8892b0;font-size:13px;padding:8px 0;font-weight:600;">Phase 4</td><td style="color:#2ecc71;font-size:13px;padding:8px 0;">Mastery & Application ✅</td></tr>
</table>
</div>
<div style="background:#0a0e2a;border-radius:12px;padding:20px;margin:24px 0;border-left:4px solid #2ecc71;">
<p style="color:#ffffff;font-size:14px;font-weight:600;margin:0 0 8px;">Your Maintenance Protocol:</p>
<p style="color:#c8d0e8;font-size:13px;line-height:1.7;margin:0;">To maintain your gains, do the <strong style="color:white;">Day 20 Full Integration Circuit</strong> 3x per week. That's 15 minutes, three times a week. Research shows gains are maintained with this frequency.</p>
</div>
<p style="color:#c8d0e8;font-size:14px;line-height:1.7;margin:20px 0;"><strong style="color:#f59e0b;">Pro tip:</strong> The men who see the best long-term results keep the 5-Position Relaxation Flow (Day 5) as a daily practice — even just 5 minutes. Relaxation is the foundation everything else is built on.</p>
${cta('Open My Dashboard →', 'https://pelvicfit.xyz')}
<p style="color:#8892b0;font-size:13px;text-align:center;line-height:1.6;margin-top:24px;">Questions or feedback? Reply to this email.<br><a href="mailto:support@pelvicfit.xyz" style="color:#5b8dee;">support@pelvicfit.xyz</a></p>
`)
    ));

    // ─── Return results ──────────────────────────────────────
    const summary = {
      total: results.length,
      success: results.filter(r => r.status === 201).length,
      failed: results.filter(r => r.status !== 201).length,
      templates: results.map(r => ({
        name: r.name,
        id: r.id || null,
        status: r.status === 201 ? '✅' : `❌ ${r.error}`,
      })),
      nextSteps: [
        'Go to Brevo → Automations → Create two workflows',
        'Automation 1: Trigger on List 4 add → 3 abandoned cart emails with STATUS checks',
        'Automation 2: Trigger on List 5 add → 5 nurture emails with delays',
      ],
    };

    return res.status(200).json(summary);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
