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
    //pads[i].addEventListener('click', () => padIn(pads[i]))
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
        //TODO - make streak & high score visible
        document.querySelectorAll('.info').forEach((inf) => {
            console.log(`make visible... ${inf.id} classList: ${document.getElementById('highScore').classList}`)
            inf.style.visibility = "visible"
            //inf.classList.remove("invisible")
            console.log(`made visible???? ${inf.id} classList: ${document.getElementById('highScore').classList}`)
        })
        state = 'game-sequence'
    }
    gameSequence()
}

async function gameSequence(){
    gameSeq.push(Math.floor(Math.random() * padCount))
    console.log(`Game Sequence: ${gameSeq}`)
    //STRETCH - consider generating a random array of values before gameplay starts to avoid a delay between a successful pad push and the next prompt running
    //gameSeq.from({length: 99}, () => Math.floor(Math.random() * 4))

    for(let g of gameSeq){
        console.log('next game sequence pad to show: ' + 'p'+g)
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
            score++
            setStreak(score)
            if(l == gameSeq.length){//If the user is finished entering their sequence don't let them enter any extra
                inputPhase = false
                console.log('Player sequence match')
                gameSequence()
            }
        }else{ //user entered incorrect pad pattern
            console.log('Player pad mismatch')
            inputPhase = false
            gameOver(p)
        }
    }
}

function gameOver(p){
    sb.innerText = 'Play\nAgain'
    p.innerText = `Sutton said ${document.getElementById('p'+gameSeq[playerSeq.length-1]).style.backgroundColor}...\ngame over`
    if(score > hs){
        setHighScore(score)
        //STRETCH - put a new bubble on the high score and clear it when the next game starts
    }
    setTimeout(() => {
        p.innerText = ''
        sb.disabled = false
    }, 5000)
}

function suttonShow(p){
    ///console.log(`starting suttonShow for button ${g}`)
    return new Promise(resolve => {
        p.classList.add("bright") //pad immediately flashes white
        setTimeout(() => { //after 0.75sec the pad resets
            p.classList.remove("bright") //TODO - increase the luminosity of the pressed pad
            setTimeout(() => {resolve('shown')},250) //after 0.25sec promise is returned, leaving enough time to differentiate between pads sequentially lighting up
            //console.log('shown  promise is complete')
        }, 750)
    })
}

function setStreak(s){
    streak.innerText = `Streak\n${s}`
}

function setHighScore(s){
    highScore.innerText = `High Score\n${s}`
}