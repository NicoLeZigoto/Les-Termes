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

// =========================================================
// ÉTAT DU JEU — côté serveur
// =========================================================

// rooms[roomCode] = {
//   players: [...],
//   currentReaderId: socketId,
//   deck: [...],           ← le paquet centralisé
//   cemetery: [...],       ← cartes brûlées
//   isVoting: bool,
//   currentCard: {},
//   votes: {},             ← { socketId: targetSocketId }
//   voteMode: 'transparent'|'semi'|'anonyme',
//   scoreToWin: number,
//   timerRef: null,        ← référence setTimeout serveur
//   tieBreakCandidates: [],
//   phase: 'lobby'|'drawing'|'reading'|'voting'|'resolving'
// }
const rooms = {};

// =========================================================
// UTILITAIRES
// =========================================================

function broadcastPlayers(roomCode) {
    const room = rooms[roomCode];
    if (!room) return;
    io.to(roomCode).emit('update_players', room.players);
}

function getAlivePlayers(room) {
    return room.players.filter(p => !p.isDead);
}

function pickRandomCards(deck, count) {
    const chosen = [];
    const indices = [];
    while (chosen.length < count && deck.length > 0) {
        const idx = Math.floor(Math.random() * deck.length);
        if (!indices.includes(idx)) {
            chosen.push(deck[idx]);
            indices.push(idx);
        }
    }
    // On retire ces cartes du deck
    indices.sort((a, b) => b - a).forEach(i => deck.splice(i, 1));
    return chosen;
}

function clearTimer(room) {
    if (room.timerRef) {
        clearTimeout(room.timerRef);
        room.timerRef = null;
    }
    if (room.tickRef) {
        clearInterval(room.tickRef);
        room.tickRef = null;
    }
}

// =========================================================
// RÉSOLUTION D'UN TOUR (appelée par le serveur uniquement)
// =========================================================

function resolveVotes(roomCode, isTieBreak = false, tieBreakCandidates = []) {
    const room = rooms[roomCode];
    if (!room) return;

    clearTimer(room);
    room.isVoting = false;
    room.phase = 'resolving';

    const excluded = (isTieBreak && room.tieBreakExcluded) ? room.tieBreakExcluded :[];
    const afkPlayers = room.players.filter(p =>
        !p.isDead &&
        !excluded.includes(p.id) &&
        !room.votes[p.id]
    );

    // -- NOUVEAU : On calcule un délai pour que le serveur attende la fin des cinématiques --
    let afkDelay = 0;
    if (afkPlayers.length > 0) {
        afkDelay = afkPlayers.length * 5000; // 5 secondes par joueur AFK
        afkPlayers.forEach(p => { 
            p.afkCount = (p.afkCount || 0) + 1; 
            
            // 💀 L'ARBITRE TUE OFFICIELLEMENT LE JOUEUR
            if (p.afkCount >= 3) {
                p.isDead = true;
            }
        });
        
        io.to(roomCode).emit('afk_players', {
            // On envoie aussi la confirmation de décès au client
            afkPlayers: afkPlayers.map(p => ({ id: p.id, afkCount: p.afkCount, isDead: p.isDead })) 
        });
    }

    const voteCounts = {};
    const validTargets = isTieBreak ? tieBreakCandidates : null;
    Object.values(room.votes).forEach(targetId => {
        if (validTargets && !validTargets.includes(targetId)) return;
        voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
    });

    const totalVotes = Object.values(voteCounts).reduce((a, b) => a + b, 0);

    if (totalVotes === 0) {
        io.to(roomCode).emit('no_votes');
        // On rajoute le délai AFK ici
        return scheduleNextRound(roomCode, 2000 + afkDelay); 
    }

    let maxVotes = 0;
    let losers = [];
    for (const [id, count] of Object.entries(voteCounts)) {
        if (count > maxVotes) { maxVotes = count; losers = [id]; }
        else if (count === maxVotes) { losers.push(id); }
    }

    const aliveLosers = losers.filter(id => {
        const p = room.players.find(pl => pl.id === id);
        return p && !p.isDead;
    });

    if (aliveLosers.length === 0) {
        io.to(roomCode).emit('all_targets_dead');
        // On retarde la destruction de carte de afkDelay
        setTimeout(() => burnCard(roomCode), afkDelay);
        return;
    }

    const votesByTarget = {};
    Object.entries(room.votes).forEach(([voterId, targetId]) => {
        if (!votesByTarget[targetId]) votesByTarget[targetId] = [];
        votesByTarget[targetId].push(voterId);
    });

    if (aliveLosers.length === 1) {
        const loserId = aliveLosers[0];
        const loser = room.players.find(p => p.id === loserId);

        loser.score++;
        loser.wonCards.push(room.currentCard);
        room.currentReaderId = loserId;

        broadcastPlayers(roomCode);

        io.to(roomCode).emit('round_result', {
            type: 'loser',
            loserId,
            votes: votesByTarget,
            newReaderId: loserId,
            players: room.players
        });

        if (loser.score >= room.scoreToWin) {
            return setTimeout(() => {
                io.to(roomCode).emit('game_over', {
                    winnerId: loserId,
                    players: room.players
                });
            }, 7000 + afkDelay); // <-- On ajoute afkDelay
        }

        scheduleNextRound(roomCode, 8000 + afkDelay); // <-- On ajoute afkDelay

    } else if (aliveLosers.length >= getAlivePlayers(room).length && !isTieBreak) {
        io.to(roomCode).emit('general_tie');
        setTimeout(() => burnCard(roomCode), afkDelay); // <-- On ajoute afkDelay

    } else {
        room.tieCount = (room.tieCount || 0) + 1; 

        if (room.tieCount > 1) {
            io.to(roomCode).emit('general_tie');
            setTimeout(() => burnCard(roomCode), afkDelay);
        } else {
            io.to(roomCode).emit('tie_break_start', { tiedPlayerIds: aliveLosers, votes: votesByTarget });
            room.tieBreakCandidates = aliveLosers;
            const isTwoWayTie = aliveLosers.length === 2;
            room.tieBreakExcluded = isTwoWayTie ? aliveLosers : [];

            setTimeout(() => {
                startVotePhase(roomCode, true, aliveLosers);
            }, 5000 + afkDelay);
        }
    }
}

