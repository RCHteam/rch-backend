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

// 1st of every month: reminder to download the attendance sheets.
function attendanceReminders() {
  const out = [];
  for (let y = 2026; y <= 2028; y++) {
    for (let m = 1; m <= 12; m++) {
      const date = `${y}-${pad(m)}-01`;
      if (date < '2026-11-01') continue;
      out.push({
        id: 'fx-attendance-' + date, fixed: true, title: 'Download Attendance Sheets', date,
        startTime: '09:00', endTime: '09:30', location: '', color: 'gold',
        notes: [
          'Fixed date: the 1st of every month.',
          '',
          'Coaches > Documents > Attendance: choose the grade and this month, then download the PDF sheet for every grade.',
          'Print them (or load them on the coaches\' tablets) before the first practice of the month.',
          'Last month\'s completed sheets: file them, and enter any missing attendance.',
        ].join('\n'),
      });
    }
  }
  return out;
}

// ---------------------------------------------------------------------------------
// TRAINING SCHEDULE. We train every Tuesday and Thursday, so one of these always shows
// on both days. Which kind it is comes from the rules below (the handwritten plan).
//   Nov 1 to Nov 20      practice on Plano city fields (lights needed, sunset about 5:30)
//   Nov 21               season close, Thanksgiving week off
//   Dec 1 to Dec 20      no field practice, cardio on Saturday and Sunday
//   Dec 21 to Jan 4      break
//   Jan 5 to Jan 18      cardio on Saturday and Sunday (Allen / Techiya)
//   Jan 19 onward        Tuesday and Thursday practice again
//   Every July           break
//   Dec 2027 onward      break
//   Mar 1 2027           PIT Plano negotiations
// ---------------------------------------------------------------------------------
const TRAIN_START = '17:00';
const TRAIN_END = '18:15'; // 1 hour 15 minutes
// Dec 1 to Jan 19 the session is shortened to 5:00 to 6:00 PM.
const WINTER_END = '18:00';
const TRAIN_FIRST_DAY = '2026-10-11';
const TRAIN_LAST_DAY = '2028-12-31';

// Returns { kind, label } for a date: 'practice' | 'off' | 'break'
function trainingPhase(date) {
  if (date >= '2027-12-01') return { kind: 'break', label: 'Break (December 2027 onward)' };
  if (date.slice(5, 7) === '07') return { kind: 'break', label: 'July break' };
  if (date >= '2026-11-21' && date <= '2026-11-30') return { kind: 'off', label: 'Season closed, Thanksgiving week' };
  if (date >= '2026-12-01' && date <= '2026-12-20') return { kind: 'off', label: 'Off-season, weekend cardio only' };
  if (date >= '2026-12-21' && date <= '2027-01-04') return { kind: 'break', label: 'Winter break' };
  if (date >= '2027-01-05' && date <= '2027-01-18') return { kind: 'off', label: 'Off-season, weekend cardio only' };
  if (date >= '2026-11-01' && date <= '2026-11-20') return { kind: 'practice', where: 'Plano city field (booked on Plano, lights needed)' };
  return { kind: 'practice', where: '' };
}

function trainingDays() {
  const out = [];
  for (let d = new Date(TRAIN_FIRST_DAY + 'T00:00:00Z'); iso(d) <= TRAIN_LAST_DAY; d = new Date(d.getTime() + 86400000)) {
    const dow = d.getUTCDay();
    const date = iso(d);
    const ph = trainingPhase(date);
    if (dow === 2 || dow === 4) {
      const name = dow === 2 ? 'Tuesday' : 'Thursday';
      if (ph.kind === 'practice') {
        const plano = date >= '2026-11-01' && date <= '2026-11-20';
        out.push({
          id: 'fx-train-' + date, fixed: true, title: name + ' Practice', date,
          startTime: TRAIN_START, endTime: TRAIN_END, location: ph.where, color: 'green',
          notes: [
            'We train every Tuesday and Thursday, 5:00 to 6:15 PM. Every practice starts with laps around the field and ends with 1 v 1.',
            plano ? '' : null,
            plano ? 'Nov 1 to Nov 20: booked on Plano city fields. Daylight saving has ended, so it is dark early (sunset about 5:30) and we need the lights.' : null,
            plano ? 'Plano books 2 to 10 days ahead and only one practice per week, so confirm how the second weekly practice is covered.' : null,
            '',
            'Coaches: take attendance at the start and the end, follow the curriculum and the coaching summary, and use the Practice Field plan to stay organized.',
          ].filter((x) => x !== null).join('\n'),
        });
      } else {
        out.push({
          id: 'fx-train-' + date, fixed: true, title: 'No Practice: ' + name, date,
          startTime: TRAIN_START, endTime: (date >= '2026-12-01' && date <= '2027-01-19') ? WINTER_END : TRAIN_END, location: '', color: 'gray',
          notes: ph.label + '. We normally train every Tuesday and Thursday; this one is off.',
        });
      }
    }
    if ((dow === 6 || dow === 0) && ph.kind === 'off' && (date <= '2026-12-20' ? date >= '2026-12-01' : true)) {
      const jan = date >= '2027-01-05';
      out.push({
        id: 'fx-cardio-' + date, fixed: true, title: 'Weekend Cardio' + (jan ? ': Allen / Techiya' : ''), date,
        startTime: TRAIN_START, endTime: WINTER_END, location: jan ? 'Allen / Techiya' : '', color: 'blue',
        notes: [
          'Off-season cardio, Saturday and Sunday, 5:00 to 6:00 PM. No field booking is needed.',
          jan ? 'January cardio is at Allen / Techiya.' : null,
        ].filter((x) => x !== null).join('\n'),
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
      'Last day of the fall season (Thanksgiving week off). Weekend cardio runs from December 1.'),
    m('break-2026-12-21', '2026-12-21', 'Break Starts', 'gray', 'Winter break, December 21 to January 4. No practice and no cardio.'),
    m('resume-2027-01-19', '2027-01-19', 'Practice Resumes', 'green', 'Tuesday and Thursday practice, 5:00 to 6:15 PM, starts again. January cardio at Allen / Techiya ran from January 5.'),
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
  return [...socialPosts(), ...outings(), ...termDays(), ...attendanceReminders(), ...trainingDays(), ...trainingMarkers()];
}

module.exports = { fixedEvents, BREAKS, TERMS };
