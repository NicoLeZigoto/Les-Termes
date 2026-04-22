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

    // Créer une room
    socket.on('create_room', (playerData) => {
        const roomCode = Math.floor(1000 + Math.random() * 9000).toString();
        rooms[roomCode] = { players: [{ ...playerData, id: socket.id, score: 0, wonCards: [] }] };
        
        socket.join(roomCode);
        socket.emit('room_info', { roomCode, players: rooms[roomCode].players });
        console.log(`👑 Room ${roomCode} créée par ${playerData.name}`);
    });

    // Rejoindre une room
    socket.on('join_room', (data) => {
        const room = rooms[data.roomCode];
        if (room) {
            const newPlayer = { ...data.playerData, id: socket.id, score: 0, wonCards: [] };
            room.players.push(newPlayer);
            
            socket.join(data.roomCode);
            // On prévient TOUT LE MONDE dans la room qu'il y a une mise à jour
            io.to(data.roomCode).emit('update_players', room.players);
            socket.emit('room_info', { roomCode: data.roomCode, players: room.players });
        } else {
            socket.emit('error_msg', "Room introuvable !");
        }
    });

    socket.on('disconnect', () => {
        console.log(`🔴 Déconnecté : ${socket.id}`);
        // Ici on pourrait gérer la déconnexion d'un joueur en pleine partie
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Serveur prêt sur le port ${PORT}`);
});