// State
let using_GPT3 = false // otherwise using simple chatbot
let previousInput = ''
let previousOutput = ''
let previousOutputs = new Set()
let currentSpirit = null

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
        console.log(parsedResponse)
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
    console.log(response)
    return 'ERR'
}

const generateOpenAIPrompt = function (spirit, currentQuestion, previousQuestion, previousAnswer) {
    const beginningInstructions = [
        'The player communicates with a spirit using a Ouija board.',
        'The spirit moves the planchette on the board to communicate.',
        'The spirit answers with short answers containing 1 or 2 words.',
        'The spirit never answers with "yes" or "no".',
        'The spirit does not answer with simple yes/no answers.',
        'The spirit answers with colorful language.',
        `The spirit is ${spirit.type} and its answers are unsettling, creepy and scary.`
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
        //'Player: what is your name?',
        //`Spirit: ${spirit.name.toUpperCase()}`,
    ].join('\n') + '\n'

    const maybePreviousQA = previousQuestion ? `Player: ${previousQuestion.toLocaleLowerCase()}?\nSpirit: ${previousAnswer}\n` : ''
    const currentQA = `Player: ${currentQuestion.toLocaleLowerCase()}?\nSpirit:`
    return beginningInstructions + chatHistoryAsSampleQA + maybePreviousQA + currentQA
}

