const io = require("socket.io-client")
const io_client = io.connect("http://localhost:4001");
io_client.on("connect", () => {
    console.log("Connected to the websocket server!");
    io_client.on("hire", emp => {
        console.log(`${emp.fullname} is hired!`);
    })
    io_client.on("fire", emp => {
        console.log(`${emp.fullname} is fired!`);
    })
})
console.log("Our websocket client is running...");