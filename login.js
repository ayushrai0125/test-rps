const button = document.querySelector('button');
const socket = io();
let roleAssigneD = false

// Listen for the server's role assignment message
socket.on("roleAssigned", (data) => {
    console.log(`Your Role: ${data.role}`);
    localStorage.setItem("role", data.role);      // Store the role
    roleAssigneD = true;
});

// Listen for incoming chat messages
socket.on("chatMessage", (data) => {
    console.log(`[${data.role}] ${data.user}: ${data.message}`);
});

button.addEventListener('click', sendMessage);

function sendMessage() {
    const storedRole = localStorage.getItem("role");
    let username = document.querySelector('#name').value;
    let roomId = document.querySelector('#roomTxt').value;
    let udata = {
        uname : username,
        roomID: roomId
    };
    if (roleAssigneD){
        socket.emit("joinRoom", JSON.stringify(udata));
    } else {
        socket.emit("chatMessage",{role: storedRole, user: udata.uname, message:"Already Joined the room"});
        
    }
    // if (storedRoom && storedRole) {
    //     // Emit to the server to join the existing room
    //     socket.emit("joinRoom", { roomID: storedRoom, role: storedRole });
    //     console.log(`Reconnecting to room ${storedRoom} as ${storedRole}`);
    // } else {
    //     // If no room/role in localStorage, show an error
    //     console.error("No room or role found in localStorage!");
    // }
}
