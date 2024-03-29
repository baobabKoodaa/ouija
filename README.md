## O̅͒͊̎̌ͯ͋̀̉uͭ̒͂̉ͪ͐̌ͦ̀i͒͋ͭ͋́͑͗͒̔̅̓̓̎̒̾͂̈̔̍j̇͗ͮ̉͑̃ͩͩ̀̒ͥͧ̉ǎ͂ͣͩͥ̿̓ͤͬ ͛ͦ͌̔ͣ͑̄ͭ̎̑̅̽͑ͯoͦ̈͋̀͗ͧ͒̈̊̃̆̐̓͑͋̄̀nͧ͆ͬ̅̾l̈͊ͪͮ̄̽ͧi̇ͨ̿̂ͤͣ͛̒̐̐̈̾͋ͥ̌ͩ͆̀n̋́̃̍̑̓ͪeͨ̇ͥ̍ͭ͗̓ͣͮͤͪͩ̓ͣͥͫͮ͋̚

A web ho̲̘̙̜̮ͦrro̦̅̑̆̀r experience where you communicate with sp̙̝̜͐̇̀ir̛͡͏̀͝its͍̙̅ͣ using a Ouija board.

Try it here: :scream: :scream: :scream: [https://ouija.attejuvonen.fi](https://ouija.attejuvonen.fi) :scream: :scream: :scream:

![Screenshot of Ouija Online](assets/screenshot2-transparent.png)

#### Notable features:

- Despite existing only as a web page, the spirits have the ability to m̜͙̼͉̊͐ͬo̖̗͆̽v̫̺̘̇͗e̮͎̦̞̼ ̩̥͉̆͋̆̎ͅt̞̬͍͓̅̾̎͆́h̫ễ̱̦̤͖̊̅ͭͥ̚ ̳̗͐ͥͭp̺̜̤̅̏̌ͮl̤͒̌a̙̺̣̗̘͆ͣ̒͗͊ͅy̝̻̭̖͑ͭ͑̉e̱͔̯̬̘̅̀͋̍̃ͥr͔͇͉̯̣ͤ̍'͚͎̖̲̞̬͈̈̅̇̑̇š́ͮͦ ̠͈͚̣̩̝ͅm̹̌͊o̗͐ͧ̇̊̏̉̔uͯͧ̓̎̋ͣ̈́s̺̩̗͓͉͈͒̾ͬͯ̒ͧ̆e͉͔̘̒̇̂ͤ towards letters on the board
- Two different chatbots available: a __scripted experience__ is available for all, and for players who have OpenAI API keys, there is a more versatile __GPT-3 mode__
- The scripted experience has 3 achievements to unlock and various special effects including a few jumpscares :scream:

#### How does it work

- Ouija Online is built as a static website with vanilla JS, HTML, and CSS. No frameworks, no libraries, no generators, no bundlers, no servers. You can fork this repo and simply open `index.html` in your browser. (There are a couple of Cloudflare Workers to provide geolocation and logging, but these are supplementary functions and the app works fine without the workers.)
- Control of the user's mouse is an illusion (settings have a toggle to reveal the trick visually).
- Chatbot in GPT-3 mode constructs a prompt with verbal instructions, question-answer examples, previous question and answer, and current question. We request 5 completions for the prompt, and then heuristically choose one of them (considering length, repetition, dullness, etc.).
- Chatbot in scripted mode utilizes state-of-the-art if-else technology.

#### Attribution

Design and implementation: [Baobab Koodaa](https://github.com/baobabKoodaa)

Assets and effects:

- The Ouija board image is a photograph of the original Ouija board from 1889, created by Kennard Novelty Company. According to [Wikipedia](https://en.wikipedia.org/wiki/Ouija#/media/File:Ouija_board_-_Kennard_Novelty_Company.png), this image is in the public domain. Photographer is unknown.
- Planchette PNG image is from [KindPNG](https://www.kindpng.com/imgv/hToiomo_transparent-planchette-png-ouija-board-planchette-png-png/), which provide permission for use in "non-commercial or personal projects". Author is unknown.
- Smoke effect used in tooltip is adapted from work by [chokcoco](https://segmentfault.com/a/1190000041189786/en). I modified the effect heavily in order to get smoother transitions for dissipation and hover. Those transitions now animate the Perlin turbulence filter by using SVG animate (not CSS!) in addition to some CSS transitions.
- Spirit message text glitch Tiktok effect was popularized by Tiktok, implementation adapted from [AmazingCSS](https://amazingcss.com/glitch-text-effect-like-tiktok/).
- Spirit message text glitch Zalgotext was inspired by [the legendary Stackoverflow answer](https://stackoverflow.com/questions/1732348/regex-match-open-tags-except-xhtml-self-contained-tags), implementation adapted from [tchouky](https://eeemo.net/) and [The Great Rambler](https://github.com/TheGreatRambler/another-zalgo.js/)
- Magnifying glass effect adapted from [W3Schools](https://www.w3schools.com/howto/howto_js_image_magnifier_glass.asp) example code.
- Font 'Feral' was created by Marcus Lien Gundersen and was downloaded from [1001fonts](https://www.1001fonts.com/feral-font.html), which provide permission for both personal and commercial use.
- Font 'Carnevalee Freakshow' was created by Chris Hansen and was downloaded from [1001fonts](https://www.1001fonts.com/carnivalee-freakshow-font.html), which provide permission for both personal and commercial use.
- Font 'Kingthings Trypewriter 2' was created by Kevin King and was downloaded from [1001fonts](https://www.1001fonts.com/kingthings-trypewriter-2-font.html), which provide permission for both personal and commercial use.
- Background pattern used in first-visit popup is from [Hero Patterns](https://heropatterns.com/), which provide permission for use under CC BY 4.0 license.
- Icons for settings and external links are from [FontAwesome](https://fontawesome.com/icons/gear?s=solid) with permission for both personal and commercial use.
- Jack-in-the-box audio is from [SoundBible](https://soundbible.com/1872-Jack-In-The-Box.html), uploaded by Mike Koenig with attribution license.
- Creepy old photo used in easter egg is from [Vintage Everyday](https://www.vintag.es/2016/11/these-50-creepy-photographs-early-20th.html), copyright expired.
- Easter egg jumpscare audio is from [Mixkit](https://mixkit.co/free-sound-effects/horror/), which provide permission for both personal and commercial use.
- Banshee scream jumpscare audio is from [Pixabay](https://pixabay.com), which provide permission for both personal and commercial use.
- Glass crack PNG image is from [SeekPNG](https://www.seekpng.com/ipng/u2q8i1y3r5i1t4a9_the-gallery-for-broken-glass-transparent-png-broken/), which provide permission for personal use.
- Glass crack audio was recorded in-house.