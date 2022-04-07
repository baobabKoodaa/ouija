// State
let using_GPT3 = false // otherwise using scripted experience
let previousInput = ''
let previousOutput = ''
let previousOutputs = new Set()
let currentSpirit = null
let questGoals = {
    // How many QAs of a certain tag the user must go through before progressing in the questline.
    who: 2,
    where: 3,
    rage: 5
}

// Snoop user city from IP in order to provide creepy location for spirit.
// Using free CloudFlare worker to bypass Adblockers.
// Geolocation provider is CloudFlare, no other third parties involved.
let userCity = ''
fetch('https://geo.atte-cloudflare.workers.dev/', { mode: 'cors' })
    .then(res => res.json())
    .then(response => {
        const ALLOWED_CHARS = 'abcdefghijklmnopqrstuvwxyz'
        const cleanedResponse = response.city.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase()
        for (let i=0; i<cleanedResponse.length; i++) {
            const c = cleanedResponse[i]
            if (ALLOWED_CHARS.includes(c)) {
                userCity += c
            }
        }
        if (userCity.length < 3) {
            userCity = ''
        }
    })
    .catch(exception => {
        // Ad-blocker prevents request? Rate limited? Suppress error from user.
    })

const FRIENDLY = 'friendly'
const EVIL = 'evil'

const names = [
    { value: 'Abel' },
    { value: 'Abigail' },
    { value: 'Anna' },
    { value: 'Bartholomew' },
    { value: 'Beelzebub', restrictedTo: [EVIL] },
    { value: 'Bethel' },
    { value: 'Caleb', restrictedTo: [FRIENDLY] },
    { value: 'Damien', restrictedTo: [EVIL] },
    { value: 'Deborah' },
    { value: 'Dora' },
    { value: 'Doris' },
    { value: 'Ethel' },
    { value: 'Esmeralda' },
    { value: 'Esther' },
    { value: 'Eunice' },
    { value: 'Ezekiel' },
    { value: 'Gabriel', restrictedTo: [FRIENDLY] },
    { value: 'Herod' },
    { value: 'Hosanna' },
    { value: 'Ishmael' },
    { value: 'Jeremiah' },
    { value: 'Joanna' },
    { value: 'John' },
    { value: 'Kezia' },
    { value: 'Lazarus' },
    { value: 'Lucifer', restrictedTo: [EVIL] },
    { value: 'Magda' },
    { value: 'Mahali' },
    { value: 'Micah' },
    { value: 'Miriam' },
    { value: 'Moriah' },
    { value: 'Obadiah' },
    { value: 'Olaf' },
    { value: 'Oswald' },
    { value: 'Pazuzu', restrictedTo: [EVIL] },
    { value: 'Rafael' },
    { value: 'Rasputin' },
    { value: 'Ruth' },
    { value: 'Sabina' },
    { value: 'Sapphira' },
    { value: 'Shamir' },
    { value: 'Sheba' },
    { value: 'Simeon' },
    { value: 'Tabatha' },
    { value: 'Uri' },
    { value: 'Yacob', restrictedTo: [FRIENDLY] },
    { value: 'Zozo', restrictedTo: [EVIL] },
]

/**************************************** OPENAI stuff begins ********************************************/

const parseOpenAIresponseText = function (rawText) {
    return rawText
        .split(/(\s+)/)
        .filter((word) => !['A', 'AN', 'THE', ' '].includes(word))
        .join("")
        .toUpperCase()
        .replace(/[^0-9A-Z]/gi, '')
}

