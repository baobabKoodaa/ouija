// This web app is designed for Chrome, some animations are disabled in Firefox due to performance issues in Firefox.
const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1
const reduceAnimations = isFirefox

// String literals
const ON_PLANCHETTE = 'onPlanchette'
const ON_USER_MESSAGE = 'onUserMessage'
const ON_BUTTON = 'onButton'
const ON_TEXT_INPUT = 'onTextInput'
const SHUT_UP = 'shutUp'
const RECORDING = 'recording'
const TURN_SPIRIT = 'turnSpirit'
const TURN_USER = 'turnUser'
const OUIJA_USER_ID = 'ouija-user-id'
const OUIJA_PLAYER_NAME = 'ouija-player-name'
const OUIJA_SUICIDE_POPUP_SHOWN_ONCE  = 'ouija-suicide-popup-shown-once'
const OUIJA_SUICIDE_PREVENTION_ACTIVATED = 'ouija-suicide-prevention-activated'

// Achievements!
const FALSE_PROPHETS_ACHIEVEMENT = 'achievementFalseProphets'
const EASTER_EGG_ACHIEVEMENT = 'achievementEasterEgg'
const POSSESSED_ACHIEVEMENT = 'achievementPossessed'
const allAchievements = [EASTER_EGG_ACHIEVEMENT, POSSESSED_ACHIEVEMENT, FALSE_PROPHETS_ACHIEVEMENT]

// Global state
let loadingOverlayDisabled = false
let gameOver = false
let popupIsOpen = false
let showTips = true
let easyMode = false
let easterEggVisible = false
let draggingPlanchette = false
let planchetteTransformX = 0 // In % relative to planchette's own size (to support browser resizing)
let planchetteTransformY = 0 // In % relative to planchette's own size (to support browser resizing)
let prevX = undefined
let prevY = undefined
let offsetX = 0 // In % relative to planchette's size (to support browser resizing consistently with planchetteHelper)
let offsetY = 0 // In % relative to planchette's size (to support browser resizing consistently with planchetteHelper)
let userMoveCount = 0
let remainingGoals = ''
let revealedSpiritLetters = ''
let userMessage = ''
let currentExchangeNumber = 0
let turn = TURN_USER
let hoveringOverTooltip = false
let speedMode = false
let revealMouse = false
let debug = {}

// Magnifier constants
const MAG_ZOOM = 1.2
const MAG_LEFT = 0.465
const MAG_TOP = 0.58

// Offset constants
const SPIRIT_MAX_DIST = 43.0 // Values above 43 will cause confusing UX when target is on different "row" of letters than the player is!
const SPIRIT_STOCHASTIC_STR = 0.6
const SPIRIT_ACCEL_STR = 1.4
const OFFSET_CANCELLATION_STR = 0.3
const OFFSET_CANCELLATION_LOW_URGENCY = 0.3

// Planchette drag limitations (board area)
const HARD_Y_MAX = 80
const HARD_Y_MIN = -160
const HARD_X_MAX = 270
const HARD_X_MIN = -255
const SOFT_Y_MAX = HARD_Y_MAX - 10
const SOFT_Y_MIN = HARD_Y_MIN - 10
const SOFT_X_MAX = HARD_X_MAX - 10
const SOFT_X_MIN = HARD_X_MIN - 10

// User message constants
USER_MESSAGE_MAX_LENGTH = 40

// Goal constants. Coordinates are in % relative to planchette transform.
const ALLOWED_CHARS = 'abcdefghijklmnopqrstuvwxyz1234567890'
const CHAR_SELECT_MAX_DIST = 10
const goalCoords = {
    "0": { "x": 96.57, "y": -0.67 },
    "1": { "x": -110.95, "y": -1.07 },
    "2": { "x": -92.67, "y": -0.27 },
    "3": { "x": -69.56, "y": -0.27 },
    "4": { "x": -45.9, "y": -0.27 },
    "5": { "x": -23.86, "y": -0.27 },
    "6": { "x": -1.28, "y": -0.67 },
    "7": { "x": 20.23, "y": -0.67 },
    "8": { "x": 42.27, "y": -0.27 },
    "9": { "x": 67.54, "y": -0.67 },
    "a": { "x": -159.6, "y": -58.17 },
    "b": { "x": -139.2, "y": -77.69 },
    "c": { "x": -115.5, "y": -91.63 },
    "d": { "x": -91.94, "y": -101.99 },
    "e": { "x": -64.52, "y": -110.36 },
    "f": { "x": -35.48, "y": -115.5 },
    "g": { "x": -6.57, "y": -116.62 },
    "h": { "x": 24.94, "y": -115.17 },
    "i": { "x": 52.9, "y": -111.67 },
    "j": { "x": 74.94, "y": -105.69 },
    "k": { "x": 105.05, "y": -94.14 },
    "l": { "x": 130.32, "y": -79.4 },
    "m": { "x": 152.9, "y": -63.06 },
    "n": { "x": -152.8, "y": -7.68 },
    "o": { "x": -136.2, "y": -22.82 },
    "p": { "x": -117.9, "y": -36.37 },
    "q": { "x": -94.81, "y": -47.92 },
    "r": { "x": -65.24, "y": -57.48 },
    "s": { "x": -36.75, "y": -63.46 },
    "t": { "x": -6.75, "y": -67.17 },
    "u": { "x": 24.53, "y": -65.21 },
    "v": { "x": 55.17, "y": -60.83 },
    "w": { "x": 86.36, "y": -51.67 },
    "x": { "x": 111.63, "y": -37.72 },
    "y": { "x": 134.21, "y": -24.18 },
    "z": { "x": 147.65, "y": -9.44 }
}

// Easter egg coordinates (relative to planchette's size).
const easterEggLocation = {
    x: -200.78,
    y: 41.95
}

// Tooltip hovering area. Coordinates are relative to planchette's size.
const tooltipHoverArea = {
    top: 0.57,
    left: 0.83,
    bottom: 0.87,
    right: 0.96
}

const loadAnalyticsScript = function() {
    // We need DOMContentLoaded to execute fast, that's why we insert analytics scripts only AFTER the first 'load' event has fired.
    const script = document.createElement("script")
    script.setAttribute('data-domain', 'ouija.attejuvonen.fi')
    script.src = "https://plausible.io/js/plausible.js"
    document.getElementsByTagName("head")[0].appendChild(script)
}

const preloadImage = function(url) {
    const img = document.createElement("img")
    img.src = url
    img.style = "display: none;"
    img.alt = ""
    document.body.appendChild(img)
}

const preloadSomeImages = function() {
    // Preloading these images prevents a flicker issue with magnifying glass. This preload is delayed on purpose to improve initial load time.
    preloadImage("assets/ouija_bg_face_stare.jpg")
    preloadImage("assets/ouija_bg_face_no_eyes.jpg")
    preloadImage("assets/ouija_bg_face_outline.jpg")
}

const disableLoadingOverlay = function() {
    if (loadingOverlayDisabled) return
    loadingOverlayDisabled = true
    document.getElementById('loadingOverlay').style.opacity = 0
    setTimeout(() => {
        document.getElementById('loadingOverlay').style.display = 'none'
    }, 1000)
}

