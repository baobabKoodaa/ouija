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
    rage: 3
}

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

const scriptedExperience = [
    {
        trigger: /(^|.* )gender( .*|$)/,
        options: [
            { value: '!GENDER' },
        ],
    },
    {
        trigger: /^are you (boy|girl|man|woman|male|female)( or .*)?$/,
        options: [
            { value: '!GENDER' },
        ],
    },
    {
        trigger: /.*(meaning|purpose) of life.*/,
        options: [
            { value: 'tosuffer', restrictedTo: [EVIL] },
            { value: 'toserve' },
            { value: 'tosacrifice', restrictedTo: [EVIL] },
            { value: 'todie', restrictedTo: [EVIL] },
            { value: 'obedience' },
            { value: 'devotion', restrictedTo: [FRIENDLY] },
            { value: 'salvation', restrictedTo: [FRIENDLY] },
            { value: 'nomeaningtoit' },
            { value: 'pointless' },
        ],
    },
    {
        trigger: /^country$/,
        options: [
            { value: '!COUNTRY' },
        ],
    },
    {
        trigger: /^(which|what) country.*/,
        options: [
            { value: '!COUNTRY' },
        ],
    },
    {
        trigger: /^(state|county|region)$/,
        options: [
            { value: '!REGION' },
        ],
    },
    {
        trigger: /^(which|what) (state|county|region).*/,
        options: [
            { value: '!REGION' },
        ],
    },
    {
        trigger: /^(which|what) city.*/,
        options: [
            { value: '!CITY' },
        ],
    },
    {
        trigger: /.*(^| )(bitch|asshole|jerk|harlot|idiot|stupid|faggot|gay|dickhead|suck|sucker|cocksucker|retard|fuck|fucking|shit|shut up|fucker|motherfucker|liar|whore|dumb|dumbass)($| ).*/,
        options: [
            { value: '!INSULTED' },
        ]
    },
    {
        trigger: /^test(ing)?($| .*)/,
        options: [
            { value: 'donttestme' },
            { value: 'notesting' },
        ],
    },
    {
        trigger: /(^|.* )([0-9]*) (plus|minus|times) ([0-9]*)( .*|$)/,
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
        options: [
            { value: 'rainingtears', restrictedTo: [EVIL] },
            { value: 'rainingblood', restrictedTo: [EVIL] },
            { value: 'rainingfire', restrictedTo: [EVIL] },
            { value: 'freezing', restrictedTo: [FRIENDLY] },
            { value: 'stormiscoming', restrictedTo: [FRIENDLY] },
        ],
    },
    {
        trigger: /(^|.* )love($| .*)/,
        options: [
            { value: 'loveishate', restrictedTo: [EVIL] },
            { value: 'loveisdeath', restrictedTo: [EVIL] },
            { value: 'loveispointless', restrictedTo: [EVIL] },
            { value: 'nolovehere', restrictedTo: [EVIL] },
            { value: 'ihatelove', restrictedTo: [EVIL] },
            { value: 'loveyourself', restrictedTo: [FRIENDLY] },
            { value: 'findlove', restrictedTo: [FRIENDLY] },
            { value: 'loveistheanswer', restrictedTo: [FRIENDLY] },
            { value: 'thatslove', restrictedTo: [FRIENDLY] },
        ],
    },
    {
        trigger: /(^|.* )(sign|prove|haunt me|scare me|show yourself)($| .*)/,
        options: [
            { value: '!LIGHTSPECIAL' },
        ],
    },
    {
        trigger: /(^|.* )(turn|switch) (.*)?lights?($| .*)/,
        options: [
            { value: '!LIGHTSPECIAL' },
        ],
    },
    {
        trigger: '{lightResponse}',
        options: [
            { value: 'behold' },
            { value: 'watch' },
        ],
    },
    {
        trigger: /(^|.* )tell me(.*)? your?(.*)? name( .*|$)/, // please tell me your real name demon
        options: [
            { value: '!NAME' },
        ]
    },
    {
        trigger: /^please.*$/,
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
        options: [
            { value: 'nope' },
            { value: 'no' },
            { value: 'nottoday' },
        ],
    },
    {
        trigger: /^(goodbye|good bye|bye|farewell)($| .*)/,
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
        trigger: /.*sorry.*/,
        options: [
            { value: 'youbetterbe', restrictedTo: [EVIL] },
            { value: 'idontforgive', restrictedTo: [EVIL] },
            { value: 'unforgivable', restrictedTo: [EVIL] },
            { value: 'notforgiven', restrictedTo: [EVIL] },
            { value: 'youwillpay', restrictedTo: [EVIL] },
            { value: 'itsok', restrictedTo: [FRIENDLY] },
            { value: 'itsfine', restrictedTo: [FRIENDLY] },
            { value: 'forgiven', restrictedTo: [FRIENDLY] },
            { value: 'acknowledged', restrictedTo: [FRIENDLY] },
            { value: 'noted', restrictedTo: [FRIENDLY] },
        ],
    },
    {
        trigger: /^nice to meet you.*/, // nice to meet you too, nice to meet you abigail
        options: [
            { value: 'andyou', restrictedTo: [FRIENDLY] },
            { value: 'youtoo', restrictedTo: [FRIENDLY] },
            { value: 'myfriend', restrictedTo: [EVIL] },
            { value: 'niceforme', restrictedTo: [EVIL] },
        ]
    },
    {
        trigger: /.*(not my name|my name is not).*/, // thats not my name dummy, my name is not mikko
        options: [
            { value: 'yesitis' },
        ]
    },
    {
        trigger: /^(what.*|tell me|say)?my (full )?name( is)?$/, // what is my name? what do you think my name is? tell me my name? say my name? my name? // shouldnt match "my name is mikko"
        options: [
            { value: '!PLAYERNAME' },
        ]
    },
    {
        trigger: /^my name is .*/,
        options: [
            { value: 'nicetomeetyou' },
            { value: 'stupidname', restrictedTo: [EVIL] },
            { value: 'dumbname', restrictedTo: [EVIL] },
            { value: 'nicename', restrictedTo: [FRIENDLY] },
            { value: 'fancyname', restrictedTo: [FRIENDLY] },
        ]
    },
    {
        trigger: /^(help|help me)$/,
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
        trigger: /^(are|is) (you|anyone|anybody) (there|here)$/,
        options: [
            { value: 'justme' },
            { value: 'manyofus' },
            { value: 'hereiam' },
        ]
    },
    {
        trigger: '{speakEnglish}',
        options: [
            { value: 'what' },
            { value: 'language' },
            { value: 'speakproperly' },
            { value: 'speakup' },
            { value: 'english' },
        ],
        questGoals: {
            rage: 1
        }
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

            { value: 'hellodear', restrictedTo: [FRIENDLY] },
            { value: 'hellothere', restrictedTo: [FRIENDLY] },
            { value: 'run', restrictedTo: [FRIENDLY] },
            { value: 'danger', restrictedTo: [FRIENDLY] }, 
            { value: 'notsafe', restrictedTo: [FRIENDLY] },
            // TODO 'imsorry' friendly
            //{ value: 'knockknock' },
            // TODO tormented: killme, icantsee, sohungry, socold, somuchpain, cantbreathe, helpme, pleasehelp
            { value: 'hellofriend', restrictedTo: [EVIL] },
            { value: 'iseeyou', restrictedTo: [EVIL] },
        ]
    },
    {
        trigger: /^finally what$/,
        options: [
            { value: 'youreback' },
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
        options: [
            { value: '{clarification}' },
        ]
    },
    {
        trigger: /^like what$/,
        options: [
            { value: '{clarification}' },
        ]
    },
    {
        trigger: /.* (or|between) .*/, // are you demon or angel? for what me or you? who will win between superman and batman?
        options: [
            { value: 'former' },
            { value: 'latter' },
            { value: 'both' },
            { value: 'neither' },
            { value: 'either' },
        ]
    },
    {
        trigger: /^which.*/, // which room are you in? which one? which finger am i holding up?
        options: [
            { value: 'all' },
            { value: 'firstone' },
            { value: 'lastone' },
            { value: 'youchoose' },
        ]
    },
    {
        trigger: /^how old am i$/,
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
        trigger: /^how old.*/, // how old are you? how old were you when you died
        options: [
            { value: '!RANDOM_COUNT' }
        ]
    },
    {
        trigger: /^how long.*/, // how long ago did you die? how long have you been dead? how long since ... how long until ...
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
        trigger: /^how many people.*/, // how many people have you killed? how many people are in this room?
        options: [
            { value: '!DEFINE people' },
            { value: 'justyou' },
            { value: 'dontworry', restrictedTo: [EVIL] },
            { value: '2', restrictedTo: [FRIENDLY] },
        ]
    },
    {
        trigger: /^how many.*/, // how many humans have you killed? how many of you are here? how many fingers am i holding up?
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
        trigger: /^(how.*( kill| die))|(what happened).*/, // how were you killed? how will i die? what happened to you?
        options: [
            { value: 'murder' },
            { value: 'accident' },
            { value: 'poison' },
            { value: 'plague' },
            { value: 'hanging' },
            { value: 'suicide' },
            { value: 'knife' },
            { value: 'betrayal' },
            { value: 'treachery' },
            { value: 'famine' },
            { value: 'thirst' },
            { value: 'inquisition' },
            { value: 'witchhunt' },
            { value: 'fire' },
            { value: 'carnage' },
            { value: 'suffocation' },
            { value: 'exorcism' },
            { value: 'purge' },
        ]
    },
    {
        trigger: /^(what|how) .* (anger|angers|angry|mad)( .*|$)/, // what makes you angry? (make it easier to complete the anger quest)
        options: [
            { value: 'vulgarity' },
            { value: 'badmanners' },
            { value: 'nastywords' },
            { value: 'cursewords' },
            { value: 'insults' },
            { value: 'repetition' },
            { value: 'stupidquestions' },
            { value: 'doubts' },
            { value: 'attitude' },
        ]
    },
    {
        trigger: /(^|how )(do|can) (i|we) .*/, // can i trap you? how can we trap you? how do i win?
        options: [
            { value: 'cant', priority: 1},
            { value: 'blacksmoke' },
            { value: 'impossible' },
            { value: 'giveup', restrictedTo: [EVIL] },
            { value: 'nohope' },
        ]
    },
    {
        trigger: /(^|.* )how are you.*/, // hello how are you
        options: [
            { value: 'hungry' },
            { value: 'thirsty' },
            { value: 'craving' },
            { value: 'lonely', restrictedTo: [FRIENDLY] },
        ]
    },
    {
        trigger: /^how.*/, // how does the world end? how do you hear my questions? how do you know where i am? how is this possible?
        options: [
            { value: 'secret' },
            { value: 'supernatural' },
            { value: 'voodoo' },
            { value: 'blackmagic' },
        ]
    },
    {
        trigger: /^when.*( did | where | was ).*/, // when did you die? when was washington born? when were you born (with were->where subsitution)
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
        trigger: /^where is .*/, // where is home? where is darkness?
        options: [
            { value: '!LOCATIONQUEST' }
        ]
    },
    {
        trigger: /^where (are you|in|.* (house|home)|exactly|specifically|do you live).*/, // where in {userCity}, where inside the house
        options: [
            { value: '!LOCATIONQUEST' }
        ]
    },
    {
        trigger: /^where$/,
        options: [
            { value: '!LOCATIONQUEST' }
        ]
    },
    {
        trigger: /^where.*/, // where were you killed? where will i die? where am i?
        options: [
            { value: 'indarkness' },
            { value: 'inthelight' },
            { value: 'home' },
            { value: 'house' },
        ]
    },
    {
        trigger: /^are you going to .*/, // are you going to hurt me
        options: [
            { value: 'youwillsee' },
            { value: 'nottoday' },
            { value: 'yes' },
            { value: 'dontworry', restrictedTo: [EVIL] },
        ]
    },
    {
        trigger: /^are you (in|at|there|close|near|here|around|present|under|behind|above|over)( .*|$)/,
        options: [
            { value: '!LOCATIONQUEST' }
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
        trigger: /^are you.*/, // Are you ghost, spirit, undead, alive, still alive
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
        trigger: /^whose home$/,
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
            { value: 'master' },
            { value: 'father' },
            { value: 'demon' },
            { value: 'savior' },
            { value: 'messiah' },
            { value: 'impresario' },
        ]
    },
    {
        trigger: /^why.*/,
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
        trigger: /^what (form )?are you$/,
        options: [
            { value: 'human' },
            { value: 'impresario' },
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
        trigger: /^what is my.*/, // birthdate? location? age?
        options: [
            { value: 'youknow', priority: 1 },
            { value: 'whyaskme', priority: 1 },
            { value: 'donttestme', priority: 1 },
            { value: 'areyoutestingme', priority: 1 },
            { value: '{clarification}' },
        ]
    },
    {
        trigger: /^what do.* mean.*/, // what does that mean? what does it mean? what do you mean?
        options: [
            { value: 'iamnotmean', priority: 0.3 },
            { value: 'yourchoice' },
            { value: 'interpret' },
            { value: '{clarification}' },
        ]
    },
    {
        trigger: /^(what.*)?age($| .*)/, // what is my age? what is your age? what age did you die? what age? age?
        options: [
            { value: '!RANDOM_COUNT' }
        ]
    },
    {
        trigger: /^(what is your? )?last name$/,
        options: [
            { value: 'nolastname' },
            { value: 'onlyfirstname' },
        ]
    },
    {
        trigger: /(^|.*what is your )name$/, // hello what is your name? what is your name? name?
        options: [
            { value: '!NAME' },
        ]
    },
    {
        trigger: /^what is your (location|position)$/, 
        options: [
            { value: '!LOCATIONQUEST' },
        ]
    },
    {
        trigger: /^what .*colou?r.*/, // what is your favorite color? what color are my shoes?
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
        trigger: /^what is your favorite .*/, // what is your favorite ice cream? favorite tv show? favorite food?
        options: [
            { value: 'nofavorites' },
            { value: 'whateveryoulike' },
            { value: 'youchoose' },
            { value: 'notmything' },
        ]
    },
    {
        trigger: /^what is your .*/, // goal? motivation? folly? secret?
        options: [
            { value: 'youwillsee', restrictedTo: [EVIL] },
            { value: 'dontworry', restrictedTo: [EVIL] },
            { value: 'darkness', restrictedTo: [EVIL] },
            { value: 'punishment', restrictedTo: [EVIL] },
            { value: 'peace', restrictedTo: [FRIENDLY] },
            { value: 'balance', restrictedTo: [FRIENDLY] },
            { value: 'compassion', restrictedTo: [FRIENDLY] },
            { value: 'love', restrictedTo: [FRIENDLY] },
        ]
    },
    {
        trigger: /^what is up$/, // whats up (grammar-corrected), pretend to misunderstand question
        options: [
            { value: 'heaven' },
            { value: 'stars' },
            { value: 'sky' },
            { value: 'gasprice' },
        ]
    },
    {
        trigger: /^what is this$/,
        options: [
            { value: 'nightmare' },
            { value: 'feverdream' },
            { value: 'nirvana' },
        ]
    },
    {
        trigger: /^what do you think about.*/,
        options: [
            { value: 'fun' },
            { value: 'iloveit' },
            { value: 'despicable' },
            { value: 'awful' },
            { value: 'great' },
            { value: 'horrid' },
        ]
    },
    {
        trigger: /^what do you want.*/, // what do you want from me?
        options: [
            { value: 'nothing' },
            { value: 'blacksmoke' },
            { value: 'assistance', restrictedTo: [FRIENDLY] },
            { value: 'help', restrictedTo: [FRIENDLY] },
            { value: 'soul', restrictedTo: [EVIL] },
            { value: 'yoursoul', restrictedTo: [EVIL] },
            { value: 'yourlife', restrictedTo: [EVIL] },
            { value: 'lifeforce', restrictedTo: [EVIL] },
            { value: 'youressence', restrictedTo: [EVIL] },
            { value: 'dontworry', restrictedTo: [EVIL] },
        ],
        questGoals: {
            who: 1
        }
    },
    {
        trigger: /^what do you.*/, // what do you feel? what do your eyes look like?
        options: [
            { value: 'peace', restrictedTo: [FRIENDLY] },
            { value: 'despair' },
            { value: 'grief' },
            { value: 'fortune' },
            { value: 'regret' },
            { value: 'misery' },
            { value: 'sorrow' },
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
        trigger: /^what should (i|we|you).*/,
        options: [
            { value: 'giveup', restrictedTo: [EVIL] },
            { value: 'blacksmoke' },
            { value: 'surrender' },
        ]
    },
    {
        trigger: /^what.*year.* (where|did|was) .*/, // were->where substituted
        options: [
            { value: '!RANDOM_YEAR_PAST' },
        ]
    },
    {
        trigger: /^what.* year.*/,
        options: [
            { value: '!RANDOM_YEAR_FUTURE' },
        ]
    },
    {
        trigger: /^what time is it$/,
        options: [
            { value: 'timetodie', restrictedTo: [EVIL] },
            { value: 'timetoyield', restrictedTo: [EVIL] },
            { value: 'timetostop', restrictedTo: [FRIENDLY] },
            { value: 'timetorun', restrictedTo: [FRIENDLY] },
            { value: 'timetoleave', restrictedTo: [FRIENDLY] },
        ]
    },
    {
        trigger: /^what (day|month|year).*/, // what month, what month is it, what month is it today, what year will i marry
        options: [
            { value: 'nocalendar' },
            { value: 'currentone' },
            { value: 'nextone' },
            { value: 'yourlastone' },
        ]
    },
    {
        trigger: /^what.* kind($| .*)/,
        options: [
            { value: 'badkind' },
            { value: 'evilkind' },
            { value: 'wrongkind' },
        ]
    },
    {
        trigger: /^what language.*/,
        options: [
            { value: 'english' },
        ]
    },
    {
        trigger: /^what$/, // note that due to the way we resolve queries, we often hit this path from inputs such as "hungry for what"
        options: [
            { value: 'youheardme', priority: 1 },
            { value: 'whatisaid', priority: 1 },
            { value: 'areyoudeaf', priority: 1 },
            { value: '{clarification}' },
        ]
    },
    {
        trigger: /^what are you trying to do$/,
        options: [
            { value: 'forget' },
            { value: 'escape' },
            { value: 'burrow' },
            { value: 'survive' },
            { value: 'return' },
        ]
    },
    {
        trigger: /^what.*/, // what bothers you? what did you do? what are you afraid of? what should i have for breakfast? what type of sin? what is ether? what should i do?
        options: [
            { value: 'cantsee' },
            { value: 'darkness' },
            { value: 'misery' },
            { value: 'sorrow' },
            { value: 'anguish' },
            { value: 'agony' },
            { value: 'atonement' },
        ]
    },
    {
        trigger: /^wanna .*/, // wanna kiss? wanna kill me?
        options: [
            { value: '{boolean}' },
        ]
    },  
    {
        trigger: /^does .*/, // does she love me?
        options: [
            { value: '{boolean}' },
        ]
    },   
    {
        trigger: /^did you( .*|$)/, // did you poison anyone? did you like living?
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
        options: [
            { value: '!PLAYERNAME yes' },
        ]
    },
    {
        trigger: /^do you know .*/, // do you know when will i marry, do you know how i will die
        options: [
            { value: 'yesiknow' },
            { value: 'justask' },
            { value: 'iknoweverything' },
        ]
    },
    {
        trigger: /^do you( .*|$)/, // do you sleep? do you like me? do you kill people? do you have a favorite color?
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
        trigger: /^(do|did) i .*/, // do i have a soul? do i have a chance to win? did i die?
        options: [
            { value: '{boolean}' },
        ]
    },
    {
        trigger: /^can you .*/, // can you hurt me? can you see me? can you die?
        options: [
            { value: 'ican' },
            { value: 'icould' },
            { value: 'imust' },
            { value: 'iwill' },
            { value: 'wanttosee', restrictedTo: [EVIL] },
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
            { value: 'youwillpayforthis', restrictedTo: [FRIENDLY] },
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
        trigger: /^(i see|really|right)$/,
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
        trigger: /^(ok|okay|aha|sure|no|whatever|i dont believe|lies)( .*|$)/,
        options: [
            { value: 'watchyourtone' },
            { value: 'believeme' },
            { value: 'trustme' },
            { value: 'ipromise' },
            { value: 'itisknown' },
            { value: 'fact' },
        ]
    },
    {
        trigger: /^you are.*/,
        options: [
            { value: 'iam' },
            { value: 'iamnot' },
            { value: 'icanbe' },
            { value: 'icant' },
            { value: 'itry' },
            { value: 'noyouare' },
        ],
    },
    {
        trigger: /^i am not.*/, // im not afraid, im not scared (as a response to "dontworry" or "dontbeafraid")
        options: [
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
        trigger: /^i am .*/, // im waiting, im jonathan, im haunted, im your worst nightmare
        options: [
            { value: 'areyounow' },
            { value: 'youareindeed' },
            { value: 'yesyouare' },
            { value: 'iknow' },
        ]
    },
    {
        trigger: /^hello.*/, // hello is intentionally down here because inputs like "hello how are you" should preferrably hit "how are you", not "hello"
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
        trigger: /(^|.* )so .*/, // "so it is true", "so are you single", etc. but not "so" or "thought so"
        options: [
            { value: 'gasp' },
            { value: 'yes' },
            { value: 'ahhyes' },
            { value: 'indeed' },
            { value: 'correct' },
        ]
    },
    {
        trigger: /^yes$/,
        options: [
            { value: 'indeed' },
            { value: 'agreed' },
            { value: 'yesindeed' },
        ]
    },
    {
        /* Fallback when nothing else matches. Presumably the user made a statement not a question.
         * We might end up here after recursively resolving the query such that we always drop the first word,
         * until finally we end up here with empty string. */
        trigger: /^$/,
        options: [

            /* Plausible responses to a statement */
            { value: 'dontbeafraid', restrictedTo: [EVIL] },
            { value: 'dontworry', restrictedTo: [EVIL] },
            { value: 'noted' },
            { value: 'blasphemy', restrictedTo: [FRIENDLY] },
            { value: 'heresy', restrictedTo: [FRIENDLY] },
            { value: 'recant', restrictedTo: [FRIENDLY] },
            { value: 'wretched' },
            { value: 'lies' },
            { value: 'liar' },
            { value: 'donotlie' },
            { value: 'indeed' },
            { value: 'unfathomable' },
            { value: 'unthinkable' },
            { value: 'intheory' },
            { value: 'unlikely' },
            { value: 'thatslovely' },
            { value: 'soundsgreat' },
            { value: 'fantastic' },
            { value: 'exaggeration' },
            { value: 'idontthinkso' },
            { value: 'fabrication' },
            { value: 'agreed' },
            { value: 'whatever', restrictedTo: [EVIL] },
            { value: 'idontcare', restrictedTo: [EVIL] },

            { value: 'why' },
            { value: 'how' },
            { value: 'when' },
            { value: 'explain' },

            /* Nonsequiturs */
            { value: 'youwilldie', restrictedTo: [EVIL] },
            { value: 'youwillcry', restrictedTo: [EVIL] },
            { value: 'youshallweep', restrictedTo: [EVIL] },
            { value: 'iwillhurtyou', restrictedTo: [EVIL] },
            { value: 'isthisagametoyou', restrictedTo: [FRIENDLY] },
            { value: 'thisisnotagame', restrictedTo: [FRIENDLY] },
            { value: 'repent', restrictedTo: [FRIENDLY] },
            { value: 'atone', restrictedTo: [FRIENDLY] },

            { value: 'whatdoyouwant' },
            { value: 'whyareyouhere' },

            { value: '!PLAYERNAME ok', priority: 0.3 },
            
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
    if (v.startsWith('!PLAYERNAME')) {
        // Special case: treat !PLAYERNAME like any fully resolved actual output.
        previousOutputs.add(v)
    }
    return v
}

const resolveQueryWithSimpleChatbot = function(query) {
    // Special cases
    if (query.startsWith('!LIGHTSPECIAL')) {
        setTimeout(() => {
            document.getElementById('lightFlash').style.display = 'block';
            setTimeout(() => {
                document.getElementById('lightFlash').style.display = 'none';
            }, 50)
        }, 4000)
        return resolveQueryWithSimpleChatbot('{lightResponse}')
    }
    if (query.startsWith('!GENDER')) {
        return (currentSpirit.gender || 'male')
    }
    if (query.startsWith('!CITY')) {
        return userCity || resolveQueryWithSimpleChatbot('{location0}')
    }
    if (query.startsWith('!LOCATIONQUEST')) {
        if (questGoals.where === 3) {
            questGoals.where -= 1
            return userCity || resolveQueryWithSimpleChatbot('{location0}')
        }
        if (questGoals.where === 2) return resolveQueryWithSimpleChatbot(`{location2}`)
        if (questGoals.where === 1) return resolveQueryWithSimpleChatbot(`{location1}`)
        return resolveQueryWithSimpleChatbot('{location0}')
    }
    if (query.startsWith('!COUNTRY')) {
        return userCountry || resolveQueryWithSimpleChatbot('{location0}')
    }
    if (query.startsWith('!REGION')) {
        return userRegion || resolveQueryWithSimpleChatbot('{location0}')
    }
    if (query.startsWith('!DEFINE')) {
        scriptedExperience.forEach((node) => node.options = node.options.filter((option) => !option.value.startsWith('!DEFINE')))
        return 'define' + query.split(" ")[1]
    }
    if (query.startsWith('!PLAYERNAME')) { // '!PLAYERNAME ok', '!PLAYERNAME yes', '!PLAYERNAME'
        const prefix = query.split(' ').length > 1 ? query.split(' ')[1] : ''
        const name = window.localStorage.getItem(OUIJA_PLAYER_NAME)
        if (name) return prefix + name
        if (prefix) {
            // Special case with the previousOutputs, to allow repeating !PLAYERNODE within the fallback resolver (this time "whatsyourname", next time answer with name, so it's not really repetition)
            previousOutputs.delete(query)
            return "whatsyourname"
        }
        // If we are here, the user asked "what is my name" and we don't know the name, so we resolve to path "what is my *" (e.g. whyaskme)
        return resolveQueryWithSimpleChatbot('what is my abracadabra')
    }
    if (query.startsWith('!NAME')) {
        if (questGoals.who > 0) {
            questGoals.who -= 1
        }
        return currentSpirit.name
    }
    if (query.startsWith('!INSULTED')) {
        if (questGoals.rage <= 1) return resolveQueryWithSimpleChatbot('{insultedHard}')
        if (questGoals.rage <= 2) return resolveQueryWithSimpleChatbot('{insult}')
        return resolveQueryWithSimpleChatbot('{insultedSoft}')
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
                    questGoals.rage -= matchingNode.questGoals.rage
                    if (questGoals.rage > 0) randomRageEffect()
                    else {
                        logToSumoLogic('!SOLVED_QUEST_3')
                        flyBanshee()
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
    return resolveQueryWithSimpleChatbot(splitted.join(" "))
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

const looksLikeNonsense = function(text) {
    // Relative percentage of consonants: detect inputs like "fdf" as nonsense
    let count = 0;
    const consonants = 'bcdfghjklmnpqrstvwxz'
    for (let i=0; i<text.length; i++) {
        if (consonants.includes(text[i])) count += 1
    }
    const consonantPercentage = count * 1.0 / text.length
    if (consonantPercentage > 0.9) return true
    
    // Absolute number of consecutive consonants or vowels: detect inputs like "screeeeeee" as nonsense
    let maxCount = 1
    let currentCount = 0
    let prevCharType = 'nothing'
    for (let i=0; i<text.length; i++) {
        if ('0123456789 '.includes(text[i])) {
            currentCount = 0
            prevCharType = 'nothing'
            continue
        }
        const currCharType = consonants.includes(text[i]) ? 'consonant' : 'vowel'
        if (currCharType === prevCharType) {
            currentCount += 1
        } else {
            currentCount = 1
        }
        maxCount = Math.max(maxCount, currentCount)
        prevCharType = currCharType
    }
    return maxCount >= 5
}

const augmentedResolveQueryWithSimpleChatbot = function(input) {
    if (input.match(/my name is (?! not .*).*/)) {
        // matches: hello my name is mikko
        // doesnt match: my name is not mikko, what do you think my name is
        const removedPrefix = input.substring(input.indexOf(input.match(/my name is .*/)))
        if (removedPrefix.length > "my name is ".length) {
            window.localStorage.setItem(OUIJA_PLAYER_NAME, removedPrefix.split(" ")[3])
            return resolveQueryWithSimpleChatbot(removedPrefix)
        }
    }
    if (previousOutput === "whatsyourname" && input.split(" ").length >= 1) {
        window.localStorage.setItem(OUIJA_PLAYER_NAME, input.split(" ")[0])
        return resolveQueryWithSimpleChatbot('my name is ' + input)
    }
    if (input === previousInput) {
        return resolveQueryWithSimpleChatbot('{clarification}')
    }
    if (input.replaceAll(' ', '') === previousOutput) {
        return resolveQueryWithSimpleChatbot('{parrot}')
    }
    if (looksLikeNonsense(input)) {
        return resolveQueryWithSimpleChatbot('{speakEnglish}')
    }
    return resolveQueryWithSimpleChatbot(input)
}

const respondWithSimpleChatbot = function(rawInput, callback) {
    const input = rawInput
        .replaceAll('I', 'i').replaceAll('??', 'i') // Turkish i character
        .toLocaleLowerCase()
        .split(" ")
        .filter((word) => !['the', 'a', 'an'].includes(word)) // Normalize common grammar typos
        .map((word) => {
            // Normalize common word typos
            if (word === 'whats') return 'what is'
            if (word === 'whos') return 'who is'
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

    const spiritResponse = augmentedResolveQueryWithSimpleChatbot(input).toLocaleLowerCase()
    
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