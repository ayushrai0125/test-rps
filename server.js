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

// 🔒 Set up session middleware
app.use(session({
    secret: "YAYONNOPE02384*&3)",
    resave: false,
    saveUninitialized: true
}));

let players = {};  // Store connected players
let playerCount = 0;  // Track number of players

// 🎮 Assign Player 1 or Player 2


// ✅ Render login page
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
    if (req.session.isAuthenticated) {
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

const assignPlayerRole = (session) => {
    if (!players["player1"]) {
        players["player1"] = session.id;
        return "player1";
    } else if (!players["player2"]) {
        players["player2"] = session.id;
        return "player2";
    }
    return null;  // No available slots
};


io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id} playerCount: ${playerCount}`);

    socket.on("register", (data) => {
            let udata = JSON.parse(data);
            if (udata.roomID == roomID){
                const assignedRole = assignPlayerRole(socket);
                socket.emit("roleAssigned", { role: assignedRole, roomID });
                console.log("Player Verified");
            } 
    });

    socket.on("sync", (data) =>{
        players[data] = socket.id;
        console.log("Synchronization Done!!")
        console.log(players);
    })

    socket.on("joinRoom",(data) =>{
        let udata = JSON.parse(data);
        if (udata.uname == "NOPE"){
            console.log("Clearing")
            socket.emit("clearSession");
            for (let role in players) {
                if (players[role] === socket.id) {
                    delete players[role];
                    playerCount--;
                    break;
                }
            }
        }
        if (playerCount < 2){
            socket.join(udata.roomID); 
            playerCount++;
            console.log(`${udata.role} joined room: ${udata.roomID}`);
            io.emit("chatMessage", {
                user: udata.roomID,
                message: `${udata.role} has joined the room!`,
                role: udata.role
            });
        } else {
            io.emit("chatMessage",{
                user: "Server",
                message: "Room is FULL!!!!",
            });
        }

        // io.to(roomID).emit("chatMessage", {
        //     user: assignedRole,
        //     message: `${assignedRole} has joined the room!`
        // });
    })

    socket.on("chatMessage", (data) => {
        console.log(`[${data.role}] ${data.user}: ${data.message}`);
        io.emit("chatMessage", data);
    });

    socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.id}  playerCount: ${playerCount}`);

        // Remove player role on disconnect
        for (let role in players) {
            if (players[role] === socket.id) {
                delete players[role];
                playerCount--;
                break;
            }
        }
    });
});

server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});