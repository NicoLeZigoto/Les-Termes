const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, '../frontend')));

app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

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
    io.to(roomCode).emit('update_players', { players: room.players, currentReaderId: room.currentReaderId });
}
// ====== APRÈS ======
function handlePlayerDeparture(socket, roomCode) {
    const room = rooms[roomCode];
    if (!room) return;

    const playerIndex = room.players.findIndex(p => p.id === socket.id);
    if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);
    }

    // 1. [NOUVEAU] Sécurité Countdown : Si un mec quitte et qu'on est en train de lancer
    const activePlayers = room.players.filter(p => !p.isSpectator);
    if (room.countdownTimer && activePlayers.length < 3) {
        clearTimeout(room.countdownTimer);
        room.countdownTimer = null;
        io.to(roomCode).emit('countdown_cancelled', { 
            reason: "Un joueur a quitté la room, lancement annulé." 
        });
    }

    // 2. [ORIGINAL] Room vide
    if (room.players.length === 0) {
        room._emptyTimer = setTimeout(() => {
            if (rooms[roomCode] && rooms[roomCode].players.length === 0) {
                delete rooms[roomCode];
            }
        }, 2 * 60 * 1000);
        return;
    }

    // 3. [ORIGINAL] Passage de flambeau si le chef est parti
    if (room.currentReaderId === socket.id) {
        const nextReader = room.players.find(p => !p.isDead && !p.disconnected && !p.isSpectator);
        if (nextReader) {
            room.currentReaderId = nextReader.id;
            io.to(roomCode).emit('reader_changed', { newReaderId: nextReader.id });
        } else {
            room.currentReaderId = null;
        }
    }

    io.to(roomCode).emit('update_players', { players: room.players, currentReaderId: room.currentReaderId });
}

