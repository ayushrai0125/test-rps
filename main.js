// const rock = document.querySelector('#r')
// const paper = document.querySelector('#p')
// const scissors = document.querySelector('#s')
// const buttons = document.querySelectorAll('.nope')
// const resultDisp = document.querySelector('#result')
// 
// 
// function Player(name,disp,scoreDisp){
//     this.name = name;
//     this.score = 0;
//     this.choice = 0;
//     this.disp = document.querySelector(disp);
//     this.scoreDisp = document.querySelector(scoreDisp);
//     this.winStatement =  name + " Wins";
// }

// let p1 = new Player("NOPE",'#player','#player1Score')
// let p2 = new Player("YAY",'#other','#player2Score')

// p1.choice = 0
// p2.choice = 0

// let poss = ['r', 'p' , 's']


// function getChoice(choice) {
//     p1.choice = poss.indexOf(choice)
// }

// buttons.forEach(button => {
//     button.addEventListener('click',function(){
//         getChoice(button.id);
//         // start();
//     });
// });

// const resultPoss = [
//     ['Draw','Win', 'Lose'],
//     ['Lose', 'Draw', 'Win'],
//     ['Win','Lose','Draw']
// ]

// function dispWin(player){
//     resultDisp.innerHTML = player.winStatement;
// }


// function calcResult() {
//     if (p1.choice == 0 && p2.choice == 2){
//         p1.score++;
//         dispWin(p1);
//     } else if (p2.choice == 0 && p1.choice == 2){
//         p2.score++;
//         dispWin(p2);
//     } else if(p1.choice == 1 && p2.choice == 0){
//         p1.score++;
//         dispWin(p1);  
//     } else if(p2.choice == 1 && p1.choice == 0){
//         p2.score++;
//         dispWin(p2);  
//     } else if (p1.choice == 2 && p2.choice == 1){
//         p1.score++;
//         dispWin(p1);
//     } else if (p2.choice == 1 && p1.choice == 2){
//         p2.score++;
//         dispWin(p2);
//     } else if (p1.choice == p2.choice){
//         resultDisp.innerHTML = "Draw";
//     }
// }

// function dispScore(p) {
//     p.scoreDisp.innerHTML = p.name + "'s Score:" + p.score
// }



// function dispChoice(n,place) {
//     switch (n) {
//         case 0:
//             place.innerHTML = "Rock";
//             break;
//         case 1:
//             place.innerHTML = "Paper";
//             break;
//         case 2:
//             place.innerHTML = "Scissors";
//             break;
//         default:
//             break;
//     }
// }

// function start() {
//     dispChoice(p1.choice,p1.disp)
//     dispChoice(p2.choice,p2.disp)
//     calcResult();
//     dispScore(p1)
//     dispScore(p2)
// }
// const sPort = 2000
const socket = io();
// let player = {
//     role: null,
//     roomid: null,
//     user: null
// }

let userData = JSON.parse(localStorage.getItem("userData"));


socket.on("chatMessage", (data) => {
    console.log(`[${data.role}] ${data.user}: ${data.message}`);

});

socket.on("roleAssigned", (data) =>{
    console.log(`Your Role : ${data.role} in room ${data.roomID}`)

});

button.addEventListener('click',sendMessage);

function sendMessage() {
    io.to(player.roomid).emit("chatMessage" , {
        role: player.role,
        msg: "YAY"
    });
}
