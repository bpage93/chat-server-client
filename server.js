const net = require("net");
const fs = require("fs");

const clients = new Map();
let clientIdCounter = 1;

const logToFile = (message) => {
    fs.appendFileSync("chat.log", message + "\n");
};

const server = net.createServer((socket) => {
    const clientName = `Client${clientIdCounter++}`;
    clients.set(socket, clientName);

    const welcomeMessage = `Welcome ${clientName}!`;
    socket.write(welcomeMessage + "\n");
    logToFile(`${clientName} connected.`);

    // Notify others
    for (let [otherSocket, name] of clients) {
        if (otherSocket !== socket) {
            otherSocket.write(`${clientName} has joined the chat.\n`);
        }
    }

    socket.on("data", (data) => {
        const message = data.toString().trim();
        const senderName = clients.get(socket);
        const fullMessage = `${senderName}: ${message}`;

        // Broadcast to others
        for (let [otherSocket, name] of clients) {
            if (otherSocket !== socket) {
                otherSocket.write(fullMessage + "\n");
            }
        }

        logToFile(fullMessage);
    });

    socket.on("end", () => {
        const clientName = clients.get(socket);
        clients.delete(socket);
        const goodbyeMessage = `${clientName} disconnected.`;

        logToFile(goodbyeMessage);

        // Notify others
        for (let [otherSocket, name] of clients) {
            otherSocket.write(`${clientName} has left the chat.\n`);
        }
    });
});

server.listen(3000, () => {
    console.log("Server listening on port 3000");
});
