let sb = document.getElementById('suttonButton')
let wrapper = document.querySelector('.wrapper')
let pb = document.getElementById('plus')
let mb = document.getElementById('minus')
let pc = document.getElementById('padCounter')
let attribute = document.getElementById('attribution')
let modalClose = document.querySelector('.modal-close')
let modalBG = document.querySelector('.modal-bg')
let modal = document.querySelector('.modal')
let frameAttribute = document.getElementById('frameAttribution')
let instructions = document.querySelector('.instructions')

let padCount = 0
let score = 0
let hs = 0
let state = 'gathering'
let starting = false // true during the 2-second lead-in after Start is clicked
let pads = []
let gameSeq = []
let playerSeq =  []
let cols = 2
let rows = 2
let grid = [4, 6, 8, 9, 12, 16]
let gameplayDifficulty = 0
let fruitBundle = []

pc.style.visibility = 'hidden'
pc.innerText = `Number\nof pads: ${grid[gameplayDifficulty]}`

// Opening the pop-up adds a browser history entry, so a phone's back button closes it
// instead of leaving the game. Every way of closing it goes back through that entry.
function openInstructions(){
    if(!modalBG.classList.contains('modal-bg_inactive')){ return }
    frameWithSparePhoto()
    modalBG.classList.remove('modal-bg_inactive')
    history.pushState({ instructions: true }, '')
}
function closeInstructions(){
    if(modalBG.classList.contains('modal-bg_inactive')){ return }
    if(history.state && history.state.instructions){ history.back() } // the popstate handler hides it
    else { modalBG.classList.add('modal-bg_inactive') }
}
window.addEventListener('popstate', () => {
    modalBG.classList.toggle('modal-bg_inactive', !(history.state && history.state.instructions))
})
if(history.state && history.state.instructions){ history.replaceState(null, '') } // reloaded with it open

instructions.addEventListener('click', openInstructions)
modalClose.addEventListener('click', closeInstructions)
// A tap on the dimmed area outside the pop-up, or Escape, also closes it
modalBG.addEventListener('click', (event) => { if(event.target === modalBG){ closeInstructions() } })
document.addEventListener('keydown', (event) => { if(event.key === 'Escape'){ closeInstructions() } })

// Frame the pop-up with a collection photo that isn't on a pad right now. Pads use the
// first grid-size photos in order, so any later one is off screen. Credited like the pads.
function frameWithSparePhoto(){
    let onPads = grid[gameplayDifficulty]
    if(fruitBundle.length <= onPads){ return } // photos not loaded yet: the CSS gradient frame shows
    let spare = fruitBundle.slice(onPads)
    // Prefer photos whose edges are fruit: a frame only shows a photo's border
    let colorful = spare.filter((photo) => photo.frameScore >= 0.6)
    let pick = colorful.length ? colorful : spare
    let photo = pick[Math.floor(Math.random() * pick.length)]
    modal.style.backgroundImage = 'url("' + sizedPhoto(photo, 800) + '")'
    frameAttribute.innerText = photo.user.name
    frameAttribute.href = photo.links.html
}

// Many collection photos are fruit on a plain white or black background, which makes a blank frame.
// Once the photos load, score each by the share of colorful pixels in its outer border, using a
// tiny 32px copy (Unsplash's image server allows reading the pixels).
function scoreFramePhotos(){
    fruitBundle.forEach((photo) => {
        let img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
            let canvas = document.createElement('canvas')
            canvas.width = canvas.height = 32
            let ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0, 32, 32)
            let d = ctx.getImageData(0, 0, 32, 32).data, colorful = 0, total = 0
            for(let y = 0; y < 32; y++){
                for(let x = 0; x < 32; x++){
                    if(x >= 5 && x < 27 && y >= 5 && y < 27){ continue } // border band only
                    let k = (y * 32 + x) * 4
                    let chroma = Math.max(d[k], d[k + 1], d[k + 2]) - Math.min(d[k], d[k + 1], d[k + 2])
                    if(chroma >= 40){ colorful++ } // white, grey and black backgrounds have little chroma
                    total++
                }
            }
            photo.frameScore = colorful / total // kept on the photo, so reshuffling doesn't mix scores up
        }
        img.src = sizedPhoto(photo, 64)
    })
}