// Memoize some values to reduce reflows (improve performance).
let boardWidth = 0
let boardHeight = 0
let boardTop = 0
let boardLeft = 0
let planchetteWidth = 0
let planchetteHeight = 0
let magSize = 0
let windowWidth = 0
let windowHeight = 0
const resizeUpdates = function () {
    // Update memoized values
    const boardBounds = document.getElementById('boardContainer').getBoundingClientRect()
    boardTop = boardBounds.top
    boardLeft = boardBounds.left
    boardWidth = boardBounds.width
    boardHeight = boardBounds.height
    const planchette = document.getElementById('planchette')
    planchetteWidth = planchette.clientWidth
    planchetteHeight = planchette.clientHeight
    windowWidth = window.innerWidth
    windowHeight = window.innerHeight

    // Update magnifying glass
    const mag = document.getElementById('magnifying-glass')
    magSize = planchetteWidth * 0.40
    Object.assign(mag.style, {
        left: (100 * MAG_LEFT) + "%",
        top: (100 * MAG_TOP) + "%",
        width: magSize + 'px',
        height: magSize + 'px',
        backgroundSize: (MAG_ZOOM * 100 * boardWidth / magSize) + '% ' + (MAG_ZOOM * 100 * boardHeight / magSize) + '%',
        visibility: 'visible'
    })
    updateMagnifyingGlassPosition()

    // Disable loading overlay
    disableLoadingOverlay()

    // Fix edge case where user sees 2 cursors when using keyboard shortcut to resize browser
    const cursor = document.getElementById("cursor")
    if (cursor) {
        cursor.style.visibility = "hidden";
    }
}
// Call resizeUpdates after the first complete render and after each resize
window.addEventListener('load', function (event) {
    resizeUpdates()
    setTimeout(() => {
        loadAnalyticsScript()
        preloadSomeImages()
    }, 500)
});
window.addEventListener('resize', function (event) {
    resizeUpdates()
});

const LOG_ENDPOINT = 'https://endpoint1.collection.eu.sumologic.com/receiver/v1/http/ZaVnC4dhaV0vBIvS0oahg-8LYhDkyFCtWZ2zZ_7NbP0x0PYd0DmEk2cLgA4DJlePqnHWB5KjcxPFudwdOmtop0b6isr9VgLeKHYmzJ6eSqkD0cyZ6FNQiQ=='
const LOG_PROXY_ENDPOINT = 'https://lokittaja.atte-cloudflare.workers.dev/'
const logToSumoLogic = function (message) {
    if (window.localStorage.getItem('ouija-dont-log-myself') || window.location.href.startsWith("file")) {
        // Exclude debug testing messages from logs (use incognito if you need to test logging)
        return
    }
    const augmentedMessage = `${window.localStorage.getItem(OUIJA_USER_ID)}:${Date.now()}:${using_GPT3 ? "GPT-3" : "Simple"}:${message}`
    fetch(`${LOG_ENDPOINT}?${augmentedMessage}`)
        .catch((error => {
            // Adblocker blocks direct requests to SumoLogic? Fallback to using log proxy
            fetch(`${LOG_PROXY_ENDPOINT}?${augmentedMessage}`, { mode: 'cors' })
                .catch((error2) => {
                    console.log('Logging failed', error, error2)
                })
        }))
}

const paintCursorWithOffset = function (cursor, realX, realY) {
    let x = realX + offsetX * planchetteWidth / 100
    let y = realY + offsetY * planchetteHeight / 100
    cursor.style.top = (y - boardTop) + "px";
    cursor.style.left = (x - boardLeft) + "px";
}

const updateMagnifyingGlassPosition = function () {
    const mag = document.getElementById('magnifying-glass')
    const xMoveWithOffset = planchetteTransformX + offsetX
    const yMoveWithOffset = planchetteTransformY + offsetY

    // Move location of the magnifying glass
    const xMag = xMoveWithOffset * planchetteWidth / magSize
    const yMag = yMoveWithOffset * planchetteHeight / magSize
    mag.style.transform = `translateX(${xMag}%) translateY(${yMag}%)`;

    // Move background image inside magnifying glass (using pixels because I couldn't get % to work, this is why we have to call this method inside resizeUpdates)
    const xBgPosPx = -(xMoveWithOffset * planchetteWidth + MAG_LEFT * 100 * boardWidth) / 100 * MAG_ZOOM - magSize * MAG_ZOOM * (1 - 1 / MAG_ZOOM) / 2
    const yBgPosPx = -(yMoveWithOffset * planchetteHeight + MAG_TOP * 100 * boardHeight) / 100 * MAG_ZOOM - magSize * MAG_ZOOM * (1 - 1 / MAG_ZOOM) / 2
    mag.style.backgroundPosition = `${xBgPosPx}px ${yBgPosPx}px`
}

const updatePlanchettePosition = function () {
    const planchette = document.getElementById('planchette')
    const planchetteHelper = document.getElementById('planchetteHelper')

    planchette.style.transform = `translateX(${planchetteTransformX + offsetX}%) translateY(${planchetteTransformY + offsetY}%) rotate(130deg)`;
    planchetteHelper.style.transform = `translateX(${planchetteTransformX}%) translateY(${planchetteTransformY}%) rotate(130deg)`;
    updateMagnifyingGlassPosition()
}

const spiritGuidanceToOffset = function (x, y, diffX, diffY, goalX, goalY, dist) {
    const accelDistanceMultiplier = (SPIRIT_MAX_DIST - dist) / SPIRIT_MAX_DIST
    if (Math.random() > SPIRIT_STOCHASTIC_STR) {
        return
    }
    if (diffX != 0 && Math.sign(goalX - x) == Math.sign(diffX)) { // X axis move is in preferable direction
        if (dist > 5) { // reduce jittery accels on top of goal
            offsetX += diffX * SPIRIT_ACCEL_STR * 1.3 * 100.0 / planchetteWidth // accelerate
        }
    } else if (diffX != 0) { // X axis move is in undesired direction
        if (dist < 10) { // sharp cutoff for deceleration to reinforce feeling of "magnetic force" and to reduce unnecessary offsetting
            offsetX -= diffX * SPIRIT_ACCEL_STR * accelDistanceMultiplier * 100.0 / planchetteWidth // decelerate
        }
    }
    if (diffY != 0 && Math.sign(goalY - y) == Math.sign(diffY)) { // Y axis move is in preferable direction
        if (dist > 5) {
            offsetY += diffY * SPIRIT_ACCEL_STR * 1.3 * 100.0 / planchetteHeight // accelerate
        }
    } else if (diffY != 0) {
        if (dist < 10) {
            offsetY -= diffY * SPIRIT_ACCEL_STR * accelDistanceMultiplier * 100.0 / planchetteHeight // decelerate
        }
    }
}

const clearOffsets = function () {
    if (offsetX != 0) {
        planchetteTransformX += offsetX // This negates any effect on planchette positioning
        offsetX = 0
    }
    if (offsetY != 0) {
        planchetteTransformY += offsetY
        offsetY = 0
    }
}

const cancelSomeOffset = function (diffX, diffY, urgency) {
    // Will accelerate or decelerate latest mouse move in an effort to reduce offset
    const e = OFFSET_CANCELLATION_STR * urgency
    if (Math.abs(offsetX) > 1) {
        const sign = (Math.sign(offsetX) == Math.sign(diffX) ? -1 : 1) // Decelerate or accelerate depending on sign
        offsetX += sign * diffX * e
        if (!draggingPlanchette) {
            // When planchette is not being dragged, we need to do this to "negate" the effect on planchette position
            planchetteTransformX -= sign * diffX * e
        }
    }
    if (Math.abs(offsetY) > 1) {
        const sign = (Math.sign(offsetY) == Math.sign(diffY) ? -1 : 1)
        offsetY += sign * diffY * e
        if (!draggingPlanchette) {
            planchetteTransformY -= sign * diffY * e
        }
    }
}

const startedHoverOnTooltip = function () {
    document.getElementById('tooltipSymbol').style.filter = 'blur(2px)'
    // Set 'from' attribute to make animation smooth even when the user abruptly moves in and out with the mouse
    document.getElementById('animateToFocus').setAttributeNS(null, 'from', document.getElementById('smokeFilterMap').scale.animVal)
    document.getElementById('animateToFocus').beginElement()
}

