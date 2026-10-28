// Fixed RCH calendar events. These are worked out by rule, not saved in the database,
// so they never move and cannot be edited or deleted from the calendar.
//
// Source for the school breaks: the 2026-27 calendars of Plano ISD, Richardson ISD and
// Garland ISD. A date counts as "break" if ANY of the three districts is off, so players
// from every district can come. To add the next school year, add its breaks below.

// [first day, last day] inclusive, including the weekend on each side of the break.
const BREAKS = [
  ['2026-10-08', '2026-10-19', 'Fall break'],        // RISD Oct 8-12, Plano and Garland Oct 12-16, Garland Oct 19
  ['2026-11-21', '2026-11-29', 'Thanksgiving break'],
  ['2026-12-19', '2027-01-04', 'Winter break'],
  ['2027-01-16', '2027-01-18', 'Martin Luther King Jr. weekend'],
  ['2027-02-13', '2027-02-16', "Presidents' Day weekend"],
  ['2027-03-13', '2027-03-21', 'Spring break'],
  ['2027-03-26', '2027-03-28', 'Good Friday / Easter weekend'],
  ['2027-04-16', '2027-04-18', 'Garland ISD holiday weekend'],
  ['2027-05-22', '2027-08-09', 'Summer break'],       // Plano ISD is out from May 22
];
const SCHOOL_YEAR_FIRST_MONTH = '2026-10';
const SCHOOL_YEAR_LAST_MONTH = '2027-05';

const pad = (n) => String(n).padStart(2, '0');
const iso = (d) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
const dayOf = (y, m, d) => new Date(Date.UTC(y, m - 1, d));
function weekdaysInMonth(y, m, dow) {
  const out = [];
  for (let d = dayOf(y, m, 1); d.getUTCMonth() === m - 1; d = new Date(d.getTime() + 86400000)) {
    if (d.getUTCDay() === dow) out.push(iso(d));
  }
  return out;
}
const onBreak = (date) => BREAKS.some((b) => date >= b[0] && date <= b[1]);

// 2nd and 4th Sunday of every month: Social Media Post.
function socialPosts() {
  const out = [];
  for (let y = 2026; y <= 2028; y++) {
    for (let m = 1; m <= 12; m++) {
      const sundays = weekdaysInMonth(y, m, 0);
      [sundays[1], sundays[3]].forEach((date, i) => {
        if (date < '2026-10-11') return;
        out.push({
          id: 'fx-post-' + date, fixed: true, title: 'Social Media Post', date,
          startTime: '10:00', endTime: '10:30', location: '', color: 'blue',
          notes: [
            'Fixed date: the 2nd and 4th Sunday of every month.',
            '',
            'Before posting:',
            '- Choose the best photos and videos from the last two weeks of practice.',
            '- Only use players whose parents have given photo permission.',
            '',
            'What to post:',
            '- A moment from practice, or a player of the week shout-out.',
            '- The skill or chapter we are working on right now.',
            '- Anything coming up: registration, camps, shop, events.',
            '',
            'Finish: write a short caption, add hashtags, post to every account, and reply to comments the same day.',
          ].join('\n'),
        });
      });
    }
  }
  return out;
}

// First free Saturday in a month, trying the preferred order (which Saturday of the month).
function pickSaturday(y, m, order, skip) {
  const sats = weekdaysInMonth(y, m, 6);
  for (const n of order) {
    const date = sats[n - 1];
    if (date && !onBreak(date) && date !== skip) return date;
  }
  return null;
}