function burnCard(roomCode) {
    const room = rooms[roomCode];
    if (!room) return;
    room.cemetery.push(room.currentCard);
    io.to(roomCode).emit('card_burned', { card: room.currentCard, cemCount: room.cemetery.length });
    scheduleNextRound(roomCode, 5000);
}

function scheduleNextRound(roomCode, delay) {
    const room = rooms[roomCode];
    if (!room) return;
    room.phase = 'drawing';
    clearTimer(room);
    
    room.timerRef = setTimeout(() => {
        if (!rooms[roomCode]) return;
        if (room.deck.length === 0) {
            io.to(roomCode).emit('deck_empty', { players: room.players });
            return;
        }
        room.votes = {};
        room.currentCard = null;
        room.tieCount = 0; 
        
        io.to(roomCode).emit('next_round', {
            currentReaderId: room.currentReaderId,
            players: room.players
        });
    }, delay);
}

// =========================================================
// PHASE DE VOTE (démarrée par le serveur)
// =========================================================

function startVotePhase(roomCode, isTieBreak = false, tieBreakCandidates = []) {
    const room = rooms[roomCode];
    if (!room) return;

    room.isVoting = true;
    room.votes = {};
    room.phase = 'voting';

    const VOTE_DURATION = 15; // secondes
    let remaining = VOTE_DURATION;

    io.to(roomCode).emit('vote_phase_start', {
        duration: VOTE_DURATION,
        isTieBreak,
        tieBreakCandidates,
        tieBreakExcluded: room.tieBreakExcluded || []
    });

    // Tick toutes les secondes pour synchronisation
    room.tickRef = setInterval(() => {
        remaining--;
        io.to(roomCode).emit('timer_tick', { remaining });

        // Fast-forward : si tout le monde a voté
        const excluded = room.tieBreakExcluded || [];
        const eligibleCount = room.players.filter(p => !p.isDead && !excluded.includes(p.id)).length;
        const votedCount = Object.keys(room.votes).filter(id => !excluded.includes(id)).length;

        if (votedCount >= eligibleCount && remaining > 5) {
            remaining = 5;
            io.to(roomCode).emit('timer_fast_forward', { remaining: 5 });
        }

        if (remaining <= 0) {
            clearInterval(room.tickRef);
            room.tickRef = null;
            resolveVotes(roomCode, isTieBreak, tieBreakCandidates);
        }
    }, 1000);
}

