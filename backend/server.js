const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path'); // 1. Add this line

// 1. Configuration de base
const app = express();

app.use(cors()); // Autorise notre frontend à parler au backend
app.use(express.static(path.join(__dirname, '../frontend')));

const server = http.createServer(app);


// 2. Configuration de Socket.io (Le facteur en temps réel)
const io = new Server(server, {
    cors: {
        origin: "*", // Pour l'instant on accepte les connexions de partout
        methods: ["GET", "POST"]
    }
});

// 3. Quand un joueur se connecte au site
io.on('connection', (socket) => {
    console.log(`🟢 Un nouveau joueur est connecté (ID: ${socket.id})`);

    // Quand un joueur veut rejoindre une Room
    socket.on('join_room', (roomCode) => {
        socket.join(roomCode);
        console.log(`🚪 Le joueur ${socket.id} a rejoint la room: ${roomCode}`);
        
        // On prévient tous les joueurs de cette room que quelqu'un est arrivé
        io.to(roomCode).emit('player_joined', `Un nouveau joueur est arrivé !`);
    });

    // Quand un joueur ferme l'onglet
    socket.on('disconnect', () => {
        console.log(`🔴 Le joueur nous a quitté (ID: ${socket.id})`);
    });
});

// 4. On allume le serveur sur le port 3000
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`🚀 Serveur en ligne et prêt à arbitrer sur http://localhost:${PORT}`);
});