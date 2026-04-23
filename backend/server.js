const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, '../frontend')));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// On stocke les rooms ici : { "1234": { players: [...] } }
const rooms = {};
io.on('connection', (socket) => {
    console.log(`🟢 Connecté : ${socket.id}`);

    socket.on('create_room', (playerData) => {
        const roomCode = Math.floor(1000 + Math.random() * 9000).toString();
        rooms[roomCode] = { 
            players: [{ ...playerData, id: socket.id, score: 0, wonCards: [] }],
            currentReaderId: socket.id // Le créateur pioche en premier !
        };
        
        socket.join(roomCode);
        socket.emit('room_info', { roomCode, players: rooms[roomCode].players, currentReaderId: socket.id });
    });

    socket.on('join_room', (data) => {
        const room = rooms[data.roomCode];
        if (room) {
            const newPlayer = { ...data.playerData, id: socket.id, score: 0, wonCards: [] };
            room.players.push(newPlayer);
            
            socket.join(data.roomCode);
            io.to(data.roomCode).emit('update_players', room.players);
            socket.emit('room_info', { roomCode: data.roomCode, players: room.players, currentReaderId: room.currentReaderId });
        } else {
            socket.emit('error_msg', "Room introuvable !");
        }
    });

    // 📩 NOUVEAU : Le lecteur a choisi une carte, on l'envoie aux autres
    socket.on('card_chosen', (data) => {
        socket.to(data.roomCode).emit('show_card', data.card);
    });

    // 📩 NOUVEAU : Le lecteur lance le vote, on prévient les autres
    socket.on('start_vote_timer', (roomCode) => {
        socket.to(roomCode).emit('vote_started');
    });

    socket.on('disconnect', () => {
        console.log(`🔴 Déconnecté : ${socket.id}`);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Serveur prêt sur le port ${PORT}`);
});