const respondWithOpenAI = function (userQuestion, spirit, callback) {
    const prompt = generateOpenAIPrompt(spirit, userQuestion, previousInput, previousOutput)
    console.log(prompt)
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
            { value: 'mylord' }
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
        ]
    },
    {
        trigger: '{clarification}',
        options: [
            { value: 'itoldyou' },
            { value: 'think' },
            { value: 'youknow' },
            { value: 'leavemebe' },
            { value: '{insult}' },
        ]
    },
    {
        trigger: '{insult}',
        options: [
            { value: 'bitch', priority: 0.5 },
            { value: 'imbecil', priority: 0.3 },
            { value: 'fool' },
            { value: 'harlot' },
            { value: 'idiot' },
            { value: 'stupid' },
            { value: 'maggot' },
            { value: 'filthydog' },
            { value: 'areyoudeaf' }
        ]
    },
    {
        trigger: '{location}',
        options: [
            { value: 'lookup' },
            { value: 'aboveyou' },
            { value: 'yourleft' },
            { value: 'inyourbedroom', restrictedTo: [EVIL] },
            { value: 'kitchen' },
            { value: 'ceilingbehindyou' },
            { value: 'behindthedoor' },
            { value: 'insidethewalls' },
            { value: 'underthefloor' },
            { value: 'closet' },
            { value: 'outside' },
            { value: 'mirror' },
            { value: 'darkness' },
            { value: 'void' },
            { value: 'ether' },
            { value: 'hell', restrictedTo: [EVIL] },
            { value: 'grave' },
            { value: 'crypt' },
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
        ]
    },
    {
        trigger: /^how.*/, // how does the world end? how do you hear my questions?
        options: [
            { value: 'withagony' },
            { value: 'secret' },
            { value: 'supernatural' },
            { value: 'voodoo' },
            { value: 'blackmagic' },
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
        trigger: /^where are you$/,
        options: [
            { value: '{location}' }
        ]
    },
    {
        trigger: /^where.*/, // where were you killed? where will i die? where am i?
        options: [
            { value: 'indarkness' },
            { value: 'inthelight' },
            { value: 'home' },
            { value: 'house' },
            { value: 'tavern' },
            { value: 'cabin' },
            { value: 'forest' },
            { value: 'desert' },
            { value: 'swamp' },
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
            { value: '{location}' }
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
            { value: 'no' },
            { value: 'thisisnotagame' },
            // TODO iam<name> / itoldyouiam<name>
        ]
    },
    {
        trigger: /^are you.*/, // Are you ghost, spirit, undead
        options: [
            { value: '{identityFudge}' },
        ]
    },
    {
        trigger: '{boolean}',
        options: [
            { value: 'yes' },
            { value: 'no' },
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
        trigger: /^who.*/,
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
            
        ]
    },
    {
        trigger: /^what.* mean.*/,
        options: [
            { value: 'iamnotmean' },
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
        ]
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
            { value: 'mirage' },
            { value: 'careful', restrictedTo: [FRIENDLY] },
            { value: 'darkness' },
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
        trigger: /^do you.*/, // sleep? like me? kill people?
        options: [
            { value: 'sometimes' },
            { value: 'imust' },
            { value: 'perhaps' },
            { value: 'ifyouwant', restrictedTo: [FRIENDLY] },
            { value: '{boolean}' },
        ]
    },
    {
        trigger: /.*(^| )(bitch|asshole|jerk|harlot|idiot|stupid|faggot|gay|dickhead|suck|sucker|cocksucker|retard|fuck|fucking|shit|shut up)($| ).*/,
        options: [
            { value: 'ohplease' },
            { value: 'manners' },
            { value: 'youwillpayforthis' },
            { value: 'howdareyou' },
            { value: 'insolentcreature' },
            { value: '{insult}' },
        ]
    },
    {
        trigger: /^(ok|okay|i see|aha|sure|no|yes|it is|is it|really|right|yeah|whatever).*/,
        options: [
            { value: 'watchyourtone' },
            { value: 'believeme' },
            { value: 'itistrue' },
            { value: 'youwillsee', restrictedTo: [EVIL] },
        ]
    },
    {
        /* Nonsequitur fallback when nothing else matches. Presumably user made a statement not a question. */
        trigger: /.*/,
        options: [
            { value: 'isthisagametoyou', restrictedTo: [FRIENDLY] },
            { value: 'thisisnotagame', restrictedTo: [FRIENDLY] },
            { value: 'youthinkso', restrictedTo: [FRIENDLY] },
            { value: 'youwillsee', restrictedTo: [EVIL] },
            { value: 'dontbeafraid', restrictedTo: [EVIL] },
            { value: 'dontworry', restrictedTo: [EVIL] },
            { value: 'youshallperish', restrictedTo: [EVIL] },
            { value: 'youwilldie', restrictedTo: [EVIL] },
            { value: 'false' },
            { value: 'true' },
            { value: 'indeed' },
            { value: 'perhaps' },
            { value: 'isthatgood', restrictedTo: [FRIENDLY] },
            { value: 'thatsnotgood', restrictedTo: [FRIENDLY] },
            
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

const pickSuitableOption = function(options, spirit) {
    const filteredOptions = options
        .map((option) => ({
            value: option.value,
            restrictedTo: option.restrictedTo,
            // Priority: base priority, random as tiebreaker, penalty for repeating previousOutputs
            priority: (option.priority ? option.priority : 0) + Math.random() + (previousOutputs.has(option.value) ? -10 : 0)
        }))
        .filter((option) => !option.restrictedTo || option.restrictedTo.includes(spirit.type))
    filteredOptions.sort((a, b) => b.priority - a.priority)
    const v = filteredOptions[0].value
    if (!v.startsWith('!') && !v.startsWith('{')) {
        // Node is fully resolved to actual output, save it to avoid repeating it in the future
        previousOutputs.add(v)
    }
    return v
}

const resolveQueryWithSimpleChatbot = function(query, spirit) {
    // Special cases
    if (query === previousInput) {
        // TODO increase rage state?
        return resolveQueryWithSimpleChatbot('{insult}')
    }
    if (query.startsWith('!DEFINE')) {
        scriptedExperience.forEach((node) => node.options = node.options.filter((option) => !option.value.startsWith('!DEFINE')))
        return 'define' + query.split(" ")[1]
    }
    if (query.startsWith('!NAME')) {
        return spirit.name
    }
    if (query.startsWith('!RANDOM_SMALL_COUNT')) {
        return '' + (2 + Math.floor(Math.random() * 13))
    }
    if (query.startsWith('!RANDOM_COUNT')) {
        return '' + (2 + Math.floor(Math.random() * 600))
    }
    if (query.startsWith('!RANDOM_COUNT_YEARS')) {
        return resolveQueryWithSimpleChatbot('!RANDOM_COUNT', spirit) + 'years'
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
            const v = pickSuitableOption(matchingNode.options, spirit)
            if (v.startsWith('!') || v.startsWith('{')) {
                return resolveQueryWithSimpleChatbot(v, spirit)
            }
            return v
        }
        
    }
    throw new Exception('query didnt match anything, are we missing a fallback regex match')
}

const initializeSpirit = function() {
    const spiritType = Math.random() > 0.5 ? EVIL : FRIENDLY
    return {
        type: spiritType,
        name: pickSuitableOption(names, { 'type': spiritType })
    }
}
currentSpirit = initializeSpirit()

const respondWithSimpleChatbot = function(rawInput, currentSpirit, callback) {
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

    const spiritResponse = resolveQueryWithSimpleChatbot(input, currentSpirit).toLocaleLowerCase()
    
    previousInput = input
    previousOutput = spiritResponse
    callback(spiritResponse)
}

const dispatchToSpirit = function(rawInput, callback) {
    try {
        if (using_GPT3) respondWithOpenAI(rawInput, currentSpirit, callback)
        else respondWithSimpleChatbot(rawInput, currentSpirit, callback)
    } catch (ex) {
        alert('Internal error, sorry!')
        console.log(ex)
        return 'error'
    }

}