const stoppedHoverOnTooltip = function () {
    if (!isBlackSmokeClickable) return
    document.getElementById('tooltipSymbol').style.filter = 'blur(11px)'
    document.getElementById('animateRemoveFocus').setAttributeNS(null, 'from', document.getElementById('smokeFilterMap').scale.animVal)
    document.getElementById('animateRemoveFocus').beginElement()
}

const displayEasterEgg = function() {
    if (!easterEggVisible) {
        easterEggVisible = true
        document.getElementById('boardEasterEggHelper').style.display = 'block'
        document.getElementById('boardEasterEggHelper').offsetHeight // Trigger reflow.
        document.getElementById('boardEasterEggHelper').style.opacity = 1
        setTimeout(() => {
            document.getElementById('board').src = 'assets/ouija_bg_face_outline.jpg'
            document.getElementById('magnifying-glass').style.backgroundImage = 'assets/ouija_bg_face_stare.jpg'
            document.getElementById('boardEasterEggHelper').style.display = 'none'
        }, 4000)
    }
}

const flyBanshee = function() {
    easterEggVisible = false
    gameOver = true
    document.getElementById('audio-scream1').play()
    // Stop blinking caret
    document.getElementById('userMessagePre').classList = ['orangey-text']
    // Clear easter egg from board (because it flies into the screen)
    document.getElementById('board').src = 'assets/ouija_bg.jpg'
    document.getElementById('magnifying-glass').style.backgroundImage = 'assets/ouija_bg.jpg'
    // Fly, banshee, fly
    document.getElementById('banshee').style.opacity = 0.7
    document.getElementById('banshee').style.animationName = 'banshee-flying'
    setTimeout(() => {
        document.getElementById('glassCrack').style.display = 'block'
        document.getElementById('audio-crack1').play()
        turn = 'no-one'
        document.getElementById('planchette').classList = ['planchette-no-glow']
    }, 300)
    setTimeout(() => {
        if (!pauseSmokeAnimation) {
            document.getElementById('tooltipSymbol').innerText = ''
            document.getElementById('tooltipSymbol').innerHTML = '<span>&#9786;</span>' // shape smoke into smiley emoticon
            startedHoverOnTooltip() // make smoke focus so smiley emoticon is easier to notice
            isBlackSmokeClickable = false
        }
    }, 600)
    setTimeout(() => {
        if (!pauseSmokeAnimation) {
            stopSmokeAnimation()
        }
    }, 2500)
    setTimeout(() => {
        unlockAchievement(FALSE_PROPHETS_ACHIEVEMENT)
    }, 3000)
}

const jackSound = function() {
    setTimeout(() => {
        document.getElementById('audio-jack').play()
    }, 1000)
}

const lightFlash = function() {
    document.getElementById('lightFlash').style.display = 'block';
    setTimeout(() => {
        document.getElementById('lightFlash').style.display = 'none';
    }, 50)
}

const preloadAudio = function(id) {
    const a = document.getElementById(id)
    a.volume = 0.0
    a.play()
    setTimeout(() => {
        a.pause()
        a.currentTime = 0
        a.volume = 1.0
    }, 100)
}

const questLineTick = function() {
    if (!showTips) {
        return
    }
    if (currentTooltip === 0) delayedCreateTooltip(1)
    else if (currentTooltip === 1) {
        logToSumoLogic('!REVEALED_FIRST_SPIRIT_MESSAGE')
        delayedCreateTooltip(2)
    }
    else if (currentTooltip === 2 && questGoals.who <= 0) {
        logToSumoLogic('!SOLVED_QUEST_1')
        delayedCreateTooltip(3)
    }
    else if (currentTooltip === 3 && questGoals.where <= 0) {
        logToSumoLogic('!SOLVED_QUEST_2')
        delayedCreateTooltip(4)
        preloadAudio('audio-scream1')
        preloadAudio('audio-crack1')
    }
    // Easter egg face on board
    if (currentTooltip >= 3 && turn === TURN_SPIRIT) {
        displayEasterEgg()
        preloadAudio('audio-drum1')
    }
}

// When the player picks up the planchette, the spirit tugs slightly in the direction of the goal.
// This tug is different from spiritGuidance, because guidance only accelerates or decelerates movements
// that the player makes. This tug is independent of the player's movements. As such, it provides
// a different sensation and variation to the "feel" of the game. However, the main purpose of this tug
// is to allow the player to discover goals faster. Without the tug players have to slowly and painfully
// hover over all the letters. With the tug players can immediately go in the right direction (once they
// learn to flow along with the mechanic).
//
// Problem: many players ONLY noticed spirit tug, never noticed guidance effects, so they played
// the game by just doing click-click-click. Boring! In order to encourage players to discover all
// mouse effects, a 15-second timer was added, so this tug can not be initiated consecutively.
const TUG_STRENGTH = 1/15
let lastTugTime = 0
const beginSpiritTug = function() {
    if (easyMode) {
        easyModeRecursiveTimerSpiritTug()
        return
    }
    const currTugTime = Date.now()
    if (lastTugTime + 15000 > currTugTime) return
    lastTugTime = currTugTime
    let maxMovesLeft = 20
    let recursiveTimerSpiritTug = function () {
        if (remainingGoals.length === 0) return
        if (maxMovesLeft <= 0) return
        const goalX = goalCoords[remainingGoals[0]].x
        const goalY = goalCoords[remainingGoals[0]].y
        const diffX = goalX - (planchetteTransformX + offsetX)
        const diffY = goalY - (planchetteTransformY + offsetY)
        const dist = Math.sqrt(diffX * diffX + diffY * diffY)
        offsetX += diffX * maxMovesLeft * TUG_STRENGTH / dist
        offsetY += diffY * maxMovesLeft * TUG_STRENGTH / dist
        maxMovesLeft -= 1
        updatePlanchettePosition()
        paintCursorWithOffset(document.getElementById("cursor"), prevX, prevY)
        setTimeout(() => { recursiveTimerSpiritTug() }, 10)
    }
    recursiveTimerSpiritTug()
}

const EASY_MODE_TUG_STRENGTH = 1/25
let easyModeRecursiveTimerSpiritTug = function () {
    if (remainingGoals.length === 0) return
    const goalX = goalCoords[remainingGoals[0]].x
    const goalY = goalCoords[remainingGoals[0]].y
    const diffX = goalX - (planchetteTransformX + offsetX)
    const diffY = goalY - (planchetteTransformY + offsetY)
    offsetX += diffX * EASY_MODE_TUG_STRENGTH
    offsetY += diffY * EASY_MODE_TUG_STRENGTH
    updatePlanchettePosition()
    paintCursorWithOffset(document.getElementById("cursor"), prevX, prevY)
    setTimeout(() => {
        if (draggingPlanchette) {
            easyModeRecursiveTimerSpiritTug() 
        }
    }, 10)
}

