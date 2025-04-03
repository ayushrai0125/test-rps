const button = document.querySelector('button');
const socket = io();
let roleAssigneD = false
let roomJoined = false

// Listen for the server's role assignment message
socket.on("roleAssigned", (data) => {
    console.log(`Your Role: ${data.role}`);
    localStorage.clear();
    localStorage.setItem("role", data.role);
    roleAssigneD = true;
});

// Listen for incoming chat messages
socket.on("chatMessage", (data) => {
    console.log(`[${data.role}] ${data.user}: ${data.message}`);
});

socket.on("clearSession",()=>{
    localStorage.clear();
})

button.addEventListener('click', sendMessage);

function sendMessage() {
    const storedRole = localStorage.getItem("role");
    let username = document.querySelector('#name').value;
    let roomId = document.querySelector('#roomTxt').value;
    let udata = {
        uname : username,
        roomID: roomId,
        role : storedRole
    };

    let sData = JSON.stringify(udata);
    if(storedRole){
        if (storedRole === null){
            console.log("NOPE")
            localStorage.clear();
            socket.emit("register",sData);
        } else { 
            socket.emit("sync",udata.role);
            socket.emit("joinRoom",sData);
        }
    } else {
        socket.emit("register",sData);
    }

}
