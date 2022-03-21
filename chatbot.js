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

const scriptedExperience = [
    {
        trigger: /^hello$/,
        options: [
            { value: 'greetings' },
            { value: 'mylord' }
        ],
    },
    {
        trigger: /^hi$/,
        options: [
            { value: 'hello' }
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
        trigger: '{identityFudge}', // TODO allow landing here unlimited times
        options: [
            { value: 'iusedtobelikeyou' },
            { value: 'itakemanyforms' },
            { value: 'iammanythings' },
        ]
    },
    {
        trigger: '{insult}',
        options: [
            { value: 'imbecil' },
            { value: 'fool' },
            { value: 'bitch' },
            { value: 'idiot' },
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
        ]
    },
    {
        trigger: /^how many people.*/, // how many people have you killed? how many people are in this room?
        options: [
            { value: '!DEFINE people' },
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
        trigger: /^how long.*/, // how long ago did you die? how long have you been dead? how long since ...
        options: [
            { value: 'toolong' },
            { value: 'ages' },
            { value: 'horde' },
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
        trigger: /^when.*( did | were ).*/, // when did you die? when were you born?
        options: [
            { value: '!RANDOM_YEAR_PAST' },
            { value: 'longago' },
            { value: 'manymoonsago' },
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
            { value: 'darkness' },
            { value: 'inthelight' },
            { value: 'home' },
        ]
    },
    {
        trigger: /^(are |is |will ).* or .*/, // are you demon or angel? are you alive or dead? will... is...
        options: [
            { value: 'both' },
            { value: 'neither' },
            // TODO 50/50 x tai y
        ]
    },
    {
        trigger: /^are you (close|near|here|in here|around|inside|present)$/,
        options: [
            { value: '{location}' }
        ]
    },
    {
        trigger: /^are you (old|young)$/,
        options: [
            { value: '!RANDOM_COUNT_YEARS' }
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
        trigger: /^are you (ghost|spirit|undead)$/,
        options: [
            { value: '{identityFudge}' },
        ]
    },
    {
        trigger: /^are you bot$/,
        options: [
            { value: 'donotinsultme' },
            { value: 'whatisbot' },
            { value: 'human' },
            { value: 'no' },
            { value: 'thisisnotagame' },
            // TODO iam<name> / itoldyouiam<name>
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
        trigger: /^are.*/,
        options: [
            { value: '{boolean}' },
        ]
    },
    {
        /* Nonsequitur fallback when nothing else matches */
        trigger: /.*/,
        options: [
            { value: 'youwilldiesoon', restrictedTo: [EVIL] },
            { value: 'isthisagametoyou', restrictedTo: [FRIENDLY] },
            { value: 'thisisnotagame', restrictedTo: [FRIENDLY] },
            { value: 'youthinkso' },
            { value: 'youwillsee' },
            { value: 'dontbeafraid', restrictedTo: [EVIL] },
            { value: 'dontworry', restrictedTo: [EVIL] },
            { value: 'youshallperish', restrictedTo: [EVIL] },
            // TODO insults
            //{ value: 'iamtrapped', restrictedTo: [EVIL] },
            // youarechosen ... donotresist
            // itconsumesme ... itwillcomeforyounow
            // ithurts ... makeitstop
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
            priority: Math.random() // TODO alter priority based on what weve seen before
        }))
        .filter((option) => !option.restrictedTo || option.restrictedTo.includes(spirit.type))
    filteredOptions.sort((a, b) => a.priority - b.priority)
    return filteredOptions[0].value
}

const resolveQuery = function(query, spirit) {
    if (query.startsWith('!DEFINE')) {
        // TODO merkkaa localstorageen et on käytetty + poista scriptedExperiencestä kaikki DEFINEit
        return 'define' + query.split(" ")[1]
    }
    if (query.startsWith('!RANDOM_SMALL_COUNT')) {
        return '' + (2 + Math.floor(Math.random() * 13))
    }
    if (query.startsWith('!RANDOM_COUNT')) {
        return '' + (2 + Math.floor(Math.random() * 600))
    }
    if (query.startsWith('!RANDOM_COUNT_YEARS')) {
        return resolveQuery('!RANDOM_COUNT', spirit) + 'years'
    }
    if (query.startsWith('!RANDOM_YEAR_PAST')) {
        return '' + (1500 + Math.floor(Math.random() * 522))
    }
    if (query.startsWith('!RANDOM_YEAR_FUTURE')) {
        return '' + (2023 + Math.floor(Math.random() * 50))
    }
    for (let i=0; i<scriptedExperience.length; i++) {
        const node = scriptedExperience[i]
        let matchingNode = null
        if (typeof(node.trigger) == 'string') {
            if (node.trigger.startsWith('{') && query == node.trigger) {
                matchingNode = node
            }
        } else {
            // Trigger is regex
            if (query.match(node.trigger)) {
                matchingNode = node
            }
        }
        if (matchingNode) {
            const v = pickSuitableOption(matchingNode.options, spirit)
            if (v.startsWith('!') || v.startsWith('{')) {
                // If chosen option needs more resolving, call resolveQuery recursively.
                return resolveQuery(v, spirit)
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
const currentSpirit = initializeSpirit()

// TODO luetaan localStoragesta jo aiemmin käytetyt replat
// TODO jos localStoragessa on merkitty et DEFINE on käytetty ni sit poistetaan ne scriptedExperiencestä
const getSpiritResponse = function(rawInput) {

    try {
        const input = rawInput
            .toLocaleLowerCase()
            .split(" ")
            .filter((word) => !['the', 'a', 'an'].includes(word))
            .map((word) => {
                if (word === 'were') return 'where'
                if (word === 'u') return 'you'
                if (word === 'r') return 'are'
                return word
            })
            .join(' ')

        const spiritResponse = resolveQuery(input, currentSpirit)
        // TODO tallenna käytetty repla localStorageen
        return spiritResponse
    } catch (ex) {
        //alert('Internal error, sorry!')
        console.log(ex)
        return 'error'
    }

}