// ====== APRÈS ======
function getAlivePlayers(room) {
    return room.players.filter(p => !p.isDead && !p.isSpectator);
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

/**
 * Détermine le(s) gagnant(s) parmi une liste de joueurs et émet game_over.
 * Gère correctement les égalités (plusieurs joueurs avec le même score max).
 */
function emitGameOver(roomCode, candidates) {
    const room = rooms[roomCode];
    if (!room || !candidates.length) return;

    const maxScore = Math.max(...candidates.map(p => p.score));
    const winners = candidates.filter(p => p.score === maxScore);

    if (winners.length === 1) {
        io.to(roomCode).emit('game_over', {
            winnerId: winners[0].id,
            winnerIds: [winners[0].id],
            players: room.players
        });
    } else {
        // Égalité entre plusieurs joueurs
        io.to(roomCode).emit('game_over', {
            winnerId: null,
            winnerIds: winners.map(w => w.id),
            players: room.players
        });
    }
}

// =========================================================
// RÉSOLUTION D'UN TOUR (appelée par le serveur uniquement)
// =========================================================
// ====== APRÈS ======
function resolveVotes(roomCode, isTieBreak = false, tieBreakCandidates = []) {
    const room = rooms[roomCode];
    if (!room) return;

    clearTimer(room);
    room.isVoting = false;
    room.phase = 'resolving';

    // 1. Calcul des joueurs AFK
    const excluded = (isTieBreak && room.tieBreakExcluded) ? room.tieBreakExcluded : [];
    const afkPlayers = room.players.filter(p =>
        !p.isDead && !p.isSpectator && !excluded.includes(p.id) && !room.votes[p.id]
    );

    let afkTotalDelay = 0;
    if (afkPlayers.length > 0) {
        afkTotalDelay = afkPlayers.length * 5500; // ~5.5s par animation (humiliation/mort)
        afkPlayers.forEach(p => { 
            p.afkCount = (p.afkCount || 0) + 1; 
            if (p.afkCount >= 3) p.isDead = true;
        });
        
        // On envoie l'ordre de jouer les animations AFK
        io.to(roomCode).emit('afk_players', {
            afkPlayers: afkPlayers.map(p => ({ id: p.id, afkCount: p.afkCount, isDead: p.isDead })) 
        });
    }

    // 2. On encapsule TOUTE la suite dans un timeout égal au délai des animations AFK
    // Cela garantit que le client a fini de voir les morts avant de voir la carte bouger.
    setTimeout(() => {
        // On revérifie si la room existe toujours après le délai
        if (!rooms[roomCode]) return;

        // Check sécurité : reste-t-il assez de joueurs après les AFK ?
        const aliveAfterAfk = room.players.filter(p => !p.isDead && !p.disconnected && !p.isSpectator);
        if (aliveAfterAfk.length <= 2) {
            if (aliveAfterAfk.length > 0) {
                emitGameOver(roomCode, aliveAfterAfk);
            }
            return;
        }

        // 3. Calcul des votes
        const voteCounts = {};
        const validTargets = isTieBreak ? tieBreakCandidates : null;
        Object.values(room.votes).forEach(targetId => {
            if (validTargets && !validTargets.includes(targetId)) return;
            voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
        });

        const totalVotes = Object.values(voteCounts).reduce((a, b) => a + b, 0);

        if (totalVotes === 0) {
            io.to(roomCode).emit('no_votes');
            return isTieBreak ? burnCard(roomCode) : scheduleNextRound(roomCode, 2000);
        }

        let maxVotes = 0;
        let losers = [];
        for (const [id, count] of Object.entries(voteCounts)) {
            if (count > maxVotes) { maxVotes = count; losers = [id]; }
            else if (count === maxVotes) losers.push(id);
        }

        const aliveLosers = losers.filter(id => {
            const p = room.players.find(pl => pl.id === id);
            return p && !p.isDead;
        });

        if (aliveLosers.length === 0) {
            io.to(roomCode).emit('all_targets_dead');
            return burnCard(roomCode);
        }

        const votesByTarget = {};
        Object.entries(room.votes).forEach(([voterId, targetId]) => {
            if (!votesByTarget[targetId]) votesByTarget[targetId] = [];
            votesByTarget[targetId].push(voterId);
        });

        // 4. Résolution du tour
        if (aliveLosers.length === 1) {
            const loserId = aliveLosers[0];
            const loser = room.players.find(p => p.id === loserId);

            loser.score++;
            loser.wonCards.push(room.currentCard);
            room.currentReaderId = loserId;

            io.to(roomCode).emit('round_result', {
                type: 'loser',
                loserId,
                votes: votesByTarget,
                newReaderId: loserId,
                players: room.players
            });

            if (loser.score >= room.scoreToWin) {
                return setTimeout(() => {
                    io.to(roomCode).emit('game_over', { winnerId: loserId, players: room.players });
                }, 7000); 
            }
            scheduleNextRound(roomCode, 8000); 

        } else if (aliveLosers.length >= aliveAfterAfk.length && !isTieBreak) {
            io.to(roomCode).emit('general_tie');
            burnCard(roomCode);
        } else {
            room.tieCount = (room.tieCount || 0) + 1; 
            if (room.tieCount > 1) {
                io.to(roomCode).emit('general_tie');
                burnCard(roomCode);
            } else {
                io.to(roomCode).emit('tie_break_start', { tiedPlayerIds: aliveLosers, votes: votesByTarget });
                room.tieBreakCandidates = aliveLosers;
                room.tieBreakExcluded = (aliveLosers.length === 2) ? aliveLosers : [];
                setTimeout(() => startVotePhase(roomCode, true, aliveLosers), 5000);
            }
        }
    }, afkTotalDelay); // C'est ce délai qui garantit que AFK passe AVANT le résultat
}

function burnCard(roomCode) {
    const room = rooms[roomCode];
    if (!room) return;

    // Ajouter la carte au cimetière de la room
    if (room.currentCard) {
        room.cemetery.push(room.currentCard);
    }

    // Prévenir tout le monde pour déclencher l'animation visuelle de brûlure
    io.to(roomCode).emit('card_burned', { 
        card: room.currentCard, 
        cemCount: room.cemetery.length 
    });

    // Passer au tour suivant après l'animation (5 secondes)
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
        room.tieBreakCandidates = [];
        room.tieBreakExcluded = [];
        
        io.to(roomCode).emit('next_round', {
            currentReaderId: room.currentReaderId,
            players: room.players
        });
    }, delay);
}

// =========================================================
// PHASE DE VOTE (démarrée par le serveur)
// =========================================================