// Unsplash image URLs resize on request: ask for a width that stays sharp at the size shown
function sizedPhoto(photo, width){
    let url = new URL(photo.urls.thumb)
    url.searchParams.set('w', width)
    url.searchParams.set('auto', 'format')
    return url.href
}

pb.addEventListener('click', () => {
    if(gameplayDifficulty < grid.length - 1){
        gameplayDifficulty++
        console.log(genGrid())
    }
    updateNumberOfPads()
})

mb.addEventListener('click', () => {
    if(gameplayDifficulty > 0){
        gameplayDifficulty--
        console.log(genGrid())
    }
    updateNumberOfPads()
})

function grabSomeFruit(){
    console.log('🥝 grabbing some fruit! 🍍')
    fetch('/.netlify/functions/token-hider?collectionId=' + 9660118)
    .then((data) => {
        if(!data.ok){ throw new Error('token-hider responded with ' + data.status) }
        return data.json() // Reading the Response stream to completion
    })
    // .then(({ alt_description }) => console.log('serverless-api response' + alt_description) || setHighScore(alt_description) )
    .then((data) => {
        if(!Array.isArray(data) || data.length < Math.max(...grid)){ throw new Error('not enough photos for the largest grid') }
        return data
    })
    .catch(err => {
        // Saved copy of the collection's photo list. The images still load straight from Unsplash.
        console.log('something went wrong, using the saved photo list', err)
        return fetch('fallback-photos.json').then((data) => data.json())
    })
    .then((data) => fruitBundle = data)
    .catch(err => { console.log('something went wrong', err) })
    .finally(() => {
        console.log('retrieved ' + fruitBundle.length + ' records from the dataset!')
        // console.log(fruitBundle)
        state = 'landing'
        shuffleFruit()
        console.log(genGrid())
        scoreFramePhotos()        
        pb.style.visibility = 'visible'
        mb.style.visibility = 'visible'
        pc.style.visibility = 'visible'
    })
}
grabSomeFruit()

// Pads show the first photos in fruitBundle; the collection lists similar fruit back to back,
// so shuffle the whole list (Fisher-Yates) on load and after each game for a fresh mix
function shuffleFruit(){
    for(let i = fruitBundle.length - 1; i > 0; i--){
        let j = Math.floor(Math.random() * (i + 1))
        let swap = fruitBundle[i]
        fruitBundle[i] = fruitBundle[j]
        fruitBundle[j] = swap
    }
}

function genGrid(){
    // console.log('generating grid ⏳⏳⌛')
    wrapper.innerHTML = ''
    pads = []
    padCount = 0
    let gs = grid[gameplayDifficulty]

    if((gs % 4 == 0) && (gs >= 12)){
        cols = 4
    } else if((gs % 3) == 0){
        cols = 3
    } else{
        cols = 2
    }
    rows = gs / cols

    for(let r = 0; r < rows; r++){
        for(let c = 0; c < cols; c++){
            let cell = document.createElement('div')
            wrapper.appendChild(cell).className = "grid-item"

            let id = 'c' + c + 'r' + r
            cell.id = id
            pads.push(cell)

            // 400px wide so the whole photo stays sharp when scaled to fill the pad (see .grid-item)
            cell.style = 'background-image: url("' + sizedPhoto(fruitBundle[padCount++], 400) + '");'

            let lnk = fruitBundle[padCount - 1].links.html
            let nme = fruitBundle[padCount - 1].user.name

            // Pads only take game input; the photo credit below links to Unsplash
            cell.addEventListener('click', (event) => {
                if(state == 'input-phase' ){
                    padIn(event.currentTarget)
                }
            })

            cell.addEventListener('mouseover', () => {
                let w = document.getElementsByClassName('wrapped')[0]
                w.style.setProperty("visibility", "visible")
                attribute.innerText = nme
                attribute.href = lnk
            })
        }
    }

    wrapper.style.setProperty("--grid-cols", cols)
    wrapper.style.setProperty("--grid-rows", rows)
    
    return 'grid generated'
}

