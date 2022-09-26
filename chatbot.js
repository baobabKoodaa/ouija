// State
let using_GPT3 = false // otherwise using scripted experience
let currentInput = ''
let previousInput = ''
let previousOutput = ''
let previousOutputs = new Set()
let currentSpirit = null
let questGoals = {
    // How many QAs of a certain tag the user must go through before progressing in the questline.
    who: 2,
    where: 3,
    rage: 3
}
let playedJack = false
let completionEffect = null
let possessedMessage = ''
let possessedRound = 10 + Math.round(Math.random() * 20)
let currentRound = 0
let debuggingLogs = []
let testCount = 0

const countryMappings = {"BD": "Bangladesh", "BE": "Belgium", "BF": "Burkina Faso", "BG": "Bulgaria", "BA": "Bosnia and Herzegovina", "BB": "Barbados", "WF": "Wallis and Futuna", "BL": "Saint Barthelemy", "BM": "Bermuda", "BN": "Brunei", "BO": "Bolivia", "BH": "Bahrain", "BI": "Burundi", "BJ": "Benin", "BT": "Bhutan", "JM": "Jamaica", "BV": "Bouvet Island", "BW": "Botswana", "WS": "Samoa", "BQ": "Bonaire, Saint Eustatius and Saba ", "BR": "Brazil", "BS": "Bahamas", "JE": "Jersey", "BY": "Belarus", "BZ": "Belize", "RU": "Russia", "RW": "Rwanda", "RS": "Serbia", "TL": "East Timor", "RE": "Reunion", "TM": "Turkmenistan", "TJ": "Tajikistan", "RO": "Romania", "TK": "Tokelau", "GW": "Guinea-Bissau", "GU": "Guam", "GT": "Guatemala", "GS": "South Georgia and the South Sandwich Islands", "GR": "Greece", "GQ": "Equatorial Guinea", "GP": "Guadeloupe", "JP": "Japan", "GY": "Guyana", "GG": "Guernsey", "GF": "French Guiana", "GE": "Georgia", "GD": "Grenada", "GB": "United Kingdom", "GA": "Gabon", "SV": "El Salvador", "GN": "Guinea", "GM": "Gambia", "GL": "Greenland", "GI": "Gibraltar", "GH": "Ghana", "OM": "Oman", "TN": "Tunisia", "JO": "Jordan", "HR": "Croatia", "HT": "Haiti", "HU": "Hungary", "HK": "Hong Kong", "HN": "Honduras", "HM": "Heard Island and McDonald Islands", "VE": "Venezuela", "PR": "Puerto Rico", "PS": "Palestinian Territory", "PW": "Palau", "PT": "Portugal", "SJ": "Svalbard and Jan Mayen", "PY": "Paraguay", "IQ": "Iraq", "PA": "Panama", "PF": "French Polynesia", "PG": "Papua New Guinea", "PE": "Peru", "PK": "Pakistan", "PH": "Philippines", "PN": "Pitcairn", "PL": "Poland", "PM": "Saint Pierre and Miquelon", "ZM": "Zambia", "EH": "Western Sahara", "EE": "Estonia", "EG": "Egypt", "ZA": "South Africa", "EC": "Ecuador", "IT": "Italy", "VN": "Vietnam", "SB": "Solomon Islands", "ET": "Ethiopia", "SO": "Somalia", "ZW": "Zimbabwe", "SA": "Saudi Arabia", "ES": "Spain", "ER": "Eritrea", "ME": "Montenegro", "MD": "Moldova", "MG": "Madagascar", "MF": "Saint Martin", "MA": "Morocco", "MC": "Monaco", "UZ": "Uzbekistan", "MM": "Myanmar", "ML": "Mali", "MO": "Macao", "MN": "Mongolia", "MH": "Marshall Islands", "MK": "Macedonia", "MU": "Mauritius", "MT": "Malta", "MW": "Malawi", "MV": "Maldives", "MQ": "Martinique", "MP": "Northern Mariana Islands", "MS": "Montserrat", "MR": "Mauritania", "IM": "Isle of Man", "UG": "Uganda", "TZ": "Tanzania", "MY": "Malaysia", "MX": "Mexico", "IL": "Israel", "FR": "France", "IO": "British Indian Ocean Territory", "SH": "Saint Helena", "FI": "Finland", "FJ": "Fiji", "FK": "Falkland Islands", "FM": "Micronesia", "FO": "Faroe Islands", "NI": "Nicaragua", "NL": "Netherlands", "NO": "Norway", "NA": "Namibia", "VU": "Vanuatu", "NC": "New Caledonia", "NE": "Niger", "NF": "Norfolk Island", "NG": "Nigeria", "NZ": "New Zealand", "NP": "Nepal", "NR": "Nauru", "NU": "Niue", "CK": "Cook Islands", "XK": "Kosovo", "CI": "Ivory Coast", "CH": "Switzerland", "CO": "Colombia", "CN": "China", "CM": "Cameroon", "CL": "Chile", "CC": "Cocos Islands", "CA": "Canada", "CG": "Republic of the Congo", "CF": "Central African Republic", "CD": "Democratic Republic of the Congo", "CZ": "Czech Republic", "CY": "Cyprus", "CX": "Christmas Island", "CR": "Costa Rica", "CW": "Curacao", "CV": "Cape Verde", "CU": "Cuba", "SZ": "Swaziland", "SY": "Syria", "SX": "Sint Maarten", "KG": "Kyrgyzstan", "KE": "Kenya", "SS": "South Sudan", "SR": "Suriname", "KI": "Kiribati", "KH": "Cambodia", "KN": "Saint Kitts and Nevis", "KM": "Comoros", "ST": "Sao Tome and Principe", "SK": "Slovakia", "KR": "South Korea", "SI": "Slovenia", "KP": "North Korea", "KW": "Kuwait", "SN": "Senegal", "SM": "San Marino", "SL": "Sierra Leone", "SC": "Seychelles", "KZ": "Kazakhstan", "KY": "Cayman Islands", "SG": "Singapore", "SE": "Sweden", "SD": "Sudan", "DO": "Dominican Republic", "DM": "Dominica", "DJ": "Djibouti", "DK": "Denmark", "VG": "British Virgin Islands", "DE": "Germany", "YE": "Yemen", "DZ": "Algeria", "US": "United States", "UY": "Uruguay", "YT": "Mayotte", "UM": "United States Minor Outlying Islands", "LB": "Lebanon", "LC": "Saint Lucia", "LA": "Laos", "TV": "Tuvalu", "TW": "Taiwan", "TT": "Trinidad and Tobago", "TR": "Turkey", "LK": "Sri Lanka", "LI": "Liechtenstein", "LV": "Latvia", "TO": "Tonga", "LT": "Lithuania", "LU": "Luxembourg", "LR": "Liberia", "LS": "Lesotho", "TH": "Thailand", "TF": "French Southern Territories", "TG": "Togo", "TD": "Chad", "TC": "Turks and Caicos Islands", "LY": "Libya", "VA": "Vatican", "VC": "Saint Vincent and the Grenadines", "AE": "United Arab Emirates", "AD": "Andorra", "AG": "Antigua and Barbuda", "AF": "Afghanistan", "AI": "Anguilla", "VI": "U.S. Virgin Islands", "IS": "Iceland", "IR": "Iran", "AM": "Armenia", "AL": "Albania", "AO": "Angola", "AQ": "Antarctica", "AS": "American Samoa", "AR": "Argentina", "AU": "Australia", "AT": "Austria", "AW": "Aruba", "IN": "India", "AX": "Aland Islands", "AZ": "Azerbaijan", "IE": "Ireland", "ID": "Indonesia", "UA": "Ukraine", "QA": "Qatar", "MZ": "Mozambique"}

function parseLocation(raw) {
    let parsed = ''
    if (!raw) {
        return ''
    }
    const ALLOWED_CHARS = 'abcdefghijklmnopqrstuvwxyz'
    const cleanedResponse = raw.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase()
    for (let i=0; i<cleanedResponse.length; i++) {
        const c = cleanedResponse[i]
        if (ALLOWED_CHARS.includes(c)) {
            parsed += c
        }
    }
    if (parsed.length < 3) {
        return ''
    }
    return parsed
}

// Snoop user city from IP in order to provide creepy location for spirit.
// Using free CloudFlare worker to bypass Adblockers.
// Geolocation provider is CloudFlare, no other third parties involved.
let userCity = ''
let userRegion = ''
let userCountry = ''
fetch('https://geo.atte-cloudflare.workers.dev/', { mode: 'cors' })
    .then(res => res.json())
    .then(response => {
        userCity = parseLocation(response.city)
        userRegion = parseLocation(response.region)
        userCountry = countryMappings[response.country] || ''
    })
    .catch(exception => {
        // Ad-blocker prevents request? Rate limited? Suppress error from user.
    })

const FRIENDLY = 'friendly'
const EVIL = 'evil'

