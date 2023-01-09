//Importing various packages using require()
const http = require("http");
const express = require("express");
const cors = require("cors");
const socketIo = require("socket.io");

//Creating an app calling express() function of express package.
const app = express();
//Port on which our application is hosted.
//whatever the port given to our application in deployment that
//will be choosen using process.env.port means
const port = 4500 || process.env.port;

//Creating the server on which our app will be deployed.
const server = http.createServer(app);

//Attaching a  WEB Socket (Full Duplex) to our server.
const io = socketIo(server);

//Making the server listen on the port of local host or the port assigned to
//server by the deployer.
server.listen(port, () => {
  console.log(`Server is working on ${port}`);
});

const users = [{}];
//CORS is used for intercommunication between URL.
app.use(cors());
//whenever a get request came to our server with URL as "/" then this will execute.
//By sending data res(response) make sure something is visible on browser.
app.get("/", (req, res) => {
  res.send("HELL ITS WORKIN");
});

io.on("connection", (socket) => {
  console.log("New Connection");

  socket.on("joined", ({ username }) => {
    users[socket.id] = username;
    console.log("Joined", username);

    socket.broadcast.emit("userJoined", {
      user: "Admin",
      message: `${users[socket.id]} has joined`,
    });
    socket.emit("welcome", {
      user: "Admin",
      message: `Welcome to the chat, ${users[socket.id]}`,
    });
  });

  socket.on("message", ({ message, id }) => {
    io.emit("sendMessage", { user: users[id], message, id });
  });

  socket.on("disconnected", () => {
    socket.broadcast.emit("leave", {
      user: "Admin",
      message: `${users[socket.id]} has left`,
    });
    console.log("User disconnected");
  });
});