const parseOpenAIresponseJSON = function (response) {
    let bestResponse = ''
    let bestResponsePenalty = 999999999
    let fallbackResponse = ''
    for (let i = 0; i < response.choices.length; i++) {
        const parsedResponse = parseOpenAIresponseText(response.choices[i].text)
        if (parsedResponse.length >= 2) {
            // Any response at least 2 characters long is good enough for our fallback response, and they all suck, so we don't care which one we pick.
            fallbackResponse = parsedResponse
        }
        if (parsedResponse.length < 4 || parsedResponse.length > 15) {
            // Avoid short responses like "YES", "NO", "IAM" and also long ones like "BECAUSEIAMYOURDARKLORDYOUSHOULDFOLLOWME"
            continue
        }
        let penalty = 0
        penalty += previousOutputs.has(parsedResponse) ? 10 : 0 // Prefer unseen responses
        penalty += parsedResponse.length // Prefer shorter responses (given that they are between 4 and 15 characters)
        if (penalty < bestResponsePenalty) {
            bestResponsePenalty = penalty
            bestResponse = parsedResponse
        }
    }
    if (bestResponse.length > 0) {
        return bestResponse
    }
    if (fallbackResponse.length > 0) {
        return fallbackResponse
    }
    return 'ERR'
}

const generateOpenAIPrompt = function (currentQuestion, previousQuestion, previousAnswer) {
    const beginningInstructions = [
        'The player communicates with a spirit using a Ouija board.',
        'The spirit moves the planchette on the board to communicate.',
        'The spirit answers with short answers containing 1 or 2 words.',
        'The spirit never answers with "yes" or "no".',
        'The spirit does not answer with simple yes/no answers.',
        'The spirit answers with colorful language.',
        `The spirit is ${currentSpirit.type} and its answers are unsettling, creepy and scary.`
    ].join(" ") + '\n'

    const chatHistoryAsSampleQA = [
        'Player: is this safe?',
        'Spirit: RUN',
        'Player: what do you feel?',
        'Spirit: PAIN',
        'Player: am i going to die?',
        'Spirit: IN AGONY',
        'Player: are you an angel?',
        'Spirit: DEMON',
        'Player: is this safe?',
        'Spirit: DANGER',
        'Player: are you good?',
        'Spirit: VERY',
        'Player: is this safe?',
        'Spirit: LEAVE NOW',
        'Player: do you want happiness?',
        'Spirit: DEATH',
        'Player: am i going to die?',
        'Spirit: HORRIBLY',
        'Player: can you hurt me?',
        'Spirit: WITH PLEASURE',
    ].join('\n') + '\n'

    const maybePreviousQA = previousQuestion ? `Player: ${previousQuestion.toLocaleLowerCase()}?\nSpirit: ${previousAnswer}\n` : ''
    const currentQA = `Player: ${currentQuestion.toLocaleLowerCase()}?\nSpirit:`
    return beginningInstructions + chatHistoryAsSampleQA + maybePreviousQA + currentQA
}

const respondWithOpenAI = function (userQuestion, callback) {
    const prompt = generateOpenAIPrompt(userQuestion, previousInput, previousOutput)
    fetch('https://api.openai.com/v1/engines/text-davinci-002/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${window.localStorage.getItem('ouija-openai-api-key')}`
        },
        body: JSON.stringify({
            "prompt": prompt,
            "max_tokens": 32,
            "temperature": 0.9,
            "top_p": 1,
            "n": 5,
            "stream": false,
            "stop": "\n"
        })
    })
    .then((response) => response.json())
    .then((response) => parseOpenAIresponseJSON(response))
    .then((parsed) => {
        previousInput = userQuestion
        previousOutput = parsed
        previousOutputs.add(parsed)
        callback(parsed)
    })
    .catch((exception) => console.log(exception))
}

/**************************************** OPENAI stuff ends ********************************************/

