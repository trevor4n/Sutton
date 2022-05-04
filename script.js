let streak = document.getElementById('streak')
let highScore = document.getElementById('highScore')
let sb = document.getElementById('suttonButton')
let wrapper = document.querySelector('.wrapper')
let pb = document.getElementById('plus')
let mb = document.getElementById('minus')
let pc = document.getElementById('padCounter')
let fr = document.getElementById('freeze')

let padCount = 0
let score = 0
let hs = 0
let state = 'gathering'
let pads = []
let gameSeq = []
let playerSeq =  []
let cols = 2
let rows = 2
let grid = [4, 6, 8, 9, 12, 16] // Gameplay difficulty 0-5
let gridSize = 0
let fruitBundle = []

pc.style.visibility = 'hidden'
pc.innerText = `Number\nof pads: ${grid[gridSize]}`

pb.addEventListener('click', () => {
    if(gridSize < grid.length - 1){
        gridSize++
        console.log(genGrid())
    }
    updateNumberOfPads()
})

mb.addEventListener('click', () => {
    if(gridSize > 0){
        gridSize--
        console.log(genGrid())
    }
    updateNumberOfPads()
})

function grabSomeFruit(){
    console.log('🥝 grabbing some fruit! 🍍')
    fetch('/.netlify/functions/token-hider?collectionId=' + 9660118)
    .then((data) => data.json()) // Reading the Response stream to completion 
    // .then(({ alt_description }) => console.log('serverless-api response' + alt_description) || setHighScore(alt_description) )
    .then((data) => fruitBundle = data)
    .catch(err => { console.log('something went wrong', err) })
    .finally(() => {
        console.log('retrieved ' + fruitBundle.length + ' records from the dataset!')
        // console.log(fruitBundle)
        state = 'landing'
        console.log(genGrid())        
        pb.style.visibility = 'visible'
        mb.style.visibility = 'visible'
        pc.style.visibility = 'visible'
    })
}
grabSomeFruit()

function genGrid(){
    console.log('generating grid ⏳⏳⌛')

    wrapper.innerHTML = ''
    pads = []
    padCount = 0

    let gs = grid[gridSize]

    if((gs % 4 == 0) && (gs >= 12)){
        cols = 4
    } else if((gs % 3) == 0){
        cols = 3
    } else{
        cols = 2
    }
    rows = gs / cols

    for(r = 0; r < rows; r++){
        for(c = 0; c < cols; c++){
            let cell = document.createElement('div')
            wrapper.appendChild(cell).className = "grid-item"

            let id = 'c' + c + 'r' + r
            cell.id = id
            cell.style.setProperty('grid-row', r)
            cell.style.setProperty('grid-column', c)

            pads.push(document.querySelector('#' + id))

            let src = fruitBundle[padCount++].urls.thumb + '&auto=format&q=80' 
            cell.style = "background-image: url(" + src + ');'

            cell.addEventListener('click', () => padIn(event.currentTarget))
        }
    }

    wrapper.style.setProperty("--grid-cols", cols)
    wrapper.style.setProperty("--grid-rows", rows)
    
    return new Promise(resolve => {
        resolve('grid generated')
    })
}

window.onload = function(){ // Deferred main
    sb.addEventListener('click', () => suttonButton())
}

async function suttonButton(){
    if(state == 'gathering' || state == 'game-sequence' || state == 'input-phase' || state == 'game-over'){
        return
    }
    sb.disabled = true
    pb.style.visibility = 'hidden'
    mb.style.visibility = 'hidden'
    score = 0
    setStreak(score)
    gameSeq = []
    sb.innerText = 'Sutton\nSays!'

    if(state == 'landing'){
        setHighScore(0)
        streak.style.visibility = "visible"
        let gg = await genGrid()
        console.log(gg)
    }
    setTimeout(()=>{
        gameSequence()
    }, 2000)
}

async function gameSequence(){
    state = 'game-sequence'
    let rand = Math.floor(Math.random() * grid[gridSize])
    gameSeq.push(pads[rand])
    sb.innerText = 'Sutton\nSays!'
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
        highScore.style.visibility = "visible"
        setHighScore(score)
        //ICEBOX: put a high score bubble on streak
    }
    setTimeout(() => {
        p.innerText = ''
        pb.style.visibility = 'visible'
        mb.style.visibility = 'visible'
        state = 'play-again'
    }, 2500)
}

function setStreak(s){
    streak.innerText = `Streak\n${s}`
}

function updateNumberOfPads(){
    pc.innerText = `Number\nof pads: ${grid[gridSize]}`
}

function setHighScore(s){
    hs = s
    highScore.innerText = `High Score\n${s}`
}