const mouseMoved = function (event, onObject) {
    const currX = event.clientX
    const currY = event.clientY
    const diffX = (userMoveCount > 0 ? currX - prevX : 0)
    const diffY = (userMoveCount > 0 ? currY - prevY : 0)
    prevX = currX
    prevY = currY
    userMoveCount += 1

    if (draggingPlanchette) {
        const x = planchetteTransformX + offsetX + diffX * 100.0 / planchetteWidth
        const y = planchetteTransformY + offsetY + diffY * 100.0 / planchetteHeight
        if (y > HARD_Y_MAX || y < HARD_Y_MIN || x > HARD_X_MAX || x < HARD_X_MIN) {
            // Prevent planchette from being moved outside board
            stopDraggingPlanchette(event)
            return
        }
        planchetteTransformX += diffX * 100.0 / planchetteWidth
        planchetteTransformY += diffY * 100.0 / planchetteHeight

        const goalX = remainingGoals.length > 0 ? goalCoords[remainingGoals[0]].x : -10000
        const goalY = remainingGoals.length > 0 ? goalCoords[remainingGoals[0]].y : -10000

        // Possibly accelerate/decelerate move by modifying cursor offset
        const dist = Math.sqrt((x - goalX) * (x - goalX) + (y - goalY) * (y - goalY))
        if (dist < SPIRIT_MAX_DIST) {
            // Modify cursor offset to guide the user towards goal
            spiritGuidanceToOffset(x, y, diffX, diffY, goalX, goalY, dist)
        } else {
            // User dragging planchette but is not near goal, use this opportunity to
            // reduce cursor offset to prevent the real cursor from escaping window.
            if (y < SOFT_Y_MAX && y > SOFT_Y_MIN && x < SOFT_X_MAX && x > SOFT_X_MIN) {
                // Soft limits are used to prevent us from accelerating the user beyond hard limits where planchette would be trapped
                cancelSomeOffset(diffX, diffY, OFFSET_CANCELLATION_LOW_URGENCY)
            }
        }
    } else {
        // User is not dragging planchette.

        // Take the opportunity to reduce cursor offset to prevent the real cursor from escaping window.
        // We need coordinates relative to viewport.
        let x = (currX + offsetX * planchetteWidth / 100) / windowWidth
        let y = (currY + offsetY * planchetteHeight / 100) / windowHeight
        const minimumEscapeDistance = Math.min(Math.abs(x - 0), Math.abs(x - 1), Math.abs(y - 1), Math.abs(y - 0))
        if (minimumEscapeDistance > 0.04) {
            // TODO instead of linear we need to have exponential urgency towards the edges of window
            const urgency = Math.max(1 - minimumEscapeDistance / 0.30, OFFSET_CANCELLATION_LOW_URGENCY)
            cancelSomeOffset(diffX, diffY, urgency)
        } else {
            // We are too close to the edge, immediately cancel all offset
            clearOffsets()
        }

        // Determine if user's fake cursor is hovering over tooltip.
        // We need coordinates relative to board (to support browser resizing).
        x = (x * windowWidth - boardLeft) / boardWidth
        y = (y * windowHeight - boardTop) / boardHeight
        if (showTips && !popupIsOpen && !pauseSmokeAnimation && x > tooltipHoverArea.left && x < tooltipHoverArea.right && y > tooltipHoverArea.top && y < tooltipHoverArea.bottom) {
            // We are hovering over tooltip.
            if (!hoveringOverTooltip) {
                // We just now entered the hover area.
                hoveringOverTooltip = true
                startedHoverOnTooltip()
            }
        } else {
            // We are not hovering over tooltip (or popup is open so we dont do the hover effect anyway).
            if (hoveringOverTooltip) {
                // We just now left the hover area.
                hoveringOverTooltip = false
                stoppedHoverOnTooltip()
            }
        }

    }
    updatePlanchettePosition()

    const chooseCursorIcon = function () {
        if (draggingPlanchette) return 'assets/grabbing.cur'
        if (onObject === ON_PLANCHETTE && turn === TURN_SPIRIT) return 'assets/grab.cur'
        if (onObject === ON_BUTTON) return 'assets/aero_link.cur'
        if (hoveringOverTooltip) return 'assets/aero_link.cur'
        return 'assets/aero_arrow.cur'
    }

    const cursor = document.getElementById("cursor")
    const newCursorSrc = chooseCursorIcon()
    if (cursor.src !== newCursorSrc) cursor.src = newCursorSrc
    cursor.style.visibility = "visible";
    paintCursorWithOffset(cursor, prevX, prevY)

    event.preventDefault()
}

const startDraggingPlanchette = function (event) {
    if (turn === TURN_SPIRIT) {
        draggingPlanchette = true
        cursor.src = "assets/grabbing.cur"
        if (easterEggVisible) document.getElementById('magnifying-glass').style.backgroundImage = "url('assets/ouija_bg_face_stare.jpg')"
        beginSpiritTug()
        event.preventDefault() // Fixes issue in Firefox that made dragging immediately stop.
    }
}
const stopDraggingPlanchette = function (event, source) {
    draggingPlanchette = false
    const newCursor = (source === ON_PLANCHETTE ? 'assets/grab.cur' : 'assets/aero_arrow.cur')
    cursor.src = newCursor
    const x = planchetteTransformX + offsetX
    const y = planchetteTransformY + offsetY
    if (easterEggVisible) { 
        document.getElementById('magnifying-glass').style.backgroundImage = "url('assets/ouija_bg_face_no_eyes.jpg')"
        const c = easterEggLocation
        const dist = Math.sqrt((x - c.x) * (x - c.x) + (y - c.y) * (y - c.y))
        if (dist < CHAR_SELECT_MAX_DIST) {
            unlockAchievement(EASTER_EGG_ACHIEVEMENT)
        }
    }
    if (source === ON_PLANCHETTE) {
        if (debug[RECORDING]) {
            const chars = ALLOWED_CHARS
            let i = 0
            while (debug[RECORDING][chars[i]]) i++
            debug[RECORDING][chars[i]] = {
                x: Math.round(100 * x) / 100,
                y: Math.round(100 * y) / 100,
            }
            console.log(debug[RECORDING])
        } else {
            // What is the closest character to planchette
            let closestDist = 99999999
            let closestChar = 'a'
            for (let i = 0; i < ALLOWED_CHARS.length; i++) {
                const char = ALLOWED_CHARS[i]
                const c = goalCoords[char]
                const dist = Math.sqrt((x - c.x) * (x - c.x) + (y - c.y) * (y - c.y))
                if (dist < closestDist) {
                    closestDist = dist
                    closestChar = char
                }
            }
            if (closestDist < CHAR_SELECT_MAX_DIST) {
                // Close enough, interpret that user intends to select this character
                if (remainingGoals.length > 0 && closestChar === remainingGoals[0]) {
                    // Selected character was goal, move onto the next goal.
                    addCharToRevealedMessage(closestChar)
                    remainingGoals = remainingGoals.substring(1)
                    if (remainingGoals.length === 0) {
                        thingsToDoAfterSpiritMessageHasBeenRevealed()
                    }
                    // Reset tug timer (if player is not on easy mode, when they pick up the planchette, there will be a small tug available again)
                    lastTugTime = 0
                }
            }
        }
    }
    event.stopPropagation()
}

const zalgoChars = {
    up: [
        '\u030d', '\u030e', '\u0311',
        '\u0306', '\u0310', '\u0352', '\u0357', '\u0351', '\u0307',
        '\u0308', '\u030a', '\u0342', '\u0343', '\u0344', '\u034a',
        '\u034b', '\u034c', '\u0303', '\u0302', '\u030c', '\u0350',
        '\u0300', '\u0301', '\u030b', '\u030f', '\u0312', '\u0313',
        '\u0314', '\u033d', '\u0309', '\u033e', '\u035b',
    ],
    upLetters: {
        a: '\u0363',
        e: '\u0364',
        i: '\u0365',
        o: '\u0366',
        u: '\u0367',
        c: '\u0368',
        d: '\u0369',
        h: '\u036a',
        m: '\u036b',
        r: '\u036c',
        t: '\u036d',
        v: '\u036e',
        x: '\u036f',
        s: '\u033e'
    },
    middle: [
        '\u0315', '\u031b', '\u0340', '\u0341', '\u0358', '\u0327', '\u0328'
    ],
    down: [
        '\u0316', '\u0317', '\u0318', '\u0319', '\u031c', '\u031d',
        '\u031e', '\u031f', '\u0320', '\u0324', '\u0325', '\u0326',
        '\u0329', '\u032a', '\u032b', '\u032c', '\u032d', '\u032e',
        '\u032f', '\u0330', '\u0331', '\u0332', '\u0333', '\u0339',
        '\u033a', '\u033b', '\u033c', '\u0347', '\u0348',
        '\u0349', '\u034d', '\u034e', '\u0353', '\u0354', '\u0355',
        '\u0356', '\u0359', '\u035a', '\u0323'
    ]
}

function zalgoRandInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function zalgoAddRandomChars(charIn, conf) {
    let charOut = charIn
    for (const direction in conf) {
        const arr = zalgoChars[direction]
        for (let count=0; count<conf[direction]; count++) {
            charOut += arr[zalgoRandInt(0, arr.length - 1)]
        }
    }
    return charOut
}

function zalgoAddSpecificLetters(charIn, letters) {
    let charOut = charIn
    for (let i=letters.length-1; i>=0; i--) {
        charOut += zalgoChars.upLetters[letters[i]] || ""
    }
    return charOut
}

const zalgoMessages = [
    'hecomes',
    'ithurts',
    'cthuihu',
    'xerxes',
    'doom',
    // TODO: more
    // no diatrics characters available to represent: tainted, unholy, toolate, scourge, pestilence, zalgo, mortal, breach, corrupt, pestilence, extinguish
]

const zalgoize = function(char) {
    if (currentExchangeNumber === 0) {
        // Special case here. The interaction begins with no zalgoization and gradually increases in intensity.
        return char
    }
    const MAX_INTENSITY_REACHED_AFTER_EXCHANGE_NUMBER = 20.0
    const intensity = Math.min(currentExchangeNumber / MAX_INTENSITY_REACHED_AFTER_EXCHANGE_NUMBER, 1.0)
    if (intensity === 1.0 && Math.random() > 0.9) {
        // Special case here. Once max intensity is reached we occasionally drop in a hidden message in zalgotext
        char = zalgoAddRandomChars(char, { up: 2, down: 2 } )
        char = zalgoAddSpecificLetters(char, zalgoMessages[zalgoRandInt(0, zalgoMessages.length-1)])
        char = zalgoAddRandomChars(char, { up: 2 } )
        return char
    }
    // Typical case below.
    if (intensity < 1.0 && Math.random()*2 > intensity+0.3) {
        // Before we reach max intensity, we want only occasional characters to be zalgoized.
        // After we reach max intensity, all characters will be zalgoized.
        return char
    }
    conf = {
        up: zalgoRandInt(2, Math.max(2, Math.round(14 * intensity))),
        middle: zalgoRandInt(0, 5),
        down: zalgoRandInt(1, Math.max(1, Math.round(6 * intensity)))
    }
    char = zalgoAddRandomChars(char, conf)
    return char
}

const addCharToRevealedMessage = function (char) {
    revealedSpiritLetters += zalgoize(char)
    const container = document.getElementById('spiritMessageContainer')
    container.innerText = revealedSpiritLetters
    container.setAttribute('data-text', revealedSpiritLetters)
}

const switchTurnToSpirit = function () {
    turn = TURN_SPIRIT

    // Clear previously revealed spirit message
    revealedSpiritLetters = ''

    // Indicate to user that planchette can be dragged
    document.getElementById('planchette').classList = [' planchette-active-glow']

    // Clear previously revealed answer from visuals
    const container = document.getElementById('spiritMessageContainer')
    container.innerText = ''
    container.setAttribute('data-text', '')

    // Stop blinking caret
    document.getElementById('userMessagePre').classList = ['orangey-text']

    // Maybe update tooltip
    questLineTick()
}

const getInitialDelay = function() {
    // Intent is to emulate a human who takes a little bit longer before starting to write
    return 700 + Math.round(Math.random() * 1000)
}

const thingsToDoAfterSpiritMessageHasBeenRevealed = function() {
    turn = TURN_USER
    console.log('Spirit: ' + revealedSpiritLetters.toUpperCase())
    document.getElementById('planchette').classList = ['planchette-no-glow']
    document.getElementById('userMessagePre').innerText = ''
    document.getElementById('userMessagePre').classList = ['blinking-caret']
    currentExchangeNumber++
    questLineTick()
    if (completionEffect) {
        setTimeout(() => {
            completionEffect()
            completionEffect = null
        }, 1000 + Math.round(Math.random() * 3000))
    }
}

const getConsecutiveDelay = function(nextChar) {
    // Intent is to emulate a human with varying delays between key presses
    const prev1 = revealedSpiritLetters.charAt(revealedSpiritLetters.length-1)
    const prev2 = revealedSpiritLetters.charAt(revealedSpiritLetters.length-2)
    if (nextChar == prev1 || nextChar == prev2) {
        return 60 + Math.round(Math.random() * 120)
    }
    return 80 + Math.round(Math.random() * 400)
}

const recursivelyRevealSpiritMessage = function (delayParam) {
    turn = 'no-one'
    document.getElementById('planchette').classList = ['planchette-no-glow']
    if (remainingGoals.length === 0) {
        thingsToDoAfterSpiritMessageHasBeenRevealed()
    } else {
        const delay = delayParam ?? getInitialDelay()
        setTimeout(() => {
            const c = remainingGoals[0]
            const nextDelay = getConsecutiveDelay(c)
            remainingGoals = remainingGoals.substring(1)
            addCharToRevealedMessage(c)
            recursivelyRevealSpiritMessage(nextDelay)
        }, delay)
    }
}

const spiritIsReadyToCommunicate = function (rawMessage) {
    const message = rawMessage.toLocaleLowerCase().replace(/[^0-9a-z]/gi, '')
    const container = document.getElementById('spiritMessageContainer')

    logToSumoLogic(previousInput + " -> " + message)

    remainingGoals = message
    if (speedMode) {
        recursivelyRevealSpiritMessage()
    }
}

let currentTooltip = 0

const delayedCreateTooltip = function(i) {
    currentTooltip = i
    if (!using_GPT3) stopSmokeAnimation()
    setTimeout(() => createTooltip(i), 2500)
}

const createTooltip = function (i) {
    if (!SCRIPTED_TOOLTIPS) {
        // Possibly slow connection and chatbot.js hasn't loaded yet
        setTimeout(() => createTooltip(i), 500)
        return
    }
    const t = SCRIPTED_TOOLTIPS[i]
    document.getElementById('tooltipSymbol').innerText = t.tooltip
    document.getElementById('tooltipContent').innerHTML = `<h1>${t.headline}</h1>\n${t.paragraphs.map((str) => '<p>' + str + '</p>\n').join("")}`
    if (showTips && !using_GPT3) {
        startSmokeAnimation()
    }
}

const openTooltipPopup = function (e) {
    clearOffsets()
    mouseMoved(e) // To update cursor location after clearing offsets.
    document.getElementById('board').style.filter = `blur(10px) brightness(0.6)`
    document.getElementById('planchette').style.filter = `blur(10px) brightness(0.6)`
    document.getElementById('planchetteHelper').style.filter = `blur(10px) brightness(0.6)`
    document.getElementById('spiritMessageContainer').style.visibility = `hidden`
    document.getElementById('userMessageContainer').style.visibility = `hidden`
    document.getElementById('tooltipPopup').style.opacity = '1'
    document.getElementById('tooltipPopup').style.display = `block`
}

const closeTooltipPopup = function (shutUp) {
    if (shutUp) toggleShowTips()
    document.getElementById('settingsGear').classList.remove(['one-time-gear-roll'])
    document.getElementById('planchette').style.removeProperty('filter')
    document.getElementById('tooltipPopup').style.display = 'none'
    document.getElementById('board').style.filter = `none`;
    document.getElementById('planchetteHelper').style.filter = `none`;
    document.getElementById('spiritMessageContainer').style.visibility = `visible`
    document.getElementById('userMessageContainer').style.visibility = `visible`;
}