const scriptedExperience = [
    {
        trigger: /^hello.*/,
        options: [
            { value: 'greetings' },
            { value: 'mylove' },
            { value: 'mylord' },
        ],
    },
    {
        trigger: /^(hi|hey)($| .*)/,
        options: [
            { value: 'hello' },
            { value: 'shalom' }
        ]
    },
    {
        trigger: /^is (anyone|anybody) (there|here)$/,
        options: [
            { value: 'justme' },
            { value: 'manyofus' },
            { value: 'hereiam' },
        ]
    },
    {
        trigger: '{introduction}',
        options: [
            { value: 'hellodear' },
            { value: 'hellothere' },
            { value: 'run', restrictedTo: [FRIENDLY]  },
            { value: 'danger', restrictedTo: [FRIENDLY] }, 
            { value: 'notsafe', restrictedTo: [FRIENDLY] },
            // TODO 'imsorry' friendly
            // TODO tormented: killme, icantsee, sohungry, socold, somuchpain, cantbreathe, helpme, pleasehelp
            { value: 'hellofriend', restrictedTo: [EVIL] },
            { value: 'iseeyou', restrictedTo: [EVIL] },
            { value: 'finally', restrictedTo: [EVIL] },
        ]
    },
    {
        trigger: '{identityFudge}',
        options: [
            { value: 'iusedtobelikeyou' },
            { value: 'itakemanyforms' },
            { value: 'iammanythings' },
            { value: 'iamgod', restrictedTo: [EVIL] },
        ],
        questGoals: {
            who: 0.49
        }
    },
    {
        trigger: '{clarification}',
        options: [
            { value: 'itoldyou', priority: 2 },
            { value: 'areyoudeaf', priority: 1.5 },
            { value: 'fuckoff', priority: 1.0 },
            { value: 'leavemebe', priority: 1.0 },
            { value: '{insult}' },
        ],
        questGoals: {
            rage: 1
        }
    },
    {
        trigger: '{insult}',
        options: [
            { value: 'bitch', priority: 0.5 },
            { value: 'imbecil', priority: 0.5 },
            { value: 'die' },
            { value: 'fool' },
            { value: 'harlot' },
            { value: 'idiot' },
        ],
        questGoals: {
            rage: 1
        }
    },
    {
        trigger: '{location2}',
        options: [
            { value: 'home' },
            { value: 'yourhouse' },
        ],
        questGoals: {
            where: 1
        }
    },
    {
        trigger: '{location1}',
        options: [
            { value: 'lookup' },
            { value: 'aboveyou' },
            { value: 'yourleft' },
            { value: 'inyourbedroom', restrictedTo: [EVIL] },
            { value: 'ceilingbehindyou' },
            { value: 'behindthedoor' },
            { value: 'insidethewalls' },
            { value: 'underthefloor' },
            { value: 'closet' },
            { value: 'mirror' },
        ],
        questGoals: {
            where: 1
        }
    },
    {
        trigger: '{location0}',
        options: [
            { value: 'darkness' },
            { value: 'void' },
            { value: 'ether' },
            { value: 'near' },
            { value: 'close' },
            //{ value: 'heaven', restrictedTo: [EVIL] },
            //{ value: 'hell', restrictedTo: [EVIL] },
            //{ value: 'grave' },
            //{ value: 'crypt' },
        ]
    },
    {
        trigger: /^(how come|explain)$/,
        options: [
            { value: '{clarification}' },
        ]
    },
    {
        trigger: /^like what$/,
        options: [
            { value: 'likediebitch', priority: 100 },
            { value: '{clarification}' },
        ]
    },
    {
        trigger: /^how many people.*/, // how many people have you killed? how many people are in this room?
        options: [
            { value: '!DEFINE people' },
            { value: 'justyou' },
            { value: 'dontworry', restrictedTo: [EVIL] },
            { value: '2', restrictedTo: [FRIENDLY] },
        ]
    },
    {
        trigger: /^how many.*/, // how many humans have you killed? how many of you are here?
        options: [
            { value: 'dontworry', restrictedTo: [EVIL] },
            { value: 'legion', restrictedTo: [EVIL] },
            { value: 'horde', restrictedTo: [EVIL] },
            { value: '!RANDOM_SMALL_COUNT' }
        ]
    },
    {
        trigger: /^how long.*/, // how long ago did you die? how long have you been dead? how long since ... how long until ...
        options: [
            { value: 'toolong' },
            { value: 'ages' },
            { value: 'centuries' },
            { value: '!RANDOM_COUNT_YEARS' }
        ]
    },
    {
        trigger: /^how old.*/, // how old are you?
        options: [
            { value: '!RANDOM_COUNT' }
        ]
    },
    {
        trigger: /^how.*( kill| die).*/, // how were you killed? how will i die?
        options: [
            { value: 'murder' },
            { value: 'accident' },
            { value: 'poison' },
            { value: 'plague' },
            { value: 'hanging' },
            { value: 'suicide' },
            { value: 'knife' },
            { value: 'betrayal' },
            { value: 'famine' },
            { value: 'thirst' },
            { value: 'inquisition' },
            { value: 'witchhunt' },
            { value: 'fire' },
            { value: 'carnage' },
        ]
    },
    {
        trigger: /^how are you$/,
        options: [
            { value: 'hungry' },
            { value: 'thirsty' },
            { value: 'craving' },
            { value: 'lonely', restrictedTo: [FRIENDLY] },
        ]
    },
    {
        trigger: /^how can (i|we).*/, // how can we trap you? how can i win the game?
        options: [
            { value: 'impossible' },
            { value: 'giveup' },
            { value: 'cant' },
            { value: 'nohope' },
        ]
    },
    {
        trigger: /^how.*/, // how does the world end? how do you hear my questions? how do you know where i am? how is this possible?
        options: [
            { value: 'secret' },
            { value: 'supernatural' },
            { value: 'voodoo' },
            { value: 'blackmagic' },
            { value: 'hack' },
        ]
    },
    {
        trigger: /^when.*( did | where ).*/, // when did you die? when were you born (with were->where subsitution)
        options: [
            { value: '!RANDOM_YEAR_PAST' },
            { value: 'longago' },
            { value: 'manymoonsago', restrictedTo: [FRIENDLY] },
        ]
    },
    {
        trigger: /^when.*/, // when will I die? when is the world going to end?
        options: [
            { value: '!RANDOM_YEAR_FUTURE' },
            { value: 'never' },
            { value: 'soon' },
            { value: 'nottoosoon', restrictedTo: [FRIENDLY] },
            { value: 'dontworry', restrictedTo: [EVIL] },
            { value: 'youwillsee', restrictedTo: [EVIL] },
        ]
    },
    {
        trigger: /^where is home$/,
        options: [
            { value: '{clarification}' }
        ]
    },
    {
        trigger: /^where (are you|in|.* (house|home)|exactly|specifically).*/, // where in {userCity}, where inside the house
        options: [
            { value: '!LOCATION' }
        ]
    },
    {
        trigger: /^where$/,
        options: [
            { value: 'indarkness' },
            { value: 'inthelight' },
        ]
    },
    {
        trigger: /^where.*/, // where were you killed? where will i die? where am i?
        options: [
            { value: 'indarkness' },
            { value: 'inthelight' },
            { value: 'home' },
            { value: 'house' },
            //{ value: 'tavern' },
            //{ value: 'cabin' },
            //{ value: 'forest' },
            //{ value: 'desert' },
            //{ value: 'swamp' },
        ]
    },
    {
        trigger: /^can (i|you|we) .*/,
        options: [
            { value: '{boolean}' }
        ]
    },
    {
        trigger: /^(are |is |will ).* or .*/, // are you demon or angel? are you alive or dead? will... is...
        options: [
            { value: 'both' },
            { value: 'neither' },
            // TODO 50/50 x or y
        ]
    },
    {
        trigger: /^are you (in|at|there|close|near|here|around|present|under|behind|above|over).*/,
        options: [
            { value: '!LOCATION' }
        ]
    },
    {
        trigger: /^are you (old|young)$/,
        options: [
            { value: '!RANDOM_COUNT' }
        ]
    },
    {
        trigger: /^are you dead$/,
        options: [
            { value: '!DEFINE dead' },
            { value: '{identityFudge}' },
        ]
    },
    {
        trigger: /^are you human$/,
        options: [
            { value: '!DEFINE human' },
            { value: '{identityFudge}' },
        ]
    },
    {
        trigger: /^are you real$/,
        options: [
            { value: '!DEFINE real' },
            { value: '{identityFudge}' },
        ]
    },
    {
        trigger: /^are you bot$/,
        options: [
            { value: 'donotinsultme' },
            { value: 'human' },
            { value: 'thisisnotagame' },
            // TODO iam<name> / itoldyouiam<name>
        ]
    },
    {
        trigger: /^are you.*/, // Are you ghost, spirit, undead, alive
        options: [
            { value: '{identityFudge}' },
        ]
    },
    {
        trigger: '{boolean}',
        options: [
            { value: 'perhaps' },
            { value: 'ofcourse' },
            { value: 'ithinkso' },
            { value: 'whatdoyouthink' },
            { value: 'notexactly' },
            { value: 'thinkagain' },
        ]
    },
    {
        trigger: /^are .*/,
        options: [
            { value: '{boolean}' },
        ]
    },
    {
        trigger: /^should .*/,
        options: [
            { value: '{boolean}' },
            { value: 'risky' },
            { value: 'worthit' },
            { value: 'insane' },
            { value: 'whynot' },
            { value: 'toolate' },
            { value: 'later' },
        ]
    },
    {
        trigger: /^(am i|is|will)( |$).*/,
        options: [
            { value: '{boolean}' },
        ]
    },
    {
        trigger: /^(whose|whos) home$/,
        options: [
            { value: 'yours' },
        ]
    },
    {
        trigger: /^who is my.*/,
        options: [
            { value: 'youknowwho' },
            { value: 'thedarkone' },
        ]
    },
    {
        trigger: /^who (are you|is it|is here|is there|is this|is talking|is speaking)$/,
        options: [
            { value: '!NAME' },
        ]
    },
    {
        trigger: /^who$/,
        options: [
            { value: '{clarification}' },
        ]
    },
    {
        trigger: /^who .*/,
        options: [
            { value: 'lord' },
            { value: 'angel' },
            { value: 'demon' },
            { value: 'savior' },
            { value: 'messiah' },
        ]
    },
    {
        trigger: /^why.*/,
        options: [
            { value: 'youknowwhy' },
            { value: 'sin' },
            { value: 'greed' },
            { value: 'money' },
            { value: 'love' },
            { value: 'lust' },
            { value: 'mistake', restrictedTo: [FRIENDLY] },
            { value: 'noreason', restrictedTo: [FRIENDLY] },
            { value: 'forced', restrictedTo: [FRIENDLY] },
            { value: 'nochoice', restrictedTo: [FRIENDLY] },
            { value: 'influence' },
            { value: 'power' },
        ]
    },
    {
        trigger: /^what are you$/,
        options: [
            { value: 'human' },
            { value: 'lostsoul', restrictedTo: [FRIENDLY] },
            { value: 'wanderer', restrictedTo: [FRIENDLY] },
            { value: 'demon', restrictedTo: [EVIL] },
            { value: 'angel', restrictedTo: [EVIL] },
            { value: 'iamdeath', restrictedTo: [EVIL] },
            { value: 'god', restrictedTo: [EVIL] },
            { value: '666', restrictedTo: [EVIL] },
        ],
        questGoals: {
            who: 1
        }
    },
    {
        trigger: /^what.* mean.*/,
        options: [
            { value: 'iamnotmean', priority: 1.0 },
            { value: 'yourchoice' },
            { value: 'interpret' },
            { value: '{clarification}' },
        ]
    },
    {
        trigger: /^what is your age$/,
        options: [
            { value: '!RANDOM_COUNT' }
        ]
    },
    {
        trigger: /^what is your name$/,
        options: [
            { value: '!NAME' },
        ]
    },
    {
        trigger: /^what is your (location|position)$/, 
        options: [
            { value: '!LOCATION' },
        ]
    },
    {
        trigger: /^what is your.*/, // goal? motivation? favorite food?
        options: [
            { value: 'youwillsee', restrictedTo: [EVIL] },
            { value: 'dontworry', restrictedTo: [EVIL] },
            { value: '{clarification}' },
        ]
    },
    {
        trigger: /^what is my.*/, // name? birthdate? location?
        options: [
            { value: 'thisisnotagame', restrictedTo: [FRIENDLY] },
            { value: 'isthisagametoyou', restrictedTo: [FRIENDLY] },
            { value: 'youknow', restrictedTo: [FRIENDLY] },
            { value: '{clarification}' },
            { value: '{insult}' },
        ]
    },
    {
        trigger: /^what is this$/,
        options: [
            { value: 'nightmare' },
            { value: 'feverdream' },
            { value: 'nirvana' },
            { value: 'dontworry', restrictedTo: [EVIL] },
            { value: '{clarification}' },
        ]
    },
    {
        trigger: /^what do you.*/, // want? feel?
        options: [
            { value: 'peace', restrictedTo: [FRIENDLY] },
            { value: 'despair' },
            { value: 'grief' },
            { value: 'fortune' },
            { value: 'regret' },
            { value: 'dontworry', restrictedTo: [EVIL] },
        ],
        questGoals: {
            who: 1
        }
    },
    {
        trigger: /^what did you say$/,
        options: [
            { value: '{insult}' },
        ]
    },
    {
        trigger: /^what.*year.* (where|did|was) .*/, // were->where substituted
        options: [
            { value: '!RANDOM_YEAR_PAST' },
        ]
    },
    {
        trigger: /^what.*year.*/,
        options: [
            { value: '!RANDOM_YEAR_FUTURE' },
        ]
    },
    {
        trigger: /^what$/,
        options: [
            { value: 'youheardme' },
            { value: 'whatisaid' },
            { value: 'areyoudeaf' },
            { value: '{clarification}' },
        ]
    },
    {
        trigger: /^what.*/,
        options: [
            { value: 'cantsee' },
            { value: 'dontknow', restrictedTo: [FRIENDLY] },
            { value: 'careful', restrictedTo: [FRIENDLY] },
            { value: 'darkness' },
        ]
    },
    {
        trigger: /^(do|did) you.*/, // sleep? like me? kill people?
        options: [
            { value: 'sometimes' },
            { value: 'fun' },
            { value: 'imust' },
            { value: '{boolean}' },
        ]
    },
    {
        trigger: /^(was|did) .*/,
        options: [
            { value: 'fortunately' },
            { value: 'unfortunately' },
            { value: 'regrettably' },
            { value: '{boolean}' },
        ]
    },
    {
        trigger: '{insultedSoft}',
        options: [
            { value: 'ohplease' },
            { value: 'manners' },
            { value: 'knowyourplace' },
            { value: 'leavemebe' },
            { value: 'dontplaywithme' },
        ],
        questGoals: {
            rage: 1
        }
    },
    {
        trigger: '{insultedHard}',
        options: [
            { value: 'youwillpayforthis' },
            { value: 'howdareyou' },
            { value: 'die' },
            { value: 'youshallperish' },
            { value: 'youwilldie' },
        ],
        questGoals: {
            rage: 1
        }
    },
    {
        trigger: /.*(^| )(bitch|asshole|jerk|harlot|idiot|stupid|faggot|gay|dickhead|suck|sucker|cocksucker|retard|fuck|fucking|shit|shut up|fucker|motherfucker|liar)($| ).*/,
        options: [
            { value: '!INSULTED' },
        ]
    },
    {
        trigger: /^(it is|is it) .*/,
        options: [
            { value: '{boolean}' },
        ]
    },
    {
        trigger: /^(ok|okay|i see|aha|sure|no|yes|really|right|yeah|whatever)( .*|$)/,
        options: [
            { value: 'watchyourtone' },
            { value: 'believeme' },
            { value: 'trustme' },
        ]
    },
    {
        /* Nonsequitur fallback when nothing else matches. Presumably the user made a statement not a question.
         * We might end up here after recursively resolving the query such that we always drop the first word,
         * until finally we end up here with empty string. */
        trigger: /^$/,
        options: [
            { value: 'temp', priority: 100000 },
            { value: 'isthisagametoyou', restrictedTo: [FRIENDLY] },
            { value: 'thisisnotagame', restrictedTo: [FRIENDLY] },
            { value: 'dontbeafraid', restrictedTo: [EVIL] },
            { value: 'dontworry', restrictedTo: [EVIL] },
            { value: 'itisknown' },
            { value: 'lies' },
            { value: 'liar' },
            { value: 'indeed' },
            { value: 'false' },
            { value: 'true' },
            
            //{ value: 'iamtrapped', restrictedTo: [EVIL] },
            // youarechosen ... donotresist
            // itconsumesme ... itwillcomeforyounow
            // ithurts ... makeitstop
            // theytookmyeyes ...
        ]
    }
]

