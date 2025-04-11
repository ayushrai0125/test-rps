const button = document.querySelector('button');
const socket = io();

socket.on("roleAssigned", (data) => {
    console.log(`Your Role: ${data.role}`);
    localStorage.clear();
    localStorage.setItem("role", data.role);
    localStorage.setItem("name", document.querySelector("#name").value);
});

socket.on("redirectToMain", () => {
    window.location.href = "/main";
})

socket.on("logoutUser",() => {
    localStorage.clear();
    window.location.href = "/"
});

socket.on("chatMessage", (data) => {
    console.log(`[${data.role}] : ${data.msg}`);
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
        localStorage.clear();
        socket.emit("register",sData);
        socket.emit("joinRoom",sData);
    } else {
        socket.emit("register",sData);
        socket.emit("joinRoom",sData);
    }

}