// =========================================================
// CONNEXIONS SOCKET
// =========================================================

io.on('connection', (socket) => {
    console.log(`🟢 Connecté : ${socket.id}`);

    // ------ LOBBY ------

    socket.on('create_room', (data) => {
        const roomCode = Math.floor(1000 + Math.random() * 9000).toString();
        const { playerData, scoreToWin, voteMode, deck } = data;

        rooms[roomCode] = {
            players: [{ ...playerData, id: socket.id, score: 0, afkCount: 0, isDead: false, wonCards: [] }],
            currentReaderId: socket.id,
            deck: deck ? [...deck] : [], // Le créateur envoie le deck complet
            cemetery: [],
            isVoting: false,
            currentCard: null,
            votes: {},
            voteMode: voteMode || 'transparent',
            scoreToWin: scoreToWin || 5,
            timerRef: null,
            tickRef: null,
            tieBreakCandidates: [],
            tieBreakExcluded: [],
            phase: 'lobby'
        };

        socket.join(roomCode);
        socket.emit('room_created', {
            roomCode,
            players: rooms[roomCode].players,
            currentReaderId: socket.id,
            voteMode: rooms[roomCode].voteMode,
            scoreToWin: rooms[roomCode].scoreToWin
        });
        console.log(`🏠 Room ${roomCode} créée par ${socket.id}`);
    });

    socket.on('join_room', (data) => {
        const { roomCode, playerData } = data;
        const room = rooms[roomCode];
        if (!room) {
            return socket.emit('error_msg', "Room introuvable !");
        }
        if (room.phase !== 'lobby') {
            return socket.emit('error_msg', "La partie a déjà commencé !");
        }

        const newPlayer = { ...playerData, id: socket.id, score: 0, afkCount: 0, isDead: false, wonCards: [] };
        room.players.push(newPlayer);
        socket.join(roomCode);

        // Confirmer au nouveau joueur
        socket.emit('room_joined', {
            roomCode,
            players: room.players,
            currentReaderId: room.currentReaderId,
            voteMode: room.voteMode,
            scoreToWin: room.scoreToWin
        });

        // Prévenir les autres
        socket.to(roomCode).emit('player_joined', { players: room.players, newPlayer });
        console.log(`👤 ${socket.id} a rejoint la room ${roomCode}`);
    });

    // ------ DÉMARRAGE DE PARTIE ------

    socket.on('start_game', (roomCode) => {
        const room = rooms[roomCode];
        if (!room || room.currentReaderId !== socket.id) return;

        if (room.phase !== 'lobby') {
            return; 
        }
        
        if (room.players.length < 3) {
            return socket.emit('error_msg', "Il faut au moins 3 joueurs pour démarrer !");
        }

        room.phase = 'drawing';
        io.to(roomCode).emit('game_started', {
            currentReaderId: room.currentReaderId,
            players: room.players
        });
        console.log(`🎮 Partie démarrée dans la room ${roomCode}`);
    });

    // ------ PIOCHE ------

    socket.on('request_draw', (roomCode) => {
        const room = rooms[roomCode];
        if (!room) return;
        if (room.currentReaderId !== socket.id) return; // Seul le lecteur peut piocher
        if (room.phase === 'voting' || room.phase === 'resolving' || room.phase === 'reading') return; // Pas pendant un vote
                const alivePlayers = room.players.filter(p => !p.isDead && !p.disconnected);
        if (alivePlayers.length < 3) {
            socket.emit('error_msg', "Il faut au moins 3 joueurs vivants pour piocher !");
            return;
        }
        if (room.deck.length < 3) {
            io.to(roomCode).emit('deck_empty', { players: room.players });
            return;
        }

        // Piocher 3 cartes
        const threeCards = pickRandomCards(room.deck, 3);
        room.phase = 'reading';
        room.pendingCards = threeCards; 

        // Le lecteur reçoit les 3 vraies cartes, les autres voient le dos
        socket.emit('draw_result_reader', { cards: threeCards });
        socket.to(roomCode).emit('draw_result_others'); // Juste le dos
        console.log(`🃏 Pioche dans la room ${roomCode} : ${threeCards.length} cartes`);
    });

    // ------ CHOIX DE CARTE ------

    socket.on('card_chosen', (data) => {
        const { roomCode, card, keptCards } = data;
        const room = rooms[roomCode];
        if (!room || room.currentReaderId !== socket.id) return;

        // Remettre les 2 cartes non choisies dans le deck
        if (keptCards && keptCards.length > 0) {
            room.deck.push(...keptCards);
        }

        room.currentCard = card;
        room.phase = 'reading';

        // Tout le monde voit la carte
        io.to(roomCode).emit('show_card', { card });
        console.log(`📖 Carte choisie dans la room ${roomCode}`);
    });

    // ------ LANCEMENT DU VOTE ------

    socket.on('start_vote', (roomCode) => {
        const room = rooms[roomCode];
        if (!room || room.currentReaderId !== socket.id) return;
        if (room.phase !== 'reading') return;

        startVotePhase(roomCode);
    });

    // ------ VOTE D'UN JOUEUR ------

    socket.on('cast_vote', (data) => {
        const { roomCode, targetId } = data;
        const room = rooms[roomCode];
        if (!room || !room.isVoting) return;

        const voter = room.players.find(p => p.id === socket.id);
        if (!voter || voter.isDead) return;
        if (socket.id === targetId) return;
        if (room.votes[socket.id]) return; 

        const targetPlayer = room.players.find(p => p.id === targetId);
        if (!targetPlayer || targetPlayer.isDead || targetPlayer.disconnected) {
            return; 
        }

        if (room.tieBreakCandidates && room.tieBreakCandidates.length > 0) {
            if (room.tieBreakExcluded && room.tieBreakExcluded.includes(socket.id)) return;
            if (!room.tieBreakCandidates.includes(targetId)) return;
        }

        room.votes[socket.id] = targetId;

        if (room.voteMode === 'transparent') {
            io.to(roomCode).emit('pointer_update', { voterId: socket.id, targetId });
        }

        socket.emit('vote_registered', { targetId });

        console.log(`🗳️  Vote de ${socket.id} → ${targetId} dans ${roomCode}`);
    });

    // ------ DÉCONNEXION ------

    socket.on('disconnect', () => {
        console.log(`🔴 Déconnecté : ${socket.id}`);

        // Trouver la room du joueur
        for (const [roomCode, room] of Object.entries(rooms)) {
            const playerIndex = room.players.findIndex(p => p.id === socket.id);
            if (playerIndex === -1) continue;

            const player = room.players[playerIndex];
            player.isDead = true;       // Compte comme mort pour les votes/résolutions
            player.disconnected = true; // Flag visuel pour griser l'avatar

            io.to(roomCode).emit('player_disconnected', {
                playerId: socket.id,
                playerName: player.name,
                players: room.players
            });

            // Si c'était le lecteur, passer le flambeau
            if (room.currentReaderId === socket.id) {
                const currentIndex = room.players.findIndex(p => p.id === socket.id);
                let nextReader = null;
            
                for (let i = 1; i < room.players.length; i++) {
                    const checkIndex = (currentIndex + i) % room.players.length;
                    const p = room.players[checkIndex];
                    if (!p.isDead && !p.disconnected) {
                        nextReader = p;
                        break;
                    }
                }
            
                if (nextReader) {
                    room.currentReaderId = nextReader.id;
                
                    if (room.phase === 'reading' || room.phase === 'drawing') {
                        room.phase = 'drawing'; 

                        if (room.pendingCards) {
                            room.deck.push(...room.pendingCards);
                            room.pendingCards = null;
                        }
                    }
                
                    io.to(roomCode).emit('reader_changed', { newReaderId: nextReader.id });
                }
            }

            // Si partie en cours et plus assez de joueurs vivants
            const alive = room.players.filter(p => !p.isDead && !p.disconnected);
            if (alive.length < 3 && room.phase !== 'lobby') {
                clearTimer(room);
                if (alive.length > 0) {
                    const winner = alive.reduce((prev, current) => (prev.score > current.score) ? prev : current);
                    io.to(roomCode).emit('game_over', { winnerId: winner.id, players: room.players });
                }
            }
            break;
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Serveur prêt sur le port ${PORT}`);
});