function outings() {
  const out = [];
  const [fy, fm] = SCHOOL_YEAR_FIRST_MONTH.split('-').map(Number);
  const [ly, lm] = SCHOOL_YEAR_LAST_MONTH.split('-').map(Number);
  let idx = 0;
  for (let y = fy, m = fm; y < ly || (y === ly && m <= lm); idx++, m === 12 ? (y++, m = 1) : m++) {
    // Players: once a month, a Saturday morning outside every break.
    const playerDate = pickSaturday(y, m, [3, 4, 2, 1, 5], null);
    if (playerDate && playerDate >= '2026-10-11') {
      out.push({
        id: 'fx-players-' + playerDate, fixed: true, title: 'Extracurricular Event: Players', date: playerDate,
        startTime: '10:00', endTime: '12:00', location: '', color: 'green',
        notes: [
          'Fixed monthly event for the players. Never held during a school break (Plano, Richardson and Garland ISD calendars checked).',
          '',
          'Ideas: bowling, trampoline park, pizza and a movie, small tournament day, or watching a local match together.',
          '',
          'Two weeks before: choose the activity and place, then send the details to every parent.',
          'Day of: take attendance, keep the group together, and take photos for social media (photo permission only).',
        ].join('\n'),
      });
    }
    // Parents: every two months (Nov, Jan, Mar, May), a Saturday afternoon outside every break.
    if ((idx - 1) % 2 === 0 && idx > 0) {
      const parentDate = pickSaturday(y, m, [2, 1, 4, 3, 5], playerDate) || playerDate;
      if (parentDate && !onBreak(parentDate)) {
        out.push({
          id: 'fx-parents-' + parentDate, fixed: true, title: 'Extracurricular Event: Parents', date: parentDate,
          startTime: '14:00', endTime: '16:00', location: '', color: 'gold',
          notes: [
            'Fixed event with the parents, every two months. Never held during a school break (Plano, Richardson and Garland ISD calendars checked).',
            '',
            'Ideas: family picnic at the field, parents v coaches game, coffee with the coaches, or a short parent meeting with a snack.',
            '',
            'Two weeks before: choose the activity and place, then invite every family.',
            'Day of: greet each parent, ask how their child is enjoying the program, and note any feedback.',
          ].join('\n'),
        });
      }
    }
  }
  return out;
}

// Four terms a year (two seasons, two terms each). Each term ends with a report day and a
// coaches meeting with Coach Ismail on the Sunday after the term's last practice.
const TERMS = [
  { name: 'Fall Term 1', span: 'Aug 11 to Oct 8', date: '2026-10-18' },
  { name: 'Fall Term 2', span: 'Oct 20 to Dec 18', date: '2026-12-20' },
  { name: 'Spring Term 1', span: 'Jan 5 to Mar 12', date: '2027-03-21' },
  { name: 'Spring Term 2', span: 'Mar 22 to May 21', date: '2027-05-23' },
];
function termDays() {
  const out = [];
  TERMS.forEach((t) => {
    out.push({
      id: 'fx-reports-' + t.date, fixed: true, title: 'Term Reports: ' + t.name, date: t.date,
      startTime: '13:00', endTime: '15:00', location: '', color: 'red',
      notes: [
        t.name + ' (' + t.span + ') has ended. Write the report for every child today.',
        '',
        'Coaches > Student Report: choose the child, the term and the chapters covered, tick each chapter, record the assessment result, write the comment, then email the PDF to the parent.',
        'Check the Recent reports list at the end: every child should show a date under Emailed.',
      ].join('\n'),
    });
    out.push({
      id: 'fx-feedback-' + t.date, fixed: true, title: 'Send Reviews and "What Can We Change?"', date: t.date,
      startTime: '16:45', endTime: '17:30', location: '', color: 'red',
      notes: [
        'End of ' + t.name + '. Send the parents both requests, right after their child\'s report has been emailed.',
        '',
        'Data > Reviews: send the review request (star rating).',
        'Data > What Can We Change?: send the service feedback request.',
        '',
        'Over the next weeks, read the answers and write down the changes we can make to our services, to discuss at the next term\'s coaches meeting.',
      ].join('\n'),
    });
    out.push({
      id: 'fx-meeting-' + t.date, fixed: true, title: 'Coaches Meeting with Coach Ismail', date: t.date,
      startTime: '15:30', endTime: '16:30', location: '', color: 'red',
      notes: [
        'End of ' + t.name + '. All coaches attend, right after the term reports are done.',
        '',
        'Agenda: how the term went, curriculum progress and assessment results, attendance, the changes to our services from the last round of "What Can We Change?" answers, and the plan for the next term.',
      ].join('\n'),
    });
  });
  return out;
}

