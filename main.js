const socket = io();
const buttons = document.querySelectorAll('.nope');
const resultDisp = document.querySelector('#result');
const playerChoice = document.querySelector('#playerChoice');
const otherChoice = document.querySelector('#otherChoice');
const ready = document.querySelector('#ready');
const readyStat = document.querySelector('#readyStatus');
const mainResult = document.querySelector("#mainRes");
let poss = ['Rock', 'Paper' , 'Scissors']
function Player(){
    this.name = "",
    this.score = 0,
    this.choice = null,
    this.result = false
}
let p1 = new Player();
let p2 = new Player();
const uname = localStorage.getItem("name");
const playerRole = localStorage.getItem("role");

if(playerRole == "p1"){
    p1.name = uname;
} else if(playerRole == "p2"){
    p2.name = uname;
}

window.onload = () => {
    socket.emit("redirectionConfirmed",playerRole);
    socket.emit("initRoom");
};

if (playerRole != null){
    socket.emit("chatMessage",{
        role: playerRole,
        msg: `${playerRole} Joined the Room`
    });
} else {
    window.location.href = "/";
}

function getChoice(choice,player) {
    player.choice = poss.indexOf(choice)
    dispChoice();
}

buttons.forEach(button => {
    button.addEventListener('click',function(){
        if (playerRole == "p1"){
            getChoice(button.id,p1);
            socket.emit("sendC", JSON.stringify({
                role: playerRole,
                choice : p1.choice
            }));
        } else if(playerRole == "p2"){
            getChoice(button.id,p2);
            socket.emit("sendC", JSON.stringify({
                role: playerRole,
                choice : p2.choice
            }));
        }
    });
});


function dispWin(player,round){
    resultDisp.innerText = `${player} Wins Round${round}`;
}

function dispScore() {
    document.querySelector("#p1Score").innerText = `${p1.name} : ${p1.score}`;
    document.querySelector("#p2Score").innerText = `${p2.name} : ${p2.score}`;
}


function dispChoice() {
    if (playerRole == "p1"){
        playerChoice.innerText = poss[p1.choice];
        if (p2.choice != null){
            otherChoice.innerText = poss[p2.choice];
        } else {
            otherChoice.innerText = "Choosing";
        }
    } else if(playerRole == "p2"){
        playerChoice.innerText = poss[p2.choice];
        if (p1.choice != null){
            otherChoice.innerText = poss[p1.choice];
        } else {
            otherChoice.innerText = "Choosing";
        }  
    }
}

socket.on("result", (data) => {
    let pData = JSON.parse(data);
    console.log(pData)
    let round = pData.rNo;
    if (round < 4){
        p1.choice = pData.p1C;
        p1.score = pData.p1S;
        p2.choice = pData.p2C;
        p2.score = pData.p2S;
        dispChoice();
        if (pData.p1res === true){
            dispWin(p1.name,round-1);
        } else if (pData.p2res === true){
            dispWin(p2.name,round-1);
        } else {
            resultDisp.innerText = "DRAW!!!!";
        }
        dispScore();
    } else {
        p1.choice = pData.p1C;
        p1.score = pData.p1S;
        p2.choice = pData.p2C;
        p2.score = pData.p2S;
        dispChoice();
        if (pData.p1res === true){
            dispWin(p1.name,round-1);
        } else if (pData.p2res === true){
            dispWin(p2.name,round-1);
        } else {
            resultDisp.innerText = "DRAW!!!!";
        }
        dispScore();
        if (playerRole == "p1"){
            if (p1.score > p2.score){
                mainResult.innerText = `You Win :)`;
            } else if (p2.score > p1.score) {
                mainResult.innerText = "You Lose :("
            } else {
                mainResult.innerText = "DRAW!!!!!!!!!!!!!!!!!"
            }
        } else if(playerRole == "p2"){
            if (p1.score > p2.score){
                mainResult.innerText = `You Lose :(`;
            } else if (p2.score > p1.score) {
                mainResult.innerText = "You Win :)"
            } else {
                mainResult.innerText = "DRAW!!!!!!!!!!!!!!!!!"
            }
        }
        console.log("MATCH OVER!!!!!!!");
    }
})

socket.on("chatMessage", (data) => {
    console.log(`[${data.role}] : ${data.msg}`);
});

socket.on("reset",() => {
    alert("Server Reseting");
    window.location.href = "/";
});

ready.addEventListener('click', readyS);

function readyS() {
    if(playerRole == "p1" ){
        if (p1.choice != null){
            socket.emit("ready", JSON.stringify({
                role : playerRole,
            }));
        } else {
            console.log("Choose Your Hand First");
        }
    } else if (playerRole == "p2"){
        if (p2.choice != null){
            socket.emit("ready", JSON.stringify({
                role : playerRole,
            }));
        } else {
            console.log("Choose Your Hand First");
        }
    }
}

socket.on("readyStat", (data) => {
    let rData = JSON.parse(data);
    if (playerRole == "p1"){
        readyStat.innerText = `You : ${rData.p1R} | Other Player : ${rData.p2R}`;
    } else if(playerRole == "p2"){
        readyStat.innerText = `You ${rData.p2R} | Other Player : ${rData.p1R}`;
    }
})

socket.on("playerNotReady", () => {
    if (p1.choice == null){
        console.log("Please choose your hand already!!!");
    } else if(p2.choice == null){
        console.log("The Other Player has not chosen yet.");
    }
});

socket.on("roundStart", (rNo) => {
    document.querySelector("h1").innerText = `Round : ${rNo}`
});

socket.on("startRoom",(data) => {
    let pData = JSON.parse(data);
    p1.name = pData.p1Name;
    p2.name = pData.p2Name;
    dispScore();
});