let isBlackSmokeClickable = true
const toggleTooltipPopup = function (e, shutUp) {
    if (!isBlackSmokeClickable) return
    popupIsOpen = !popupIsOpen
    popupIsOpen ? openTooltipPopup(e) : closeTooltipPopup(shutUp)
}

const openSettingsPopup = function () {
    document.getElementById('settingsGear').classList.add(['one-time-gear-roll'])
    document.getElementById('board').style.filter = `blur(10px) brightness(0.6)`
    document.getElementById('planchette').style.filter = `blur(10px) brightness(0.6)`
    document.getElementById('planchetteHelper').style.filter = `blur(10px) brightness(0.6)`
    document.getElementById('spiritMessageContainer').style.visibility = `hidden`
    document.getElementById('userMessageContainer').style.visibility = `hidden`
    document.getElementById('settingsPopup').style.opacity = '1'
    document.getElementById('settingsPopup').style.display = `block`
}

const closeSettingsPopup = function () {
    document.getElementById('settingsGear').classList.remove(['one-time-gear-roll'])
    document.getElementById('planchette').style.removeProperty('filter')
    document.getElementById('settingsPopup').style.display = 'none'
    document.getElementById('board').style.filter = `none`;
    document.getElementById('planchetteHelper').style.filter = `none`;
    document.getElementById('spiritMessageContainer').style.visibility = `visible`
    document.getElementById('userMessageContainer').style.visibility = `visible`;
}

const toggleSettingsPopup = function () {
    popupIsOpen = !popupIsOpen
    popupIsOpen ? openSettingsPopup() : closeSettingsPopup()
}

const toggleEasyMode = function() {
    easyMode = !easyMode
    const slider = document.getElementById('easyModeSliderSlider')
    if (easyMode) {
        slider.classList.add(['checked'])
    } else {
        slider.classList.remove(['checked'])
    }
}

const toggleShowTips = function () {
    showTips = !showTips
    const slider = document.getElementById('showTipsSliderSlider')
    if (showTips) {
        slider.classList.add(['checked'])
        if (!using_GPT3) startSmokeAnimation()
    } else {
        slider.classList.remove(['checked'])
        if (!using_GPT3) stopSmokeAnimation()
    }
}

const toggleRevealMouse = function () {
    revealMouse = !revealMouse
    const slider = document.getElementById('revealMouseSliderSlider')
    if (!revealMouse) {
        slider.classList.remove(['checked'])
        document.getElementById('planchetteHelper').style.opacity = 0
        document.getElementById('bg').style.cursor = 'none'
        document.getElementById('hoverBoard').style.cursor = 'none'
        document.getElementById('planchette').style.cursor = 'none'
        document.getElementById('planchetteHelper').style.cursor = 'none'
    } else {
        slider.classList.add(['checked'])
        document.getElementById('planchetteHelper').style.opacity = 0.5
        document.getElementById('bg').style.cursor = 'auto'
        document.getElementById('hoverBoard').style.cursor = 'auto'
        document.getElementById('planchette').style.cursor = 'auto'
        document.getElementById('planchetteHelper').style.cursor = 'auto'
    }
}

const toggleSpeedMode = function () {
    speedMode = !speedMode
    const slider = document.getElementById('speedModeSliderSlider')
    if (speedMode) {
        slider.classList.add(['checked'])
        localStorage.setItem('ouija-speedmode', true)
    } else {
        slider.classList.remove(['checked'])
        localStorage.removeItem('ouija-speedmode')
    }
    if (speedMode && remainingGoals.length > 0) {
        recursivelyRevealSpiritMessage()
    }
}

const toggleOpenAI = function () {
    using_GPT3 = !using_GPT3
    const slider = document.getElementById('openAISliderSlider')
    if (!using_GPT3) {
        slider.classList.remove(['checked'])
        document.getElementById('settingsPopupButtonsContainer').style.marginTop = '1.5vw'
        document.getElementById('textInputAPIKey').style.marginTop = '1.7vw'
        if (showTips) startSmokeAnimation()
    } else {
        slider.classList.add(['checked'])
        document.getElementById('settingsPopupButtonsContainer').style.marginTop = '4.1vw'
        document.getElementById('textInputAPIKey').value = window.localStorage.getItem('ouija-openai-api-key')
        document.getElementById('textInputAPIKey').style.marginTop = '1vw'
        if (showTips) stopSmokeAnimation()
    }

}

const userPastedAPIKey = function () {
    window.localStorage.setItem('ouija-openai-api-key', document.getElementById('textInputAPIKey').value)
}

const mouseCheck = function () {
    if (userMoveCount < 20) {
        document.getElementById('mouseRequirement').style.color = 'red'
        return false
    }
    return true
}

const openConsentPopup = function () {
    popupIsOpen = true
    document.getElementById('board').style.filter = `blur(10px) brightness(0.6)`
    document.getElementById('planchette').style.filter = `blur(10px) brightness(0.6)`
    document.getElementById('planchetteHelper').style.filter = `blur(10px) brightness(0.6)`
    document.getElementById('userMessageContainer').style.visibility = `hidden`
    document.getElementById('consentPopup').style.display = `block`
    document.getElementById('settingsGear').style.opacity = `0`
    document.getElementById('settingsGear').style.transition = `opacity 3s`
}

const closeConsentPopup = function () {
    popupIsOpen = false
    window.localStorage.setItem(OUIJA_USER_ID, 'user' + Math.round(1000000000 * Math.random()))
    document.getElementById('consentPopup').style.opacity = '0'
    document.getElementById('settingsGear').style.opacity = `0.7`
    setTimeout(() => {
        document.getElementById('consentPopup').style.display = 'none'
        document.getElementById('settingsGear').style.removeProperty('opacity')
        document.getElementById('settingsGear').style.removeProperty('transition')
        createTooltip(0)
    }, 3000)
    document.getElementById('board').style.filter = `none`;
    document.getElementById('planchette').style.removeProperty('filter')
    document.getElementById('planchetteHelper').style.filter = `none`;
    document.getElementById('userMessageContainer').style.visibility = `visible`;
    document.getElementById('consentYes').classList.add(['one-time-bump'])
    const elementsToFadeOut = document.getElementsByClassName('consentText')
    for (let i = 0; i < elementsToFadeOut.length; i++) {
        elementsToFadeOut[i].style.opacity = '0.4';
    }
    document.getElementById('changingConsentText').innerText = 'Thank you for complying. We shall come for your soul after death.'
    document.getElementById('consentYes').style.pointerEvents = 'none'
    document.getElementById('consentNo').style.pointerEvents = 'none'
}

const consentYes = function () {
    if (!mouseCheck()) return
    logToSumoLogic('!CONSENT_YES')
    closeConsentPopup()
}

const consentNo = function () {
    if (!mouseCheck()) return
    logToSumoLogic('!CONSENT_NO')
    // Make it appear as if the user clicked 'yes', even though they actually clicked 'no'
    const shiftXbuttonWidth = document.getElementById('consentNo').getBoundingClientRect().width * 100.0 / planchetteWidth
    const shiftXmarginWidth = windowWidth * 1.5 / planchetteWidth
    const shiftX = shiftXbuttonWidth + shiftXmarginWidth
    offsetX -= shiftX // Shift mouse to consentYes button
    planchetteTransformX += shiftX // Negate any effect on planchette's position
    const cursor = document.getElementById("cursor")
    paintCursorWithOffset(cursor, prevX, prevY)
    closeConsentPopup()
}