window.onload = function(){ // Deferred main
    sb.addEventListener('click', () => suttonButton())
}

async function suttonButton(){
    if(starting || state === 'gathering' || state === 'game-sequence' || state === 'input-phase' || state == 'game-over'){
        return
    }
    starting = true // the Start button is a <div>, which ignores `disabled`, so repeat clicks are blocked here
    pb.style.visibility = 'hidden'
    mb.style.visibility = 'hidden'
    score = 0
    setStreak(score)
    gameSeq = []
    sb.innerHTML = '<span>Sutton<br>Says<span class="hang">!</span></span>'

    if(state == 'landing'){
        setHighScore(0)
        document.getElementById('streak').style.visibility = "visible"
        let gg = await genGrid()
        console.log(gg)
    }
    setTimeout(()=>{
        starting = false
        gameSequence()
    }, 2000)
}

async function gameSequence(){
    state = 'game-sequence'
    let rand = Math.floor(Math.random() * grid[gameplayDifficulty])
    gameSeq.push(pads[rand])
    sb.innerHTML = '<span>Sutton<br>Says<span class="hang">!</span></span>'
    // console.log('gameSeq::',gameSeq)
    for(let g of gameSeq){
        let active = await suttonShow(g) //FIX
        // console.log(active) //expected output: "pad shown"
    }
    playerSeq = []
    sb.innerText = 'Your\nTurn'
    state = 'input-phase'
}

function suttonShow(p){
    return new Promise(resolve => {
        p.classList.add("bright") //pad immediately flashes white
        setTimeout(() => { //after 0.75sec the pad resets
            p.classList.remove("bright") //STRETCH - increase the luminosity of the pressed pad instead
            setTimeout(() => {resolve('pad shown')},500) //after 0.5sec promise is returned
        }, 750)
    })
}

async function padIn(p){
    if(state == 'input-phase'){
        if(playerSeq.length < gameSeq.length){
            playerSeq.push(p) //in HTML 4, ids must begin with a letter
            let l = playerSeq.length
            // let act = await suttonShow(p)
            await suttonShow(p)
            .then((act) => {
            // suttonShow(p, function(act){
                if(state !== 'input-phase'){ return } // a quicker wrong press already ended the game
                let pExpected = gameSeq[l-1]
                if(playerSeq[l-1].id === pExpected.id){
                    //console.log('Player pad match')
                    if(l == gameSeq.length){
                        //console.log('Player sequence match')
                        score = l
                        setStreak(score)
                        gameSequence()
                    }
                }else{
                    //console.log('Player pad mismatch')
                    gameOver(p, pExpected)
                }
            })
        }else{
            console.log('input quantity exceeded expectations')
        }
    }
}

function gameOver(p, pExpected){
    state = 'game-over'
    sb.innerText = 'Play\nAgain'
    p.innerText = `game over!` 
    if(score > hs){
        document.getElementById('highScore').style.visibility = "visible"
        setHighScore(score)
        //ICEBOX: put a high score bubble on streak
    }
    setTimeout(() => {
        p.innerText = ''
        pb.style.visibility = 'visible'
        mb.style.visibility = 'visible'

        shuffleFruit() // new fruit for the next game
        genGrid()
        state = 'play-again'
    }, 2500)
}

function setStreak(s){
    document.getElementById('streak').innerText = `Streak\n${s}`
}

function updateNumberOfPads(){
    pc.innerText = `Number\nof pads: ${grid[gameplayDifficulty]}`
}

function setHighScore(s){
    hs = s
    document.getElementById('highScore').innerText = `High Score\n${s}`
}
