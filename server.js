const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const client = require('./client');

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(
    server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
    },
}
);

//connection
io.on('connection', (socket) => {
    console.log('A user connected to server: ' + socket.id);

    socket.on('message', async ({ room, data }) => {
        if (room) {
            const query = "INSERT INTO messages(room,data) VALUES($1,$2) RETURNING *";
            const values = [room, message];
            try {
                const res = await client.query(query, values);
                console.log('Message saved:', res.rows[0]);
                io.to(room).emit('message', message);
            } catch (err) {
                console.error('Error saving message to DB', err);
            }
        } else {
            const query = "INSERT INTO messages(room,message) VALUES($1,$2) RETURNING *";

            try {
                const res = await client.query(query, ['public', data]);
                console.log('Message saved:', res.rows[0]);
                console.log('Message received', data);
                io.emit('message', data);
            } catch (err) {
                console.error('Error saving message to DB', err);
            }
        }
    });

    socket.on('joinRoom', async (room) => {
        socket.join(room);
        console.log(`User ${socket.id} joined room: ${room}`);

        const query = "SELECT message, timestamp FROM messages WHERE room = $1 ORDER BY timestamp DESC LIMIT 10";
        try {
            const res = await client.query(query, [room]);
            const messages = res.rows;
            socket.emit('previousMessages', messages);

        } catch (err) {
            console.error('Error', err);
        }
    });

    socket.on('leaveRoom', (room) => {
        socket.leave(room);
        console.log(`User ${socket.id} leaved room: ${room}`);
    });

    socket.on('disconnect', () => {
        console.log('Disconnecting from server);');
    },);
});

server.listen(5001, () => {
    console.log('Server is running on http://localhost:5001');
});