let pauseSmokeAnimation = true
let timerToPauseSmokeAnimation = null
const startSmokeAnimation = function () {
    // We have a scale transition to start/stop smoke animation,
    // and after that transition is done we want to kill our animation tick for performance reasons.
    // The user might toggle on/off before the transition is completed.
    if (timerToPauseSmokeAnimation) {
        // This might happen if the user quickly toggles tips off and on.
        clearTimeout(timerToPauseSmokeAnimation)
        document.getElementById('animateRemoveFocus').beginElement()
    }
    document.getElementById('tooltipSymbol').style.transform = 'scale(1.0)'
    document.getElementById('tooltipSymbol').style.filter = 'blur(11px)'
    document.getElementById('tooltipSymbol').style.opacity = '1.0'
    if (!pauseSmokeAnimation) {
        return
    }
    pauseSmokeAnimation = false
    const filter = document.getElementById("smokeFilterTurbulence");
    let frames = 1;
    let rad = Math.PI / 180;
    let bfx, bfy;
    let prevTime = Date.now()
    const tickSmokeAnimation = function () {
        if (pauseSmokeAnimation) {
            // This pause only exists for performance reasons, smoke would be hidden anyway.
            return
        }
        // Use elapsedTime to stabilize animation speed regardless of device
        const currTime = Date.now()
        const timeElapsed = currTime - prevTime
        prevTime = currTime
        frames += .02 * timeElapsed

        bfx = 0.03;
        bfy = 0.03;

        bfx += 0.005 * Math.cos(frames * rad);
        bfy += 0.005 * Math.sin(frames * rad);

        bf = bfx.toString() + " " + bfy.toString();
        filter.setAttributeNS(null, "baseFrequency", bf);

        // Use requestIdleBallback instead of requestAnimationFrame, because 
        // we want our mouse move event listener callbacks to be prioritized
        // higher than this low-prio animation in the queue for event loop.

        // Due to performance reasons we disable this animation on Firefox.
        if (!reduceAnimations) window.requestIdleCallback(tickSmokeAnimation);
    }
    window.requestIdleCallback(tickSmokeAnimation);
}

const stopSmokeAnimation = function () {
    if (reduceAnimations) {
        document.getElementById('tooltipSymbol').style.transform = 'scale(0.0)'
        document.getElementById('tooltipSymbol').style.filter = 'blur(11px)'
        document.getElementById('tooltipSymbol').style.opacity = '0.0'
        return
    }
    document.getElementById('tooltipSymbol').style.transform = 'scale(3.0)'
    document.getElementById('tooltipSymbol').style.filter = 'blur(13px)'
    document.getElementById('tooltipSymbol').style.opacity = '0.0'
    document.getElementById('animateDissipate').setAttributeNS(null, 'from', document.getElementById('smokeFilterMap').scale.animVal)
    document.getElementById('animateDissipate').beginElement()
    timerToPauseSmokeAnimation = setTimeout(() => {
        pauseSmokeAnimation = true
        document.getElementById('tooltipSymbol').classList.add('disable-transitions')
        document.getElementById('tooltipSymbol').style.transform = 'scale(0.0)'
        document.getElementById('tooltipSymbol').style.filter = 'blur(11px)'
        document.getElementById('tooltipSymbol').style.opacity = '1.0'
        document.getElementById('tooltipSymbol').offsetHeight // Trigger a reflow while transitions are disabled.
        document.getElementById('tooltipSymbol').classList.remove('disable-transitions')
        document.getElementById('animateRemoveFocus').beginElement()
    }, 2000)
}

const displaySuicidePreventionPopup = function() {
    document.getElementById(`suicide-prevention-popup`).style.bottom = '20px'
    document.getElementById(`suicide-prevention-popup`).style.transition = 'bottom 2s cubic-bezier(.12, 1, .96, .97)'
}
const hideSuicidePreventionPopup = function() {
    document.getElementById(`suicide-prevention-popup`).style.bottom = '-17vw'
    document.getElementById(`suicide-prevention-popup`).style.transition = 'bottom 2s ease-out'
}
const showSuicidePreventionOverlay = function() {
    gameOver = true
    document.getElementById('suicidePreventionOverlay').style.display = 'block'
    // Hide blinking cursor
    document.getElementById('userMessagePre').classList = ['orangey-text']
}
document.getElementById('suicide-prevention-button-fine').addEventListener('click', hideSuicidePreventionPopup)
document.getElementById('suicide-prevention-button-help').addEventListener('click', e => {
    hideSuicidePreventionPopup()
    showSuicidePreventionOverlay()
    window.localStorage.setItem(OUIJA_SUICIDE_PREVENTION_ACTIVATED, true)
})
if (window.localStorage.getItem(OUIJA_SUICIDE_PREVENTION_ACTIVATED)) {
    showSuicidePreventionOverlay()
}

const displayNotification = function(achievement) {
    document.getElementById(`${achievement}-notification`).style.bottom = '-3px'
    document.getElementById(`${achievement}-notification`).style.transition = 'bottom 2s cubic-bezier(.12, 1, .96, .97)'
    setTimeout(() => {
        document.getElementById(`${achievement}-notification`).style.bottom = '-12vw'
        document.getElementById(`${achievement}-notification`).style.transition = 'bottom 2s ease-in'
    }, 4000)
}

const activateAchievementIcon = function(achievement) {
    // Remove not-achieved hint icon
    document.getElementsByClassName('not-achieved')[0].remove()
    // Add new element in its place
    document.getElementById('achievement-row').innerHTML += `
        <svg id="${achievement}" class="achieved" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
            <path d="M288 358.3c13.98-8.088 17.53-30.04 28.88-41.39c11.35-11.35 33.3-14.88 41.39-28.87c7.98-13.79 .1658-34.54 4.373-50.29C366.7 222.5 383.1 208.5 383.1 192c0-16.5-17.27-30.52-21.34-45.73c-4.207-15.75 3.612-36.5-4.365-50.29c-8.086-13.98-30.03-17.52-41.38-28.87c-11.35-11.35-14.89-33.3-28.87-41.39c-13.79-7.979-34.54-.1637-50.29-4.375C222.5 17.27 208.5 0 192 0C175.5 0 161.5 17.27 146.3 21.34C130.5 25.54 109.8 17.73 95.98 25.7C82 33.79 78.46 55.74 67.11 67.08C55.77 78.43 33.81 81.97 25.72 95.95C17.74 109.7 25.56 130.5 21.35 146.2C17.27 161.5 .0008 175.5 .0008 192c0 16.5 17.27 30.52 21.34 45.73c4.207 15.75-3.615 36.5 4.361 50.29C33.8 302 55.74 305.5 67.08 316.9c11.35 11.35 14.89 33.3 28.88 41.4c13.79 7.979 34.53 .1582 50.28 4.369C161.5 366.7 175.5 384 192 384c16.5 0 30.52-17.27 45.74-21.34C253.5 358.5 274.2 366.3 288 358.3zM112 192c0-44.27 35.81-80 80-80s80 35.73 80 80c0 44.17-35.81 80-80 80S112 236.2 112 192zM1.719 433.2c-3.25 8.188-1.781 17.48 3.875 24.25c5.656 6.75 14.53 9.898 23.12 8.148l45.19-9.035l21.43 42.27C99.46 507 107.6 512 116.7 512c.3438 0 .6641-.0117 1.008-.0273c9.5-.375 17.65-6.082 21.24-14.88l33.58-82.08c-53.71-4.639-102-28.12-138.2-63.95L1.719 433.2zM349.6 351.1c-36.15 35.83-84.45 59.31-138.2 63.95l33.58 82.08c3.594 8.797 11.74 14.5 21.24 14.88C266.6 511.1 266.1 512 267.3 512c9.094 0 17.23-4.973 21.35-13.14l21.43-42.28l45.19 9.035c8.594 1.75 17.47-1.398 23.12-8.148c5.656-6.766 7.125-16.06 3.875-24.25L349.6 351.1z" />
        </svg>
    `
    document.getElementById('achievement-row').offsetHeight // Trigger reflow.
    setTimeout(() => {
        // I don't understand why this doesn't work without timer.
        document.getElementById(achievement).addEventListener('click', e => { trophyClicked(achievement) })
    }, 1000)
    
}

