<<<<<<< HEAD
require("dotenv").config();
const path=require('path');
const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);


const users = {};

const socketToRoom = {};

io.on('connection', socket => {
    socket.on("join room", userDetail => {
        roomID=userDetail.room;
        const info={
            socketID:socket.id,
            name:userDetail.name,
            GID:userDetail.GID
        }
        if (users[roomID]) {
            const length = users[roomID].length;
            if (length === 4) {
                socket.emit("room full");
                return;
            }
            users[roomID].push(info);
        } else {
            users[roomID] = [info];
        }
        socketToRoom[socket.id] = roomID;
        const usersInThisRoom = users[roomID].filter((X) => X.socketID !== socket.id);
        socket.emit("all users", usersInThisRoom);
    });

    socket.on("sending signal", payload => {
        io.to(payload.userToSignal).emit('user joined', { signal: payload.signal, callerID: payload.callerID, name:payload.name, GID: payload.GID });
    });

    socket.on("returning signal", payload => {
        io.to(payload.callerID).emit('receiving returned signal', { signal: payload.signal, id: socket.id });
    });

    socket.on('disconnect', () => {
        console.log("Called....");
        const roomID = socketToRoom[socket.id];
        let room = users[roomID];
        if (room) {
            room = room.filter((row) => row.socketID !== socket.id);
            users[roomID] = room;
        }
        socket.broadcast.emit('user left',socket.id);
    });

});

// Serve static assets if in production
if(process.env.PROD){
    app.use(express.static(path.join(__dirname,'./client/build')));
    app.get('*',(req,res)=>{
        res.sendFile(path.join(__dirname,'./client/build/index.html'));
    })
}

const port=process.env.PORT || 8000;

=======
require("dotenv").config();
const path=require('path');
const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);
const cors = require('cors');


const users = {};

const socketToRoom = {};

app.use(cors());

io.on('connection', socket => {
    socket.on("join room", userDetail => {
        roomID=userDetail.room;
        const info={
            socketID:socket.id,
            name:userDetail.name,
            GID:userDetail.GID
        }
        if (users[roomID]) {
            const length = users[roomID].length;
            if (length === 4) {
                socket.emit("room full");
                return;
            }
            users[roomID].push(info);
        } else {
            users[roomID] = [info];
        }
        socketToRoom[socket.id] = roomID;
        const usersInThisRoom = users[roomID].filter((X) => X.socketID !== socket.id);
        socket.emit("all users", usersInThisRoom);
    });

    socket.on("sending signal", payload => {
        io.to(payload.userToSignal).emit('user joined', { signal: payload.signal, callerID: payload.callerID, name:payload.name, GID: payload.GID });
    });

    socket.on("returning signal", payload => {
        io.to(payload.callerID).emit('receiving returned signal', { signal: payload.signal, id: socket.id });
    });

    socket.on('disconnect', () => {
        console.log("Called....");
        const roomID = socketToRoom[socket.id];
        let room = users[roomID];
        if (room) {
            room = room.filter((row) => row.socketID !== socket.id);
            users[roomID] = room;
        }
        socket.broadcast.emit('user left',socket.id);
    });

});

// Serve static assets if in production
if(process.env.PROD){
    app.use(express.static(path.join(__dirname,'./client/build')));
    app.get('*',(req,res)=>{
        res.sendFile(path.join(__dirname,'./client/build/index.html'));
    })
}

const port=process.env.PORT || 8000;

>>>>>>> 40686c394ab225d00b4b4c6dbdd9de3dce28fb2a
server.listen(port, () => console.log(`server is running on port ${port}`));