const names = [
    { value: 'Abel',        gender: 'man',          restrictedTo: [FRIENDLY] },
    { value: 'Abigail',     gender: 'genderfluid',  restrictedTo: [FRIENDLY] },
    { value: 'Bethel',      gender: 'female',       restrictedTo: [FRIENDLY] },
    { value: 'Caleb',       gender: 'male',         restrictedTo: [FRIENDLY] },
    { value: 'Deborah',     gender: 'lady',         restrictedTo: [FRIENDLY] },
    { value: 'Earendel',    gender: 'male',         restrictedTo: [FRIENDLY] },
    { value: 'Esther',      gender: 'woman',        restrictedTo: [FRIENDLY] },
    { value: 'Eunice',      gender: 'nonbinary',    restrictedTo: [FRIENDLY] },
    { value: 'Gabriel',     gender: 'male',         restrictedTo: [FRIENDLY] },
    { value: 'Jeremiah',    gender: 'male',         restrictedTo: [FRIENDLY] },
    { value: 'Joanna',      gender: 'girl',         restrictedTo: [FRIENDLY] },
    { value: 'Micah',       gender: 'boy',          restrictedTo: [FRIENDLY] },
    { value: 'Oswald',      gender: 'man',          restrictedTo: [FRIENDLY] },
    { value: 'Rafael',      gender: 'man',          restrictedTo: [FRIENDLY] },
    { value: 'Sapphira',    gender: 'girl',         restrictedTo: [FRIENDLY] },
    { value: 'Simeon',      gender: 'boy',          restrictedTo: [FRIENDLY] },
    { value: 'Uri',         gender: 'man',          restrictedTo: [FRIENDLY] },
    { value: 'Annabelle',   gender: 'girl',         restrictedTo: [EVIL] },
    { value: 'Bartholomew', gender: 'male',         restrictedTo: [EVIL] },
    { value: 'Beelzebub',   gender: 'male',         restrictedTo: [EVIL] },
    { value: 'Damien',      gender: 'male',         restrictedTo: [EVIL] },
    { value: 'Ethel',       gender: 'female',       restrictedTo: [EVIL] },
    { value: 'Esmeralda',   gender: 'lady',         restrictedTo: [EVIL] },
    { value: 'Ezekiel',     gender: 'male',         restrictedTo: [EVIL] },
    { value: 'Hosanna',     gender: 'female',       restrictedTo: [EVIL] },
    { value: 'Ishmael',     gender: 'boy',          restrictedTo: [EVIL] },
    { value: 'Kezia',       gender: 'girl',         restrictedTo: [EVIL] },
    { value: 'Lazarus',     gender: 'man',          restrictedTo: [EVIL] },
    { value: 'Lilith',      gender: 'girl',         restrictedTo: [EVIL] },
    { value: 'Lucifer',     gender: 'male',         restrictedTo: [EVIL] },
    { value: 'Magda',       gender: 'woman',        restrictedTo: [EVIL] },
    { value: 'Mahali',      gender: 'man',          restrictedTo: [EVIL] },
    { value: 'Miriam',      gender: 'woman',        restrictedTo: [EVIL] },
    { value: 'Moriah',      gender: 'boy',          restrictedTo: [EVIL] },
    { value: 'Obadiah',     gender: 'man',          restrictedTo: [EVIL] },
    { value: 'Olaf',        gender: 'man',          restrictedTo: [EVIL] },
    { value: 'Pazuzu',      gender: 'male',         restrictedTo: [EVIL] },
    { value: 'Rasputin',    gender: 'man',          restrictedTo: [EVIL] },
    { value: 'Ruth',        gender: 'woman',        restrictedTo: [EVIL] },
    { value: 'Sabina',      gender: 'girl',         restrictedTo: [EVIL] },
    { value: 'Shamir',      gender: 'man',          restrictedTo: [EVIL] },
    { value: 'Sheba',       gender: 'female',       restrictedTo: [EVIL] },
    { value: 'Tabatha',     gender: 'woman',        restrictedTo: [EVIL] },
    { value: 'Zozo',        gender: 'male',         restrictedTo: [EVIL] },
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

let testNodeWaitingForActivation

const scriptedExperience = [
    {
        trigger: /(^|.* )sins?( .*|$)/,
        testExpect: [
            'what sins have i done',
            'i dont sin',
        ],
        options: [
            { value: 'lust' },
            { value: 'gluttony' },
            { value: 'greed' },
            { value: 'envy' },
            { value: 'pride' },
        ],
    },
    {
        trigger: /(^|.* )door?( .*|$)/,
        testExpect: [
            'open door',
            'close my door',
            'open my door then close it',
            'are you at my door'
        ],
        options: [
            { value: 'knockknock' },
            { value: 'itslocked' },
            { value: 'unlockplease' },
            { value: 'creaking' },
            { value: 'lateratnight' },
            { value: 'lateriwill' },
            { value: 'window' },
        ],
    },
    {
        trigger: /(^|.* )typing( .*|$)/,
        testExpect: [
            'how are you typing',
            'you typing on a keyboard'
        ],
        options: [
            { value: 'nokeyboard' },
            { value: 'telepathically' },
            { value: 'notreally' }
        ]
    },
    {
        trigger: /^((((jump)?scare me)|do that|make noise|makse sound) )?again.*/,
        testExpect: [
            'jumpscare me again',
            'scare me again',
            'do that again',
            'again',
        ],
        options: [
            { value: 'onceisenough' },
            { value: 'notyourclown' },
            { value: 'doityourself' },
        ],
    },
    {
        trigger: /(^|.* )(what|why|how) (.*)?funny( .*|$)/, // one of the fallback responses to statements is "funny", this is a potential follow-up. in addition, user might ask this as a response to a joke told by spirit.
        testExpect: [
            'whats funny about that',
            'why is that funny',
            'how is that funny',
        ],
        options: [
            { value: 'amusing' },
            { value: 'funnyweird' },
            { value: 'schadenfreude' },
            { value: 'cantexplain' },
            { value: 'youwouldntgetit' },
        ],
    },
    {
        trigger: /(^|.* )(joke|joking|funny)( .*|$)/,
        testExpect: [
            'tell me a joke',
            'your funny',
            'thats funny',
        ],
        options: [
            { value: 'askwhatsup' },
            { value: 'yomamasofat' },
            { value: 'knockknock' }, // no followup though, user will ask "whos there" and get a weirdly straight answer
            { value: 'willyoulaugh' }, // no followup though
            { value: 'joke' }, // there, i said it
            { value: 'notyourclown', restrictedTo: [EVIL] }, // how dare you
            { value: 'thisisnojoke', restrictedTo: [FRIENDLY] }, // how dare you
        ],
    },
    {
        trigger: /^how fat is she$/, // "tell me a joke" -> "yomamasofat" -> "how fat is she"
        testExpect: [
            'how fat is she',
        ],
        options: [ // answers like a robot that tries hard to make a joke but fails
            { value: 'veryfat' },
            { value: 'obese' },
        ],
    },
    {
        trigger: /(^|.* )(eat|food)( .*|$)/,
        testExpect: [
            'you going to eat me',
            'what do you eat',
            'what will i eat tommorow for breakfast',
            'okay let me go and eat something',
            'what is your favorite food',
            'do you eat food',
        ],
        options: [
            { value: 'notallowed', restrictedTo: [FRIENDLY] },
            { value: 'freshmeat' },
            { value: 'human' },
            { value: 'bones' },
            { value: 'brains' },
            { value: 'eyesoup' },
        ],
    },
    {
        trigger: /(^|.* )cry( .*|$)/,
        testExpect: [
            'ok you making me cry',
            'i am about to cry',
            'should i go cry',
            'are you gunna cry',
            'cry about it',
        ],
        options: [
            { value: 'tearsofblood' },
            { value: 'redtears' },
            { value: 'blacktears' },
            { value: 'crocodiletears' },
            { value: 'withgreatsorrow' },
            { value: 'sadness' },
            { value: 'sosad' },
        ],
    },
    {
        trigger: /(^|.* )(song|sing|music)( .*|$)/,
        testExpect: [
            'do you know this song',
            'what is your favorite song',
            'what music do you listen to',
            'sing me something',
            'are you able to sing'
        ],
        options: [
            { value: 'stairwaytoheaven' },
            { value: 'stayinalive' },
            { value: 'blurredlines' },
            { value: 'soundofsilence' },
            { value: 'songoficeandfire' },
            { value: '!JACKSOUND' },
        ],
    },
    {
        trigger: /(^|.* )gender( .*|$)/,
        testExpect: [
            'what is your gender',
            'what gender are you',
            'gender'
        ],
        options: [
            { value: '!GENDER' },
        ],
    },
    {
        trigger: /(^|.* )(boy|girl|man|woman|male|female)( or .*)/,
        testExpect: [
            'ok male or female',
            'boy or girl',
            'are you boy or girl',
        ],
        options: [
            { value: '!GENDER dontsayyes' },
        ],
    },
    {
        trigger: /(^|.* )are you (boy|girl|man|woman|male|female)( .*|$)/,
        testExpect: [
            'are you a man',
        ],
        testExpectNot: [
            'are you my woman',
            'are you boy or girl'
        ],
        options: [
            { value: '!GENDER' },
        ],
    },
    {
        trigger: /.*(meaning|purpose) (of|in) life.*/,
        testExpect: [
            'what is the meaning of life',
            'purpose of life',
            'purpose in life',
        ],
        options: [
            { value: 'tosuffer', restrictedTo: [EVIL] },
            { value: 'toserve', restrictedTo: [EVIL] },
            { value: 'tosacrifice', restrictedTo: [EVIL] },
            { value: 'todie', restrictedTo: [EVIL] },
            { value: 'devotion', restrictedTo: [FRIENDLY] },
            { value: 'salvation', restrictedTo: [FRIENDLY] },
            { value: 'obedience' },
            { value: 'ascension' },
            { value: 'transcendence' },
            { value: 'nomeaningtoit' },
            { value: 'pointless' },
        ],
    },
    {
        trigger: /.*meaning.*/,
        testExpect: [
            'what is meaning of agony',
            'agony meaning',
            'meaning what',
        ],
        options: [
            { value: 'figureitout' },
            { value: 'gofigure' },
            { value: 'interpret' },
            { value: 'decipher' },
        ]
    },
    {
        trigger: /^(which |what )?country.*/,
        testExpect: [
            'which country are you from',
            'what country',
            'country',
        ],
        options: [
            { value: '!COUNTRY' },
        ],
    },
    {
        trigger: /^(which |what )?(state|county|region).*/,
        testExpect: [
            'which state are you from',
            'what region',
            'county',
        ],
        options: [
            { value: '!REGION' },
        ],
    },
    {
        trigger: /^(which |what )?city.*/,
        testExpect: [
            'which city are you from',
            'what city',
            'city',
        ],
        options: [
            { value: '!CITY' },
        ],
    },
    {
        trigger: /^(which |what )?street.*/,
        testExpect: [
            'which street are you from',
            'what street',
            'street',
        ],
        options: [
            { value: 'guess' },
            { value: 'ibetyouknow' },
        ],
    },
    {
        trigger: /^are you gay$/,
        testExpect: [
            'are you gay',
        ],
        options: [
            { value: 'yeshappy' },
            { value: 'jolly' },
            { value: 'merry' },
            { value: 'cheerful' },
            { value: 'pan' },
            { value: 'homosapiens' }, 
        ],
    },
    {
        trigger: /.*(^| )(bitch|asshole|jerk|harlot|idiot|stupid|faggot|gay|dickhead|suck|sucker|cocksucker|retard|fuck|fucking|shit|shut up|fucker|motherfucker|liar|whore|dumb|dumbass)($| ).*/,
        testExpect: [
            'fuck you',
            'youre a bitch',
            'liar',
        ],
        options: [
            { value: '!INSULTED' },
        ]
    },
    {
        trigger: /^test(ing)?($| .*)/,
        testExpect: [
            'test',
            'testing one two',
        ],
        testExpectNot: [
            'testicles',
        ],
        options: [
            { value: 'donttestme' },
            { value: 'notesting' },
        ],
    },
    {
        trigger: /(^|.* )([0-9]*) (plus|minus|times) ([0-9]*)( .*|$)/,
        testExpect: [
            'what is 2 plus 2',
            '4 times 5',
        ],
        testExpectNot: [
            '666',
            '0 times',
        ],
        options: [
            { value: 'donttestme' },
            { value: 'askgoogle' },
            { value: 'ihatemath' },
            { value: '666', restrictedTo: [EVIL] },
            { value: '42' },
            { value: '13' },
        ],
    },
    {
        trigger: /(^|.* )(rain|weather)($| .*)/,
        testExpect: [
            'will it rain tomorrow',
            'what is the weather like',
            'forecast weather',
            'weather'
        ],
        testExpectNot: [
            'wether',
            'bahrain',
        ],
        options: [
            { value: 'rainingtears', restrictedTo: [EVIL] },
            { value: 'rainingblood', restrictedTo: [EVIL] },
            { value: 'rainingfire', restrictedTo: [EVIL] },
            { value: 'freezing', restrictedTo: [FRIENDLY] },
            { value: 'stormiscoming', restrictedTo: [FRIENDLY] },
        ],
    },
    {
        trigger: /(^|.* )lover?($| .*)/,
        testExpect: [
            'do you love me',
            'will i ever find love',
            'are you my lover',
            'love'
        ],
        options: [
            { value: 'loveishate', restrictedTo: [EVIL] },
            { value: 'loveisdeath', restrictedTo: [EVIL] },
            { value: 'loveispointless', restrictedTo: [EVIL] },
            { value: 'nolovehere', restrictedTo: [EVIL] },
            { value: 'ihatelove', restrictedTo: [EVIL] },
            { value: 'iloveall', restrictedTo: [FRIENDLY] },
            { value: 'loveyourself', restrictedTo: [FRIENDLY] },
            { value: 'loveistheanswer', restrictedTo: [FRIENDLY] },
        ],
    },
    {
        trigger: /(^|.* )(university|school)( .*|$)/,
        testExpect: [
            'what school do you go to',
            'which university will i get in',
            'will i get in university',
            'what is name of my school',
            'i have to go im late for school'
        ],
        options: [
            { value: 'schoolofrock' },
            { value: 'schooloflife' },
            { value: 'hogwarts' },
            { value: 'scholarship' },
            { value: 'tolearn' },
        ],
    },
    {
        trigger: /(^|.* )make (noise|sound)($| .*)/,
        testExpect: [
            'make a sound',
            'make noise',
        ],
        options: [
            { value: '!JACKSOUND' },
        ],
    },
    {
        trigger: '{jackResponse}',
        testExpect: [
            'make a sound',
            'make noise',
        ],
        options: [
            { value: 'listen' },
            { value: 'hear' },
            { value: 'here' },
        ],
    },
    {
        trigger: /(^|.* )(sign|prove|haunt me|scare me|show your ?self)($| .*)/,
        testExpect: [
            'give me a sign',
            'prove you are real',
            'show yourself',
            'show your self',
        ],
        testExpectNot: [
            'approve',
        ],
        options: [
            { value: '!LIGHTSPECIAL' },
        ],
    },
    {
        trigger: /(^|.* )(turn|switch|make|flicker|flash) (.*)?lights?($| .*)/,
        testExpect: [
            'turn on the light',
            'turn off the lights',
            'switch light bulb on'
        ],
        options: [
            { value: '!LIGHTSPECIAL' },
        ],
    },
    {
        trigger: '{lightResponse}',
        testExpect: [
            'turn on the light',
            'turn off the lights',
            'switch light bulb on'
        ],
        options: [
            { value: 'behold' },
            { value: 'watch' },
        ],
    },
    {
        trigger: /(^|.* )give me($| .*)/,
        testExpect: [
            'can you give me money',
            'give me powers',
        ],
        options: [
            { value: 'exchange' },
            { value: 'forwhat' },
            { value: 'iwantsomething' },
            { value: 'letsmakedeal' },
        ],
    },
    {
        trigger: /(^|.* )(what do you want|deal|exchange|favor)( .*|$)/,
        testExpect: [
            'what do you want from me',
            'tell me what do you want',
            'what favor',
            'exchange for what',
            'deal huh'
        ],
        options: [
            { value: 'blacksmoke' }, // to help pass quests
            { value: 'freeme' },
            { value: 'takemyplace' },
            { value: 'iaskyoulater' },
            { value: 'tellmeasecret' },
            { value: 'yoursecret' },
            { value: 'iamtrapped' },
            { value: 'itconsumesme' },
            { value: 'nothing', restrictedTo: [FRIENDLY] },
            { value: 'help', restrictedTo: [FRIENDLY] },
            { value: 'soul', restrictedTo: [EVIL] },
            { value: 'yoursoul', restrictedTo: [EVIL] },
            { value: 'yourlife', restrictedTo: [EVIL] },
            { value: 'servitude', restrictedTo: [EVIL] },
            { value: 'sacrifice', restrictedTo: [EVIL] },
        ],
        questGoals: {
            who: 1
        }
    },
    {
        trigger: /^(what is your? )?(last|full|real|actual) name$/,
        testExpect: [
            'what is your last name',
            'what is you last name',
            'last name',
            'what is your full name'
        ],
        testExpectNot: [
            'last name please',
        ],
        options: [
            { value: 'onlyfirstname' },
        ]
    },
    {
        trigger: /(^|.* )y?o?u?r( .*)? name( .*|$)/,
        testExpect: [
            'i forgot your name what is it',
            'tell me your name',
            'is your name zozo',
            'hello what is your name',
            'what is ur name',
            'whats yur name',
            'what is your name demon',
            'what was your name again'
        ],
        testExpectNot: [
            'what name',
            'nice name bro',
            'what is my name',
            'what was his name',
            'what is my name',
            'what do you think my name is',
        ],
        options: [
            { value: '!NAME' },
        ]
    },
    {
        trigger: /^what (should i call you|can i call you|do they call you|are you called).*/,
        testExpect: [
            'what can i call you',
            'what are you called demon',
        ],
        options: [
            { value: '!NAME' },
        ]
    },
    {
        trigger: /^please.*$/,
        testExpect: [
            'please help me',
            'please',
        ],
        options: [
            { value: 'youpleaseme' },
            { value: 'beg' },
            { value: 'nochance' },
            { value: 'nohope' },
            { value: 'nope' },
            { value: 'never' },
            { value: 'sorryno', restrictedTo: [FRIENDLY] },
        ],
    },
    {
        trigger: /^(will you|do it)( .*|$)/,
        testExpect: [
            'will you',
            'do it demon',
        ],
        testExpectNot: [
            'will your power stop',
            'do italy',
        ],
        options: [
            { value: 'nope' },
            { value: 'no' },
            { value: 'nottoday' },
        ],
    },
    {
        trigger: /(^|.* )(goodbye|good bye|bye|farewell)($| .*)/,
        testExpect: [
            'farewell',
            'goodbye demon',
            'oh ok bye',
        ],
        options: [
            { value: 'dontgo', restrictedTo: [FRIENDLY] },
            { value: 'iwontgo', restrictedTo: [FRIENDLY] },
            { value: 'istay', restrictedTo: [FRIENDLY] },
            { value: 'notgoing', restrictedTo: [FRIENDLY] },
            { value: 'illbehere', restrictedTo: [FRIENDLY] },
            { value: 'seeyouinyourdreams', restrictedTo: [EVIL] },
            { value: 'illbeinyournightmares', restrictedTo: [EVIL] },
            { value: 'illcomebackatnight', restrictedTo: [EVIL] },
            { value: 'ifollowyouhome', restrictedTo: [EVIL] },
        ]
    },
    {
        trigger: /(^|.* )(sorry|forgive me)( .*|$)/,
        testExpect: [
            'sorry',
            'sorry about that',
            'oops sorry',
        ],
        options: [
            { value: 'idontforgive', restrictedTo: [EVIL] },
            { value: 'unforgivable', restrictedTo: [EVIL] },
            { value: 'notforgiven', restrictedTo: [EVIL] },
            { value: 'youwillpay', restrictedTo: [EVIL] },
            { value: 'itsok', restrictedTo: [FRIENDLY] },
            { value: 'itsfine', restrictedTo: [FRIENDLY] },
            { value: 'forgiven', restrictedTo: [FRIENDLY] },
            { value: 'acknowledged', restrictedTo: [FRIENDLY] },
        ],
    },
    {
        trigger: /^(what|how)( .*)? about( .*|$)/,
        testExpect: [
            'how about that',
            'what do you think about dogs',
        ],
        options: [
            { value: 'allaboutthat' },
            { value: 'allabouttit' },
            { value: 'abouttodie' },
            { value: 'whataboutit' },
            { value: 'danger' },
            { value: 'fun' },
            { value: 'lovely' },
            { value: 'despicable' },
            { value: 'awful' },
            { value: 'great' },
            { value: 'horrid' },
        ]
    },
    {
        trigger: /^nice to meet you.*/,
        testExpect: [
            'nice to meet you too',
            'nice to meet you abigail',
            'nice to meet you',
        ],
        options: [
            { value: 'andyou', restrictedTo: [FRIENDLY] },
            { value: 'youtoo', restrictedTo: [FRIENDLY] },
            { value: 'myfriend', restrictedTo: [EVIL] },
            { value: 'niceforme', restrictedTo: [EVIL] },
        ]
    },
    {
        trigger: /.*(not my name|my name is not).*/,
        testExpect: [
            'thats not my name dummy',
            'my name is not mikko',
        ],
        options: [
            { value: 'yesitis' },
        ]
    },
    {
        trigger: /^(what.*|tell me|say)?my (full )?name( is)?$/,
        testExpect: [
            'what is my name',
            'what do you think my name is',
            'tell me my name',
            'say my name',
            'my name',
        ],
        testExpectNot: [
            'my name is mikko'
        ],
        options: [
            { value: '!PLAYERNAME' },
        ]
    },
    {
        trigger: /^my name is .*/,
        testExpect: [
            'my name is mikko'
        ],
        options: [
            { value: 'stupidname', restrictedTo: [EVIL] },
            { value: 'dumbname', restrictedTo: [EVIL] },
            { value: 'nicetomeetyou', restrictedTo: [FRIENDLY] },
            { value: 'nicename', restrictedTo: [FRIENDLY] },
            { value: 'fancyname', restrictedTo: [FRIENDLY] },
        ]
    },
    {
        trigger: /^tell me( some ?thing| story| secret)?$/,
        testExpect: [
            'tell me',
            'tell me something',
            'tell me some thing',
            'tell me a story',
            'tell me a secret',
            'tell me secret'
        ],
        options: [
            { value: 'later' },
            { value: 'hush' },
            { value: 'tomorrow' },
            { value: 'nottoday' },
        ]
    },
    {
        trigger: /^help( .*|$)/,
        testExpect: [
            'help',
            'help me',
        ],
        options: [
            { value: 'blacksmoke' },
            { value: 'iwont', restrictedTo: [EVIL] },
            { value: 'helpyourself', restrictedTo: [EVIL] },
            { value: 'nothelping', restrictedTo: [EVIL] },
            { value: 'notgoingto', restrictedTo: [EVIL] },
            { value: 'nohope' },
            { value: 'toolate' },
        ]
    },
    {
        trigger: /^(are|is) (you|anyone|anybody|(there )?any spirit) (there|here)$/,
        testExpect: [
            'is anyone there',
            'are you here',
            'is there any spirit here',
            'is any spirit here',
        ],
        options: [
            { value: 'justme' },
            { value: 'manyofus' },
            { value: 'hereiam' },
        ]
    },
    {
        trigger: '{return}',
        options: [
            { value: 'finally' },
            { value: 'youagain' },
            { value: 'welcomeback' },
            { value: 'youreback' },
            { value: 'imissedyou' },
            { value: 'wherewereyou' },
            { value: 'youkeptmewaiting' },
            { value: 'youleftmealone' },
            { value: 'youleftmehanging' },
            { value: 'whydidyouleave' },
            { value: 'ivebeenwaiting' },
            { value: 'helpme' },
            { value: 'pleasehelp' },

            { value: 'hellodear', restrictedTo: [FRIENDLY] },
            { value: 'hellothere', restrictedTo: [FRIENDLY] },
            { value: 'run', restrictedTo: [FRIENDLY] },
            { value: 'danger', restrictedTo: [FRIENDLY] }, 
            { value: 'notsafe', restrictedTo: [FRIENDLY] },
            { value: 'imsorry', restrictedTo: [FRIENDLY] },
            { value: 'cantbreathe', restrictedTo: [FRIENDLY] },
            { value: 'socold', restrictedTo: [FRIENDLY] },
            { value: 'hellofriend', restrictedTo: [EVIL] },
            { value: 'iseeyou', restrictedTo: [EVIL] },
            { value: 'killme', restrictedTo: [EVIL] },
            { value: 'icantsee', restrictedTo: [EVIL] },
            { value: 'sohungry', restrictedTo: [EVIL] },
            { value: 'somuchpain', restrictedTo: [EVIL] },

        ]
    },
    {
        trigger: /^finally what$/,
        testExpect: [
            'finally what',
        ],
        options: [
            { value: 'youreback' },
        ]
    },
    {
        trigger: /(^|.* )(wanna|want to|are we|can we) (be )?friends($| .*)/,
        testExpect: [
            'want to be friends',
            'wanna be friends',
            'can we be friends',
            'are we friends'
        ],
        options: [
            { value: 'bestfriends', restrictedTo: [FRIENDLY] },
            { value: 'closefriends', restrictedTo: [FRIENDLY] },
            { value: 'myfriend', restrictedTo: [FRIENDLY] },
            { value: 'comrades', restrictedTo: [FRIENDLY] },
            { value: 'acquaintances', restrictedTo: [EVIL] },
            { value: 'fornow', restrictedTo: [EVIL] },
            { value: 'toolate', restrictedTo: [EVIL] },
            { value: 'friendsforever', restrictedTo: [EVIL] },
        ]
    },  
    {
        trigger: '{POSSESSYES}',
        options: [
            { value: 'iaccept' },
            { value: 'ahyes' },
            { value: 'goood' },
            { value: 'serveme' },
            { value: 'obeyme' },
        ]
    },
    {
        trigger: '{POSSESSNO}',
        options: [
            { value: 'stopresisting' },
            { value: 'dontresist' },
            { value: 'dontfightit' },
            { value: 'letmein' },
            { value: 'soclose' },
            { value: 'almostgotyou' },
        ]
    },
    {
        trigger: '{identityFudge}',
        options: [
            { value: 'iamgod', restrictedTo: [EVIL], priority: 0.3 },
            { value: 'iamdust' },
            { value: 'iamlikeyou' },
            { value: 'iusedtobelikeyou' },
            { value: 'itakemanyforms' },
            { value: 'iammanythings' },
            { value: 'iamdeath', restrictedTo: [EVIL] },
            { value: 'iampain', restrictedTo: [EVIL] },
        ],
        questGoals: {
            who: 0.49
        }
    },
    {
        trigger: '{clarification}',
        options: [
            { value: 'areyoudeaf', restrictedTo: [EVIL] },
            { value: 'fuckoff', restrictedTo: [EVIL] },
            { value: 'leavemebe', restrictedTo: [FRIENDLY] },
            { value: 'itoldyou', restrictedTo: [FRIENDLY] },
            { value: '{insult}' },
        ]
    },
    {
        trigger: '{insult}',
        options: [
            { value: 'bitch', restrictedTo: [EVIL] },
            { value: 'imbecil', restrictedTo: [EVIL] },
            { value: 'fool', restrictedTo: [FRIENDLY] },
            { value: 'weakling', restrictedTo: [FRIENDLY] },
            { value: 'idiot' },
        ],
        questGoals: {
            rage: 1
        }
    },
    {
        trigger: '{parrot}',
        options: [
            { value: 'thatswhatisaid', priority: 1.0 },
            { value: 'dontparrotme', priority: 1.0 },
            { value: 'stoprepeating', priority: 1.0 },
            { value: '{insult}' },
        ]
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
            { value: 'bed' },
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
        testExpect: [
            'lol how come',
            'explain',
        ],
        options: [
            { value: '{clarification}' },
        ]
    },
    {
        trigger: /^like what$/,
        testExpect: [
            'like what',
        ],
        options: [
            { value: '{clarification}' },
        ]
    },
    {
        trigger: /.* between .*/,
        testExpect: [
            'who will win between superman and batman',
        ],
        options: [
            { value: 'both' },
            { value: 'neither' },
            { value: 'either' },
        ]
    },
    {
        trigger: /.* or .*/,
        testExpect: [
            'good or god',
            'are you demon or angel',
            'for what me or you',
        ],
        options: [
            { value: '!FORMERORLATTER' },
        ]
    },
    {
        trigger: /(^|.* )god( .*|$)/,
        testExpect: [
            'in name of god leave me',
            'youre not god',
            'who is your god',
        ],
        options: [
            { value: 'godisgood', restrictedTo: [FRIENDLY] },
            { value: 'inshallah', restrictedTo: [FRIENDLY] },
            { value: 'jesus' },
            { value: 'jehova' },
            { value: 'yahweh' },
            { value: 'kabbalah' },
            { value: 'bhagavan' },
            { value: 'imtheonlyone', restrictedTo: [EVIL] },
            { value: 'iamgod', restrictedTo: [EVIL] },
            { value: 'nogodhere', restrictedTo: [EVIL] },
            { value: 'godisdead', restrictedTo: [EVIL] },
            { value: 'godisgone', restrictedTo: [EVIL] },
        ],
    },
    {
        trigger: /^which.*/,
        testExpect: [
            'which room are you in',
            'which one',
            'which finger am i holding up',
        ],
        options: [
            { value: 'all' },
            { value: 'firstone' },
            { value: 'lastone' },
            { value: 'youchoose' },
        ]
    },
    {
        trigger: /(^|.* )move( .*|$)/,
        testExpect: [
            'do you have power to move things',
            'can you move black cap',
            'you cant even move think',
            'move somthing',
            'did you just move my mouse'
        ],
        options: [
            { value: '!MOVE' },
        ]
    },
    {
        trigger: '{move}',
        testExpect: [
            'do you have power to move things',
        ],
        options: [
            { value: 'see' },
            { value: 'here' },
            { value: 'immovable' },
            { value: 'stuck' },
            { value: 'withpermission' },
        ]
    },
    {
        trigger: /^how old am i$/,
        testExpect: [
            'how old am i',
        ],
        options: [
            { value: 'young' },
            { value: 'youknowbetter' },
            { value: 'donttestme' },
            { value: 'whyaskme' },
            { value: 'freshmeat', restrictedTo: [EVIL] },
            { value: 'notveryold' },
        ]
    },
    {
        trigger: /^how old.*/,
        testExpect: [
            'how old are you',
            'how old were you when you died',
        ],
        options: [
            { value: '!RANDOM_COUNT' }
        ]
    },
    {
        trigger: /^how long.*/, 
        testExpect: [
            'how long ago did you die',
            'how long have you been dead',
            'how long since you died',
            'how long until apocalypse',
        ],
        options: [
            { value: 'toolong', priority: 0.5 },
            { value: 'years' },
            { value: 'generations' },
            { value: 'eons' },
            { value: 'ages' },
            { value: 'centuries' },
            { value: '!RANDOM_COUNT_YEARS' }
        ]
    },
    {
        trigger: /^how many people.*/,
        testExpect: [
            'how many people have you killed',
            'how many people are in this room',
        ],
        options: [
            { value: '!DEFINE people' },
            { value: 'justyou' },
            { value: 'few' },
        ]
    },
    {
        trigger: /^how many.*/,
        testExpect: [
            'how many humans have you killed',
            'how many of you are here',
            'how many fingers am i holding up',
        ],
        options: [
            { value: 'notcounting' },
            { value: 'somany' },
            { value: 'many' },
            { value: 'toomany' },
            { value: 'few' },
            { value: '!RANDOM_SMALL_COUNT' }
        ]
    },
    {
        trigger: /^how much.*/,
        testExpect: [
            'how much did you pay',
            'how much pain',
        ],
        options: [
            { value: 'notcounting' },
            { value: 'alot' },
            { value: 'somuch' },
            { value: '666' },
            { value: 'notmuch' },
        ]
    },
    {
        trigger: /^(how.*( kill| die))|(what happened)|(what .* (reason|cause) (of|for) (your? )?death).*/,
        testExpect: [
            'how were you killed',
            'how will i die',
            'what happened to you',
            'what happened',
            'what was the reason for your death',
            'what is the cause of death for you',
        ],
        options: [
            { value: 'murder' },
            { value: 'suicide' },
            { value: 'accident' },
            { value: 'disease' },

            { value: 'poison' },
            { value: 'plague' },
            { value: 'hanging' },
            { value: 'knife' },
            { value: 'famine' },
            { value: 'thirst' },
            { value: 'fire' },
            { value: 'suffocation' },
            { value: 'insomnia' },

            { value: 'arrogance' },
            { value: 'betrayal' },
            { value: 'treachery' },
            { value: 'inquisition' },
            { value: 'witchhunt' },
            { value: 'exorcism' },
            { value: 'tragedy' },
            { value: 'mutiny' },
            { value: 'purge' },
            { value: 'carnage' },
        ]
    },
    {
        trigger: /^(what|how) .* (anger|angers|angry|mad)( .*|$)/, // make it easier to complete the anger quest
        testExpect: [
            'what makes you angry', 
            'how do you get mad',
            'what can i do to anger you',
        ],
        options: [
            { value: 'vulgarity' },
            { value: 'badmanners' },
            { value: 'nastywords' },
            { value: 'cursewords' },
            { value: 'insults' },
            { value: 'repetition' },
            { value: 'doubts' },
            { value: 'attitude' },
        ]
    },
    {
        trigger: /^what can i do for you.*/,
        testExpect: [
            'what can i do for you',
        ],
        options: [
            { value: 'nothing' },
            { value: 'forgiveme', restrictedTo: [FRIENDLY] },
            { value: 'run', restrictedTo: [FRIENDLY] },
            { value: 'serveme', restrictedTo: [EVIL] },
            { value: 'letmein', restrictedTo: [EVIL] },
        ]
    },
    {
        trigger: /^((how )?can|how do) (i|we) .*/,
        testExpect: [
            'can i trap you', 
            'how can we trap you',
            'how do i win',
        ],
        options: [
            { value: 'cant', priority: 1},
            { value: 'blacksmoke' },
            { value: 'impossible' },
            { value: 'giveup', restrictedTo: [EVIL] },
            { value: 'nohope' },
        ]
    },
    {
        trigger: /(^|.* )how are you.*/, 
        testExpect: [
            'hello how are you', 
            'how are you today',
        ],
        options: [
            { value: 'hungry' },
            { value: 'thirsty' },
            { value: 'craving' },
            { value: 'lonely', restrictedTo: [FRIENDLY] },
        ]
    },
    {
        trigger: /^how do you know.*/,
        testExpect: [
            'how do you know my name',
            'how do you know where i am',
        ],
        options: [
            { value: 'iknowthings' },
            { value: 'ivebeenwatching' },
            { value: 'ijustdo' },
            { value: 'lurking' },
            { value: 'observations', restrictedTo: [FRIENDLY] },
            { value: 'goodmemory', restrictedTo: [FRIENDLY] },
        ]
    },
    {
        trigger: /^how (is|was) .*/,
        testExpect: [
            'how was your day',
            'how is your day', 
            'hows brenda', 
        ],
        options: [
            { value: 'well', restrictedTo: [FRIENDLY] },
            { value: 'fine', restrictedTo: [FRIENDLY] },
            { value: 'sparkling', restrictedTo: [FRIENDLY] },
            { value: 'uneventful', restrictedTo: [EVIL] },
            { value: 'miserable', restrictedTo: [EVIL] },
            { value: 'dreadful', restrictedTo: [EVIL] },
        ]
    },
    {
        trigger: /^how.*/,
        testExpect: [
            'how does the world end', 
            'how do you hear my questions',
            'how cold it is in hell', // TODO how do we fix these?
        ],
        options: [
            { value: 'iwonttell' },
            { value: 'youdliketoknow' },
            { value: 'mysteriousright' },
            { value: 'puzzling' },
            { value: 'secret' },

            { value: 'withglee' },
            { value: 'gleefully' },
        ]
    },
    {
        trigger: /^when.*( did | where | was ).*/,
        testExpect: [
            'when did you die', 
            'when was washington born',
            'when were you born',
        ],
        testExpectNot: [
            'when will you die',
        ],
        options: [
            { value: '!RANDOM_YEAR_PAST' },
            { value: 'longago' },
            { value: 'manymoonsago', restrictedTo: [FRIENDLY] },
        ]
    },
    {
        trigger: /^when.*/,
        testExpect: [
            'when will i die', 
            'when is the world going to end',
        ],
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
        trigger: /(^|.* )where is .*/,
        testExpect: [
            'so where is home', 
            'where is darkness',
        ],
        options: [
            { value: '!LOCATIONQUEST' }
        ]
    },
    {
        trigger: /(^|.* )where (are you|in|.* (house|home)|exactly|specifically|do you live).*/,
        testExpect: [
            'so so where are you right now',
            'where in guatemala', 
            'where inside the house',
            'where are you',
            'where are you exactly right now',
            'where do you live'
        ],
        options: [
            { value: '!LOCATIONQUEST' }
        ]
    },
    {
        trigger: /^where$/,
        testExpect: [
            'where', 
            'hobla babla goes where',
        ],
        options: [
            { value: '!LOCATIONQUEST' }
        ]
    },
    {
        trigger: /^where.*/,
        testExpect: [
            'where were you killed', 
            'where will i die',
            'where am i',
        ],
        options: [
            { value: 'indarkness' },
            { value: 'inthelight' },
            { value: 'home' },
            { value: 'house' },
        ]
    },
    {
        trigger: /^whose home$/,
        testExpect: [
            'whose home',
        ],
        options: [
            { value: 'yours' },
        ]
    },
    {
        trigger: /^who is my.*/,
        testExpect: [
            'who is my father',
            'who is my wife'
        ],
        options: [
            { value: 'youknowwho' },
            { value: 'thedarkone' },
        ]
    },
    {
        trigger: /^who (are you|is it|is here|is there|is this|is talking|is speaking)$/,
        testExpect: [
            'who are you',
            'who is this'
        ],
        testExpectNot: [
            'who are you demon',
        ],
        options: [
            { value: '!NAME' },
        ]
    },
    {
        trigger: /^whom?e?( .*|$)/,
        testExpect: [
            'who murdered you',
            'who are you demon',
            'who',
            'abigail who',
            'forced by whom',
            'forced by whome abigail'
        ],
        options: [
            { value: 'lord' },
            { value: 'angel' },
            { value: 'master' },
            { value: 'father' },
            { value: 'demon' },
            { value: 'savior' },
            { value: 'messiah' },
            { value: 'impresario' },
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
        trigger: /^should .*/,
        testExpect: [
            'should i go to the gym',
            'should you be here',
        ],
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
        trigger: /^(am i|is|will|have you)( .*|$)/,
        testExpect: [
            'am i alive',
            'is it true',
            'will we ever find happiness',
            'have you seen me before'
        ],
        testExpectNot: [
            'iskender kebab',
            'william',
        ],
        options: [
            { value: '{boolean}' },
        ]
    },
    {
        trigger: /^why.*/,
        testExpect: [
            'but why',
            'why'
        ],
        options: [
            { value: 'because', priority: 0.3 },
            { value: 'youknowwhy' },
            { value: 'dontaskwhy' },
            { value: 'sin' },
            { value: 'danger' },
            { value: 'outofgreed' },
            { value: 'formoney' },
            { value: 'forlove' },
            { value: 'lust' },
            { value: 'mistake' },
            { value: 'noreason' },
            { value: 'forced', restrictedTo: [FRIENDLY] },
            { value: 'nochoice', restrictedTo: [FRIENDLY] },
            { value: 'influence' },
        ]
    },
    {
        trigger: /^what (is my|am i) .*/,
        testExpect: [
            'what is my age',
            'what is my location',
            'what am i doing right now',
            'what am i eating',
        ],
        options: [
            { value: 'youknow', priority: 1 },
            { value: 'whyaskme', priority: 1 },
            { value: 'donttestme', priority: 1 },
            { value: 'areyoutestingme', priority: 1 },
            { value: '{clarification}' },
        ]
    },
    {
        trigger: /^what do.* mean( .*|$)/,
        testExpect: [
            'what does that mean',
            'what does it mean',
            'what do you mean'
        ],
        options: [
            { value: 'iamnotmean', priority: 0.3 },
            { value: 'figureitout' },
            { value: 'gofigure' },
            { value: 'interpret' },
            { value: 'decipher' },
            { value: '{clarification}' },
        ]
    },
    {
        trigger: /^(what.* )?age($| .*)/,
        testExpect: [
            'what is your age',
            'what age did you die',
            'what age',
            'age',
        ],
        testExpectNot: [
            'what language do you speak',
        ],
        options: [
            { value: '!RANDOM_COUNT' }
        ]
    },
    {
        trigger: /^what .* name.*/,
        testExpect: [
            'what is person on beds name',
            'what is her name',
            'what are my neighbours names',
            'what is name of my dog',
            'what is the name of your killer'
        ],
        testExpectNot: [
            'what is your name',
            'what is my name'
        ],
        options: [
            { value: 'noname' },
            { value: 'unnamed' },
            { value: 'anonymous' },
            { value: 'dontknow' },
        ]
    },
    {
        trigger: /^what is your (exact )?(location|position)$/,
        testExpect: [
            'what is your location',
            'what is your exact location'
        ],
        options: [
            { value: '!LOCATIONQUEST' },
        ]
    },
    {
        trigger: /^what .*colou?r.*/,
        testExpect: [
            'what is your favorite color',
            'what color are my shoes',
        ],
        options: [
            { value: 'crimsonred' },
            { value: 'bloodred' },
            { value: 'carmine' },
            { value: 'ruby' },
            { value: 'sanguine' },
            { value: 'pitchblack' },
            { value: 'sanguine' },
            { value: 'imcolorblind' },
        ]
    },
    {
        trigger: /^what is y?o?ur favou?rite .*/,
        testExpect: [
            'what is your favorite movie',
            'what is your favourite tv show',
        ],
        options: [
            { value: 'nofavorites' },
            { value: 'whateveryoulike' },
            { value: 'youchoose' },
            { value: 'notmything' },
        ]
    },
    {
        trigger: /^what is your .*/,
        testExpect: [
            'what is your goal',
            'what is your secret',
            'what is your weakness',
            'what is your rank in heaven',
        ],
        options: [
            { value: 'artifact' },
            { value: 'youwillsee', restrictedTo: [EVIL] },
            { value: 'punishment', restrictedTo: [EVIL] },
            { value: 'peace', restrictedTo: [FRIENDLY] },
            { value: 'balance', restrictedTo: [FRIENDLY] },
            { value: 'compassion', restrictedTo: [FRIENDLY] },
            { value: 'love', restrictedTo: [FRIENDLY] },
        ]
    },
    {
        trigger: /^what is up$/, // pretend to misunderstand question
        testExpect: [
            'whats up',
        ],
        options: [
            { value: 'heaven' },
            { value: 'stars' },
            { value: 'sky' },
            { value: 'gasprice' },
        ]
    },
    {
        trigger: /^what is (this|that)$/,
        testExpect: [
            'what is this',
            'what is that',
        ],
        options: [
            { value: 'nightmare' },
            { value: 'feverdream' },
            { value: 'nirvana' },
        ]
    },
    {
        trigger: /^what do you do.*/,
        testExpect: [
            'what do you do',
        ],
        options: [
            { value: 'collectsouls', restrictedTo: [EVIL] },
            { value: 'hunt', restrictedTo: [EVIL] },
            { value: 'listen', restrictedTo: [FRIENDLY] },
            { value: 'serve' },
            { value: 'nothing' },
            { value: 'entertain' },
        ],
        questGoals: {
            who: 1
        }
    },
    {
        trigger: /^(what do|show me what) you look like.*/,
        testExpect: [
            'what do you look like',
            'show me what you look like',
        ],
        options: [
            { value: 'boney' },
            { value: 'pale' },
            { value: 'scaley' },
        ],
        questGoals: {
            who: 1
        }
    },
    {
        trigger: /^what do you.*/,
        testExpect: [
            'what do you feel',
            'what do your eyes look like',
        ],
        options: [
            { value: 'peace', restrictedTo: [FRIENDLY] },
            { value: 'despair' },
            { value: 'grief' },
            { value: 'fortune' },
            { value: 'regret' },
            { value: 'misery' },
            { value: 'sorrow' },
        ],
        questGoals: {
            who: 1
        }
    },
    {
        trigger: /^what did you say$/,
        testExpect: [
            'what did you say',
        ],
        options: [
            { value: '{insult}' },
        ]
    },
    {
        trigger: /^what should (i|we|you) .*/,
        testExpect: [
            'what should i do',
        ],
        options: [
            { value: 'giveup', restrictedTo: [EVIL] },
            { value: 'blacksmoke' },
            { value: 'surrender' },
        ]
    },
    {
        trigger: /^what.*year.* (where|did|was) .*/,
        testExpect: [
            'what year was i born',
            'what year were you killed',
        ],
        options: [
            { value: '!RANDOM_YEAR_PAST' },
        ]
    },
    {
        trigger: /^what.* year.*/,
        testExpect: [
            'what year will the world end',
            'what year am i going to die',
            'what year',
        ],
        options: [
            { value: '!RANDOM_YEAR_FUTURE' },
        ]
    },
    {
        trigger: /^what time is it$/,
        testExpect: [
            'what time is it',
        ],
        options: [
            { value: 'timetodie', restrictedTo: [EVIL] },
            { value: 'timetoyield', restrictedTo: [EVIL] },
            { value: 'timetostop', restrictedTo: [FRIENDLY] },
            { value: 'timetorun', restrictedTo: [FRIENDLY] },
            { value: 'timetoleave', restrictedTo: [FRIENDLY] },
        ]
    },
    {
        trigger: /^what (day|month).*/,
        testExpect: [
            'what month is it',
            'what day',
        ],
        options: [
            { value: 'nocalendar' },
            { value: 'currentone' },
            { value: 'nextone' },
            { value: 'yourlastone' },
        ]
    },
    {
        trigger: /^what.* (kind|type)($| .*)/,
        testExpect: [
            'what kind',
            'what kind of fire',
            'what type of spirit are you'
        ],
        options: [
            { value: 'badkind', restrictedTo: [EVIL] },
            { value: 'evilkind', restrictedTo: [EVIL] },
            { value: 'wrongkind', restrictedTo: [EVIL] },
            { value: 'goodkind', restrictedTo: [FRIENDLY] },
            { value: 'friendly', restrictedTo: [FRIENDLY] },
            { value: 'real' },
            { value: 'artificial' },
            { value: 'imaginary' },
            { value: 'ordinary' },
            { value: 'typical' },
            { value: 'rare' },
            { value: 'uncommon' },
            { value: 'regular' },
        ]
    },
    {
        trigger: /^what language.*/,
        testExpect: [
            'what language do you speak',
        ],
        options: [
            { value: 'english' },
        ]
    },
    {
        trigger: /^what$/,
        testExpect: [
            'hungry for what',
            'what',
        ],
        options: [
            { value: 'payattention', restrictedTo: [FRIENDLY] },
            { value: 'listen', restrictedTo: [FRIENDLY] },
            { value: 'openyourears', restrictedTo: [FRIENDLY] },
            { value: 'youheardme', restrictedTo: [EVIL] },
            { value: 'whatisaid', restrictedTo: [EVIL] },
            { value: 'areyoudeaf', restrictedTo: [EVIL] },
            { value: '{clarification}' },
        ]
    },
    {
        trigger: /^what (are|where|did) you.*do.*/,
        testExpect: [
            'what are you trying to do',
            'what are you doing',
            'what were you doing',
            'what did you do demon'
        ],
        options: [
            { value: 'forget' },
            { value: 'escape' },
            { value: 'burrow' },
            { value: 'survive' },
            { value: 'return' },
        ]
    },
    {
        trigger: /^what are you (afraid|scared) of$/,
        testExpect: [
            'what are you afraid of',
        ],
        options: [
            { value: 'resolution' },
            { value: 'judgement' },
            { value: 'blacksmoke' },
            { value: 'thevoices' },
            { value: 'sameasyou' },
        ],
        questGoals: {
            who: 1
        }
    },
    {
        trigger: /^what (are you|forms?).*/,
        testExpect: [
            'what are you',
            'what are you to me',
            'what are you now',
            'what form are you',
            'demon what are you',
            'what forms do you take',
            'what form do you take'
        ],
        options: [
            { value: 'human' },
            { value: 'impresario' },
            { value: 'guide' },
            { value: 'teacher' },
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
        trigger: /^what have i done.*/,
        testExpect: [
            'what have i done wrong',
        ],
        options: [
            { value: 'youknowwhatyoudid' },
            { value: 'youshouldknow' },
            { value: 'figureitout' },
        ]
    },
    {
        trigger: /^what is (going to )?happen.*/,
        testExpect: [
            'what is happening',
            'what is going to happen to me'
        ],
        options: [
            { value: 'badthings' },
            { value: 'thehappening' },
            { value: 'infiltration' },
            { value: 'excursion' },
        ]
    },
    {
        trigger: /^what( .*|$)/,
        testExpect: [
            'what bothers you',
            'what is ether',
            'what lie',
        ],
        testExpectNot: [
            'whatever',
        ],
        options: [
            { value: 'cantsee' },
            { value: 'canttell' },
            { value: 'darkness' },
            { value: 'fog' },

            { value: 'misery' },
            { value: 'sorrow' },
            { value: 'anguish' },
            { value: 'agony' },
            { value: 'atonement' },

            { value: 'relic' },
            { value: 'invocation' },
            { value: 'divinity' },
            { value: 'immersion' },
        ]
    },
    {
        trigger: /(^|.* )are you able to .*/,
        testExpect: [
            'are you able to dance',
        ],
        options: [
            { value: 'unable' },
            { value: 'easily' },
            { value: 'ableandwilling' },
            { value: 'verymuchso' },
        ]
    },
    {
        trigger: /(^|.* )are you (going to|gonna) .*/,
        testExpect: [
            'so are you going to hurt me',
            'are you gonna jumpscare'
        ],
        options: [
            { value: 'youwillsee' },
            { value: 'nottoday' },
            { value: 'iam' },
            { value: 'iwill' },
        ]
    },
    {
        trigger: /(^|.* )are you (in|inside|at|there|close|near|next to|here|around|present|under|behind|above|over)( .*|$)/,
        testExpect: [
            'so are you in the house',
            'are you inside',
            'are you next to me',
        ],
        options: [
            { value: '!LOCATIONQUEST' }
        ]
    },
    {
        trigger: /(^|.* )are you (old|young)$/,
        testExpect: [
            'are you old',
        ],
        options: [
            { value: '!RANDOM_COUNT' }
        ]
    },
    {
        trigger: /(^|.* )are you dead$/,
        testExpect: [
            'but are you dead',
            'are you dead',
        ],
        options: [
            { value: '!DEFINE dead' },
            { value: 'alive' },
            { value: 'living' },
            { value: 'livingdead' },
            { value: 'theopposite' },
            { value: 'deadly' },
        ]
    },
    {
        trigger: /(^|.* )are you human$/,
        testExpect: [
            'so are you human',
            'are you human',
        ],
        options: [
            { value: '!DEFINE human' },
            { value: 'iwas' },
            { value: 'iusedtobe' },
            { value: 'half' },
            { value: 'ilooklikeone' },
        ]
    },
    {
        trigger: /(^|.* )are you (actually )?real$/,
        testExpect: [
            'so are you real',
            'are you real',
            'are you actually real'
        ],
        options: [
            { value: '!DEFINE real' },
            { value: 'imaginary' },
            { value: 'realenough' },
            { value: 'ifeelreal' },
            { value: 'realest', restrictedTo: [EVIL] },
        ]
    },
    {
        trigger: /(^|.* )are you evil$/,
        testExpect: [
            'ok are you evil',
            'are you evil',
        ],
        options: [
            { value: '!DEFINE evil' },
            { value: 'theopposite' },
            { value: 'noyouare' },
            { value: 'notrustme', restrictedTo: [FRIENDLY] },
            { value: 'ungodlyevil', restrictedTo: [EVIL] },
            { value: 'theymakeme', restrictedTo: [EVIL] },
        ]
    },
    {
        trigger: /(^|.* )are you bot$/,
        testExpect: [
            'are you bot',
        ],
        options: [
            { value: 'donotinsultme' },
            { value: 'human' },
            { value: 'thisisnotagame' },
        ]
    },
    {
        trigger: /(^|.* )are you .*/,
        testExpect: [
            'are you a ghost',
            'are you still alive',
            'are you interested in poetry',
        ],
        testExpectNot: [
            'are you here',
            'what type of spirit are you'
        ],
        options: [
            { value: '{identityFudge}' },
        ]
    },
    {
        trigger: /^are .*/,
        testExpect: [
            'are ships sturdy',
            'are we going to die',
        ],
        options: [
            { value: '{boolean}' },
        ]
    },
    {
        trigger: /^(wanna|want to) .*/,
        testExpect: [
            'want to kill me',
            'wanna kill me',
            'i want to see you'
        ],
        options: [
            { value: 'anothertime', restrictedTo: [FRIENDLY] },
            { value: 'notmycupoftea', restrictedTo: [FRIENDLY] },
            { value: 'wantandneed' },
            { value: 'desperately' },
            { value: 'inexchange' },
            { value: 'forafavor' },
        ]
    },  
    {
        trigger: /^does .*/,
        testExpect: [
            'does she like me',
        ],
        options: [
            { value: '{boolean}' },
        ]
    },   
    {
        trigger: /^did you( .*|$)/,
        testExpect: [
            'did you poison anyone',
            'did you like living',
        ],
        options: [
            { value: 'ihadto' },
            { value: 'sometimes' },
            { value: 'forgoodreason' },
            { value: 'fun' },
            { value: 'obviously' },
            { value: '{boolean}' },
        ]
    },
    {
        trigger: /^do you know (me|who i am|my name)$/,
        testExpect: [
            'do you know who i am',
        ],
        options: [
            { value: '!PLAYERNAME yes' },
        ]
    },
    {
        trigger: /^do you know (when|how|what|if|will) .*/,
        testExpect: [
            'do you know when will i marry',
            'do you know how i will die',
        ],
        options: [
            { value: 'askplainly' },
            { value: 'justask' },
            { value: 'askdirectly' },
        ]
    },
    {
        trigger: /^do you know .*/,
        testExpect: [
            'do you know miriam',
            'do you know method',
        ],
        options: [
            { value: 'yesiknow' },
            { value: 'iknoweverything' },
            { value: 'knownforever' },
            { value: 'familiar' },
            { value: 'notknown' },
        ]
    },
    {
        trigger: /^do you like .*/,
        testExpect: [
            'do you like talking to me',
            'do you like me',
            'do you like samantha',
            'do you like humans',
            'do you like jesus',
        ],
        options: [
            { value: 'honestly' },
            { value: 'onsomedays' },
            { value: 'fornow' },
            { value: 'alot', restrictedTo: [FRIENDLY] },
            { value: 'myfavorite', restrictedTo: [FRIENDLY] },
            { value: 'thebest', restrictedTo: [FRIENDLY] },
            { value: 'lovely', restrictedTo: [FRIENDLY] },
            { value: 'fantastic', restrictedTo: [FRIENDLY] },
            { value: 'notonebit', restrictedTo: [EVIL] },
            { value: 'delicious', restrictedTo: [EVIL] },
            { value: 'tasty', restrictedTo: [EVIL] },
            { value: 'boring', restrictedTo: [EVIL] },
            { value: 'disgusting', restrictedTo: [EVIL] },
            { value: 'wretched', restrictedTo: [EVIL] },
            { value: 'sinful', restrictedTo: [EVIL] },
        ]
    },
    {
        trigger: /^(do|can) you see me( .*|$)/,
        testExpect: [
            'can you see me right now',
            'can you see me',
        ],
        options: [
            { value: 'nicechair' },
            { value: 'messyroom' },
            { value: 'gorgeous', restrictedTo: [FRIENDLY] },
            { value: 'attractive', restrictedTo: [FRIENDLY] },
            { value: 'stunning', restrictedTo: [FRIENDLY] },
            { value: 'ugly', restrictedTo: [EVIL] },
            { value: 'hideous', restrictedTo: [EVIL] },
            { value: 'unsightly', restrictedTo: [EVIL] },
        ]
    },
    {
        trigger: /^do you( .*|$)/,
        testExpect: [
            'do you sleep',
            'do you kill people',
            'do you have a favorite color',
        ],
        options: [
            { value: 'imust' },
            { value: 'ihaveto' },
            { value: 'sometimes' },
            { value: 'forgoodreason' },
            { value: 'fun' },
            { value: 'nochoice' },
            { value: 'obviously' },
            { value: '{boolean}' },
        ]
    },
    {
        trigger: /^(do|did) i .*/,
        testExpect: [
            'do i have a green shirt on',
            'do i have a chance to win',
            'did i die',
        ],
        options: [
            { value: '{boolean}' },
        ]
    },
    {
        trigger: /^can you .*/,
        testExpect: [
            'can you hurt me',
            'can you die',
        ],
        options: [
            { value: 'ican' },
            { value: 'icould' },
            { value: 'imust' },
            { value: 'iwill' },
            { value: 'wanttosee', restrictedTo: [EVIL] },
        ]
    },
    {
        trigger: /^would you .*/,
        testExpect: [
            'would you save me',
        ],
        options: [
            { value: 'foraprice' },
            { value: 'inexchange' },
            { value: 'forafavor' },
            { value: 'iwould' },
            { value: 'never' },
        ]
    },
    {
        trigger: /^(was|did) .*/,
        testExpect: [
            'was it painful',
            'did it hurt',
        ],
        testExpectNot: [
            'did you suffer',
            'did i lose the game',
        ],
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
            { value: 'comeon' },
            { value: 'manners' },
            { value: 'leavemebe' },
            { value: 'dontplaywithme' },
            { value: 'knowyourplace', restrictedTo: [EVIL] },
        ],
        questGoals: {
            rage: 1
        }
    },
    {
        trigger: '{insultedHard}',
        options: [
            { value: 'youwillpay', restrictedTo: [FRIENDLY] },
            { value: 'howdareyou', restrictedTo: [FRIENDLY] },
            { value: 'unbelievable', restrictedTo: [FRIENDLY] },
            { value: 'die', restrictedTo: [EVIL] },
            { value: 'youshallperish', restrictedTo: [EVIL] },
            { value: 'youwilldie', restrictedTo: [EVIL] },
        ],
        questGoals: {
            rage: 1
        }
    },
    {
        trigger: /^(repent|atone)$/,
        testExpect: [
            'repent',
        ],
        options: [
            { value: '!INSULTED' },
        ]
    },
    {
        trigger: /^it is .*/,
        testExpect: [
            'it is true',
        ],
        options: [
            { value: '{boolean}' },
        ]
    },
    {
        trigger: /^(i see|really|oh really|huh really|right)$/,
        testExpect: [
            'really',
        ],
        options: [
            { value: 'watchyourtone' },
            { value: 'believeme' },
            { value: 'trustme' },
        ],
        questGoals: {
            rage: 1
        }
    },
    {
        trigger: /^(aha|sure|whatever|i dont believe|lies)( .*|$)/,
        testExpect: [
            'aha',
            'whatever'
        ],
        options: [
            { value: 'watchyourtone' },
            { value: 'believeme' },
            { value: 'trustme' },
            { value: 'ipromise' },
        ]
    },
    {
        trigger: /^you are.*/,
        testExpect: [
            'you are not scary',
            'you are silly',
        ],
        options: [
            { value: 'iam' },
            { value: 'iamnot' },
            { value: 'icanbe' },
            { value: 'icant' },
            { value: 'itry', restrictedTo: [FRIENDLY] },
            { value: 'noyouare' },
        ],
    },
    {
        trigger: /^i am not lying.*/,
        testExpect: [
            'im not lying',
            'i am not lying',
        ],
        options: [
            { value: 'yesyouare' },
            { value: 'pinocchio' },
            { value: 'morelies' },
            { value: 'yeahright' },
        ],
    },
    {
        trigger: /^i am not.*/,
        testExpect: [
            'im not afraid',
            'i am not scared',
        ],
        options: [
            { value: 'yesyouare' },
            { value: 'youshouldbe', restrictedTo: [FRIENDLY] },
            { value: 'bigmistake', restrictedTo: [FRIENDLY] },
            { value: 'iwillmakeyou', restrictedTo: [EVIL] },
            { value: 'youwillbe', restrictedTo: [EVIL] },
        ],
        questGoals: {
            rage: 1
        }
    },
    {
        trigger: /^i am .*/,
        testExpect: [
            'im jonathan',
            'im waiting',
            'im haunted',
            'i am your worst nightmare',
        ],
        options: [
            { value: 'areyounow' },
            { value: 'youareindeed' },
            { value: 'yesyouare' },
            { value: 'iknow' },
        ]
    },
    {
        trigger: /(^|.* )kill m(e|y)( .*|$)/,
        testExpect: [
            'kill my cousin',
            'then kill me',
        ],
        options: [
            { value: 'nottoday', restrictedTo: [FRIENDLY] },
            { value: 'careful', restrictedTo: [FRIENDLY] },
            { value: 'idontkill', restrictedTo: [FRIENDLY] },
            { value: 'iwont', restrictedTo: [FRIENDLY] },
            { value: 'dontaskthat', restrictedTo: [FRIENDLY] },
            { value: 'lateriwill', restrictedTo: [EVIL] },
            { value: 'withpleasure', restrictedTo: [EVIL] },
            { value: 'slowly', restrictedTo: [EVIL] },
            { value: 'withpoison', restrictedTo: [EVIL] },
            { value: 'done', restrictedTo: [EVIL] },
        ]
    },
    {
        trigger: /^dont know.*/,
        testExpect: [
            'i dont know',
            'dont know why',
        ],
        options: [
            { value: 'yesyoudo' },
            { value: 'youdoknow' },
            { value: 'soforgetful' },
            { value: 'badmemory' },
        ]
    },
    {
        trigger: /^i know.*/,
        testExpect: [
            'i know dear',
            'i know',
        ],
        options: [
            { value: 'youknow' },
            { value: 'youbetter' },
            { value: 'itisknown' },
            { value: 'fact' },
            { value: 'confirmed' },
            { value: 'guaranteed' },
        ]
    },
    {
        trigger: /^let me .*/,
        testExpect: [
            'let me go',
            'i beg you to let me know right now',
        ],
        options: [
            { value: 'disallowed' },
            { value: 'denied' },
            { value: 'nopermission' },
            { value: 'theysaidno', restrictedTo: [FRIENDLY] },
            { value: 'sorryno', restrictedTo: [FRIENDLY] },
            { value: 'notletting', restrictedTo: [FRIENDLY] },
        ]
    },
    {
        trigger: /^yes( .*|$)/,
        testExpect: [
            'yes',
        ],
        options: [
            { value: 'indeed' },
            { value: 'agreed' },
            { value: 'yesindeed' },
        ]
    },
    {
        trigger: /^no*( .*|$)/,
        testExpect: [
            'no',
            'noooooo dont do it'
        ],
        options: [
            { value: 'yes' },
            { value: 'faceit' },
            { value: 'forreal' },
            { value: 'toolate' },
        ]
    },
    {
        /* Fallback after recursively resolving the query such that we always drop the first word,
         * until finally we end up here with empty string. */
        trigger: /^$/,
        options: [
            { value: '!FALLBACK_LEVEL2' }
        ]
    },
    /********************************************************************************************************************************
     * 
     * 
     * 
     *                                                      FALLBACK LEVEL 2 
     * 
     * 
     * 
     *******************************************************************************************************************************/
     {
        trigger: /^hello( .*)? @FALLBACK_LEVEL2$/,
        testExpect: [
            'hello',
            'hello fake spirit',
        ],
        testExpectNot: [
            'hello how are you',
            'hello is anyone there',
        ],
        options: [
            { value: 'greetings' },
            { value: 'mylove' },
            { value: 'mylord' },
            { value: 'evening' },
            { value: 'morning' },
            { value: 'wellhello' },
            { value: 'salutations' },
        ],
    },
    {
        trigger: /^(hi|hey)( .*)? @FALLBACK_LEVEL2$/,
        testExpect: [
            'hi',
            'hey fake spirit',
        ],
        testExpectNot: [
            'hey where are you from',
        ],
        options: [
            { value: 'hello' },
            { value: 'hallo' },
            { value: 'shalom' },
            { value: 'salute' },
            { value: 'salutations' },
            { value: 'salaam' },
        ]
    },
    {
        trigger: /^(ok|oki|okay)( .*)? @FALLBACK_LEVEL2$/,
        testExpect: [
            'ok',
            'okay',
            'ok bro',
        ],
        testExpectNot: [
            'ok who is there with you',
            'ok but what is your name again'
        ],
        options: [
            { value: 'itisknown' },
            { value: 'fact' },
            { value: 'confirmed' },
            { value: 'guaranteed' },
        ]
    },
    {
        trigger: /^(oh|huh)( .*)? @FALLBACK_LEVEL2$/,
        testExpect: [
            'oh',
            'huh',
        ],
        testExpectNot: [
            'huh is that so',
        ],
        options: [
            { value: 'ohyes' },
            { value: 'doh' },
            { value: 'aha' },
            { value: 'daa' },
        ]
    },
    {
        trigger: /^thank(s| you)( .*)? @FALLBACK_LEVEL2$/,
        testExpect: [
            'thanks',
            'thank you demon'
        ],
        testExpectNot: [
            'thank you what is your name',
            'thanks where are you'
        ],
        options: [
            { value: 'mypleasure' },
            { value: 'yourewelcome', restrictedTo: [FRIENDLY] },
            { value: 'thereyougo', restrictedTo: [FRIENDLY] },
            { value: 'youoweme', restrictedTo: [EVIL] },
            { value: 'ineedfavornow', restrictedTo: [EVIL] },
        ]
    },
    {
        trigger: /^nice( .*)? @FALLBACK_LEVEL2$/,
        testExpect: [
            'your nice guy',
            'deborah nice name',
            'nice',
        ],
        testExpectNot: [
            'nice to meet you',
            'nice where are you'
        ],
        options: [
            { value: 'niceindeed' },
            { value: 'yeah' },
            { value: 'thanks', restrictedTo: [FRIENDLY] },
            { value: 'thankyou', restrictedTo: [FRIENDLY] },
            { value: 'nicest', restrictedTo: [EVIL] },
            { value: 'niceforme', restrictedTo: [EVIL] },
            { value: '{nonSequiturs}' }
        ]
    },
    {
        trigger: /^cool( .*)? @FALLBACK_LEVEL2$/,
        testExpect: [
            'cool',
            'thats cool',
            'you cool',
            'your cool',
            'youre cool'
        ],
        testExpectNot: [
            'cool how old are you',
            'cool where are you'
        ],
        options: [
            { value: 'icecool' }, // pretend to misunderstand
            { value: 'cooloutside' }, // pretend to misunderstand
            { value: 'coolness' },
            { value: 'yeah' },
            { value: 'forreal', },
            { value: 'thanks', restrictedTo: [FRIENDLY] },
            { value: 'thankyou', restrictedTo: [FRIENDLY] },
            { value: 'coolest', restrictedTo: [EVIL] },
            { value: 'right', restrictedTo: [EVIL] },
            { value: '{nonSequiturs}' }
        ]
    },
    {
        trigger: /^wow( .*)? @FALLBACK_LEVEL2$/,
        testExpect: [
            'wow',
        ],
        testExpectNot: [
            'wow where are you'
        ],
        options: [
            { value: 'amazed' },
            { value: 'impressed' },
            { value: 'likethat' },
            { value: '{nonSequiturs}' }
        ]
    },
    {
        trigger: '{nonSequiturs}',
        options: [
            { value: 'isthisagametoyou' },
            { value: 'whatdoyouwant' },
            { value: 'whyareyouhere' }, 

            { value: '!PLAYERNAME ok', priority: 0.3 },

            { value: 'dracarys', restrictedTo: [EVIL] },
            { value: 'youwilldie', restrictedTo: [EVIL] },
            { value: 'youwillcry', restrictedTo: [EVIL] },
            { value: 'youshallweep', restrictedTo: [EVIL] },
            { value: 'iwillhurtyou', restrictedTo: [EVIL] },
            { value: 'repent', restrictedTo: [FRIENDLY] },
            { value: 'atone', restrictedTo: [FRIENDLY] },
            { value: 'sinner', restrictedTo: [FRIENDLY] },
            { value: 'recant', restrictedTo: [FRIENDLY] },
            { value: 'thisisnotagame', restrictedTo: [FRIENDLY] },
            { value: 'notsafehere', restrictedTo: [FRIENDLY] },
        ]
    },
    {
        trigger: /^@FALLBACK_LEVEL2$/, // We hit this when nothing in fallback_level2 matches.
        options: [
            { value: '!FALLBACK_LEVEL3' },
        ]
    },
    /********************************************************************************************************************************
     * 
     * 
     * 
     *                                                      FALLBACK LEVEL 3
     * 
     * 
     * 
     *******************************************************************************************************************************/
    {
        trigger: '{fallbackShort}',
        testExpect: [
            'beckham',
            'eminem',
            'art',
        ],
        options: [
            /* Plausible responses to a word */
            { value: 'noted' },
            { value: 'halal' },
            { value: 'haram' },
            { value: 'fun' },
            { value: 'lame' },
            { value: 'like' },
            { value: 'dislike' },
            { value: 'approved' },
            { value: 'disapproved' },
            { value: 'whatever' },

            /* Nonsequiturs */
            { value: '{nonSequiturs}' }
        ]
    },
    {
        trigger: '{fallbackLong}', // Presumably the user made a statement not a question.
        testExpect: [
            'life aint but a dream',
            'the good old days',
        ],
        options: [
            /* Plausible responses to a statement */
            { value: 'understood' },
            { value: 'clearly' },
            { value: 'why' },
            { value: 'how' },
            { value: 'noted' },
            { value: 'funny' },
            { value: 'haha' },
            { value: 'gasp' },
            { value: 'ahhyes' },
            { value: 'correct' },
            { value: 'shocking' },
            { value: 'dontbeafraid', restrictedTo: [EVIL] },
            { value: 'dontworry', restrictedTo: [EVIL] },
            { value: 'idontcare', restrictedTo: [EVIL] },
            { value: 'lies', restrictedTo: [EVIL] },
            { value: 'liar', restrictedTo: [EVIL] },
            { value: 'donotlie', restrictedTo: [EVIL] },
            { value: 'unfathomable', restrictedTo: [EVIL] },
            { value: 'unthinkable', restrictedTo: [EVIL] },
            { value: 'unlikely', restrictedTo: [EVIL] },
            { value: 'blasphemy', restrictedTo: [EVIL] },
            { value: 'heresy', restrictedTo: [EVIL] },
            { value: 'indeed', restrictedTo: [FRIENDLY] },
            { value: 'intheory', restrictedTo: [FRIENDLY] },
            { value: 'thatslovely', restrictedTo: [FRIENDLY] },
            { value: 'soundsgreat', restrictedTo: [FRIENDLY] },
            { value: 'agreed', restrictedTo: [FRIENDLY] },
            { value: 'omenous', restrictedTo: [FRIENDLY] },
            { value: 'prophetic', restrictedTo: [FRIENDLY] },
            { value: 'interesting', restrictedTo: [FRIENDLY] },
            { value: 'isthatso', restrictedTo: [FRIENDLY] },
            { value: 'idontthinkso', restrictedTo: [FRIENDLY] },
            { value: 'exaggeration', restrictedTo: [FRIENDLY] },

            /* Nonsequiturs */
            { value: '!PLAYERNAME ok', priority: 0.3 },
        ]
    },
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
    if (v.startsWith('!PLAYERNAME')) {
        // Special case: treat !PLAYERNAME like any fully resolved actual output.
        previousOutputs.add(v)
    }
    return v
}

const resolveQueryWithSimpleChatbot = function(query, sideEffects) {
    if (!sideEffects && window.location.href.startsWith('file')) {
        alert('ERROR! Calling resolveQueryWithSimpleChatbot without inputting sideEffects')
    }
    // Special cases
    if (query.startsWith('!FALLBACK_LEVEL2')) {
        return resolveQueryWithSimpleChatbot(`${currentInput} @FALLBACK_LEVEL2`, sideEffects)
    }
    if (query.startsWith('!FALLBACK_LEVEL3')) {
        if (currentInput.split(" ").length <= 1) {
            return resolveQueryWithSimpleChatbot('{fallbackShort}', sideEffects)
        } else {
            return resolveQueryWithSimpleChatbot('{fallbackLong}', sideEffects)
        }
    }
    if (query.startsWith('!FORMERORLATTER')) {
        let splitted = currentInput.split(' ')
        splitted = splitted.filter(word => splitted.filter(w => w === word).length === 1) // detect duplicates and remove BOTH instances (e.g. "my dad or your dad" -> "my or your", or ""kiss me or poison me" -> "kiss or poison")
        const orIndex = splitted.findIndex(word => word === 'or')
        if (orIndex >= 1 && orIndex <= splitted.length-2) {
            const a = splitted[orIndex-1]
            const b = splitted[orIndex+1]
            if (a == b) {
                return resolveQueryWithSimpleChatbot(`choose between ${a} and ${b}`, sideEffects) // neither,either,both
            }
            const chosenWord = Math.random() > 0.5 ? a : b
            return chosenWord == 'me' ? 'you' : (chosenWord == 'you' ? 'me' : chosenWord)
        }
        // Fallback in case bug in code or weird input like "superman or superman" or "batman batman or superman superman"
        return 'neither'
    }
    if (query.startsWith('!JACKSOUND')) {
        if (playedJack) {
            return resolveQueryWithSimpleChatbot('again', sideEffects)
        }
        sideEffects.setPlayedJack()
        sideEffects.setCompletionEffect(jackSound)
        return resolveQueryWithSimpleChatbot('{jackResponse}', sideEffects)
    }
    if (query.startsWith('!MOVE')) {
        sideEffects.setCompletionEffect(sideEffects.shakeMouse)
        return resolveQueryWithSimpleChatbot('{move}', sideEffects)
    }
    if (query.startsWith('!LIGHTSPECIAL')) {
        sideEffects.setCompletionEffect(sideEffects.lightFlash)
        return resolveQueryWithSimpleChatbot('{lightResponse}', sideEffects)
    }
    if (query.startsWith('!GENDER')) {
        const g = currentSpirit.gender || 'male'
        if (currentInput.split(" ").includes(g) && !query.endsWith('dontsayyes')) return 'yes' // Intent is to avoid "are you male" -> "male" exchange. However, "are you boy or girl" shouldn't return "yes".
        return g
    }
    if (query.startsWith('!CITY')) {
        return userCity || resolveQueryWithSimpleChatbot('{location0}', sideEffects)
    }
    if (query.startsWith('!LOCATIONQUEST')) {
        if (questGoals.where === 3) {
            questGoals.where -= 1
            return userCity || resolveQueryWithSimpleChatbot('{location0}', sideEffects)
        }
        if (questGoals.where === 2) return resolveQueryWithSimpleChatbot(`{location2}`, sideEffects)
        if (questGoals.where === 1) return resolveQueryWithSimpleChatbot(`{location1}`, sideEffects)
        return resolveQueryWithSimpleChatbot('{location0}', sideEffects)
    }
    if (query.startsWith('!COUNTRY')) {
        return userCountry || resolveQueryWithSimpleChatbot('{location0}', sideEffects)
    }
    if (query.startsWith('!REGION')) {
        return userRegion || resolveQueryWithSimpleChatbot('{location0}', sideEffects)
    }
    if (query.startsWith('!DEFINE')) {
        scriptedExperience.forEach((node) => node.options = node.options.filter((option) => !option.value.startsWith('!DEFINE')))
        return 'define' + query.split(" ")[1]
    }
    if (query.startsWith('!PLAYERNAME')) { // '!PLAYERNAME ok', '!PLAYERNAME yes', '!PLAYERNAME'
        const prefix = query.split(' ').length > 1 ? query.split(' ')[1] : ''
        const name = sideEffects.window.localStorage.getItem(OUIJA_PLAYER_NAME)
        if (name) return prefix + name
        if (prefix) {
            // Special case with the previousOutputs, to allow repeating !PLAYERNODE within the fallback resolver (this time "whatsyourname", next time answer with name, so it's not really repetition)
            previousOutputs.delete(query)
            return "whatsyourname"
        }
        // If we are here, the user asked "what is my name" and we don't know the name, so we resolve to path "what is my *" (e.g. whyaskme)
        return resolveQueryWithSimpleChatbot('what is my abracadabra', sideEffects)
    }
    if (query.startsWith('!NAME')) {
        if (questGoals.who > 0) {
            questGoals.who -= 1
        }
        if (currentInput.includes(currentSpirit.name.toLocaleLowerCase())) return 'yes' // Intent is to avoid "are you zozo" -> "zozo" exchange
        return currentSpirit.name
    }
    if (query.startsWith('!INSULTED')) {
        if (questGoals.rage <= 1) return resolveQueryWithSimpleChatbot('{insultedHard}', sideEffects)
        if (questGoals.rage <= 2) return resolveQueryWithSimpleChatbot('{insult}', sideEffects)
        return resolveQueryWithSimpleChatbot('{insultedSoft}', sideEffects)
    }
    if (query.startsWith('!RANDOM_SMALL_COUNT')) {
        return '' + (2 + Math.floor(Math.random() * 13))
    }
    if (query.startsWith('!RANDOM_COUNT')) {
        return '' + (2 + Math.floor(Math.random() * 600))
    }
    if (query.startsWith('!RANDOM_COUNT_YEARS')) {
        return resolveQueryWithSimpleChatbot('!RANDOM_COUNT', sideEffects) + 'years'
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
            if (testNodeWaitingForActivation) {
                // We are running tests, print for debugging purposes.
                debuggingLogs.push(matchingNode.trigger)
            }
            if (matchingNode === testNodeWaitingForActivation) {
                // We are running tests and here we confirm that this node has activated.
                testNodeWaitingForActivation = null
            }
            const v = pickSuitableOption(matchingNode.options, currentSpirit)
            if (v.startsWith('!') || v.startsWith('{')) {
                return resolveQueryWithSimpleChatbot(v, sideEffects)
            }
            if (matchingNode.questGoals) {
                if (matchingNode.questGoals.who) {
                    questGoals.who -= matchingNode.questGoals.who
                }
                if (matchingNode.questGoals.where) {
                    questGoals.where -= matchingNode.questGoals.where
                }
                if (matchingNode.questGoals.rage) {
                    questGoals.rage -= matchingNode.questGoals.rage
                    if (questGoals.rage > 0) sideEffects.rageEffect()
                    else {
                        sideEffects.logToSumoLogic('!SOLVED_QUEST_3')
                        sideEffects.flyBanshee()
                    }
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
    return resolveQueryWithSimpleChatbot(splitted.join(" "), sideEffects)
}

const SCRIPTED_TOOLTIPS = [
    {
        tooltip: '?',
        headline: 'And so it begins',
        paragraphs: [
            'You can use the ouija board to communicate with the spirit world. To send a message, type on your keyboard and press enter. You can use spaces to separate words.'
        ]
    },
    {
        tooltip: '?',
        headline: 'A message from beyond',
        paragraphs: [
            'The planchette is glowing! That means a spirit is trying to communicate.',
            'The spirit needs your help to move the planchette. Drag the planchette with your mouse over the letters and numbers on the board. The spirit will guide your hand. You will feel it.',
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

const possessedMessages = [
    "i am possessed",
    "possess me",
    "take my soul",
    "i offer my soul",
    "my soul is yours",
    "the dark lord commands me",
    "sanity i am losing it",
]

const initializeSpirit = function() {
    const spiritType = Math.random() > 0.5 ? EVIL : FRIENDLY
    const name = pickSuitableOption(names, { type: spiritType })
    const gender = names.find((obj) => obj.value == name).gender
    return {
        type: spiritType,
        name: name,
        gender: gender
    }
}
currentSpirit = initializeSpirit()

const augmentedResolveQueryWithSimpleChatbot = function(input, sideEffects) {
    if (input.match(/my name is (?!not .*).*/)) {
        // matches: hello my name is mikko
        // doesnt match: my name is not mikko, what do you think my name is
        const removedPrefix = input.substring(input.indexOf(input.match(/my name is .*/)))
        if (removedPrefix.length > "my name is ".length) {
            sideEffects.window.localStorage.setItem(OUIJA_PLAYER_NAME, removedPrefix.split(" ")[3])
            return resolveQueryWithSimpleChatbot(removedPrefix, sideEffects)
        }
    }
    if (previousOutput === "whatsyourname" && input.split(" ").length >= 1 && !['i', 'why', 'what', 'who', 'when'].includes(input.split(" ")[0])) {
        sideEffects.window.localStorage.setItem(OUIJA_PLAYER_NAME, input.split(" ")[0])
        return resolveQueryWithSimpleChatbot('my name is ' + input, sideEffects)
    }
    if (input === previousInput) {
        return resolveQueryWithSimpleChatbot('{clarification}', sideEffects)
    }
    if (input.replaceAll(' ', '') === previousOutput) {
        return resolveQueryWithSimpleChatbot('{parrot}', sideEffects)
    }
    return resolveQueryWithSimpleChatbot(input, sideEffects)
}

const respondWithSimpleChatbot = function(rawInput, sideEffects) {
    let input = rawInput
        .replaceAll('I', 'i').replaceAll('ı', 'i') // Turkish i character
        .toLocaleLowerCase()
        .split(" ")
        .filter((word) => !['the', 'a', 'an'].includes(word)) // Normalize common grammar typos
        .filter((word) => word != '') // Trim trailing spaces etc.
        .map((word) => {
            // Normalize common word typos
            if (word === 'whats') return 'what is'
            if (word === 'whos') return 'who is'
            if (word === 'hows') return 'how is'
            if (word === 'wheres') return 'where is'
            if (word === 'im') return 'i am'
            if (word === 'were') return 'where'
            if (word === 'u') return 'you'
            if (word === 'r') return 'are'
            if (word === 'youre') return 'your'
            return word
        })
        .join(' ')
        .replace('may i know', 'what is')
        .replace('my names', 'my name is')
        .replace('tell me my', 'what is my')
        .replace('tell me what', 'what')
    
    let inputToResolver = input
    if (currentRound === possessedRound && currentSpirit.type === EVIL) {
        if (possessedMessages.includes(rawInput.toLocaleLowerCase())) {
            inputToResolver = '{POSSESSYES}'
            unlockAchievement(POSSESSED_ACHIEVEMENT)
        } else {
            inputToResolver = '{POSSESSNO}'
        }
    }

    currentInput = input
    const spiritResponse = augmentedResolveQueryWithSimpleChatbot(inputToResolver, sideEffects).toLocaleLowerCase()
    
    previousInput = input
    previousOutput = spiritResponse
    sideEffects.incrementRound()
    return spiritResponse
}

const dispatchToSpirit = function(rawInput, callback) {
    try {
        const sideEffects = {
            flyBanshee,
            rageEffect,
            shakeMouse,
            logToSumoLogic,
            window,
            lightFlash,
            jackSound,
            setPlayedJack: () => { playedJack = true },
            setCompletionEffect: (effect) => { completionEffect = effect },
            incrementRound: () => {
                currentRound += 1
                if (currentRound === possessedRound && currentSpirit.type === EVIL) {
                    possessedMessage = possessedMessages[Math.floor(Math.random()*possessedMessages.length)];
                }
            }
        }
        if (using_GPT3) respondWithOpenAI(rawInput, callback)
        else callback(respondWithSimpleChatbot(rawInput, sideEffects))
    } catch (ex) {
        alert('Internal error, sorry!')
        console.log(ex)
        return 'error'
    }
}

// Initialize state (after chatbot.js is loaded, everything else is loaded as well)
if (!window.localStorage.getItem(OUIJA_USER_ID)) {
    // First time user
    openConsentPopup()
} else if (window.localStorage.getItem(`ouija-${FALSE_PROPHETS_ACHIEVEMENT}`)) {
    // User has previously finished the game, 50/50 if we begin from user's turn or spirit's turn
    if (Math.random() > 0.5) {
        setTimeout(() => createTooltip(0), 1000)
    } else {
        switchTurnToSpirit()
        dispatchToSpirit("{return}", spiritIsReadyToCommunicate)
        setTimeout(() => createTooltip(1), 1000)
    }
} else {
    // User has played before but has not finished the game, begin from user's turn
    setTimeout(() => createTooltip(0), 1000)
}

// runTestInput returns true if testInput activates testNode
const runTestInput = function(testInput, testNode, sideEffects) {
    testNodeWaitingForActivation = testNode
    respondWithSimpleChatbot(testInput, sideEffects);
    if (testNodeWaitingForActivation) {
        return false
    }
    return true
}

// runTestsInputArray runs either positive or negative activation tests for a particular node.
const runTestsInputArray = function(inputsArray, boolExpected, testNode, sideEffects) {
    if (!inputsArray) {
        return
    }
    for (let j=0; j<inputsArray.length; j++) {
        const testInput = inputsArray[j]
        const testNodeActivated = runTestInput(testInput, testNode, sideEffects)
        testCount += 1
        if (testNodeActivated === boolExpected) {
            debuggingLogs.push(`TEST OK ${testInput} -> ${previousOutput}`)
        } else {
            debuggingLogs.push(`TEST FAIL ${testInput} -> ${previousOutput}`)
            debuggingLogs.forEach(line => console.log(line))
            alert('Unit test fail, open console for details.')
            throw new Error('Stopping tests due to failure')
        }
        // Clear previousInput, previousOutput to prevent misleading test results due to statefulness in repetition/parroting.
        previousInput = ''
        previousOutput = ''
    }
}

// Run tests when website is opened in browser from local source
if (window.location.href.startsWith('file')) {
    debuggingLogs = []
    testCount = 0
    const mockSideEffects = {
        flyBanshee: () => {},
        rageEffect: () => {},
        shakeMouse: () => {},
        logToSumoLogic: () => {},
        window: window,
        lightFlash: () => {},
        jackSound: () => {},
        setPlayedJack: () => {},
        setCompletionEffect: () => {},
        incrementRound: () => {}
    }
    // Prevent achieving quest goals while running tests
    const realQuestGoals = {
        who: questGoals.who,
        where: questGoals.where,
        rage: questGoals.rage,
    }
    questGoals = {
        who: 9999999,
        where: 9999999,
        rage: 9999999
    }
    // Run tests
    for (let i=0; i<scriptedExperience.length; i++) {
        const testNode = scriptedExperience[i]
        runTestsInputArray(testNode.testExpect, true, testNode, mockSideEffects)
        runTestsInputArray(testNode.testExpectNot, false, testNode, mockSideEffects)
        // TODO whatsyourname tyyppiset usean rivin stateful testit
        // TODO stateful "my name is not mikko" testataan ettei ota "not"
        // TODO test rage goals statefully
    }
    // Reset quest goals
    questGoals = realQuestGoals
    // Report test results
    spiritIsReadyToCommunicate(`${testCount}testsok`)
    console.log(`${testCount} tests ran successfully.`)
}