// The chapter lists of the coaches' curriculum pages (curriculum-prek.html, curriculum-kindergarten.html,
// curriculum-1st-grade.html, curriculum-2nd-grade.html). They are copied into Coaches > Our Curriculum so the Student Report can offer
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
