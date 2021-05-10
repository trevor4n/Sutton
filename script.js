let streak = document.getElementById('streak')
let highScore = document.getElementById('highScore')
let pads = document.getElementsByClassName('pad')
let sb = document.getElementById('suttonButton')

let padCount = 0
let score = 0
let hs = 0
let state = 'landing'
let gameSeq = []
let playerSeq =  []

let inputPhase = false

//sb.innerText = 'Start\nSutton'

sb.addEventListener('click', () => suttonButton())

for(let i = 0; i < pads.length; i++){
    pads[i].addEventListener('click', () => padIn(event.currentTarget))
    padCount++
}

function suttonButton(){
    sb.disabled = true
    score = 0
    setStreak(score)
    //suttonSolid()
    gameSeq = []
    sb.innerText = 'Sutton\nSays!'

    if(state == 'landing'){
        setHighScore(0)
        //+ make streak & high score visible
        document.querySelectorAll('.info').forEach((inf) => {
            //console.log(`make visible... ${inf.id} classList: ${document.getElementById('highScore').classList}`)
            inf.style.visibility = "visible"
            //inf.classList.remove("invisible")
            //inf.style.display = "unset"
            //console.log(`made visible???? ${inf.id} classList: ${document.getElementById('highScore').classList}`)
        })
        state = 'game-sequence'
    }
    gameSequence()
}

async function gameSequence(){
    inputPhase = false
    gameSeq.push(Math.floor(Math.random() * padCount))
    console.log(`Game Sequence: ${gameSeq}`)
    for(let g of gameSeq){
        let active = await suttonShow(document.getElementById('p'+g))
        console.log(active)
    }
    playerSeq = []
    inputPhase = true //STRETCH - phase out  this connditional entirely (possibly by disabling the pad buttons)
}

function padIn(p){
    if(inputPhase){
        playerSeq.push(p.id.substring(1)) //in HTML 4, ids must begin with a letter
        suttonShow(p)
        let l = playerSeq.length
        if(playerSeq[l-1] == gameSeq[l-1]){ //if the user enters a correct sequence element
            console.log('Player pad match')
            score = l
            if(l == gameSeq.length){
                //inputPhase = false //If the user is finished entering the sequence don't let them overflow
                //+ if a user quickly enters the sequence, ^ will block their next padIn call of the streak... moved line just before game sequence is shown
                console.log('Player sequence match')
                setStreak(score)
                gameSequence()
            }
        }else{ //user entered incorrect pad pattern
            console.log('Player pad mismatch')
            inputPhase = false
            gameOver(p)
        }
    }
}

function gameOver(p){ //TODO - verify if a win condition after a magic number of rounds is required OR if posting a new high score counts OR if playing until the user loses is acceptable
    sb.innerText = 'Play\nAgain'
    p.innerText = `Sutton said ${document.getElementById('p'+gameSeq[playerSeq.length-1]).style.backgroundColor}...\ngame over` //TODO - fix game over condition that displays text on multiple pads
    if(score > hs){
        document.getElementById('highScore').style.display = "unset"
        setHighScore(score)
        //STRETCH - put a high score bubble on streak
    }
    setTimeout(() => {
        p.innerText = ''
        sb.disabled = false
    }, 5000)
}

function suttonShow(p){
    return new Promise(resolve => {
        //console.log(p)
        p.classList.add("bright") //pad immediately flashes white
        setTimeout(() => { //after 0.75sec the pad resets
            p.classList.remove("bright") //TODO - increase the luminosity of the pressed pad instead of changing the background color
            setTimeout(() => {resolve('pad shown')},250) //after 0.25sec promise is returned, leaving enough time to differentiate between pads sequentially lighting up
        }, 750)
    })
}

function setStreak(s){
    streak.innerText = `Streak\n${s}`
}

function setHighScore(s){
    hs = s
    highScore.innerText = `High Score\n${s}`
}