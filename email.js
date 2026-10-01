const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.CLUB_FROM_EMAIL;
const NOTIFY = process.env.CLUB_NOTIFY_EMAIL;

// A real hosted URL, not a data: URI — Gmail and most email clients don't
// reliably render inline base64 images in emails, only linked images.
const LOGO_URL = (process.env.PUBLIC_BASE_URL || 'https://rch-backend-1.onrender.com') + '/assets/logo.png';

// Wraps an email's inner content with a consistent branded header/footer.
function brandedEmail(innerHtml) {
  return `
    <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif; max-width:520px; margin:0 auto;">
      <div style="background:#0c2a1c; padding:24px; text-align:center;">
        <img src="${LOGO_URL}" alt="RCH Elite Training" width="200" style="max-width:200px; width:100%; height:auto; display:block; margin:0 auto;">
      </div>
      <div style="background:#ffffff; padding:28px 24px; color:#1c2a20; font-size:0.95rem; line-height:1.6;">
        ${innerHtml}
      </div>
      <div style="text-align:center; padding:16px; color:#999; font-size:0.75rem;">
        RCH Elite Training
      </div>
    </div>
  `;
}

// Deliverability notes (why an email lands in spam has almost nothing to do
// with this code and almost everything to do with domain authentication):
// 1. SPF + DKIM must show fully "Verified" for CLUB_FROM_EMAIL's domain in
//    the Resend dashboard (resend.com/domains) — this is the #1 cause of
//    spam placement, and no amount of content tuning fixes it if missing.
// 2. A DMARC record (a TXT record at _dmarc.yourdomain.com) should exist
//    too — many providers (Gmail especially) treat a domain with SPF/DKIM
//    but NO DMARC as suspicious. Resend's domain setup page shows the exact
//    record to add if one isn't already there.
// 3. Every send also sets reply_to to a real, monitored inbox (not a
//    no-reply address) and includes a plain-text alternative alongside the
//    HTML — both are smaller but genuine signals mail providers use.
async function sendEmail({ to, subject, html, text }) {
  if (!RESEND_API_KEY) {
    console.log(`[email skipped — no RESEND_API_KEY set] would send "${subject}" to ${to}`);
    return { skipped: true };
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to,
        subject,
        html,
        text: text || undefined,
        reply_to: NOTIFY || FROM,
      }),
    });
    if (!res.ok) {
      console.error('Email send failed:', await res.text());
      return { skipped: false, ok: false };
    }
    return { skipped: false, ok: true };
  } catch (err) {
    console.error('Email send error:', err);
    return { skipped: false, ok: false };
  }
}

async function sendSkillsRegistrationEmails(entry) {
  const firstName = entry.full_name.split(' ')[0];
  await sendEmail({
    to: entry.email,
    subject: `You're registered — RCH Elite Training`,
    html: brandedEmail(`<p>Hi ${firstName},</p><p>You're registered! A coordinator will reach out to you at ${entry.email} to start your first session.</p>`),
    text: `Hi ${firstName},\n\nYou're registered! A coordinator will reach out to you at ${entry.email} to start your first session.\n\nRCH Elite Training`,
  });
  if (NOTIFY) {
    await sendEmail({
      to: NOTIFY,
      subject: `New Skills Training registration: ${entry.full_name}`,
      html: `<p>${entry.full_name} (${entry.dob}) just registered.</p><p>Email: ${entry.email}<br/>Phone: ${entry.phone}<br/>Team: ${entry.team}<br/>Experience: ${entry.experience}</p><p>Notes: ${entry.notes}</p>`,
    });
  }
}

async function sendJoinRegistrationEmails(entry) {
  const firstName = entry.parent_name.split(' ')[0];
  await sendEmail({
    to: entry.email,
    subject: `You're on the team — Join Sultans FC (${entry.age_group})`,
    html: brandedEmail(`<p>Hi ${firstName},</p><p>${entry.child_name} has signed up for the ${entry.age_group} team. A coordinator will reach out to you at ${entry.email} to start your first session.</p>`),
    text: `Hi ${firstName},\n\n${entry.child_name} has signed up for the ${entry.age_group} team. A coordinator will reach out to you at ${entry.email} to start your first session.\n\nRCH Elite Training`,
  });
  if (NOTIFY) {
    await sendEmail({
      to: NOTIFY,
      subject: `New Join Sultans FC registration: ${entry.child_name} (${entry.age_group})`,
      html: `<p>${entry.child_name} (${entry.dob}), age group ${entry.age_group}.</p><p>Parent: ${entry.parent_name}<br/>Email: ${entry.email}<br/>Phone: ${entry.phone}</p><p>Experience: ${entry.experience}</p><p>Medical: ${entry.medical}</p>`,
    });
  }
}

async function sendPaymentLinkEmail({ to, parentName, childName, programLabel, link, oneTime, monthly, seasonEndDate }) {
  const firstName = (parentName || '').split(' ')[0] || 'there';
  const prettyDate = new Date(`${seasonEndDate}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
  });
  // Only mention "& kit fee" when a kit fee is actually being charged —
  // saying "a one-time $0.00 registration & kit fee" when the kit-fee
  // checkbox wasn't checked would be telling the family something untrue.
  const coverageHtml = oneTime > 0
    ? `This covers a one-time $${(oneTime / 100).toFixed(2)} registration &amp; kit fee, followed by $${(monthly / 100).toFixed(2)}/month, charged automatically each month and ending on ${prettyDate} — no action needed on your part.`
    : `This starts your $${(monthly / 100).toFixed(2)}/month membership, charged automatically each month and ending on ${prettyDate} — no action needed on your part.`;
  const coverageText = oneTime > 0
    ? `This covers a one-time $${(oneTime / 100).toFixed(2)} registration & kit fee, followed by $${(monthly / 100).toFixed(2)}/month, charged automatically each month and ending on ${prettyDate} — no action needed on your part.`
    : `This starts your $${(monthly / 100).toFixed(2)}/month membership, charged automatically each month and ending on ${prettyDate} — no action needed on your part.`;
  await sendEmail({
    to,
    subject: `Complete ${childName}'s registration — payment link inside`,
    html: brandedEmail(`<p>Hi ${firstName},</p>
      <p>${childName} is ready to start ${programLabel}. To finish registering, please complete payment using the link below:</p>
      <p style="text-align:center; margin:24px 0;"><a href="${link}" style="background:#164a30; color:#fff; padding:12px 24px; border-radius:6px; text-decoration:none; font-weight:700; display:inline-block;">Complete Payment</a></p>
      <p style="font-size:0.85rem; color:#666;">Or copy this link: <a href="${link}">${link}</a></p>
      <p>${coverageHtml}</p>
      <p>This link is unique to your family — please don't share it. If you have any questions, just reply to this email.</p>`),
    text: `Hi ${firstName},\n\n${childName} is ready to start ${programLabel}. To finish registering, please complete payment using this link:\n${link}\n\n${coverageText}\n\nThis link is unique to your family — please don't share it. If you have any questions, just reply to this email.\n\nRCH Elite Training`,
  });
}

module.exports = { sendSkillsRegistrationEmails, sendJoinRegistrationEmails, sendPaymentLinkEmail };