const unlockAchievement = function(achievement) {
    if (window.localStorage.getItem(`ouija-${achievement}`)) {
        // Only unlock once per achievement
        return
    }
    if (achievement !== FALSE_PROPHETS_ACHIEVEMENT) {
        document.getElementById('audio-drum1').play()
    }
    window.localStorage.setItem(`ouija-${achievement}`, 'true')
    logToSumoLogic(`!ACHIEVEMENT_${achievement}`)
    activateAchievementIcon(achievement)
    displayNotification(achievement)
}

const rageEffect = function() {
    const element = document.getElementById('boardContainer')
    element.classList.remove("shake-board")
    element.offsetWidth // Trigger reflow.
    element.classList.add("shake-board")
}

const shakeMouse = function() {
    let step = 0
    let recursiveTimerReplay = function () {
        const rec = mouse_recordings
        if (step >= rec.length) return
        const diffX = rec[step][1] / planchetteWidth * 100
        const diffY = rec[step][2] / planchetteHeight * 100
        offsetX += diffX
        planchetteTransformX -= diffX
        offsetY += diffY
        planchetteTransformY -= diffY
        step = step + 1
        paintCursorWithOffset(document.getElementById("cursor"), prevX, prevY)
        setTimeout(() => { recursiveTimerReplay() }, 0)
    }
    recursiveTimerReplay()
}

const switchToNormalCursor = function (e) {
    stopDraggingPlanchette(e)
    document.getElementById("cursor").style.visibility = "hidden"
    clearOffsets()
    updatePlanchettePosition()
}

const trophyClicked = function(achievement) {
    if (window.localStorage.getItem(`ouija-${achievement}`)) {
        displayNotification(achievement)
    }
}

// Mouse move events
document.getElementById('loadingOverlay').addEventListener('mousemove', e => { userMoveCount += 1 })
document.getElementById('bg').addEventListener('mousemove', e => { mouseMoved(e) })
document.getElementById('hoverBoard').addEventListener('mousemove', e => { mouseMoved(e) })
document.getElementById('planchette').addEventListener('mousemove', e => { mouseMoved(e) })
document.getElementById('planchetteHelper').addEventListener('mousemove', e => { mouseMoved(e, ON_PLANCHETTE) })
document.querySelectorAll('.popupHoverboard').forEach((element) => element.addEventListener('mousemove', e => { mouseMoved(e) }))
document.querySelectorAll('.popupButton').forEach((element) => element.addEventListener('mousemove', e => { mouseMoved(e, ON_BUTTON) }))
document.querySelectorAll('.slider').forEach((element) => element.addEventListener('mousemove', e => { mouseMoved(e, ON_BUTTON) }))
document.getElementById('extRowGithub').addEventListener('mousemove', e => { mouseMoved(e, ON_BUTTON) })
document.getElementById('extRowFeedback').addEventListener('mousemove', e => { mouseMoved(e, ON_BUTTON) })

// Button click events
document.getElementById('consentYes').addEventListener('click', e => { consentYes() })
document.getElementById('consentNo').addEventListener('click', e => { consentNo() })
document.getElementById('bg').addEventListener('click', e => { if (hoveringOverTooltip && showTips && !pauseSmokeAnimation) toggleTooltipPopup(e) })
document.getElementById('hoverBoard').addEventListener('click', e => { if (hoveringOverTooltip && showTips && !pauseSmokeAnimation) toggleTooltipPopup(e) })
document.getElementById('tooltipContinueButton').addEventListener('click', e => { toggleTooltipPopup(e) })
document.getElementById('tooltipShutUpButton').addEventListener('click', e => { toggleTooltipPopup(e, SHUT_UP) })
document.getElementById('saveSettings').addEventListener('click', e => { toggleSettingsPopup() })
document.getElementById('easyModeSlider').addEventListener('click', e => { toggleEasyMode() })
document.getElementById('showTipsSlider').addEventListener('click', e => { toggleShowTips() })
document.getElementById('revealMouseSlider').addEventListener('click', e => { toggleRevealMouse() })
document.getElementById('speedModeSlider').addEventListener('click', e => { toggleSpeedMode() })
document.getElementById('openAISlider').addEventListener('click', e => { toggleOpenAI() })
document.getElementById('settingsGear').addEventListener('click', e => { toggleSettingsPopup() })

// Activating planchetteDragging
document.getElementById('planchetteHelper').addEventListener('mousedown', e => { startDraggingPlanchette(e) })

// Deactivating planchetteDragging
document.getElementById('planchetteHelper').addEventListener('mouseup', e => { stopDraggingPlanchette(e, ON_PLANCHETTE) })
document.body.addEventListener('mouseup', e => { stopDraggingPlanchette(e) })

// Switches from fake cursor to normal cursor
document.body.addEventListener('mouseleave', e => { switchToNormalCursor(e) })
document.getElementById('suicide-prevention-popup').addEventListener('mousemove', e => { switchToNormalCursor(e) })
document.getElementById('settingsGearHoverboard').addEventListener('mousemove', e => { switchToNormalCursor(e) })
document.getElementById('achievement-hoverboard').addEventListener('mousemove', e => { switchToNormalCursor(e) })
document.getElementById('textInputAPIKey').addEventListener('mousemove', e => { switchToNormalCursor(e) })

// Keydown events
document.body.addEventListener('keydown', e => {
    const lowerCasedChar = e.key.toLocaleLowerCase()
    if (turn === TURN_USER && !popupIsOpen && !gameOver) {
        const m = document.getElementById('userMessagePre')
        if (e.key == 'Enter') {
            if (m.innerText.length >= 2) {
                possessedMessage = '' // this may be needed in case user sends half-consumed possessedMessage
                const userQuestion = m.innerText
                console.log('Player: ' + userQuestion)
                switchTurnToSpirit()
                dispatchToSpirit(userQuestion, spiritIsReadyToCommunicate)
            }
        } else if (possessedMessage?.length > 0) {
            const c = possessedMessage.charAt(0)
            possessedMessage = possessedMessage.substring(1)
            m.innerText += c.toUpperCase()
        } else if (ALLOWED_CHARS.includes(lowerCasedChar) || lowerCasedChar == ' ') {
            if (m.innerText.length < USER_MESSAGE_MAX_LENGTH) {
                m.innerText += lowerCasedChar.toUpperCase()
            }
        } else if (e.key == 'Backspace' && m.innerText.length > 0) {
            m.innerText = m.innerText.substring(0, m.innerText.length - 1)
        } else if (e.key == "'") {
            // Fix Firefox issue.
            e.preventDefault()
        }
    }

    // Helpers for debugging
    if (!window.location.href.endsWith("#debug")) {
        return
    }
    if (e.key == "=") {
        debug[RECORDING] = {}
        console.log('Recording')
    }
})

const cleanText = function (rawText) {
    const lowerCased = rawText.toLocaleLowerCase()
    let filtered = ''
    for (let i = 0; i < lowerCased.length; i++) {
        if (ALLOWED_CHARS.includes(lowerCased[i])) {
            filtered += lowerCased[i]
        }
    }
    return filtered
}

allAchievements
    .filter(achievement => window.localStorage.getItem(`ouija-${achievement}`))
    .map(achievement => activateAchievementIcon(achievement))

if (window.localStorage.getItem(`ouija-speedmode`)) {
    toggleSpeedMode()
}

if (reduceAnimations) {
    document.getElementById('board').style.animationName = 'no-animation'
    document.getElementById('board').style.boxShadow = '0 0 50px 20px #d35400'
}