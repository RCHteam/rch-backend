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
async function sendEmail({ to, subject, html, text, attachments }) {
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
        attachments: attachments || undefined,
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

// A single targeted "Send Link" email — a one-off charge (tournament fee,
// equipment, etc.) sent to one family's own private link, as opposed to
// sendPaymentLinkEmail above, which is specifically the registration/
// recurring-membership flow.
async function sendOneTimePaymentEmail({ to, parentName, childName, title, description, amountCents, link }) {
  const firstName = (parentName || '').split(' ')[0] || 'there';
  const amountStr = '$' + (amountCents / 100).toFixed(2);
  const who = childName ? `for ${childName}` : '';
  const descHtml = description ? `<p>${description}</p>` : '';
  const descText = description ? `${description}\n\n` : '';
  await sendEmail({
    to,
    subject: `${title} — payment link inside`,
    html: brandedEmail(`<p>Hi ${firstName},</p>
      <p>${title} ${who} — ${amountStr}.</p>
      ${descHtml}
      <p style="text-align:center; margin:24px 0;"><a href="${link}" style="background:#164a30; color:#fff; padding:12px 24px; border-radius:6px; text-decoration:none; font-weight:700; display:inline-block;">Complete Payment</a></p>
      <p style="font-size:0.85rem; color:#666;">Or copy this link: <a href="${link}">${link}</a></p>
      <p>This link is unique to your family — please don't share it. If you have any questions, just reply to this email.</p>`),
    text: `Hi ${firstName},\n\n${title} ${who} — ${amountStr}.\n\n${descText}Pay using this link:\n${link}\n\nThis link is unique to your family — please don't share it. If you have any questions, just reply to this email.\n\nRCH Elite Training`,
  });
}

// Monthly dashboard report, emailed to the club's own notification address
// (CLUB_NOTIFY_EMAIL) with the generated PDF attached — this IS the "bell":
// there's no separate in-app notification system, so the report landing in
// the inbox is what alerts the admin each month.
async function sendMonthlyReportEmail({ monthLabel, pdfBuffer, filename }) {
  if (!NOTIFY) {
    console.log('[monthly report email skipped — no CLUB_NOTIFY_EMAIL set]');
    return { skipped: true };
  }
  return sendEmail({
    to: NOTIFY,
    subject: `RCH Elite Training — Monthly Report: ${monthLabel}`,
    html: `<p>Attached is the ${monthLabel} dashboard report — roster counts, season overview, revenue after Stripe fees and business charges, one-time payments, and current coaches.</p>`,
    text: `Attached is the ${monthLabel} dashboard report.`,
    attachments: [{ filename, content: pdfBuffer.toString('base64') }],
  });
}

async function sendAgreementEmail({ to, parentName, childName, link }) {
  const firstName = (parentName || '').split(' ')[0] || 'there';
  await sendEmail({
    to,
    subject: `Please sign ${childName}'s Training Agreement — RCH Elite Training`,
    html: brandedEmail(`<p>Hi ${firstName},</p>
      <p>Before ${childName} starts, we need you to review and e-sign the RCH Elite Training / Soccer Sultans Training Agreement &amp; Liability Waiver. It takes about two minutes and works on your phone.</p>
      <p style="text-align:center; margin:24px 0;"><a href="${link}" style="background:#164a30; color:#fff; padding:12px 24px; border-radius:6px; text-decoration:none; font-weight:700; display:inline-block;">Review &amp; Sign</a></p>
      <p style="font-size:0.85rem; color:#666;">Or copy this link: <a href="${link}">${link}</a></p>
      <p>This link is unique to your family — please don't share it. You'll get a signed copy by email when you're done.</p>`),
    text: `Hi ${firstName},\n\nBefore ${childName} starts, please review and e-sign the RCH Elite Training / Soccer Sultans Training Agreement & Liability Waiver (about two minutes, works on your phone):\n${link}\n\nThis link is unique to your family — please don't share it. You'll get a signed copy by email when you're done.\n\nRCH Elite Training`,
  });
}

// After signing: the family gets their copy, the club gets one too.
async function sendSignedAgreementEmails({ to, parentName, childName, pdf }) {
  const firstName = (parentName || '').split(' ')[0] || 'there';
  const safe = (childName || 'Player').replace(/[^a-z0-9]+/gi, '_');
  const attachments = [{ filename: `RCH_Agreement_${safe}.pdf`, content: pdf.toString('base64') }];
  await sendEmail({
    to,
    subject: `Your signed agreement for ${childName} — RCH Elite Training`,
    html: brandedEmail(`<p>Hi ${firstName},</p><p>Thank you — your signed Training Agreement for ${childName} is attached for your records.</p>`),
    text: `Hi ${firstName},\n\nThank you — your signed Training Agreement for ${childName} is attached for your records.\n\nRCH Elite Training`,
    attachments,
  });
  if (NOTIFY) {
    await sendEmail({
      to: NOTIFY,
      subject: `Agreement signed: ${childName}`,
      html: `<p>${parentName} just e-signed the Training Agreement for ${childName}. The PDF is attached and saved under Data → Signed Agreements.</p>`,
      text: `${parentName} just e-signed the Training Agreement for ${childName}. The PDF is attached and saved under Data → Signed Agreements.`,
      attachments,
    });
  }
}

function escHtml(v) {
  return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// "Thank you for your trust — leave a star rating + comment" (kind 'review')
// or "What can we change in our services?" (kind 'feedback'). Both link to a
// personal /feedback/:token page.
async function sendOutreachEmail({ to, parentName, childNames, kind, link }) {
  const firstName = (parentName || '').split(' ')[0] || 'there';
  const kids = childNames && childNames.length ? childNames.join(' & ') : 'your child';
  const safeKids = escHtml(kids);
  const btn = (label) => `<p style="text-align:center; margin:26px 0;"><a href="${link}" style="background:#164a30; color:#ffffff; text-decoration:none; padding:14px 26px; border-radius:8px; font-weight:700; display:inline-block;">${label}</a></p>`;
  if (kind === 'feedback') {
    const subject = 'What can we change? We want your honest feedback — RCH Elite Training';
    const html = brandedEmail(`<p>Hi ${escHtml(firstName)},</p>
      <p>We are always looking to make RCH Elite Training better for ${safeKids} and every family. What should we change, add or do differently in our services?</p>
      <p>Your honest answer takes about a minute and goes straight to us.</p>${btn('Share your feedback')}
      <p style="color:#777; font-size:0.85rem;">If the button doesn't work, copy this link: ${link}</p>`);
    const text = `Hi ${firstName},\n\nWe are always looking to make RCH Elite Training better for ${kids} and every family. What should we change, add or do differently in our services?\n\nShare your feedback (about a minute): ${link}\n\nThank you,\nRCH Elite Training`;
    return sendEmail({ to, subject, html, text });
  }
  const subject = 'Thank you for trusting RCH Elite Training — how are we doing?';
  const html = brandedEmail(`<p>Hi ${escHtml(firstName)},</p>
    <p>Thank you for trusting us with ${safeKids}'s soccer development. It truly means a lot to our whole team.</p>
    <p>Would you take a minute to rate your experience from 1 to 5 stars and leave us a short comment?</p>${btn('Leave a review')}
    <p style="color:#777; font-size:0.85rem;">If the button doesn't work, copy this link: ${link}</p>`);
  const text = `Hi ${firstName},\n\nThank you for trusting us with ${kids}'s soccer development. It truly means a lot to our whole team.\n\nWould you take a minute to rate your experience (1-5 stars) and leave a short comment?\n${link}\n\nThank you,\nRCH Elite Training`;
  return sendEmail({ to, subject, html, text });
}

// Coach's written report to the parent, with the PDF attached. Name, month
// and year are in both the subject and the body.
async function sendStudentReportEmail({ to, parentName, childName, monthLabel, chapterTitle, pdf, filename }) {
  const firstName = (parentName || '').split(' ')[0] || 'there';
  const subject = `${childName} — Progress Report, ${monthLabel} — RCH Elite Training`;
  const chapterLine = chapterTitle ? ` on <b>${escHtml(chapterTitle)}</b>` : '';
  const html = brandedEmail(`<p>Hi ${escHtml(firstName)},</p>
    <p>Attached is ${escHtml(childName)}'s progress report for <b>${escHtml(monthLabel)}</b>${chapterLine}, written by their coach.</p>
    <p>Thank you for being part of RCH Elite Training. If you have any questions, just reply to this email.</p>`);
  const text = `Hi ${firstName},\n\nAttached is ${childName}'s progress report for ${monthLabel}${chapterTitle ? ' on ' + chapterTitle : ''}, written by their coach.\n\nThank you for being part of RCH Elite Training. If you have any questions, just reply to this email.`;
  return sendEmail({ to, subject, html, text, attachments: [{ filename, content: pdf.toString('base64') }] });
}

module.exports = {
  sendOutreachEmail,
  sendStudentReportEmail,
  sendAgreementEmail,
  sendSignedAgreementEmails,
  sendSkillsRegistrationEmails,
  sendJoinRegistrationEmails,
  sendPaymentLinkEmail,
  sendOneTimePaymentEmail,
  sendMonthlyReportEmail,
};
