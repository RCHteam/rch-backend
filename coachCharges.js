const pool = require('./pool');

// Keeps the Charges list in sync with a coach's Fixed Salary and Referral
// Salary fields. Call this after every coach insert/update. A coach's
// charges are tagged with linked_coach_id + auto_tag so this can always find
// and replace exactly its own rows (via the partial unique index on
// charges(linked_coach_id, auto_tag)) without touching charges the admin
// entered manually. Deleting a coach cascades and removes these
// automatically (ON DELETE CASCADE on charges.linked_coach_id).
async function syncCoachCharges(coachId) {
  const coachRes = await pool.query('SELECT * FROM coaches WHERE id = $1', [coachId]);
  const coach = coachRes.rows[0];
  if (!coach) return;

  if (coach.fixed_salary_cents > 0) {
    await pool.query(
      `INSERT INTO charges (description, amount_cents, kind, linked_coach_id, auto_tag)
       VALUES ($1, $2, 'recurring', $3, 'salary')
       ON CONFLICT (linked_coach_id, auto_tag) WHERE auto_tag IS NOT NULL
       DO UPDATE SET description = EXCLUDED.description, amount_cents = EXCLUDED.amount_cents`,
      [`Salary — ${coach.name}`, coach.fixed_salary_cents, coachId]
    );
  } else {
    await pool.query(`DELETE FROM charges WHERE linked_coach_id = $1 AND auto_tag = 'salary'`, [coachId]);
  }

  const referralTotalCents = coach.referral_rate_cents * coach.players_referred;
  if (coach.referral_rate_cents > 0 && coach.players_referred > 0) {
    const plural = coach.players_referred === 1 ? 'player' : 'players';
    const rate = (coach.referral_rate_cents / 100).toFixed(2);
    await pool.query(
      `INSERT INTO charges (description, amount_cents, kind, linked_coach_id, auto_tag)
       VALUES ($1, $2, 'recurring', $3, 'referral')
       ON CONFLICT (linked_coach_id, auto_tag) WHERE auto_tag IS NOT NULL
       DO UPDATE SET description = EXCLUDED.description, amount_cents = EXCLUDED.amount_cents`,
      [`Referral Salary — ${coach.name} (${coach.players_referred} ${plural} x $${rate})`, referralTotalCents, coachId]
    );
  } else {
    await pool.query(`DELETE FROM charges WHERE linked_coach_id = $1 AND auto_tag = 'referral'`, [coachId]);
  }
}

module.exports = { syncCoachCharges };