// ====== APRÈS ======
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
        tieBreakExcluded: room.tieBreakExcluded ||[]
    });

    // Tick toutes les secondes pour synchronisation
    room.tickRef = setInterval(() => {
        remaining--;
        io.to(roomCode).emit('timer_tick', { remaining });

        // Fast-forward : si tout le monde a voté
        // 🛡️ CORRECTION : On n'ignore des joueurs QUE si on est VRAIMENT en Tie-Break
        const excluded = isTieBreak ? (room.tieBreakExcluded || []) :[];
        
        const eligibleCount = room.players.filter(p => !p.isDead && !p.isSpectator && !excluded.includes(p.id)).length;
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
        const { playerData, scoreToWin, voteMode, deck, roomName } = data;

        const safeName = (playerData.name || "Anonyme").trim().substring(0, 15) || "Anonyme";
        const safeRoomName = (roomName || "La Room").trim().substring(0, 20) || "La Room";
        const safeScore = Math.min(15, Math.max(2, scoreToWin || 5));
        
        if (!deck || !Array.isArray(deck) || deck.length === 0) {
            return socket.emit('error_msg', "Impossible de créer la room : paquet de cartes invalide.");
        }

        rooms[roomCode] = {
            roomName: safeRoomName,
            players: [{ ...playerData, id: socket.id, score: 0, afkCount: 0, isDead: false, isSpectator: false, wonCards: [] }], // Le créateur est joueur
            currentReaderId: socket.id,
            deck: [...deck],
            cemetery: [],
            isVoting: false,
            currentCard: null,
            votes: {},
            voteMode: voteMode || 'transparent',
            scoreToWin: safeScore,
            timerRef: null,
            tickRef: null,
            tieBreakCandidates: [],
            tieBreakExcluded: [],
            phase: 'lobby'
        };

        socket.join(roomCode);
        socket.emit('room_created', {
            roomCode,
            roomName: safeRoomName,
            players: rooms[roomCode].players,
            currentReaderId: socket.id,
            voteMode: rooms[roomCode].voteMode,
            scoreToWin: rooms[roomCode].scoreToWin
        });
        console.log(`🏠 Room ${roomCode} créée par ${socket.id}`);
    });

// ====== APRÈS ======
socket.on('join_room', (data) => {
    const { roomCode, playerData } = data;
    const room = rooms[roomCode];
    if (!room) return socket.emit('error_msg', "Room introuvable !");

    // Annuler le timer de destruction si quelqu'un rejoint une room vide
    if (room._emptyTimer) {
        clearTimeout(room._emptyTimer);
        room._emptyTimer = null;
        console.log(`✅ Timer de destruction annulé pour room ${roomCode} — nouveau joueur`);
    }

    // Éviter les doublons (reconnexion rapide)
    const existing = room.players.find(p => p.id === socket.id);
    if (existing) {
        return socket.emit('room_joined', {
            roomCode,
            roomName: room.roomName,
            players: room.players,
            currentReaderId: room.currentReaderId,
            voteMode: room.voteMode,
            scoreToWin: room.scoreToWin,
            phase: room.phase,
            currentCard: room.currentCard,
            isVoting: room.isVoting
        });
    }
    const newPlayer = { ...playerData, id: socket.id, score: 0, afkCount: 0, isDead: false, isSpectator: true, wonCards:[] };
    room.players.push(newPlayer);
    socket.join(roomCode);

    // Si la room n'a plus de chef valide (ex: tous passés spectateurs), le nouveau joueur devient chef
    const currentReaderValid = room.players.find(p => p.id === room.currentReaderId && !p.isSpectator && !p.isDead);
    if (!currentReaderValid && room.phase === 'lobby') {
        room.currentReaderId = socket.id;
        newPlayer.isSpectator = false; // Le nouveau chef est automatiquement joueur
        console.log(`👑 ${newPlayer.name} devient automatiquement chef de la room ${roomCode}`);
    }
    // Sécurité : Si c'est le premier à rejoindre ou s'il n'y a que des spectateurs
    const activePlayers = room.players.filter(p => !p.isSpectator);
    if (activePlayers.length === 0) {
        room.phase = 'lobby';
        room.currentCard = null;
    }
    
    socket.emit('room_joined', {
        roomCode,
        roomName: room.roomName,
        players: room.players,
        currentReaderId: room.currentReaderId,
        voteMode: room.voteMode,
        scoreToWin: room.scoreToWin,
        phase: room.phase,
        // On s'assure d'envoyer null si on est en lobby
        currentCard: room.phase === 'lobby' ? null : room.currentCard,
        isVoting: room.phase === 'lobby' ? false : room.isVoting
    });

    socket.to(roomCode).emit('player_joined', { players: room.players, newPlayer });
    // Notifier la room du nouveau currentReaderId si changement
    socket.to(roomCode).emit('reader_changed', { newReaderId: room.currentReaderId });
    console.log(`👤 ${newPlayer.name} (${socket.id}) a rejoint la room ${roomCode} en tant que spectateur. Total joueurs: ${room.players.length}`);
});

