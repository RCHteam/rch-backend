// The Pre-K curriculum (11 chapters), loaded into Coaches > Our Curriculum the first time the server
// starts with no Pre-K chapters. After that it is edited in the admin and never overwritten.
const PREK_CHAPTERS = [
 {
  "n": 1,
  "title": "The Game and the Environment",
  "short": "Game & Environment",
  "lead": "Orientation. Players learn the field, the equipment, the routines and the people. Safety and belonging come before skill.",
  "objectives": [
   "Name and point to the goal, sideline and middle of the field",
   "Follow a simple routine: bag, shin guards, water, line up",
   "Separate from parents and join the group within the first 10 minutes"
  ],
  "outcomes": [
   "Arrives ready to play with minimal prompting",
   "Knows the names of coach and at least two teammates",
   "Understands a stop signal (whistle, \"freeze\")"
  ],
  "check": "Child can point to the goal and sideline and respond to the stop signal.",
  "levels": [
   "Names the parts of the field and follows the start routine",
   "Packs own kit and joins the circle without prompting",
   "Knows the team name, chant and two teammates by name",
   "Follows the stop signal and group instructions during games",
   "Helps set up cones and balls",
   "Leads the warm-up routine for the group"
  ]
 },
 {
  "n": 2,
  "title": "Movement Foundations",
  "short": "Movement",
  "lead": "Fundamental movement skills are the base for every sport. Balance, running, stopping, jumping and hopping come before ball technique.",
  "objectives": [
   "Balance on one foot for about 5 seconds on each side",
   "Run, change direction and stop on signal without falling",
   "Jump with two feet and land softly with bent knees"
  ],
  "outcomes": [
   "Controlled stopping on a visual or sound cue",
   "Hops on both feet, alternating",
   "Confident running in a crowded space without contact"
  ],
  "check": "Child balances 5 seconds on each foot and stops on signal within two steps.",
  "levels": [
   "Balances 3 s on each foot; stops on signal",
   "Balances 5 s; jumps with two feet and lands softly",
   "Hops on each foot; runs and changes direction",
   "Balances while holding a ball; stops within two steps",
   "Combines run, jump and stop in a circuit",
   "Moves with agility in a crowded space without contact"
  ]
 },
 {
  "n": 3,
  "title": "Ball Familiarization",
  "short": "Ball Familiarization",
  "lead": "The ball becomes familiar. Players learn the surfaces of the foot and make hundreds of touches in a short time.",
  "objectives": [
   "Name sole, inside and laces; use each deliberately",
   "Perform toe taps and sole rolls with both feet",
   "Keep the ball in a small area for several touches"
  ],
  "outcomes": [
   "Comfortable moving with a ball in a crowded space",
   "Uses both feet in play",
   "Starts to self-correct touch strength"
  ],
  "check": "Child can name three foot surfaces and perform 20 toe taps in 30 seconds.",
  "levels": [
   "Names sole, inside, laces; 10 toe taps",
   "20 toe taps; rolls the ball with the sole using both feet",
   "30 touches in 30 s with the inside of the foot",
   "Keeps the ball inside a small zone for 20 s",
   "Mixes sole, inside and laces on call",
   "Touches with both feet at pace with eyes up"
  ]
 },
 {
  "n": 4,
  "title": "Dribbling and Awareness",
  "short": "Dribbling",
  "lead": "Moving with the ball under control while seeing the environment. Head up, change of direction and use of space.",
  "objectives": [
   "Dribble with small touches in a straight line and around cones",
   "Look up between touches to find space",
   "Change direction with the inside and outside of the foot"
  ],
  "outcomes": [
   "Keeps the ball close at moderate pace",
   "Avoids other players while dribbling",
   "Chooses open space"
  ],
  "check": "Child dribbles through 5 cones without losing the ball and glances up at least twice.",
  "levels": [
   "Walks with the ball under control",
   "Dribbles through 3 cones",
   "Dribbles 5 cones and looks up twice",
   "Dribbles through gates in a crowd",
   "Changes direction to escape a shark",
   "Dribbles at pace and picks open space"
  ]
 },
 {
  "n": 5,
  "title": "Receiving and Control",
  "short": "Receiving",
  "lead": "Stopping and controlling the ball under pressure of time. Cushioning, positioning the body and first touch.",
  "objectives": [
   "Stop a rolled ball with the sole or the inside of the foot",
   "Cushion the ball by relaxing the receiving foot",
   "Drag the ball back and turn"
  ],
  "outcomes": [
   "Controls a rolled ball within one step",
   "Positions the body behind the line of the ball",
   "Starts to receive with the inside rather than the toe"
  ],
  "check": "Child stops 4 out of 5 slow rolled balls within one step.",
  "levels": [
   "Stops a slow rolled ball with the sole",
   "Controls 5 of 10 slow rolls",
   "Cushions with the inside of the foot",
   "Receives and drags back to turn",
   "Controls a ball played at medium pace",
   "Receives while moving and plays on"
  ]
 },
 {
  "n": 6,
  "title": "Passing and Cooperation",
  "short": "Passing",
  "lead": "The first team skill. Passing with the inside of the foot, calling for the ball and moving to a new position.",
  "objectives": [
   "Pass accurately to a partner 5 yards away using the inside of the foot",
   "Call for the ball and make eye contact",
   "Move after passing"
  ],
  "outcomes": [
   "Passes and receives in pairs and threes",
   "Shares the ball in small groups",
   "Understands \"pass and move\""
  ],
  "check": "Child makes 5 of 10 passes to a partner using the inside of the foot.",
  "levels": [
   "Rolls a pass to a partner 3 yards away",
   "5 of 10 inside-foot passes at 5 yards",
   "Calls the name and looks before passing",
   "Passes and moves in a triangle",
   "Passes in 3 v 1 under light pressure",
   "Chooses to pass in a small game"
  ]
 },
 {
  "n": 7,
  "title": "Shooting and Scoring",
  "short": "Shooting",
  "lead": "Striking the ball with the laces toward a target, scoring goals and celebrating respectfully.",
  "objectives": [
   "Strike a ball with the laces toward a goal",
   "Aim at corners and targets",
   "Follow through with the kicking leg"
  ],
  "outcomes": [
   "Shoots after a short dribble",
   "Shoots with either foot",
   "Celebrates scoring without disrespect"
  ],
  "check": "Child hits the target area with 4 out of 10 shots from 8 yards.",
  "levels": [
   "Strikes a still ball with the laces at a big goal",
   "Plants the foot beside the ball and follows through",
   "Hits corner targets 3 of 10",
   "Shoots with the weaker foot",
   "Dribbles three touches, then shoots",
   "Shoots in a game without hesitation"
  ]
 },
 {
  "n": 8,
  "title": "Attacking and Defending in 1 v 1",
  "short": "1 v 1",
  "lead": "The first duel. Attackers use simple moves to beat a defender; defenders stay between ball and goal and win the ball safely.",
  "objectives": [
   "Perform a simple fake and accelerate past a defender",
   "Defend by staying goal-side and getting low",
   "Switch roles at the moment possession changes"
  ],
  "outcomes": [
   "Attempts to beat a defender in 1 v 1",
   "Presses and tries to poke the ball away without fouling",
   "Moves from attack to defence quickly"
  ],
  "check": "Child attempts a fake in a 1 v 1 and stays on feet when defending.",
  "levels": [
   "Plays chase games: attackers run, defenders follow",
   "Fakes at a cone, then accelerates",
   "Stays goal-side in a shadow game",
   "Pokes a still ball away with the toe",
   "Attempts a fake in a live 1 v 1",
   "Switches from attack to defense fast in 2 v 2"
  ]
 },
 {
  "n": 9,
  "title": "Rules and Fair Play",
  "short": "Rules & Fair Play",
  "lead": "Learning the basic laws through play and building the habits of sportsmanship, respect and listening.",
  "objectives": [
   "Respond to a whistle by stopping and listening",
   "Perform a legal throw-in with two hands",
   "Understand that only the goalkeeper uses hands"
  ],
  "outcomes": [
   "Respects the referee and coach",
   "Shakes hands after the game",
   "Takes turns and shares"
  ],
  "check": "Child stops on whistle and performs a throw-in with two hands.",
  "levels": [
   "Stops and listens on the whistle",
   "Throws in with two hands over the head",
   "Knows hands are for the goalkeeper only",
   "Understands out of bounds and restarts",
   "Shows fair play: handshake, helps a friend up",
   "Referees a short game"
  ]
 },
 {
  "n": 10,
  "title": "The Team Game",
  "short": "Team Game",
  "lead": "Bringing it together in small-sided games. Basic roles, spreading out, shared spaces and team culture.",
  "objectives": [
   "Spread out to create space",
   "Try different roles including goalkeeper",
   "Play a complete small-sided game with simple rules"
  ],
  "outcomes": [
   "Moves into space without the ball",
   "Passes, dribbles and shoots in a game setting",
   "Enjoys playing with the team"
  ],
  "check": "Child plays in a small-sided game, spreads out and tries at least two roles.",
  "levels": [
   "Joins a small game",
   "Spreads out when reminded",
   "Spreads out without prompts",
   "Tries a second role",
   "Plays one role through a full game",
   "Shows team shape and spirit in a 4 v 4"
  ]
 },
 {
  "n": 11,
  "title": "Goalkeeper Basics",
  "short": "Goalkeeper",
  "lead": "A first, playful introduction to goalkeeping. Every child tries it. Ready position, stopping rolled balls, picking the ball up and rolling it out.",
  "objectives": [
   "Take a ready position with hands in front and knees bent",
   "Stop and pick up a rolled ball with both hands",
   "Roll the ball out to a teammate or target"
  ],
  "outcomes": [
   "Tries the goalkeeper role without fear",
   "Uses hands only inside the goal area",
   "Calls \"keeper\" or \"mine\" when taking the ball"
  ],
  "check": "Child takes a ready position and stops a slow rolled ball with both hands, then rolls it out.",
  "levels": [
   "Takes the ready position",
   "Scoops a slow rolled ball with both hands",
   "Stops soft shots and hugs the ball",
   "Calls \"mine\" before taking the ball",
   "Rolls out to a cone after a save",
   "Saves, calls and distributes in a game"
  ]
 }
];

function chapterContent(c) {
  const lines = [];
  if (c.lead) lines.push(c.lead, '');
  lines.push('Objectives:');
  c.objectives.forEach((x) => lines.push('- ' + x));
  lines.push('', 'Expected outcomes:');
  c.outcomes.forEach((x) => lines.push('- ' + x));
  if (c.levels && c.levels.length) {
    lines.push('', 'Six levels across the year:');
    c.levels.forEach((x, i) => lines.push('L' + (i + 1) + ': ' + x));
  }
  return lines.join('\n');
}

async function seedPrekCurriculum(pool) {
  const have = await pool.query("SELECT COUNT(*)::int AS n FROM curriculum_chapters WHERE grade = 'pre-k'");
  if (have.rows[0].n > 0) return false;
  for (const c of PREK_CHAPTERS) {
    await pool.query(
      "INSERT INTO curriculum_chapters (grade, position, title, content, assessment) VALUES ('pre-k', $1, $2, $3, $4)",
      [c.n, c.title, chapterContent(c), c.check || '']
    );
  }
  return true;
}

module.exports = { seedPrekCurriculum, PREK_CHAPTERS };
