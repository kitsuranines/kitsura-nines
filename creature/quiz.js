const TYPES={
lurker:{n:'Lurker Creature',t:'Seen 0 times. Has seen everything.',d:"You never type in chat, but you haven't missed a stream. You watch from a dark corner, eye glowing from a screen, and Nines KNOWS you're there. Say hi sometime... or don't. We're watching you watch us."},
chaos:{n:'Chaos Creature',t:"Chaos reigns, and you're holding the remote.",d:'You redeemed the jumpscare. Twice. Show you a working plan and you ask "what if it was on fire?" Nines blames you personally, and honestly? Fair.'},
snack:{n:'Snack Creature',t:'Here for the vibes. Mostly the snacks.',d:"Cozy stream, warm blanket, an alarming number of gummy worms. You've never missed a snack break, and you would absolutely fight Roger for the last cookie."},
scream:{n:'Scream Creature',t:'First to scream. Last to recover.',d:'Every jumpscare hits you harder than it hits Nines, and chat has the clips. You love horror games the way some people love touching hot stoves.'},
hype:{n:'Hype Creature',t:"LET'S GOOOOO (in all caps, always).",d:'You spam the hype, gift the subs, and cheer for Nines failing a jump like she just won the Olympics. A dozen creatures of energy stuffed into one tiny stitched body.'},
lore:{n:'Lore Creature',t:'Knows more Static Hollow lore than Nines does.',d:'You\'ve read every character page, have three theories about Roger, and quietly correct the wiki. Ancient, mysterious, slightly dusty. Nines asks YOU what happened in her own lore.'},
backseat:{n:'Backseat Creature',t:"You're going the wrong way. No, the OTHER wrong way.",d:'You know exactly where the key is, which door to take, and why Nines is wrong. You are always right. You are frequently ignored. You will type it again anyway.'},
emote:{n:'Emote Creature',t:'Communicates exclusively in emotes.',d:"Words? Never heard of them. Your chat messages are 40 emotes and a keyboard smash, and somehow everyone understands you perfectly. Fluent in skull, fire, and crying-laughing."},
roger:{n:'Roger Simp Creature',t:'Here for Nines. Stayed for the rude fluffball.',d:"Be honest, you'd follow Roger into the void. Grumpy little guys are your type, and you have a Roger fanart folder to prove it. He hates being petted. You pet him anyway."},
sleepy:{n:'Sleepy Creature',t:'Falls asleep to stream. Every. Single. Night.',d:"Nines' voice is your nightlight. You tuck in, hit play, and you're out before the first jumpscare. Somehow you still count as a viewer, and Nines appreciates the dedication."}};
// each answer: [text, primary, secondary]  (+2 / +1)
const QS=[
['Nines starts a horror stream. You...',[['Watch through your fingers, lights off','scream','lurker'],['Pray for jumpscares','chaos','hype'],['Grab the blanket and snacks','snack','sleepy'],['Already telling her where to go','backseat','lore']]],
['Your chat style?',[['What chat?','lurker','chaos'],['ALL CAPS, ALWAYS','hype','emote'],['Long, detailed lore theories','lore','backseat'],['"where\'s Roger"','roger','snack']]],
['Pick a Static Hollow souvenir.',[['A cursed old book','lore','lurker'],['A music box that only plays lullabies','sleepy','chaos'],['A Roger plush','roger','sleepy'],['A sticker sheet of every emote','emote','hype']]],
['Something goes bump at 3 a.m. You...',[['Are already asleep. Didn\'t hear it.','sleepy','snack'],['Scream. The whole house wakes up.','scream','emote'],['Bump it back, louder','chaos','backseat'],['Investigate. Silently.','lurker','lore']]],
['What do you spend channel points on?',[['Jumpscare. Always jumpscare.','chaos','emote'],['Hoarding them forever','lurker','roger'],['"Make Roger talk"','roger','hype'],['Hydrate reminder (for the snacks)','snack','backseat']]],
['Your ideal Friday night?',[['Pizza and a cozy game','snack','roger'],['Horror marathon with friends yelling','scream','hype'],['Down a wiki rabbit hole','lore','chaos'],['Fall asleep to a stream by 10','sleepy','lurker']]],
['Your horror-movie role?',[['The one who opens the forbidden door','chaos','roger'],['The one yelling "DON\'T GO IN THERE"','backseat','scream'],['The one who knew about the curse all along','lore','sleepy'],['Communicates only in panicked noises','emote','lurker']]],
['Nines dies to an easy jump for the 9th time.',[['LET\'S GOOOO anyway','hype','chaos'],['"you have to hold jump longer"','backseat','scream'],['💀💀💀💀💀','emote','snack'],['Snack break in solidarity','snack','lore']]],
['Pick a power.',[['Invisibility','lurker','backseat'],['Summon a swarm of creatures','hype','roger'],['Speak fluent emote','emote','sleepy'],['Sleep anywhere, instantly','sleepy','scream']]],
['Roger glares at you. You...',[['Pet him anyway (and get bitten)','roger','scream'],['Shriek and run','scream','snack'],['Tell him he\'s doing it wrong','backseat','emote'],['Cheer him on like it\'s a raid boss','hype','lore']]],
];
if(typeof module!=='undefined')module.exports={TYPES,QS};
