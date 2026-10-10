// The chapter lists of the coaches' curriculum pages (curriculum-prek.html, curriculum-kindergarten.html,
// curriculum-1st-grade.html, ... curriculum-4th-grade.html). They are copied into Coaches > Our Curriculum so the Student Report can offer
// each grade's chapters and assessment checks. On every start the saved chapters are brought in line with
// these lists (matched by chapter number), so a new version of a curriculum page updates the report choices.
const CURRICULA = {
 "pre-k": [
  {
   "n": 1,
   "title": "The Game and the Environment",
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
   "check": "Child can point to the goal and sideline and respond to the stop signal."
  },
  {
   "n": 2,
   "title": "Movement Foundations",
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
   "check": "Child balances 5 seconds on each foot and stops on signal within two steps."
  },
  {
   "n": 3,
   "title": "Ball Familiarization",
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
   "check": "Child can name three foot surfaces and perform 20 toe taps in 30 seconds."
  },
  {
   "n": 4,
   "title": "Dribbling and Awareness",
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
   "check": "Child dribbles through 5 cones without losing the ball and glances up at least twice."
  },
  {
   "n": 5,
   "title": "Receiving and Control",
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
   "check": "Child stops 4 out of 5 slow rolled balls within one step."
  },
  {
   "n": 6,
   "title": "Passing and Cooperation",
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
   "check": "Child makes 5 of 10 passes to a partner using the inside of the foot."
  },
  {
   "n": 7,
   "title": "Shooting and Scoring",
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
   "check": "Child hits the target area with 4 out of 10 shots from 8 yards."
  },
  {
   "n": 8,
   "title": "Attacking and Defending in 1 v 1",
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
   "check": "Child attempts a fake in a 1 v 1 and stays on feet when defending."
  },
  {
   "n": 9,
   "title": "Rules and Fair Play",
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
   "check": "Child stops on whistle and performs a throw-in with two hands."
  },
  {
   "n": 10,
   "title": "The Team Game",
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
   "check": "Child plays in a small-sided game, spreads out and tries at least two roles."
  },
  {
   "n": 11,
   "title": "Goalkeeper Basics",
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
   "check": "Child takes a ready position and stops a slow rolled ball with both hands, then rolls it out."
  }
 ],
 "kindergarten": [
  {
   "n": 1,
   "title": "Team Environment and Routines",
   "lead": "The environment is the first coach. Kindergarten players now run the routines themselves, learn the field as three thirds, agree on three team rules and set a personal try-it goal.",
   "objectives": [
    "Run the arrival routine without prompts: kit, water, circle, buddy",
    "Name the three thirds of the field (home, middle, away) and run to each on call",
    "Say the three team rules in their own words and show one in action",
    "Take a small job each practice: cone captain, ball captain or water captain"
   ],
   "outcomes": [
    "Joins the circle within one minute of the call",
    "Responds to three signals: freeze, circle up, go",
    "Names two teammates and one thing a teammate did well",
    "Describes how they feel with the weather check (sunny, cloudy, stormy)"
   ],
   "check": "Child names home, middle and away, uses the three signals and does a job without being asked."
  },
  {
   "n": 2,
   "title": "Movement and Agility",
   "lead": "The athletic base of every sport. Kindergarten players skip, gallop, hop and change direction with rhythm, react to what they see and add the ball to the movement.",
   "objectives": [
    "Skip and gallop with a smooth rhythm for 15 yards",
    "Balance on one foot for about 8 to 10 seconds on each side",
    "Plant the outside foot and push off to change direction on a signal",
    "Land softly from a jump or hop and stop in balance"
   ],
   "outcomes": [
    "Moves in a crowded space without contact",
    "Reacts to a visual signal (mirror a partner, a hand sign)",
    "Keeps good balance while holding or touching a ball",
    "Shows both left and right sides in movement games"
   ],
   "check": "Child balances 8 seconds on each foot, skips smoothly and plants and cuts on a signal."
  },
  {
   "n": 3,
   "title": "Ball Mastery",
   "lead": "Hundreds of touches every practice. Kindergarten players use the sole, the inside, the outside and the laces, link two moves into a pattern, and use both feet.",
   "objectives": [
    "Use the sole, the inside, the outside and the laces on call",
    "Link two moves (for example sole roll, then inside push) without stopping",
    "Reach about 40 touches in 30 seconds with the inside of the foot",
    "Use the weaker foot for half of the touches"
   ],
   "outcomes": [
    "Moves with the ball in a crowded space without leaving the zone",
    "Touches the ball on every step when asked",
    "Changes direction with inside and outside touches",
    "Starts to repeat a pattern in rhythm"
   ],
   "check": "Child names four foot surfaces and reaches about 40 touches in 30 seconds with the inside."
  },
  {
   "n": 4,
   "title": "Dribbling and Awareness",
   "lead": "Moving with the ball at different speeds, turning, protecting it and looking up to choose space. Kindergarten players add speed changes, three turns and shielding.",
   "objectives": [
    "Dribble through 8 cones without a stray touch",
    "Change speed on a signal: slow, slow, zoom",
    "Perform three turns: inside hook, drag back and stop-turn",
    "Shield the ball with the body for about 5 seconds"
   ],
   "outcomes": [
    "Keeps the ball within a stride at medium speed",
    "Looks up and reports what they saw (a color, a number)",
    "Chooses open space in a crowded area",
    "Protects the ball when a chaser comes close"
   ],
   "check": "Child dribbles through 8 cones, turns on a signal and shields the ball for 5 seconds."
  },
  {
   "n": 5,
   "title": "Receiving and Control",
   "lead": "Controlling a passed ball and a ball that bounces, then using the first touch to go where you want. Kindergarten moves from stopping rolled balls to controlling moving balls.",
   "objectives": [
    "Control a passed ball from 5 to 8 yards with the sole or the inside",
    "Take the first touch to the side, away from a cone or defender",
    "Control a ball after one bounce with the sole or inside",
    "Take one quick look before the ball arrives"
   ],
   "outcomes": [
    "Meets the ball rather than waiting for it",
    "Keeps the ball within one stride after the first touch",
    "Shows the side of the body (open body) when receiving",
    "Plays the next touch with purpose"
   ],
   "check": "Child controls 5 of 10 passes from 6 yards and takes a first touch to the side."
  },
  {
   "n": 6,
   "title": "Passing and Combination",
   "lead": "Passing becomes a team tool. Kindergarten players pass accurately with the inside of the foot, support at an angle, play a give-and-go and pass under light pressure.",
   "objectives": [
    "Pass accurately with the inside of the foot from 8 yards",
    "Move to an angle to support a teammate who has the ball",
    "Play a give-and-go off a cone wall or a teammate",
    "Pass and receive in a 3 v 1 or 4 v 2 with light pressure"
   ],
   "outcomes": [
    "Chooses a pass when it is the best option",
    "Uses the right weight so the pass reaches the teammate",
    "Calls the name and moves after the pass",
    "Understands \"pass and move\""
   ],
   "check": "Child makes 6 of 10 accurate inside passes from 8 yards and supports at an angle."
  },
  {
   "n": 7,
   "title": "Shooting and Finishing",
   "lead": "Every child scores often. Kindergarten players shoot with a run-up, finish with the inside of the foot, shoot after dribbling or receiving, and follow the shot for a rebound.",
   "objectives": [
    "Strike a ball with the laces after a 2 to 3 step run-up",
    "Finish at close range with the inside of the foot",
    "Shoot after a dribble and after receiving a pass",
    "Follow the shot and play the rebound"
   ],
   "outcomes": [
    "Shoots with either foot",
    "Aims for a corner of the goal, not just the middle",
    "Keeps playing after a shot",
    "Chooses to shoot when there is a clear view of the goal"
   ],
   "check": "Child hits the target area with 5 of 10 shots from 10 yards with the laces and finishes with the inside."
  },
  {
   "n": 8,
   "title": "1 v 1 Attack and Defend",
   "lead": "1 v 1 is the heart of the program and the finale of every practice. Attackers learn two moves and a change of pace; defenders learn to approach, slow down, stay side-on and win the ball safely.",
   "objectives": [
    "Perform two moves (a shoulder fake and an inside-outside cut) and accelerate",
    "Defend by approaching quickly, slowing down and staying low and side-on (jockeying)",
    "Force the attacker to one side and win the ball safely with a poke",
    "After winning the ball, attack the other way at once (win and go)"
   ],
   "outcomes": [
    "Attempts to beat a defender in every 1 v 1",
    "Stays on feet when defending",
    "Switches from attack to defense within two seconds",
    "Accepts winning and losing duels with kindness"
   ],
   "check": "Child attempts two different moves in a live 1 v 1 and stays on their feet when defending."
  },
  {
   "n": 9,
   "title": "Rules, Fair Play and Character",
   "lead": "Rules are learned in play. Kindergarten players know the restarts, the simple fouls and the referee signals, take turns as referee, settle small disputes themselves and show good sportsmanship.",
   "objectives": [
    "Restart correctly after the ball goes out: throw-in or kick-in, goal kick and corner",
    "Know the kick-off and the free kick after a foul (hands, push, trip)",
    "Read and give three referee signals",
    "Settle a small dispute with a simple method before asking an adult"
   ],
   "outcomes": [
    "Takes a turn as referee and supports the referee’s decisions",
    "Shows fair play: handshake, helping a player up, saying \"good game\"",
    "Uses growth words (\"not yet\", \"I will try again\")",
    "Handles losing a game without leaving the group"
   ],
   "check": "Child restarts the game with the correct restart, gives and follows a referee signal and shakes hands after the game."
  },
  {
   "n": 10,
   "title": "The Team Game",
   "lead": "Small-sided games are the classroom. Kindergarten players spread out, support the ball, close down together and rotate through every role in four-goal 3 v 3 and 4 v 4.",
   "objectives": [
    "Spread out when the team has the ball so there is space and angles",
    "Support: stand one pass away from the ball carrier",
    "Close down together: the nearest player presses and a teammate covers behind",
    "Rotate through every role, including goalkeeper"
   ],
   "outcomes": [
    "Moves into space without the ball",
    "Passes, dribbles and shoots in a game setting",
    "Names who is \"first defender\" and who is \"helper\"",
    "Enjoys playing with changing teammates"
   ],
   "check": "Child spreads out, supports a teammate and tries at least three roles in a small-sided game."
  },
  {
   "n": 11,
   "title": "Goalkeeper Fundamentals",
   "lead": "Every child tries goalkeeping. Kindergarten adds catching at chest height, falling safely to the side from the knees, throwing and rolling out, and loud communication.",
   "objectives": [
    "Take a ready position with hands in front, knees bent and weight forward",
    "Catch a ball at chest height with hands behind the ball",
    "Fall to the side from the knees onto the side of the body",
    "Roll or throw the ball out to a teammate or target and call \"mine\""
   ],
   "outcomes": [
    "Tries the goalkeeper role without fear",
    "Stands in the middle of the goal when the ball is far away",
    "Uses hands only inside the goal area",
    "Calls \"mine\" or \"keeper\" before taking the ball"
   ],
   "check": "Child takes a ready position, catches a soft chest-high toss and rolls the ball out."
  }
 ],
 "1st-grade": [
  {
   "n": 1,
   "title": "Team Culture, Leadership and Fair Play",
   "lead": "The team belongs to the players. First graders write their own team agreement, take turns as leader of the day, run restarts, settle disagreements with a short method and learn to compare themselves with their own past, not with each other.",
   "objectives": [
    "Help write a team agreement of three promises and point to one in action",
    "Take a turn as leader of the day: lead the circle, one game and the pack-up",
    "Settle a small disagreement with the three steps: stop, say, solve",
    "Set a personal goal compared with your own last practice, not with a friend"
   ],
   "outcomes": [
    "Names the three team promises and gives an example of each",
    "Leads the circle for two minutes without help",
    "Uses “I feel … I want …” words in a disagreement",
    "Says one thing they improved since last week"
   ],
   "check": "Child names the team promises, leads a circle and settles a small disagreement with stop, say, solve."
  },
  {
   "n": 2,
   "title": "Athletic Movement",
   "lead": "The speed and agility window. First graders learn sprint starts, quick feet, reaction and soft landing, build body-weight strength, and begin a proper warm-up habit that protects them.",
   "objectives": [
    "Start a sprint from a ready position and run tall for 10 to 15 yards",
    "Step quickly over low markers with light feet",
    "React to a sight or sound signal and move in the right direction",
    "Land from a small jump balanced, knees soft, for two seconds"
   ],
   "outcomes": [
    "Runs 15 yards in a straight line with arms driving",
    "Completes a 6-marker quick-feet line without touching markers",
    "Reacts correctly to 4 of 5 signals",
    "Holds a balanced landing for 2 seconds on each foot"
   ],
   "check": "Child sprints 15 yards tall, steps through a 6-marker pattern, reacts to a signal and holds a landing for 2 seconds."
  },
  {
   "n": 3,
   "title": "Ball Mastery",
   "lead": "Close control with rhythm. First graders link three- and four-move sequences, change the tempo, use both feet equally and begin juggling with a bounce.",
   "objectives": [
    "Link four moves in a sequence with both feet",
    "Change tempo: slow, fast, stop on a signal",
    "Juggle with one bounce between touches",
    "Look up during a sequence and name what you saw"
   ],
   "outcomes": [
    "Does 54 touches in 30 seconds with the inside",
    "Shows a four-move sequence on either foot",
    "Keeps the ball up twice with a bounce",
    "Names a color or number while dribbling in place"
   ],
   "check": "Child links four moves on either foot, changes tempo on a call and keeps the ball up twice with a bounce."
  },
  {
   "n": 4,
   "title": "Dribbling and Moves",
   "lead": "Dribbling with purpose. First graders run with the ball at speed, change direction and pace, use two or three moves, shield the ball and look up to find space while dribbling.",
   "objectives": [
    "Dribble 10 yards at speed with the ball just in front",
    "Use two moves to change direction and pace",
    "Shield the ball for 5 seconds while a chaser tries to win it",
    "Look up twice during a dribble and tell where there was space"
   ],
   "outcomes": [
    "Clears 8 cones in a zigzag without a stray touch at pace",
    "Performs two moves in a live 1 v 1",
    "Keeps the ball for 5 seconds under a chaser",
    "Names the open space after a dribble"
   ],
   "check": "Child dribbles at speed, performs a fake or hook followed by a burst and keeps the ball for 5 seconds under a chaser."
  },
  {
   "n": 5,
   "title": "Receiving and First Touch",
   "lead": "Control the ball at pace. First graders control rolling and bouncing balls, take the first touch away from pressure, use the thigh on a bounce, check over the shoulder and receive and turn.",
   "objectives": [
    "Control a rolling pass at pace with the inside of either foot",
    "Take the first touch away from the nearest defender",
    "Control a bouncing ball with the thigh or inside",
    "Check over the shoulder before the ball arrives, then receive and turn"
   ],
   "outcomes": [
    "Controls 7 of 10 passes from 8 yards within one stride",
    "Takes the first touch into space away from a cone defender",
    "Controls a bounce with the thigh or inside",
    "Names the nearest player after a peek"
   ],
   "check": "Child controls 7 of 10 passes at pace, takes the first touch away from a defender and peeks before receiving."
  },
  {
   "n": 6,
   "title": "Passing",
   "lead": "Accurate passes at longer range. First graders drive the ball with the inside and the laces over 10 yards, try the outside of the foot, pass on the move, pass into space and pass under light pressure.",
   "objectives": [
    "Pass with the inside of the foot firmly and accurately over 10 yards",
    "Try an outside-of-the-foot pass and a driven pass with the laces",
    "Pass while moving and pass into space for a teammate to run on to",
    "Keep the ball in a 3 v 2 under light pressure"
   ],
   "outcomes": [
    "Passes 7 of 10 accurately from 10 yards",
    "Plays an outside-foot pass to a near cone",
    "Leads a runner with a pass in front",
    "Completes 5 passes in a 3 v 2"
   ],
   "check": "Child passes 7 of 10 accurately at 10 yards, leads a runner and completes 5 passes in a 3 v 2."
  },
  {
   "n": 7,
   "title": "Shooting and Finishing",
   "lead": "Shooting with power and placement. First graders strike with the instep, finish first time, choose a corner, shoot after a dribble and finish 1 v 1 against a goalkeeper.",
   "objectives": [
    "Strike the ball with the instep with a firm plant foot",
    "Finish a pass first time without stopping it",
    "Choose a corner and shoot to the far side",
    "Finish a 1 v 1 against a goalkeeper by shooting early"
   ],
   "outcomes": [
    "Hits 5 of 10 shots on target from 10 yards",
    "Shoots first time from a rolling pass",
    "Hits a marked corner in 3 of 10 attempts",
    "Shoots after a dribble without stopping"
   ],
   "check": "Child shoots 5 of 10 on target at 10 yards, finishes first time and shoots early in a 1 v 1."
  },
  {
   "n": 8,
   "title": "1 v 1 Attacking and Defending",
   "lead": "The most important duel. First graders attack with three moves and a burst, defend with a jockey and a block tackle, recover quickly and win the ball and go.",
   "objectives": [
    "Attack with three moves and finish with a burst",
    "Defend side-on, jockey and delay for three seconds",
    "Make a safe block tackle with the inside of the foot",
    "Recover after losing the ball and win it and go"
   ],
   "outcomes": [
    "Tries three different moves in a live 1 v 1",
    "Delays an attacker for 3 seconds",
    "Wins the ball with a block tackle without fouling",
    "Starts a counter right after winning the ball"
   ],
   "check": "Child attempts three moves, delays an attacker for 3 seconds and wins and goes after a safe tackle."
  },
  {
   "n": 9,
   "title": "Combinations: 2 v 1, 2 v 2, 3 v 2",
   "lead": "Two players working as one. This chapter is new in 1st grade: draw a defender and pass, take the give-and-go further, run past a teammate (the overlap), use width and move to a free space in 3 v 2.",
   "objectives": [
    "Draw a defender toward you, then pass to the free teammate",
    "Play a wall pass (give-and-go) and run into the space behind the defender",
    "Overlap: run past a teammate who has the ball and receive in space",
    "Use width in a 3 v 2 by spreading and finding the free player"
   ],
   "outcomes": [
    "Scores in 3 of 6 attempts in a 2 v 1",
    "Plays a wall pass and runs past the defender",
    "Calls “Overlap” and runs outside the ball carrier",
    "Chooses the free player in 4 of 6 attempts in a 3 v 2"
   ],
   "check": "Child draws a defender and passes in a 2 v 1, runs past after a wall pass and finds the free player in a 3 v 2."
  },
  {
   "n": 10,
   "title": "Game Intelligence: Seeing and Deciding",
   "lead": "Looking before acting. This chapter is new in 1st grade. Players learn a three-step scan routine, use shape and color cues, make if-then decisions and answer coaches’ questions about what they saw.",
   "objectives": [
    "Use the scan routine: look before, look during, look after",
    "Make a simple decision using an if-then cue",
    "Name what you saw after a play (space, teammate, defender)",
    "Answer a coach’s question with a short sentence"
   ],
   "outcomes": [
    "Peeks before receiving in 6 of 10 passes",
    "Chooses dribble, pass or shoot using a cue",
    "Names the open space after a play",
    "Answers “What did you see?” in one sentence"
   ],
   "check": "Child peeks before receiving, uses a simple cue to choose dribble, pass or shoot and names what they saw."
  },
  {
   "n": 11,
   "title": "Team Play: Shape, Roles and Transitions",
   "lead": "Playing as a team. First graders play front, middle and back jobs that rotate, switch quickly between attack and defense, make restarts into plays and enjoy ladder match days.",
   "objectives": [
    "Play front, middle and back jobs and rotate them",
    "Switch from attack to defense within three seconds of losing the ball",
    "Take a throw-in or kick-in as a small play",
    "Play a ladder match day with fair play and no standings"
   ],
   "outcomes": [
    "Rotates through every job in a practice",
    "Reacts to a lost ball within three seconds",
    "Chooses a short play at a restart",
    "Shakes hands and shows fair play after each match"
   ],
   "check": "Child plays every job in a match, switches within three seconds and shows fair play after each round."
  },
  {
   "n": 12,
   "title": "Goalkeeper",
   "lead": "Every child tries the gloves. First graders learn the set position and angles, catch with a W, dive and recover, distribute by rolling and throwing, and see how a goal child works in 4+1.",
   "objectives": [
    "Take a ready position and a step toward the ball",
    "Catch with a W-shape of the hands",
    "Dive to the side and get up quickly",
    "Roll or throw the ball to a teammate"
   ],
   "outcomes": [
    "Stops 8 of 10 shots from 8 yards",
    "Catches 6 of 10 chest-high shots with hands in a W",
    "Dives to the side from a crouch and recovers",
    "Rolls to a target within 3 yards 4 of 5 times"
   ],
   "check": "Child sets a ready position, catches with a W, dives from a crouch and rolls to a teammate."
  }
 ],
 "2nd-grade": [
  {
   "n": 1,
   "title": "Leadership, Roles and Fair Play",
   "lead": "Second graders move from taking part to taking responsibility. They elect rotating captains, own a role in every game, help run restarts with the real signals, work out disagreements with a short method and begin to set a small goal for the whole team.",
   "objectives": [
    "Take the captain role with a fair rotation and say the three captain jobs",
    "Wear a role bib in a game and name the job of that role",
    "Call and show restarts with the referee signals (ball out, goal, free kick, advantage)",
    "Use stop, say, solve with a teammate and set one team goal for the cycle"
   ],
   "outcomes": [
    "Names the three captain jobs and does one without help",
    "Says what the role bib means before the game starts",
    "Shows two referee signals and calls the restart",
    "Helps the team set a goal and says if it was reached"
   ],
   "check": "Child names the captain jobs, says what their bib means, shows two referee signals and takes part in stop, say, solve."
  },
  {
   "n": 2,
   "title": "Agility, Speed and Rhythm",
   "lead": "Athletic movement grows with new tools. Second graders use agility ladders and low hurdles, run longer sprints from varied starts, change direction at speed, react to a signal and time themselves against their own earlier result.",
   "objectives": [
    "Run through an agility ladder with quick, light feet in two or three patterns",
    "Clear low hurdles with a soft, balanced landing",
    "Sprint 15 to 20 yards from a standing, crouch or lying start",
    "React to a sight or sound signal and cut in the called direction"
   ],
   "outcomes": [
    "Runs a ladder pattern without touching the rungs",
    "Lands from a hurdle hop and holds for two seconds",
    "Sprints 15 yards tall and compares with their own time",
    "Reacts to a signal in 3 of 4 tries"
   ],
   "check": "Child runs a ladder pattern cleanly, lands from a hurdle with balance, sprints 15 yards tall and reacts to a signal."
  },
  {
   "n": 3,
   "title": "Control, Dribbling and Change of Pace",
   "lead": "Ball mastery and dribbling join in 2nd grade. Players dribble with both feet around poles and cones, change pace and direction with a cut, a drag back or a simple step-over, shield from a chaser and look up to find space.",
   "objectives": [
    "Dribble around poles and cones on both feet at a steady pace",
    "Use a cut, a drag back and a simple step-over to change direction",
    "Change pace twice in one run: slow, fast, slow",
    "Shield the ball from a chaser and look up to find space"
   ],
   "outcomes": [
    "Dribbles six poles with no stray touch on either foot",
    "Shows a cut, a drag back and a step-over in a sequence",
    "Changes pace on a call twice in 20 yards",
    "Shields for 5 seconds and turns away from a chaser"
   ],
   "check": "Child dribbles six poles with both feet, shows a cut, drag back and step-over, changes pace twice and shields for five seconds."
  },
  {
   "n": 4,
   "title": "Receiving, Turning and Orientation",
   "lead": "Receiving moves from stopping the ball to using the first touch to set up the next action. Second graders use a rebound board, receive across the body, take a directional first touch, receive and turn and peek before the ball arrives.",
   "objectives": [
    "Control a pass from the board or a partner with either foot and in the called direction",
    "Receive across the body with the far foot and open the hips",
    "Take a first touch that moves the ball into the next action",
    "Peek before the ball arrives and receive and turn away from a passive defender"
   ],
   "outcomes": [
    "Controls 7 of 10 balls from the rebound board within one stride",
    "Receives across the body and plays on with the next touch",
    "Peeks in 6 of 10 passes before the ball arrives",
    "Receives and turns past a passive defender in 4 of 6 tries"
   ],
   "check": "Child controls balls from a rebound board, receives across the body, takes a directional touch and receives and turns."
  },
  {
   "n": 5,
   "title": "Passing Range, Patterns and Weight",
   "lead": "Passing becomes a pattern. Second graders pass over 12 to 15 yards, pass through passing arcs and rings, play wall passes and third-player runs in a triangle, judge the weight of a pass and pass with both feet.",
   "objectives": [
    "Pass accurately over 12 to 15 yards with the inside and the laces",
    "Pass through a passing arc and into a ring with the right weight",
    "Play a wall pass and a third-player run in a triangle",
    "Pass with the weaker foot and the outside of the foot in a game"
   ],
   "outcomes": [
    "Passes 7 of 10 accurately from 12 yards with either foot",
    "Hits a ring from 10 yards in 4 of 8 tries",
    "Completes a triangle pattern with a third runner",
    "Plays an outside-foot pass in a small game"
   ],
   "check": "Child passes 7 of 10 over 12 yards, hits a ring, plays a triangle pattern and uses the weaker foot in a game."
  },
  {
   "n": 6,
   "title": "Finishing and Shooting Variety",
   "lead": "Finishing grows from one clean strike to a set of ways to score. Second graders use pop-up goals, shoot with a short run-up with both feet, finish from a pass first time, place the ball far side, finish rebounds and shoot early in a 1 v 1.",
   "objectives": [
    "Strike with the instep after a two- or three-step run-up with either foot",
    "Place a shot to the far side of a pop-up goal",
    "Finish a pass first time without stopping it",
    "Shoot early in a 1 v 1 and follow up a rebound"
   ],
   "outcomes": [
    "Hits 5 of 10 shots on target from 12 yards",
    "Places 3 of 8 shots to a called corner",
    "Finishes 3 of 8 first-time balls",
    "Follows up a rebound in 2 of 5 tries"
   ],
   "check": "Child strikes with either foot from a run-up, places a shot, finishes first time and follows up a rebound."
  },
  {
   "n": 7,
   "title": "Defending: 1 v 1, Jockey, Tackle and Recover",
   "lead": "Defending becomes a skill in its own right. Second graders use mannequins to learn the jockey, delay and cover, make a safe block tackle, recover goal-side after losing the ball and play 1 v 1 with real rules about fair challenges.",
   "objectives": [
    "Jockey: stay side-on, knees bent and delay an attacker for three seconds",
    "Use a mannequin to practise the jockey, close and cover",
    "Make a block tackle with the inside of the foot on a rolling ball",
    "Recover goal-side after losing the ball and know what a fair challenge is"
   ],
   "outcomes": [
    "Delays an attacker for 3 seconds in 3 of 5 tries",
    "Closes down a mannequin side-on without reaching",
    "Wins a rolled ball with a block tackle in 3 of 6 tries",
    "Recovers and gets goal-side in 3 seconds"
   ],
   "check": "Child jockeys for three seconds, closes a mannequin side-on, makes a block tackle on a rolling ball and recovers goal-side."
  },
  {
   "n": 8,
   "title": "Small-Group Play: 2 v 1, 3 v 2 and 3 v 3",
   "lead": "Combinations grow into small-group play. Second graders use the free player in 2 v 1, 3 v 2 and 3 v 3, play wall passes, overlaps and third-player runs, use width and begin to hear the idea of staying level with the ball (the first step toward offside).",
   "objectives": [
    "Find the free player in a 2 v 1 and a 3 v 2",
    "Play a wall pass, an overlap and a third-player run in a 3 v 3",
    "Use width and support angles with marked discs",
    "Stay level with or behind the ball when the team is attacking (the idea, not the law)"
   ],
   "outcomes": [
    "Finds the free player in 4 of 6 tries",
    "Plays a wall pass and runs into space in 4 of 6 tries",
    "Spreads to marked discs without reminders",
    "Explains “stay level with the ball” in a sentence"
   ],
   "check": "Child finds the free player, plays a wall pass and an overlap, spreads to the discs and explains staying level with the ball."
  },
  {
   "n": 9,
   "title": "Scanning, Space and Decisions",
   "lead": "Seeing becomes a habit. Second graders scan before and after the ball arrives, name the free player and the open space, use if-then cues in games, take decisions under a light clock and answer questions that explain what they saw.",
   "objectives": [
    "Scan before the ball arrives and again after the first touch",
    "Name two options (free player and space) before receiving",
    "Use an if-then cue to choose pass, dribble or shoot in a small game",
    "Say in one sentence what you saw and why you chose it"
   ],
   "outcomes": [
    "Peeks in 7 of 10 passes before the ball arrives",
    "Names two options in 4 of 6 plays",
    "Follows the cue in 4 of 6 decisions",
    "Explains a decision in one sentence"
   ],
   "check": "Child peeks before the ball arrives, names two options, follows a cue and says what they saw."
  },
  {
   "n": 10,
   "title": "Team Shape, Roles and Transitions in 5 v 5",
   "lead": "Team play moves to the 5 v 5 format used in many European youth leagues at this age. Second graders learn a simple shape (back, two sides, front), roles with bibs, a three-second transition, how to build from the keeper and how to restart with a plan.",
   "objectives": [
    "Take a role (back, side, front) and say the job in one sentence",
    "Keep a simple shape with discs and rotate roles after a goal",
    "Transition from attack to defence in three seconds and back",
    "Build from the keeper with a roll or a short pass and restart with a plan"
   ],
   "outcomes": [
    "Names their role and the next job after a rotation",
    "Spreads to the shape without reminders in 4 of 5 rounds",
    "Reacts within three seconds to a change of possession",
    "Plays a restart plan with one taker and two movers"
   ],
   "check": "Child names their role, keeps the shape, reacts within three seconds and takes part in a restart plan."
  },
  {
   "n": 11,
   "title": "Goalkeeper: Positioning, Handling and Distribution",
   "lead": "Goalkeeping becomes a skill for everyone. Second graders learn to stand on the line between ball and goal, handle low and chest-high shots, dive and recover, throw and roll with accuracy, understand the back-pass rule and the time limit.",
   "objectives": [
    "Stand on the line between ball and goal and move to the ball’s side",
    "Catch low and chest-high shots with the hands in a W",
    "Dive to both sides from a crouch and get up quickly",
    "Roll or throw to a target and explain when the hands may be used"
   ],
   "outcomes": [
    "Stops 7 of 10 slow shots from 10 yards",
    "Catches 5 of 10 chest-high balls",
    "Dives to both sides and recovers in 3 of 5 tries",
    "Rolls or throws to a target in 4 of 5 tries"
   ],
   "check": "Child stands between ball and goal, catches with a W, dives from a crouch and rolls or throws to a target."
  },
  {
   "n": 12,
   "title": "Rules of the Game and Restarts",
   "lead": "Second graders meet the real laws through play: throw-in, goal kick, corner kick, fouls and free kicks, handball, offside as an idea and the referee signals. Each rule is taught inside a game where breaking it has a fair, simple consequence.",
   "objectives": [
    "Take a legal throw-in with both hands over the head and both feet on or behind the line",
    "Know a goal kick, a corner kick and a free kick and who takes each",
    "Explain the difference between a direct and an indirect free kick in simple words",
    "Understand handball, advantage, the offside idea and the referee signals"
   ],
   "outcomes": [
    "Takes a legal throw-in in 6 of 8 tries",
    "Says who takes a goal kick, corner and free kick in 3 of 3 cases",
    "Explains a foul and a free kick in one sentence",
    "Shows three referee signals"
   ],
   "check": "Child takes a legal throw-in, says who takes a goal kick, corner and free kick, explains a foul and shows three referee signals."
  }
 ],
 "3rd-grade": [
  {
   "n": 1,
   "title": "Leadership, Communication and Team Culture",
   "lead": "Leadership grows from taking a job to guiding a team. Third graders run a team talk, referee a short game, lead a restart plan, give and receive feedback with kind words and keep the team promise without a reminder.",
   "objectives": [
    "Lead a three-sentence team talk before a game",
    "Referee a short game with clear signals and explain a call in one sentence",
    "Give a teammate feedback with a kind word and one tip",
    "Run a restart plan (throw-in, corner, free kick) as captain"
   ],
   "outcomes": [
    "Leads a team talk without a script",
    "Refs two minutes with 80 percent correct calls",
    "Gives a kind-word-and-tip feedback twice in a practice",
    "Leads a restart plan with the group following"
   ],
   "check": "Child leads a team talk, refs a short game with correct signals, gives a kind word and a tip and runs a restart plan."
  },
  {
   "n": 2,
   "title": "Speed, Agility and Power",
   "lead": "Athletic movement becomes faster and more explosive. Third graders sprint over 20 to 25 yards from different starts, use cone-sprint grids and speed rings, run ladder and hurdle circuits, react to a ball that bounces unpredictably and time themselves against their own best.",
   "objectives": [
    "Sprint 20 to 25 yards from standing, crouch, lying and moving starts",
    "Run a ladder, hurdle and dots circuit with light feet",
    "React to an unpredictable bounce and change direction",
    "Compare your own times on a timing gate across the season"
   ],
   "outcomes": [
    "Runs a 20-yard sprint in an improving own time",
    "Completes a three-tool circuit without a touch",
    "Catches or controls 3 of 5 reaction-ball bounces",
    "Keeps good running form at the end of a set"
   ],
   "check": "Child sprints 20 yards with good form, completes a ladder, hurdle and dots circuit and reacts to a bounce."
  },
  {
   "n": 3,
   "title": "Dribbling, Feints and 1 v 1 Attack",
   "lead": "Dribbling becomes a weapon. Third graders carry the ball at speed with both feet, learn the step-over, the Cruyff turn, the stop-and-go and the body feint, weave poles and slalom sets, and attack a defender in a 1 v 1 with a plan.",
   "objectives": [
    "Dribble through a slalom set at speed with both feet",
    "Perform a step-over, a Cruyff turn and a stop-and-go",
    "Use a body feint to beat a mannequin",
    "Decide in a 1 v 1 whether to dribble, shield or pass"
   ],
   "outcomes": [
    "Dribbles a ten-pole set with no stray touch",
    "Performs three feints on request",
    "Beats a mannequin in 4 of 6 tries",
    "Chooses to pass when a teammate is free"
   ],
   "check": "Child dribbles a ten-pole set, performs three feints and beats a mannequin in 4 of 6 tries."
  },
  {
   "n": 4,
   "title": "First Touch, Turning and Playing Under Pressure",
   "lead": "Receiving moves from controlling the ball to playing under pressure. Third graders control a bouncing and a driven pass, take the first touch away from a mannequin or a chaser, receive on the half-turn, and use rebound boards and bounce-back nets for many repeated touches.",
   "objectives": [
    "Control a driven pass and a bouncing ball with different surfaces",
    "Receive on the half-turn with the body open to the field",
    "Take a first touch away from a mannequin or a chaser",
    "Use the bounce-back net for fast repetitions on both feet"
   ],
   "outcomes": [
    "Controls 7 of 10 driven passes within a stride",
    "Receives on the half-turn in 6 of 10",
    "Takes a first touch away from pressure in 5 of 8",
    "Completes 30 net touches in a minute"
   ],
   "check": "Child controls 7 of 10 driven passes, receives on the half-turn and takes a first touch away from a mannequin."
  },
  {
   "n": 5,
   "title": "Passing: Long, Short and Switching",
   "lead": "Passing grows in distance and purpose. Third graders pass 15 to 20 yards with the laces, play firm short passes under light pressure, switch the point of attack with a long pass, pass into a runner’s path and use the outside and the weaker foot as normal choices.",
   "objectives": [
    "Pass 15 to 20 yards with the laces and a clear follow-through",
    "Pass firmly under light pressure with the inside foot",
    "Switch the play with a long pass to the free side",
    "Lead a runner with a pass into the path"
   ],
   "outcomes": [
    "Hits the target in 6 of 10 passes from 18 yards",
    "Completes 8 of 10 short passes under light pressure",
    "Switches the play in 3 of 5 tries",
    "Leads a runner in 4 of 6 passes"
   ],
   "check": "Child passes 6 of 10 from 18 yards, switches the play and leads a runner into the path."
  },
  {
   "n": 6,
   "title": "Finishing: Angles, Cutbacks and Rebounds",
   "lead": "Finishing grows from clean strikes to scoring in game situations. Third graders shoot from different angles, finish cutbacks and low crosses first time, follow up rebounds, finish after a dribble and use small cages and target nets to aim at corners.",
   "objectives": [
    "Shoot from different angles with either foot",
    "Finish a cutback or a low cross first time",
    "Follow up a rebound in a game",
    "Place a shot at a corner target or a mini cage"
   ],
   "outcomes": [
    "Hits 6 of 10 shots on target from 12 yards",
    "Finishes 4 of 8 cutbacks first time",
    "Scores one rebound in 5 tries",
    "Hits a corner target in 3 of 8 tries"
   ],
   "check": "Child hits 6 of 10 shots on target, finishes cutbacks first time and follows up a rebound."
  },
  {
   "n": 7,
   "title": "Defending: Pressure, Cover and Winning the Ball",
   "lead": "Defending becomes a team skill. Third graders close the ball quickly, jockey side-on, cover a teammate, keep goal-side, make a safe tackle on a moving ball and work with a partner in a 2 v 2 using a pressure and cover pattern.",
   "objectives": [
    "Close the ball quickly, then slow down and stay side-on",
    "Cover a teammate and speak: \"I have cover\"",
    "Make a safe tackle on a moving ball with the inside of the foot",
    "Know what a foul is and why a card exists"
   ],
   "outcomes": [
    "Delays an attacker for 3 seconds in a 1 v 1",
    "Provides cover in 4 of 5 attempts in a 2 v 2",
    "Wins 3 of 8 moving balls without a foul",
    "Explains a foul in one sentence"
   ],
   "check": "Child delays an attacker, provides cover, makes a safe tackle and explains a foul."
  },
  {
   "n": 8,
   "title": "Combination Play: Overlaps, Third-Man Runs and 4 v 2",
   "lead": "Combinations become patterns that unlock defenders. Third graders play a wall pass, an overlap and a third-man run, keep the ball in a 4 v 2, build triangles and diamonds with discs, and start to use width and depth together.",
   "objectives": [
    "Play a wall pass and run past",
    "Play an overlap and a third-man run",
    "Keep the ball in a 4 v 2 with triangles",
    "Use width and depth with disc markers"
   ],
   "outcomes": [
    "Completes a wall pass in 4 of 6 tries",
    "Plays an overlap in 3 of 5 tries",
    "Keeps a 4 v 2 for 10 passes",
    "Marks a triangle with discs"
   ],
   "check": "Child plays a wall pass, an overlap and a third-man run in a 4 v 2 or a 5 v 5."
  },
  {
   "n": 9,
   "title": "Scanning, Decisions and Playing Forward",
   "lead": "Seeing becomes deciding. Third graders scan before and after the first touch, name two options before the ball arrives, choose between a safe pass and a forward pass, and say in one sentence why they chose it.",
   "objectives": [
    "Scan before the ball arrives and again after the first touch",
    "Name two options (free player, space) before receiving",
    "Choose between a safe pass and a forward pass",
    "Say what you saw and why in one sentence"
   ],
   "outcomes": [
    "Scans before receiving in 7 of 10 passes",
    "Names two options in 5 of 8 receptions",
    "Plays a forward pass when it is on in 4 of 6 cases",
    "Gives a reason in one sentence"
   ],
   "check": "Child scans before and after the first touch, names two options and chooses safe or forward with a reason."
  },
  {
   "n": 10,
   "title": "Team Shape, Roles and Transitions in 6 v 6 and 7 v 7",
   "lead": "Team play moves to the bigger formats that European associations use at this age. Third graders learn roles (back, middle, front, keeper), keep a simple shape, move together when the ball moves, win the ball and go in three seconds, and build from the keeper in 6 v 6 and 7 v 7.",
   "objectives": [
    "Take a role (back, middle, front, keeper) and say its job",
    "Keep a simple shape with zones and discs",
    "Switch from attack to defence and back within three seconds",
    "Build from the keeper with a short pass to a back player"
   ],
   "outcomes": [
    "Names the jobs of three roles",
    "Keeps the shape for a full game",
    "Wins the ball and goes in 3 seconds in 4 of 6 cases",
    "Plays out from the keeper in 5 of 8 restarts"
   ],
   "check": "Child plays a role in a 6 v 6 or 7 v 7, keeps the shape and transitions in three seconds."
  },
  {
   "n": 11,
   "title": "Goalkeeper: Shot-Stopping, 1 v 1s and Playing Out",
   "lead": "The keeper becomes part of the team. Third graders catch and parry shots, dive to both sides, come out to close a 1 v 1, throw and roll to start attacks, kick from the ground and use the back-pass rule.",
   "objectives": [
    "Dive to both sides and get up quickly",
    "Come out and close a 1 v 1 with a wide, low body",
    "Parry and catch with the hands in a W",
    "Start an attack with a roll or a throw and use the back-pass rule"
   ],
   "outcomes": [
    "Stops 7 of 10 moderate shots",
    "Closes a 1 v 1 in 3 of 6 tries",
    "Catches 5 of 10 shots chest-high",
    "Plays a back-pass correctly in a game"
   ],
   "check": "Child stops 7 of 10 moderate shots, closes a 1 v 1 and starts an attack with a roll or throw."
  },
  {
   "n": 12,
   "title": "Rules, Offside and Set Plays",
   "lead": "The rules grow into the real game. Third graders learn the offside rule step by step (stay level, the last 14 yards, then the full rule), take throw-ins, goal kicks, corners, free kicks and penalties, understand fouls and cards, use advantage and run simple set plays.",
   "objectives": [
    "Understand offside step by step: stay level, the last 14 yards, then the full rule",
    "Take a throw-in, a goal kick, a corner kick, a free kick and a penalty correctly",
    "Understand fouls, cards and advantage",
    "Run a simple set play with three jobs"
   ],
   "outcomes": [
    "Explains offside in a sentence",
    "Takes a legal throw-in in 4 of 5",
    "Names every restart in a game",
    "Runs a corner set play with three jobs"
   ],
   "check": "Child explains offside, takes a legal throw-in, names every restart and runs a set play."
  }
 ],
 "4th-grade": [
  {
   "n": 1,
   "title": "Leadership, Communication and Team Plans",
   "lead": "Leadership grows from running a game to running the team’s plan. Fourth graders choose a simple plan on a tactics board, call short signals during play, lead a warm-up, referee with the full set of signals and review a game with three questions.",
   "objectives": [
    "Choose a simple game plan and explain it in two sentences",
    "Call short signals during play (man on, time, switch)",
    "Lead a four-minute warm-up for the group",
    "Review a game with three questions: what worked, what was tricky, what is our next step"
   ],
   "outcomes": [
    "Explains the plan before and after a game",
    "Uses at least two signals in a game without a reminder",
    "Leads a warm-up with a clear order and kind words",
    "Names one thing the team did well and one next step"
   ],
   "check": "Child explains the plan, uses two signals, leads a warm-up and reviews a game with the three questions."
  },
  {
   "n": 2,
   "title": "Speed, Agility and Power",
   "lead": "Athletic movement becomes stronger and sharper. Fourth graders sprint 25 to 30 yards from many starts, change direction on a cue, jump and land softly from low boxes, throw a light medicine ball for power and race their own best on timing gates.",
   "objectives": [
    "Sprint 25 to 30 yards from standing, crouch, lying and moving starts",
    "Jump up to a low box and land softly on both feet",
    "Change direction on a cue without losing balance",
    "Beat your own time on a timing gate across the season"
   ],
   "outcomes": [
    "Sprints 25 yards in an improving own time",
    "Lands soft from a low box in 8 of 10 jumps",
    "Cuts and accelerates on the call in 6 of 8 tries",
    "Keeps good running form at the end of a set"
   ],
   "check": "Child sprints 25 yards with good form, lands softly from a low box and cuts on a call."
  },
  {
   "n": 3,
   "title": "Dribbling, Feints and 1 v 1 Attack",
   "lead": "Dribbling grows in speed and in thinking. Fourth graders dribble at pace through slalom sets, link two feints, change direction under pressure, attack a live defender with a plan and know when to dribble, pass or shoot.",
   "objectives": [
    "Link two feints in a row and finish with a change of pace",
    "Dribble through poles and around mannequins at pace with both feet",
    "Change direction under pressure with a scissors or a chop",
    "Choose to dribble, pass or shoot and say why"
   ],
   "outcomes": [
    "Dribbles a ten-pole set with both feet at jogging pace",
    "Beats a mannequin with a feint in 4 of 6 tries",
    "Keeps the ball in a 1 v 1 for four seconds",
    "Chooses a good option in 3 of 5 tries"
   ],
   "check": "Child links two feints, dribbles ten poles with both feet, beats a mannequin in 4 of 6 tries and chooses dribble, pass or shoot."
  },
  {
   "n": 4,
   "title": "First Touch, Receiving and Turning on the Move",
   "lead": "Receiving becomes faster and more purposeful. Fourth graders control driven and lofted balls with different surfaces, receive across the body and on the back foot, turn with a defender close and use the first touch to start the next action.",
   "objectives": [
    "Control lofted balls with the thigh and chest",
    "Receive across the body and on the back foot",
    "Choose first time or one touch by what the game gives",
    "Turn away from a defender behind you and play on within three seconds"
   ],
   "outcomes": [
    "Controls 6 of 10 lofted balls within a stride",
    "Receives across the body in 5 of 8 passes",
    "Turns away from a defender behind in 5 of 8",
    "Plays on within three seconds in a 6 v 6"
   ],
   "check": "Child controls 6 of 10 lofted balls, receives across the body and turns away from a defender behind in 5 of 8 tries."
  },
  {
   "n": 5,
   "title": "Passing: Range, Weight and Lofted Balls",
   "lead": "Passing grows in distance, speed and variety. Fourth graders pass 20 to 25 yards on the ground and in the air, choose the weight of the pass for the teammate, play through gaps with a through pass and keep passing quickly in groups of three.",
   "objectives": [
    "Pass 20 to 25 yards accurately along the ground",
    "Pass 12 to 15 yards in the air with a short lofted pass",
    "Choose the weight of a pass for a teammate who is waiting or running",
    "Play a through pass into a gap between two defenders"
   ],
   "outcomes": [
    "Passes 6 of 10 over 20 yards",
    "Hits a ring or arc in 4 of 8 lofted passes over 12 yards",
    "Plays a through pass to a runner in 3 of 5 tries",
    "Keeps a 4 v 2 for 8 passes"
   ],
   "check": "Child passes 6 of 10 over 20 yards, plays a lofted pass to a ring and plays a through pass to a runner."
  },
  {
   "n": 6,
   "title": "Finishing: Power, Placement and Composure",
   "lead": "Finishing grows in power and calm. Fourth graders shoot with the instep and the inside of the foot from many angles, strike a rolling or bouncing ball, finish 1 v 1 against a keeper and score from crosses with their feet.",
   "objectives": [
    "Strike with power and accuracy with the instep",
    "Strike a rolling or bouncing ball cleanly",
    "Finish a 1 v 1 against a keeper with a calm choice",
    "Score from a low cross with the foot"
   ],
   "outcomes": [
    "Hits 6 of 10 shots on target from 14 yards",
    "Half-volleys 3 of 8 bouncing balls on target",
    "Scores 3 of 6 in a 1 v 1 against a keeper",
    "Finishes 3 of 8 low crosses first time"
   ],
   "check": "Child hits 6 of 10 on target from 14 yards, half-volleys a bounce and finishes a low cross with the foot."
  },
  {
   "n": 7,
   "title": "Defending as a Group: Pressing, Cover and Recovery",
   "lead": "Defending becomes a team job. Fourth graders press on a trigger, cover a teammate, keep the team close together, recover goal-side and win the ball with a safe tackle in 2 v 2 and 3 v 3.",
   "objectives": [
    "Press on a trigger and stop when the cover is not there",
    "Keep the team compact within a 20-yard block",
    "Recover goal-side in a sprint after losing the ball",
    "Defend a cross with the body between ball and goal"
   ],
   "outcomes": [
    "Presses on the trigger in 4 of 6 tries",
    "Stays within a 20-yard block in a 6 v 6",
    "Recovers goal-side within three seconds in 4 of 6",
    "Wins the ball without a foul in 3 of 8 duels"
   ],
   "check": "Child presses on a trigger, covers a teammate, recovers goal-side and makes a safe tackle in a 2 v 2."
  },
  {
   "n": 8,
   "title": "Attacking Principles: Support, Width, Depth and Penetration",
   "lead": "Attacking becomes a team idea. Fourth graders support the ball carrier at good angles, stretch the field with width, offer depth for forward passes, use quick combinations and play through or around a defending team in 4 v 3 and 5 v 4.",
   "objectives": [
    "Choose a support angle and distance for the ball carrier",
    "Stretch the field with width and offer depth",
    "Play a combination and then move to a new spot",
    "Attack in a 4 v 3 or 5 v 4 with a named idea"
   ],
   "outcomes": [
    "Supports at a good angle in 4 of 6 tries",
    "Stays wide or deep on request in a 5 v 5",
    "Completes a combination in 3 of 5 tries",
    "Creates a chance with a named idea in a 5 v 4"
   ],
   "check": "Child supports at an angle, stays wide or deep on request and plays a combination in a 4 v 3."
  },
  {
   "n": 9,
   "title": "Positions and Roles: Defender, Midfielder, Winger and Forward",
   "lead": "Positions arrive as jobs, not labels. Fourth graders learn what a goalkeeper, a defender, a midfielder, a winger and a forward do with and without the ball, and every child tries every position so that nobody is stuck in one place.",
   "objectives": [
    "Name the job of each position with and without the ball",
    "Play a defender, a midfielder and a forward with a clear job",
    "Switch positions after a goal or a whistle and say the new job",
    "Explain the idea of lines (back, middle, front) and of left, right and center"
   ],
   "outcomes": [
    "Names the jobs of three positions",
    "Plays two positions in a 7 v 7 with the right job",
    "Switches position within ten seconds of the call",
    "Explains left, right and center in the lines"
   ],
   "check": "Child names the job of three positions, plays two positions with the right job and switches on the call."
  },
  {
   "n": 10,
   "title": "Team Tactics: Shape, Phases of Play and Transitions",
   "lead": "Tactics begin as simple team ideas. Fourth graders learn a shape for 7 v 7 and 8 v 8, the four phases of the game (build up, attack, defend and transition), pressing triggers and compactness, and they choose a plan, then change it at half time.",
   "objectives": [
    "Hold a 7 v 7 or 8 v 8 shape in the four phases of the game",
    "Press on a trigger and stay compact",
    "Counter-attack within five seconds of winning the ball",
    "Choose a plan, explain it and change it at half time"
   ],
   "outcomes": [
    "Holds the shape for two minutes in a 7 v 7",
    "Presses on a trigger in 4 of 6 tries",
    "Starts a counter within five seconds in 3 of 5",
    "Explains the plan and the change in two sentences"
   ],
   "check": "Child holds the shape in a 7 v 7, presses on a trigger, counters within five seconds and explains a plan and a change."
  },
  {
   "n": 11,
   "title": "The Goalkeeper: Positioning, Crosses and Distribution",
   "lead": "Goalkeeping grows in positioning and leadership. Fourth graders narrow the angle, catch crosses with soft hands, save with hands and feet, start attacks with the hands or the foot from the ground and organise the defenders with a loud voice.",
   "objectives": [
    "Move to narrow the angle and set before the shot",
    "Catch a cross with a W grip and a step",
    "Save with the hands and with the feet",
    "Start an attack with a throw or a kick from the ground"
   ],
   "outcomes": [
    "Stops 6 of 10 moderate shots",
    "Catches 4 of 8 crosses cleanly",
    "Saves with the feet in 3 of 5 close shots",
    "Starts an attack to a free teammate in 4 of 6"
   ],
   "check": "Child narrows the angle, catches a cross, starts an attack to a free teammate and organises the team with a call."
  },
  {
   "n": 12,
   "title": "Rules, Referees and Set Plays",
   "lead": "Rules deepen and become tools. Fourth graders learn what offside really means (interfering with play), handball, direct and indirect free kicks, the dropped ball, kick-off and substitutions, then use them to run set plays for corners, free kicks and throw-ins.",
   "objectives": [
    "Explain offside as interfering with play and spot an example",
    "Show and say the signal for handball and for direct and indirect free kicks",
    "Take a kick-off and a dropped ball correctly",
    "Run a set play for a corner, a free kick and a throw-in"
   ],
   "outcomes": [
    "Explains offside in two sentences",
    "Calls handball correctly in 3 of 4 tries",
    "Takes a kick-off, a dropped ball and a free kick correctly",
    "Runs three set plays in a game"
   ],
   "check": "Child explains offside, takes a legal restart, calls handball with a reason and runs a set play."
  }
 ]
};