// ---------------------------------------------------------------------------------
// TRAINING SCHEDULE. We train every Tuesday and Thursday, so one entry always shows on both
// days: a practice, a short session, or "No Practice" with the reason.
//   Until Nov 20          practice 5:00 to 6:15 (Nov 1 to Nov 20 booked on Plano city fields)
//   Nov 21 to Nov 29      Thanksgiving week, no practice
//   Nov 30 to Dec 14      cardio once a week, Saturday or Sunday
//   Dec 15 to Dec 20      no practice
//   Dec 21 to Jan 4       practice early, 4:30 to 5:30
//   Jan 5 to Jan 18       Tuesday cardio, Thursday 5:00 to 5:45 skirmishes only
//   Jan 19 to Feb 14      regular time, 5:00 to 6:00
//   Feb 15 onward         back to 5:00 to 6:15
//   Every July            break
//   Dec 2027 onward       break
//   Mar 1 2027            PIT Plano negotiations
// ---------------------------------------------------------------------------------
const TRAIN_FIRST_DAY = '2026-10-11';
const TRAIN_LAST_DAY = '2028-12-31';
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const BASE_NOTE = 'Every practice starts with laps around the field and ends with 1 v 1. Coaches: take attendance at the start and the end, follow the curriculum and the coaching summary, and use the Practice Field plan to stay organized.';

// What happens on a Tuesday (dow 2) or Thursday (dow 4).
function tuThPhase(date, dow) {
  const off = (label) => ({ kind: 'off', label });
  if (date >= '2027-12-01') return off('Break (December 2027 onward)');
  if (date.slice(5, 7) === '07') return off('July break');
  if (date >= '2026-11-21' && date <= '2026-11-29') return off('Thanksgiving week, no practice');
  if (date >= '2026-11-30' && date <= '2026-12-20') return off(date <= '2026-12-14' ? 'Cardio weeks: cardio once a week on Saturday or Sunday only' : 'No practice this week');
  if (date >= '2026-12-21' && date <= '2027-01-04') return { kind: 'practice', start: '16:30', end: '17:30', title: 'Early Practice', note: 'Early winter practice, 4:30 to 5:30 PM (December 21 to January 4).' };
  if (date >= '2027-01-05' && date <= '2027-01-18') {
    return dow === 2
      ? { kind: 'practice', start: '17:00', end: '17:45', title: 'Tuesday Cardio', where: 'Allen / Techiya', note: 'Tuesday cardio session, 5:00 to 5:45 PM (January 5 to January 18).' }
      : { kind: 'practice', start: '17:00', end: '17:45', title: 'Thursday Skirmishes', note: '45 minutes, 5:00 to 5:45 PM, skirmishes only (January 5 to January 18).' };
  }
  if (date >= '2027-01-19' && date <= '2027-02-14') return { kind: 'practice', start: '17:00', end: '18:00', note: 'Regular winter time, 5:00 to 6:00 PM, until February 14.' };
  const plano = date >= '2026-11-01' && date <= '2026-11-20';
  return {
    kind: 'practice', start: '17:00', end: '18:15',
    where: plano ? 'Plano city field (booked on Plano, lights needed)' : '',
    note: plano
      ? '5:00 to 6:15 PM. Nov 1 to Nov 20: booked on Plano city fields. Daylight saving has ended, so it is dark early (sunset about 5:30) and we need the lights. Plano books 2 to 10 days ahead and only one practice per week, so confirm how the second weekly practice is covered.'
      : '5:00 to 6:15 PM.',
  };
}