const pickRandom = function(arr) {
    return arr[Math.floor(Math.random() * arr.length)]
}

const pickSuitableOption = function(options, currentSpirit) {
    const filteredOptions = options
        .map((option) => ({
            value: option.value,
            restrictedTo: option.restrictedTo,
            // Priority: base priority, random as tiebreaker, penalty for repeating previousOutputs
            priority: (option.priority ? option.priority : 0) + Math.random() + (previousOutputs.has(option.value) ? -10 : 0)
        }))
        .filter((option) => !option.restrictedTo || option.restrictedTo.includes(currentSpirit.type))
    filteredOptions.sort((a, b) => b.priority - a.priority)
    const v = filteredOptions[0].value
    if (!v.startsWith('!') && !v.startsWith('{')) {
        // Node is fully resolved to actual output, save it to avoid repeating it in the future
        previousOutputs.add(v)
    }
    return v
}

const resolveQueryWithSimpleChatbot = function(query) {
    // Special cases
    if (query.startsWith('!LOCATION')) {
        if (questGoals.where === 3) {
            questGoals.where -= 1
            return userCity || resolveQueryWithSimpleChatbot('{location0}')
        }
        if (questGoals.where === 2) return resolveQueryWithSimpleChatbot(`{location2}`)
        if (questGoals.where === 1) return resolveQueryWithSimpleChatbot(`{location1}`)
        return resolveQueryWithSimpleChatbot('{location0}')
    }
    if (query.startsWith('!DEFINE')) {
        scriptedExperience.forEach((node) => node.options = node.options.filter((option) => !option.value.startsWith('!DEFINE')))
        return 'define' + query.split(" ")[1]
    }
    if (query.startsWith('!NAME')) {
        if (questGoals.who > 0) {
            questGoals.who -= 1
        }
        return currentSpirit.name
    }
    if (query.startsWith('!INSULTED')) {
        console.log('!insulted')
        if (questGoals.rage > 3) return resolveQueryWithSimpleChatbot('{insultedSoft}')
        if (questGoals.rage <= 3) return resolveQueryWithSimpleChatbot('{insult}')
        if (questGoals.rage <= 2) return resolveQueryWithSimpleChatbot('{insultedHard}')
    }
    if (query.startsWith('!RANDOM_SMALL_COUNT')) {
        return '' + (2 + Math.floor(Math.random() * 13))
    }
    if (query.startsWith('!RANDOM_COUNT')) {
        return '' + (2 + Math.floor(Math.random() * 600))
    }
    if (query.startsWith('!RANDOM_COUNT_YEARS')) {
        return resolveQueryWithSimpleChatbot('!RANDOM_COUNT', currentSpirit) + 'years'
    }
    if (query.startsWith('!RANDOM_YEAR_PAST')) {
        return '' + (1500 + Math.floor(Math.random() * 522))
    }
    if (query.startsWith('!RANDOM_YEAR_FUTURE')) {
        return '' + (new Date().getFullYear() + 1 + Math.floor(Math.random() * 50))
    }

    // Typical case: look for first match in scriptedExperience
    for (let i=0; i<scriptedExperience.length; i++) {
        const node = scriptedExperience[i]
        let matchingNode = null

        // Trigger is string or regex
        if (typeof(node.trigger) == 'string') {
            if (node.trigger.startsWith('{') && query == node.trigger) {
                matchingNode = node
            }
        } else {
            if (query.match(node.trigger)) {
                matchingNode = node
            }
        }

        // Resolve matchingNode
        if (matchingNode) {
            const v = pickSuitableOption(matchingNode.options, currentSpirit)
            if (v.startsWith('!') || v.startsWith('{')) {
                return resolveQueryWithSimpleChatbot(v)
            }
            if (matchingNode.questGoals) {
                if (matchingNode.questGoals.who) {
                    questGoals.who -= matchingNode.questGoals.who
                }
                if (matchingNode.questGoals.where) {
                    questGoals.where -= matchingNode.questGoals.where
                }
                if (matchingNode.questGoals.rage) {
                    randomRageEffect()
                    questGoals.rage -= matchingNode.questGoals.rage
                }
            }
            return v
        }
        
    }

    // Query didn't match anything, so we try running query without the first word.
    // This helps for inputs like "sup how do you do" that we want to match for "how do you do".
    // ScriptedExperience must have fallback regex /^$/ for empty strings.
    const splitted = query.split(" ")
    splitted.shift() // Remove first word
    return resolveQueryWithSimpleChatbot(splitted.join(" "))
}