function chapterContent(c) {
  const lines = [];
  if (c.lead) lines.push(c.lead, '');
  lines.push('Objectives:');
  (c.objectives || []).forEach((x) => lines.push('- ' + x));
  lines.push('', 'Expected outcomes:');
  (c.outcomes || []).forEach((x) => lines.push('- ' + x));
  return lines.join('\n');
}

async function seedCurricula(pool) {
  let changed = 0;
  for (const grade of Object.keys(CURRICULA)) {
    const chapters = CURRICULA[grade];
    const have = (await pool.query('SELECT id, position FROM curriculum_chapters WHERE grade = $1 ORDER BY position, id', [grade])).rows;
    const byPos = new Map();
    have.forEach((r) => { if (!byPos.has(r.position)) byPos.set(r.position, r.id); });
    for (const c of chapters) {
      const content = chapterContent(c);
      if (byPos.has(c.n)) {
        await pool.query('UPDATE curriculum_chapters SET title = $1, content = $2, assessment = $3 WHERE id = $4', [c.title, content, c.check || '', byPos.get(c.n)]);
      } else {
        await pool.query('INSERT INTO curriculum_chapters (grade, position, title, content, assessment) VALUES ($1, $2, $3, $4, $5)', [grade, c.n, c.title, content, c.check || '']);
      }
      changed++;
    }
    // Remove chapters the curriculum no longer has (anything past its last chapter number).
    await pool.query('DELETE FROM curriculum_chapters WHERE grade = $1 AND position > $2', [grade, chapters.length]);
  }
  return changed;
}

module.exports = { seedCurricula, CURRICULA };
