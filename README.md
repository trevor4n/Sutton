# ![](https://ga-dash.s3.amazonaws.com/production/assets/logo-9f88ae6c9c3871690e33280fcf557f33.png) 

# Sutton - 🥝 A Fruity Memory Game! 🍍
## FLEX 323, May 15, 2021
![image](https://user-images.githubusercontent.com/44274876/118234244-b31bd700-b458-11eb-9727-4d4bd56e2c71.png)


## &#x1F534; Introduction
Sutton is the name of [the game!](https://main--trevor4n-sutton.netlify.app/) Users must think fast as they play a game of memory. Each round, a random **fruity** sequence is displayed to the player. Players must repeat the pattern using a fantastic input pad. Players can try their best to memorize longer and more challenging streaks!

## &#x1F534; Technologies used
 - HTML
 - CSS (Grid & Flex)
 - JavaScript
 - Fetch API
 - Axios isomorphic client
 - **[Unsplash API](https://unsplash.com/?utm_source=sutton&utm_medium=referral)**
 - **[Netlify (Hosted)](https://main--trevor4n-sutton.netlify.app/)**

## &#x1F534; Installation Instructions
  1. Clone this repo
  2. Navigate to the locally established directory
  3. Open index.html

## &#x1F534; MVP User Stories
 - [x] As a player, I want to be able to start a new game, so that I can play multiple times in a row.
 - [x] As a player, I want the game to light up a sequence of input pads, so that I have a pattern to reproduce.
 - [x] As a player, I want the game to animate the pads, so that I know my moves are registered.
 - [x] As a player, I want the game to track my score, so that I know how good my memory is and how long the pattern has become.
 - [x] As a player, I want the game to alert me when I make a mistake, so that I know the game is over.

## &#x1F534; Wireframes
Simple Gameplay
![image](https://user-images.githubusercontent.com/44274876/118238336-017fa480-b45e-11eb-91ae-991c63638c54.png)
Challenging Gameplay
![image](https://user-images.githubusercontent.com/44274876/118234244-b31bd700-b458-11eb-9727-4d4bd56e2c71.png)
Game Over Condition
![image](https://user-images.githubusercontent.com/44274876/118238085-ac439300-b45d-11eb-9432-9ef4fa64d4c6.png)
Mobile Friendly View

![image](https://user-images.githubusercontent.com/44274876/118238268-e9a82080-b45d-11eb-9011-2a5ce8b499ec.png)

## &#x1F534; Major Hurdles
The biggest hurdle I overcame this project was ensuring there would be no animation clipping (due to asynchronous code). I was able to ensure that when the game sequence is displayed, animations don't overlap.  I also made sure that the user can play quickly and that the animations don't prevent input during their turn from being rejected. I implemented multiple tactics to satisfy animation timing requirements. That includes Promise statements, setTimeout functions, and async await calls.

*This project also served as a formal introduction to css... my first front-end UI!*

### &#x1F535; Stretch Goals (Not Mandatory):
- [x] Mobile friendly layout
- [x] Adjustable difficulty (user can increase the quantity of unique memory pads)
- [ ] Integrate 3rd party API
- [ ] Colorblind mode

### Timeframes
| Task | Priority | Estimated Time | Time Invested | Actual Time |
| --- | :---: |  :---: | :---: | :---: |
| Setting up site framework | H | 1.5 hrs| X hrs | 2 hrs |
| Creating game logic | H |  4.25 hrs| X hrs | 5 hrs |
| Styling game (css) | M | 4.25 hrs| X hrs |  6 hrs  |
| Building out game animations (responsive styling) | M | 4 hrs|  X hrs | 8 hrs |
| Accessibility Styling| L | 1 hrs| 0 hrs|  X hrs |
| Adjustable game difficulty  | L | 4 hrs| X hrs |  4 hrs  |
| Total | n/a | 25  hrs | X hrs  |  24 hrs|

### Project Schedule
|  Day | Deliverable | Status
|---|---| ---|
|5/3| Project proposal / wireframe pitch | complete
|5/4| Site framework / start game logic | complete
|5/5 | Finish game logic & css | complete
|5/8| Responsive styling | complete
|5/11| Accessibility / start adjustable difficulty | incomplete / complete
|5/12| Finish adjustable difficulty & playtime based scoring | complete / incomplete
|5/13| Persistent scoring w/ usernames | incomplete
|5/14| Finalize MVP  | complete
|5/14| Clean up stretch features | complete
|5/14| Submit project as an issue to the cohort gallery | complete
|5/14| Prepare for [demo](https://main--trevor4n-sutton.netlify.app/) | complete
|5/15| Presentation | complete

### [Link to project proposal](https://git.generalassemb.ly/flex-323/project-1/issues/15)