const SCRIPTED_TOOLTIPS = [
    {
        tooltip: '?',
        headline: 'And so it begins',
        paragraphs: [
            'You can use the ouija board to communicate with the spirit world. To send a message, type on your keyboard and press enter.'
        ]
    },
    {
        tooltip: '?',
        headline: 'A message from beyond',
        paragraphs: [
            'The planchette is glowing! That means a spirit is trying to communicate.',
            'The spirit needs your help to move the planchette. Drag the planchette with your mouse over the letters and numbers on the board. When you are close to the mark, you will feel it. The spirit will pull you in.',
            'Drop the planchette on the correct letters to reveal the message.',
            'If you are having trouble, try hovering slowly with different patterns.'
        ]
    },
    {
        tooltip: 'T',
        headline: 'Taleteller',
        paragraphs: [
            `That's a good start, looks like you're getting the hang of it. We need to keep this thing talking.`,
            `If you can, find out who... and what... we're dealing with here.`,
        ]
    },
    {
        tooltip: 'x',
        headline: 'All about location',
        paragraphs: [
            'Uh, this is not good. Not good at all. The spirit is gaining force and the bond to the netherworld is becoming unstable.',
            'The only way for us to end this session safely is to trap the spirit. In order to do that we need to pinpoint its exact location. You might have to ask multiple questions to find out.'
        ]
    },
    {
        tooltip: 'o',
        headline: 'Final objective',
        paragraphs: [
            'Almost there! I have the perfect concoction for this apparition, and thanks to you we know where to hit it.',
            'Just one thing left: we need to rile up the bastard to make it vulnerable to entrapment.',
            'Can you figure out a way to anger the spirit?',
        ]
    },
]