// toggle_role : switch spectateur ↔ joueur (lobby uniquement, bidirectionnel)
socket.on('toggle_role', (roomCode) => {
    const room = rooms[roomCode];
    if (!room || room.phase !== 'lobby') return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;

    const oldReaderId = room.currentReaderId;

    // 1. [ORIGINAL] Switch de rôle
    player.isSpectator = !player.isSpectator;

    // 2. [NOUVEAU] Annulation du compte à rebours si besoin
    const activePlayers = room.players.filter(p => !p.isSpectator);
    if (room.countdownTimer && activePlayers.length < 3) {
        clearTimeout(room.countdownTimer);
        room.countdownTimer = null;
        io.to(roomCode).emit('countdown_cancelled', { 
            reason: "Pas assez de joueurs actifs pour lancer la partie." 
        });
    }

    // 3. [ORIGINAL] Gestion du transfert de Chef (Reader)
    if (player.isSpectator && room.currentReaderId === socket.id) {
        const nextPlayer = room.players.find(p => !p.isSpectator && p.id !== socket.id);
        room.currentReaderId = nextPlayer ? nextPlayer.id : null;
    } else if (!player.isSpectator) {
        const currentReaderValid = room.players.find(p => p.id === room.currentReaderId && !p.isSpectator);
        if (!currentReaderValid) {
            room.currentReaderId = player.id;
        }
    }

    // 4. [ORIGINAL] Update client
    io.to(roomCode).emit('update_players', { players: room.players, currentReaderId: room.currentReaderId });
    if (room.currentReaderId !== oldReaderId) {
        io.to(roomCode).emit('reader_changed', { newReaderId: room.currentReaderId });
    }
});

    // ------ DÉMARRAGE DE PARTIE ET REJOUER ------
    socket.on('start_game', (roomCode) => {
        const room = rooms[roomCode];
        if (!room || room.phase !== 'lobby') return;
    
        // 1. [ORIGINAL] Re-balayage pour s'assurer qu'un chef est bien désigné
        const currentReaderValid = room.players.find(p => p.id === room.currentReaderId && !p.isSpectator && !p.isDead);
        if (!currentReaderValid) {
            const firstActive = room.players.find(p => !p.isSpectator && !p.isDead);
            if (firstActive) {
                room.currentReaderId = firstActive.id;
            }
        }
    
        // 2. [ORIGINAL] Seul le chef peut lancer
        if (room.currentReaderId !== socket.id) return;
    
        // 3. [ORIGINAL] Check du nombre minimum de joueurs
        const activePlayers = room.players.filter(p => !p.isSpectator);
        if (activePlayers.length < 3) {
            return socket.emit('error_msg', "Il faut au moins 3 joueurs actifs pour démarrer !");
        }
    
        // 4. [NOUVEAU] Lancement du compte à rebours avec stockage du Timer
        io.to(roomCode).emit('game_countdown', { seconds: 5 });
    
        // On stocke le timer dans l'objet room pour pouvoir l'annuler si besoin
        room.countdownTimer = setTimeout(() => {
            if (!rooms[roomCode]) return;
            room.phase = 'drawing';
            room.countdownTimer = null; // On nettoie après exécution
            
            io.to(roomCode).emit('game_started', {
                currentReaderId: room.currentReaderId,
                players: room.players
            });
        }, 5000);
    });

    socket.on('replay_game', (data) => {
        const { roomCode, deck } = data;
        const room = rooms[roomCode];
        if (!room) return;
        
        const player = room.players.find(p => p.id === socket.id);
        if (!player) return;

        // Si la room n'a pas encore été réinitialisée, on le fait et on met tout le monde spectateur
        if (room.phase !== 'lobby') {
            room.phase = 'lobby';
            room.deck = deck ? [...deck] : [];
            room.cemetery = [];
            room.currentCard = null;
            room.votes = {};
            room.isVoting = false;
            room.tieBreakCandidates = [];
            room.tieBreakExcluded = [];
            clearTimer(room);

            room.players.forEach(p => {
                p.score = 0;
                p.afkCount = 0;
                p.isDead = false;
                p.isSpectator = true; // Par défaut, replacer le joueur en spectateur
                p.wonCards = [];
            });
        }

        // Le joueur qui a cliqué sur "Rejouer" redevient un joueur actif
        player.isSpectator = false;

        io.to(roomCode).emit('game_reset_state', { players: room.players, currentReaderId: room.currentReaderId });
        console.log(`🔄 ${player.name} est prêt à rejouer dans la room ${roomCode}`);
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
        const { roomCode, card } = data; 
        const room = rooms[roomCode];
        if (!room || room.currentReaderId !== socket.id) return;
        if (!room.pendingCards) return;

        const isValidCard = room.pendingCards.some(c => c.text === card.text);
        if (!isValidCard) return; 

        const cardsToKeep = room.pendingCards.filter(c => c.text !== card.text);
        room.deck.push(...cardsToKeep);
        room.pendingCards = null; 

        room.currentCard = card;
        room.phase = 'reading';
        
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

// ====== APRÈS ======
    // ------ POINTEUR EN TEMPS RÉEL (MODE TRANSPARENT) ------
    socket.on('point_target', (data) => {
        const { roomCode, targetId } = data;
        const room = rooms[roomCode];
        
        if (!room || room.phase !== 'voting' || room.voteMode !== 'transparent') return;

        const voter = room.players.find(p => p.id === socket.id);
        if (!voter || voter.isDead || voter.isSpectator) return; 
        if (room.votes[socket.id]) return; 

        socket.to(roomCode).emit('pointer_update', { voterId: socket.id, targetId });
    });

    // ------ VOTE D'UN JOUEUR ------

socket.on('cast_vote', (data) => {
    const { roomCode, targetId } = data;
    const room = rooms[roomCode];
    
    if (!room || room.phase !== 'voting') return;

    const voter = room.players.find(p => p.id === socket.id);
    if (!voter || voter.isDead || voter.isSpectator) return;
    if (socket.id === targetId) return;
    if (room.votes[socket.id]) return; 

    const targetPlayer = room.players.find(p => p.id === targetId);
    if (!targetPlayer || targetPlayer.isDead || targetPlayer.disconnected || targetPlayer.isSpectator) {
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
    
    // NOUVEAU : On prévient toute la room que ce joueur a verrouillé son vote
    io.to(roomCode).emit('player_validated', { voterId: socket.id });

    console.log(`🗳️  Vote de ${socket.id} → ${targetId} dans ${roomCode}`);
});

    // ------ DÉCONNEXION ------


    socket.on('leave_room', (roomCode) => {
        // Départ volontaire : on retire le joueur proprement
        handlePlayerDeparture(socket, roomCode);
        socket.leave(roomCode);
    });
    
    socket.on('disconnect', () => {
        console.log(`🔴 Déconnecté : ${socket.id}`);

        for (const [roomCode, room] of Object.entries(rooms)) {
            const playerIndex = room.players.findIndex(p => p.id === socket.id);
            if (playerIndex === -1) continue;

            const player = room.players[playerIndex];

            // En lobby, on retire purement le joueur (pas de mort)
            if (room.phase === 'lobby') {
                handlePlayerDeparture(socket, roomCode);
                break;
            }

            // En jeu : on marque le joueur comme mort/déconnecté sans le supprimer
            player.isDead = true;
            player.disconnected = true;

            io.to(roomCode).emit('player_disconnected', {
                playerId: socket.id,
                playerName: player.name,
                players: room.players
            });

            // Passer le flambeau si c'était le lecteur
            if (room.currentReaderId === socket.id) {
                const currentIndex = room.players.findIndex(p => p.id === socket.id);
                let nextReader = null;

                for (let i = 1; i < room.players.length; i++) {
                    const checkIndex = (currentIndex + i) % room.players.length;
                    const p = room.players[checkIndex];
                    if (!p.isDead && !p.disconnected && !p.isSpectator) {
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

            // Vérifier si la partie doit s'arrêter
            const alive = room.players.filter(p => !p.isDead && !p.disconnected && !p.isSpectator);
            if (alive.length <= 2 && room.phase !== 'lobby') {
                clearTimer(room);
                if (alive.length > 0) {
                    emitGameOver(roomCode, alive);
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