function trainingDays() {
  const out = [];
  for (let d = new Date(TRAIN_FIRST_DAY + 'T00:00:00Z'); iso(d) <= TRAIN_LAST_DAY; d = new Date(d.getTime() + 86400000)) {
    const dow = d.getUTCDay();
    const date = iso(d);
    if (dow === 2 || dow === 4) {
      const name = DAY_NAMES[dow];
      const ph = tuThPhase(date, dow);
      if (ph.kind === 'practice') {
        out.push({
          id: 'fx-train-' + date, fixed: true, title: ph.title || (name + ' Practice'), date,
          startTime: ph.start, endTime: ph.end, location: ph.where || '', color: 'green',
          notes: ['We train every Tuesday and Thursday.', ph.note, '', BASE_NOTE].join('\n'),
        });
      } else {
        out.push({
          id: 'fx-train-' + date, fixed: true, title: 'No Practice: ' + name, date,
          startTime: '17:00', endTime: '18:15', location: '', color: 'gray',
          notes: ph.label + '. We normally train every Tuesday and Thursday; this one is off.',
        });
      }
    }
    // Cardio weeks, Nov 30 to Dec 14: one cardio session a week, Saturday or Sunday.
    if (dow === 6 && date >= '2026-11-30' && date <= '2026-12-14') {
      out.push({
        id: 'fx-cardio-' + date, fixed: true, title: 'Weekly Cardio (Sat or Sun)', date,
        startTime: '17:00', endTime: '18:00', location: '', color: 'blue',
        notes: 'Cardio weeks (December 1 to 14): one cardio session a week, on Saturday or Sunday, whichever suits the group. No field booking is needed.',
      });
    }
  }
  return out;
}

function trainingMarkers() {
  const m = (id, date, title, color, notes) => ({
    id: 'fx-' + id, fixed: true, title, date, startTime: '09:00', endTime: '09:30', location: '', color, notes,
  });
  const out = [
    m('seasonclose-2026-11-21', '2026-11-21', 'Season Close', 'red',
      'Thanksgiving week: no practice (November 21 to 29). Cardio weeks follow from December 1.'),
    m('early-2026-12-21', '2026-12-21', 'Early Practice Starts', 'green', 'December 21 to January 4: Tuesday and Thursday practice, early, 4:30 to 5:30 PM.'),
    m('jan-2027-01-05', '2027-01-05', 'Short Sessions Start', 'green', 'January 5 to January 18: Tuesday cardio, Thursday 5:00 to 5:45 PM skirmishes only.'),
    m('resume-2027-01-19', '2027-01-19', 'Regular Winter Time', 'green', 'January 19 to February 14: Tuesday and Thursday practice, 5:00 to 6:00 PM.'),
    m('full-2027-02-15', '2027-02-15', 'Back to 5:00 to 6:15', 'green', 'From February 15: Tuesday and Thursday practice goes back to 5:00 to 6:15 PM.'),
    m('pit-2027-03-01', '2027-03-01', 'PIT Plano Negotiations', 'gold',
      'PIT Plano (next to Epic Masjid) starts club field negotiations in March. Call (972) 294-5569 and ask for: the hourly rate for one lit grass field, a discount for a weekly slot for the full season, whether lights and parking are included, the rain policy, and the insurance they need. Our planning estimate is about $60 per hour; their real price is not published.'),
  ];
  for (const y of [2027, 2028]) {
    out.push(m('julybreak-' + y + '-07-01', y + '-07-01', 'July Break Starts', 'gray', 'No Tuesday or Thursday practice in July.'));
  }
  out.push(m('break-2027-12-01', '2027-12-01', 'Break Starts (December 2027 onward)', 'gray', 'The program is on break from December 2027 onward.'));
  return out;
}

function fixedEvents() {
  return [...socialPosts(), ...outings(), ...termDays(), ...trainingDays(), ...trainingMarkers()];
}

module.exports = { fixedEvents, BREAKS, TERMS };
