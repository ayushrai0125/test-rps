import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import fs from "fs";
import session from "express-session";
import bodyParser from "body-parser";

const app = express();
const server = createServer(app);
const io = new Server(server);
const port = process.env.PORT || 2000;
const roomID = "0125";

app.use(express.static("./"));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: "YAYONNOPE02384*&3)",
    resave: false,
    saveUninitialized: true,
}));
let players = {};
let playerCount = 0; 
let isPlayerAuthenticated = false;

app.get("/", (req, res) => {
    fs.readFile("login.html", (err, data) => {
        if (err) { 
            res.status(500);
            res.send("<h2> Error</h2>");
        } else {
            res.send(data.toString());
        }
    });
});

const requireAuth = (req, res, next) => {
    if (isPlayerAuthenticated) {
        next();
    } else {
        res.send(`
            <h2>No Authentication Found</h2>
            <h2>Redirecting...</h2>
            <meta http-equiv="refresh" content="3;url=/" />
        `);
    }
};


app.get("/main", requireAuth, (req, res) => {
    fs.readFile("main.html", (err, data) => {
        if (err) res.status(500).send("Error loading page");
        else res.send(data.toString());
    });
});

const assignPlayerRole = (username) => {
    if (players["p1"] === username) return "p1";
    if (players["p2"] === username) return "p2";

    if (!players["p1"]) {
        players["p1"] = username;
        return "p1";
    } else if (!players["p2"]) {
        players["p2"] = username;
        return "p2";
    } else {
        return null;
    }
};

function Player(){
    this.name = "",
    this.score = 0,
    this.choice = null,
    this.role = "",
    this.result = false
    this.ready = false
}

let p1 = new Player();
let p2 = new Player();
let roundNo = 1;
let room = "nope";




function playGame() {
    if(roundNo < 4){
        io.to(room).emit("roundStart", roundNo);
        calcResult()
        roundNo++;
        if (roundNo == 4){
            setTimeout(() => {
                resetRoom();
                console.log("YAY")
            }, 7000);
            io.to(room).emit("matchOver");    
        }
    }
}

function resetRoom() {
    roundNo = 1;
    p1.score = 0;
    p2.score = 0;
    resetChoice();
    io.to(room).emit("reset");
    console.log("server Resetted")
}

function playerWin(player){
    player.score++;
    player.result = true;
}

function calcResult() {
    if (p1.choice == 0 && p2.choice == 2){
        playerWin(p1);
    } else if(p1.choice == 0 && p2.choice == 1){
        playerWin(p2);
    } else if(p1.choice == 2 && p2.choice == 0){
        playerWin(p2);
    } else if(p1.choice == 1 && p2.choice == 0){
        playerWin(p1);
    } else if (p1.choice == 1 && p2.choice == 2){
        playerWin(p2);
    } else if(p1.choice == 2 && p2.choice == 1){
        playerWin(p1)
    } else {
        console.log("nope");
    }
}
    function resetChoice(){
    p1.ready = false;
    p1.choice = null;
    p1.result = false;
    p2.ready = false;
    p2.choice = null;
    p2.result = false;
    let sData = JSON.stringify({
        p1R : p1.ready,
        p2R : p2.ready
    });
    io.to(room).emit("readyStat", sData);
}



io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on("register", (data) => {
            if (playerCount < 2){
                let udata = JSON.parse(data);
                if (udata.roomID == roomID){
                    const assignedRole = assignPlayerRole(udata.uname);
                    if (assignedRole != null){
                        socket.emit("roleAssigned", { role: assignedRole, roomID });
                        if (players["p1"] === udata.uname ) {
                            playerCount++;
                            p1.name = udata.uname;
                            p1.role = assignedRole;
                        } else if( players["p2"] === udata.uname){
                            playerCount++;
                            p2.name = udata.uname;
                            p2.role = assignedRole;
                        } else {
                            socket.emit("chatMessage",{
                                role: "Server",
                                msg: "NULL Taking up the SPACE",
                            });
                        }
                    } else {
                        console.log("NOPE NULL")
                    } 
                }
            } else{
                socket.emit("chatMessage",{
                    role: "Server",
                    msg: "Room is FULL!!!!",
                });
            }
    });
    socket.on("joinRoom",(data) =>{
        let udata = JSON.parse(data);
            if(players["p1"] === udata.uname || players["p2"] === udata.uname){
                console.log("Preparing to redirect")
                isPlayerAuthenticated = true;
                socket.emit("redirectToMain");
            } else {
                socket.emit("chatMessage",{
                    role: "Server",
                    msg: "Error Occured Please Refresh the Browser",
                });
            }
    });

    socket.on("redirectionConfirmed",(role) =>{
        isPlayerAuthenticated = false;
        socket.join(room);
        console.log(`${role} joined room: "0125"`);
        socket.username = players[role];
        io.emit("chatMessage", {
            msg: `${role} has joined the room!`,
            role: role
        });
        console.log(players)
    })
    socket.on("chatMessage", (data) => {
        console.log(`[${data.role}] : ${data.msg}`);
        io.emit("chatMessage", data);
    });

    socket.on("initRoom", () => {
        let sData = JSON.stringify({
            p1Name : p1.name,
            p2Name : p2.name,
        });
        io.emit("startRoom",sData);
    });

    socket.on("sendC", (data) => {
        let rData = JSON.parse(data);
        if(rData.role === "p1"){
            p1.choice = rData.choice;
        } else if (rData.role === "p2"){
            p2.choice = rData.choice;
        }
    });

    socket.on("ready", (data) => {
        let pData = JSON.parse(data);
        if (pData.role == "p1"){
            p1.ready = true;
        } else if(pData.role == "p2"){
            p2.ready = true; 
        }
        let sData = JSON.stringify({
            p1R : p1.ready,
            p2R : p2.ready
        });
        io.to(room).emit("readyStat", sData);

        if (p1.ready && p2.ready){
            playGame();
            let udata = JSON.stringify({
                p1S : p1.score,
                p2S : p2.score,
                p1C : p1.choice, 
                p2C : p2.choice,
                p1res: p1.result,
                p2res: p2.result,
                rNo : roundNo
            });
            io.to(room).emit("result",udata);
            setTimeout(() =>{
                    resetChoice();
            }, 100);
        }

    });

    socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.id}`);
        for (let role in players) {
            if (players[role] === socket.username) {
                players[role] = null;
                console.log(`${role} released`);
                playerCount--;
            }
        }
    });
});

server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});