const initializeSpirit = function() {
    const spiritType = EVIL // Math.random() > 0.5 ? EVIL : FRIENDLY
    return {
        type: spiritType,
        name: pickSuitableOption(names, { type: spiritType })
    }
}
currentSpirit = initializeSpirit()

const respondWithSimpleChatbot = function(rawInput, callback) {
    const input = rawInput
        .toLocaleLowerCase()
        .split(" ")
        .filter((word) => !['the', 'a', 'an'].includes(word)) // Normalize common grammar typos
        .map((word) => {
            // Normalize common word typos
            if (word === 'were') return 'where'
            if (word === 'u') return 'you'
            if (word === 'r') return 'are'
            if (word === 'youre') return 'your'
            return word
        })
        .join(' ')

    const spiritResponse = (input !== previousInput ? resolveQueryWithSimpleChatbot(input) : resolveQueryWithSimpleChatbot('{clarification}')).toLocaleLowerCase()
    
    previousInput = input
    previousOutput = spiritResponse
    callback(spiritResponse)
}

const dispatchToSpirit = function(rawInput, callback) {
    try {
        if (using_GPT3) respondWithOpenAI(rawInput, callback)
        else respondWithSimpleChatbot(rawInput, callback)
    } catch (ex) {
        alert('Internal error, sorry!')
        console.log(ex)
        return 'error'
    }

}