let streak = document.getElementById('streak')
let highScore = document.getElementById('highScore')
let sb = document.getElementById('suttonButton')
let wrapper = document.querySelector('.wrapper')
let pb = document.getElementById('plus')
let mb = document.getElementById('minus')
let pc = document.getElementById('padCounter')

let padCount = 0
let score = 0
let hs = 0
let state = 'landing'
let pads = []
let gameSeq = []
let playerSeq =  []
let cols = 2
let rows = 2
let gridSize = 4
let  gridStyleCap = 16

pc.innerText = `Number\nof pads: ${gridSize}`
pc.style.visibility = 'visible'

function valGrid(b){
    let flag = false
    if(gridSize == 10 || gridSize == 14)
        gridSize += 2
    if((gridSize % 4 == 0) && (gridSize > 4)){
        cols = 4
        rows = gridSize / cols
        flag = true
    }else if(gridSize % 3 == 0){
        cols = 3
        rows = gridSize / cols
        flag = true
    }else if(gridSize % 2 == 0){
        cols = 2
        rows = gridSize / 2
        flag = true
    }
    else if(gridSize + 1 <= gridStyleCap && b){
        gridSize++
        flag = valGrid()
    }
    else if(!b){
        gridSize--
        flag = valGrid()
    }
    return flag
}

pb.addEventListener('click', () => {
    let gs = gridSize
    if(gridSize < gridStyleCap){
        gridSize++
        let val = valGrid(true)
        //console.log(gridSize, cols, rows)
        if(!val)
            gridSize = gs
    }
    pc.innerText = `Number\nof pads: ${gridSize}`
})

mb.addEventListener('click', () => {
    let gs = gridSize
    if(gridSize >= 6){
        if(gridSize == 16 || gridSize == 12)
            gridSize -= 2
        gridSize--
        let val = valGrid(false)
        if(!val)
            gridSize = gs            
    }
    pc.innerText = `Number\nof pads: ${gridSize}`
})

window.onload = function(){ // Deferred main
    sb.addEventListener('click', () => suttonButton())
}


async function suttonButton(){
    if(state == 'game-sequence' || state == 'input-phase' || state == 'game-over') 
        return
    sb.disabled = true
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

function genGrid(){
    console.log('generating grid ⏳⏳⌛')
    let fruitBundle = []

    fetch('/.netlify/functions/token-hider?collectionId=' + 9660118)
    .then((data) => data.json()) // Reading the Response stream to completion 
    // .then(({ alt_description }) => console.log('serverless-api response' + alt_description) || setHighScore(alt_description) )
    .then((data) => fruitBundle = data)
    .catch(err => { console.log('something went wrong', err) })
    .finally(() => {
        console.log('retrieved ' + fruitBundle.length + ' records from the dataset!')
        console.log(fruitBundle)

        for(c = 0; c < cols; c++){
            for(r = 0; r < rows; r++){
                let cell = document.createElement('div')
                wrapper.appendChild(cell).className = "grid-item"
    
                let id = 'c' + c + 'r' + r
                cell.id = id
                cell.style.setProperty('grid-row', r)
                cell.style.setProperty('grid-column', c)
    
                pads.push(document.querySelector('#' + id))
    
                //console.log(fruitBundle[0][i++]["urls"])
                let src = fruitBundle[padCount++].urls.thumb + '&auto=format&q=80' 
                cell.style = "background-image: url(" + src + ');'
    
                cell.addEventListener('click', () => padIn(event.currentTarget))
            }
        }
        wrapper.style.setProperty("--grid-cols", cols)
        wrapper.style.setProperty("--grid-rows", rows)
    
        pb.style.visibility = 'hidden'
        mb.style.visibility = 'hidden'
        
        return new Promise(resolve => {
            resolve('grid generated')
        })
    })
}

async function gameSequence(){
    state = 'game-sequence'
    let rand = Math.floor(Math.random() * padCount)
    gameSeq.push(pads[rand])
    sb.innerText = 'Sutton\nSays!'
    console.log('gameSeq::',gameSeq)
    for(let g of gameSeq){
        let active = await suttonShow(g) //FIX
        console.log(active) //expected output: "pad shown"
    }
    playerSeq = []
    sb.innerText = 'Your\nTurn'
    state = 'input-phase'
}

function suttonShow(p){
    // console.log('p::',p)
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
        let l = playerSeq.length
        // if(l < gameSeq.length){
            playerSeq.push(p) //in HTML 4, ids must begin with a letter
            let act = await suttonShow(p)
            .then(() => {
                console.log(act)
                let pExpected = gameSeq[l-1]
                if(playerSeq[l-1].id == gameSeq[l-1].id){
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
        // }else{
            // console.log('input quantity exceeded expectations')
        // }
    }
}

function gameOver(p, pExpected){
    state = 'game-over'
    sb.innerText = 'Play\nAgain'
    p.innerText = `game over!` 
    if(score > hs){
        highScore.style.visibility = "visible"
        setHighScore(score)
        //STRETCH - put a high score bubble on streak
    }
    setTimeout(() => {
        p.innerText = ''
        state = 'play-again'
    }, 2500)
}

function setStreak(s){
    streak.innerText = `Streak\n${s}`
}

function setHighScore(s){
    hs = s
    highScore.innerText = `High Score\n${s}`
}