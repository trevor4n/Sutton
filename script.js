//console.log('attached')
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
    pads[i].addEventListener('click', () => padIn(pads[i]))
    padCount++
}

function suttonButton(){
    sb.disabled = true
    score = 0
    updateStreak(score)
    suttonSolid()
    gameSeq = []
    sb.innerText = 'Sutton\nSays!'

    if(state == 'landing'){
        updateHighScore(0)
        //TODO - make streak & high score visible
        //let info = document.querySelectorAll('.info')
        //info.forEach((inf) => {console.log(`here ${inf}`); inf.style.visibility = 'visible'})
        ///let info = document.getElementById('highScore').style.visibility = "visible"
        console.log(`here: ${document.getElementById('highScore').classList}`)
        document.getElementById('highScore').classList.remove('invisible')
        console.log(`here: ${document.getElementById('highScore').classList}`)
        state = 'game-sequence'
    }
    gameSequence()
}

function gameSequence(){
    gameSeq.push(Math.floor(Math.random() * padCount))
    console.log(`Game Sequence: ${gameSeq}`)
    //STRETCH - consider generating a random array of values before gameplay starts to avoid a delay between a successful pad push and the next prompt running
    //gameSeq.from({length: 99}, () => Math.floor(Math.random() * 4))

    for(let g of gameSeq){
        setTimeout(suttonShow(g), 500)
        setTimeout(suttonSolid, 1000)
    }
    playerSequence()
}

function playerSequence(){
    playerSeq = []
    inputPhase = true //STRETCH - phase out  this connditional entirely (possibly by disabling the pad buttons)
    let validatedSeq = 0
    while(validatedSeq < gameSeq.length){
        //TODO - grab padIn code
    }
    inputPhase = false //TODO - possibly move this into a condidional w/n the while loop
    console.log('Player Sequence match')
    gameSequence()
}

function padIn(p){
    if(inputPhase){
        playerSeq.push(p.id.substring(1)) //in HTML 4, ids must begin with a letter
        suttonShow(p.id.substring(1))
        //let padIndex = playerSeq.length-1
        if(playerSeq.length == gameSeq.length)//If the user is finished entering their sequence don't let them enter any extra
            inputPhase = false
        if(playerSeq[playerSeq.length-1] != gameSeq[playerSeq.length-1]){ //if the user enters an incorrect sequence element
            gameOver(p)
            return //dont stop showing the incorrect pad right away
        }
        setTimeout(suttonSolid, 500) //TODO - the pad should stay highlighted for 500ms OR until another button is pressed, whatever comes first
    }
}

function gameOver(p){
    sb.innerText = 'Play\nAgain'
    p.innerText = `Sutton said ${document.getElementById(gameSeq[playerSeq.length-1])}...\ngame over` //TODO - access the color of the element
    if(score > hs){
        updateHighScore(score)
        //STRETCH - put a new bubble on the high score and clear it when the next game starts
    }
    setTimeout(() => {sb.disabled = false})
}

function suttonShow(g){
    //TODO - fade 3 pads & brighten the next in the pattern
    //pads[g]
    return
}

function suttonSolid(){
    //TODO - return all pads to default transparency & reset their text(to remove game over description)
    return
}

function updateStreak(s){
    streak.innerText = `Streak\n${s}`
}

function updateHighScore(s){
    highScore.innerText = `High Score\n${s}`
}