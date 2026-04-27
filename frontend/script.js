// =========================================================
// LOBBY — Navigation et UI
// =========================================================

function goToIdentity() {
    audioManager.playSound('ui-click');
    document.getElementById('step-home').classList.add('hidden');
    document.getElementById('step-identity').classList.remove('hidden');
}

function goToHome() {
    audioManager.playSound('ui-click');
    document.getElementById('step-identity').classList.add('hidden');
    document.getElementById('step-home').classList.remove('hidden');
}

function goToStep1() {
    audioManager.playSound('ui-click');
    document.getElementById('step-choose').classList.add('hidden');
    document.getElementById('step-identity').classList.remove('hidden');
}

function goToStep2() {
    audioManager.playSound('ui-click');
    const pseudoInput = document.getElementById('input-pseudo');
    if (!pseudoInput.value.trim()) {
        showNotification("⚠️ Hé, n'oublie pas de renseigner ton pseudo !");
        pseudoInput.focus();
        return;
    }

    const pathCode = window.location.pathname.replace('/', '');
    if (pathCode.length === 4 && !isNaN(pathCode)) {
        document.getElementById('input-room-code').value = pathCode;
        joinRoom(); 
    } else {
        document.getElementById('step-identity').classList.add('hidden');
        document.getElementById('step-choose').classList.remove('hidden');
    }
}

function stepPoints(delta) {
    audioManager.playSound('ui-click');
    const input = document.getElementById('input-points');
    const current = Math.min(15, Math.max(2, parseInt(input.value) || 5));
    input.value = Math.min(15, Math.max(2, current + delta));
}

function backToMenu() {
    audioManager.playSound('ui-click');
    document.getElementById('confirm-modal').classList.remove('hidden');
}

function closeConfirmModal() {
    audioManager.playSound('ui-click');
    document.getElementById('confirm-modal').classList.add('hidden');
}

function executeBackToMenu() {
    audioManager.playSound('ui-click');
    document.getElementById('confirm-modal').classList.add('hidden');

    // 1. On prévient le serveur qu'on part
    socket.emit('leave_room', currentRoomCode);

    // 2. On nettoie l'URL (on revient à la racine)
    window.history.pushState({}, '', '/');

    // 3. On réinitialise l'interface
    document.getElementById('game-wrapper').classList.add('hidden');
    document.getElementById('lobby-screen').classList.remove('hidden');
    
    // On renvoie à l'écran de choix (Créer/Rejoindre)
    document.getElementById('step-home').classList.add('hidden');
    document.getElementById('step-identity').classList.add('hidden');
    document.getElementById('step-choose').classList.remove('hidden');

    // 4. On vide les variables locales pour éviter les conflits au prochain join
    currentRoomCode = "0000";
    players = [];
    currentCard = null;
    isVoting = false;
}

// =========================================================
// CONSTANTES ET ÉTAT LOCAL
// =========================================================

const PSEUDO_PLACEHOLDERS = [
    "Ex: Joe Dash", "Ex: Le T", "Ex: Brakav", "Ex: Polux", "Ex: Belbit",
    "Ex: Guendoul", "Ex: Ricky La Pénave", "Ex: Jonny L'horloger",
    "Ex: Tromax", "Ex: Ératosthène", "Ex: Marluxia", "Ex: DROP TABLE users; --force",
    "Ex: PILOTE", "Ex: Alphonse D'audrey de la cour des Fleurs", "Hey",
    "Croquette", "Chouquette", "Monsieur Poitoux", "Bétadine"
];

const ROOM_NAME_PLACEHOLDERS = [
    "Soirée Raclette", "Le Tribunal", "Règlement de comptes", "Fin des amitiés",
    "Entre Traîtres", "Le Dîner de Cons", "Guerre Froide", "Bain de sang",
    "Réunion de crise", "Le Conseil", "Copains mais pas gays", "Sucé-En-Bris"
];

const IDENTITY_SUBTITLES = [
    "C'est qui ce beau gosse ?", "Tu viens souvent ici ?", "C'est quoi ton p'tit nom ?",
    "Heeeey mais qui voila !", "Hmmmm.. Tu viens jouer ?",
    "Balance ton blaze (et ton 06 si tu veux).", "PTDR T KI ?"
];

const AVATAR_PAGE_SIZE = 10;
const AVATAR_CHOICES = [
    "😇", "😎", "🤓", "🤡", "🤠", "👽", "👻", "🤖", "💩", "💀",
    "🐵", "🐶", "🐺", "🦊", "🐱", "🦁", "🐯", "🐴", "🦄", "🐷",
    "🐸", "🐼", "🐨", "🐻", "🐔", "🐧", "🦆", "🦉", "🦇", "🐝",
    "🐢", "🐍", "🐙", "🦀", "🐬", "🐳", "🦈", "🐊", "🦖", "🐉",
    "🔥", "⚡", "💎", "🍀", "🍕", "🍔", "🌮", "🎮", "🚀", "👑"
];

const CARD_SKIN_STORAGE_KEY = 'les-termes-card-skin';
const CARD_SKINS = [
    { id: 'skin-classic', name: 'Classique', image: 'cartes/dos-carte.png' },
    { id: 'skin-kh', name: 'Royaume Coeur', image: 'cartes/dos-carte-kh.png' },
    { id: 'skin-zelda', name: 'Force Trois', image: 'cartes/dos-carte-zelda.png' },
    { id: 'skin-blanc', name: 'Pure', image: 'cartes/dos-carte-blanche.png' },
    { id: 'skin-vert', name: 'Nature', image: 'cartes/dos-carte-verte.png' },
    { id: 'skin-solaire', name: 'Solaire', image: 'cartes/dos-carte-jaune.png' },
    { id: 'skin-smash', name: 'Smash', image: 'cartes/dos-carte-smash.png' },
    { id: 'skin-lk', name: 'Roi-Liche', image: 'cartes/dos-carte-lk.png' },
    { id: 'skin-celeste', name: 'Celeste', image: 'cartes/dos-carte-celeste.png' },
];

// ─── État local (lecture seule, tout vient du serveur) ───
let MY_ID = "";
let currentRoomCode = "0000";
let players = [];
let currentReaderId = "";
let SCORE_TO_WIN = 5;
let GAME_VOTE_MODE = 'transparent';
let currentCard = null;
let cemetery = [];
let voteStats = { againstMe: {}, byMe: {} };
let isVoting = false;
// Source de vérité unique pour la phase — synchronisée depuis le serveur
let gamePhase = 'lobby';

// File d'attente pour séquencer proprement les animations ---
let cinematicQueue = Promise.resolve();
function enqueueAnimation(fn) {
    cinematicQueue = cinematicQueue.then(() => {
        // Timeout de sécurité : si l'animation ne se termine pas en 8s, on passe quand même
        const timeout = new Promise(resolve => setTimeout(resolve, 8000));
        return Promise.race([fn(), timeout]);
    }).catch(err => console.error('cinematicQueue error:', err));
}
// Timer local (cosmétique uniquement — la vraie source est le serveur)
let localTimer = 0;
let localTimerInterval = null;

// Cartes proposées au lecteur (3 choix)
let pendingThreeCards = [];

// Skin sélectionné
let selectedCardSkinId = CARD_SKINS[0].id;
let selectedAvatar = AVATAR_CHOICES[0];
let avatarPageIndex = 0;
let identitySubtitleInterval = null;
let lastIdentitySubtitleIndex = -1;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// =========================================================
// CONNEXION SOCKET
// =========================================================

const socket = io();

socket.on('connect', () => {
    MY_ID = socket.id;
});

// =========================================================
// LOBBY — Actions réseau
// =========================================================

function createRoom() {
    const pseudo = document.getElementById('input-pseudo').value.trim();
    if (!pseudo) return showNotification("Pseudo obligatoire !");

    const roomName = document.getElementById('input-room-name').value.trim() || "La Room";
    const rawPoints = parseInt(document.getElementById('input-points').value);
    const scoreToWin = isNaN(rawPoints) ? 5 : Math.min(15, Math.max(2, rawPoints));
    document.getElementById('input-points').value = scoreToWin;
    const voteMode = document.getElementById('select-vote-mode').value;
    const deck = typeof cartesJSON !== 'undefined' ? [...cartesJSON] : [];

    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    socket.emit('create_room', {
        playerData: { name: pseudo, avatar: selectedAvatar },
        roomName,
        scoreToWin,
        voteMode,
        deck
    });
}

function joinRoom() {
    const pseudo = document.getElementById('input-pseudo').value.trim();
    const code = document.getElementById('input-room-code').value.trim();
    if (!pseudo || code.length !== 4) return showNotification("Infos invalides !");

    socket.emit('join_room', {
        roomCode: code,
        playerData: { name: pseudo, avatar: selectedAvatar }
    });
}

// ─── Réponses serveur : lobby ───

socket.on('room_created', (data) => {
    currentRoomCode = data.roomCode;
    players = data.players;
    currentReaderId = data.currentReaderId;
    SCORE_TO_WIN = data.scoreToWin;
    GAME_VOTE_MODE = data.voteMode;
    gamePhase = 'lobby';
    document.getElementById('display-room-name').innerText = data.roomName;
    enterGame();
});

socket.on('room_joined', (data) => {
    currentRoomCode = data.roomCode;
    players = data.players;
    currentReaderId = data.currentReaderId;
    SCORE_TO_WIN = data.scoreToWin;
    GAME_VOTE_MODE = data.voteMode;
    gamePhase = data.phase || 'lobby';
    document.getElementById('display-room-name').innerText = data.roomName || "La Room";
    
    if (data.phase && data.phase !== 'lobby') {
        currentCard = data.currentCard;
        isVoting = data.isVoting;
    }
    
    enterGame(data.phase);
});

// NOUVELLE FONCTION : toggleRole
function toggleRole() {
    audioManager.playSound('ui-click');
    socket.emit('toggle_role', currentRoomCode);
}

socket.on('player_joined', (data) => {
    players = data.players;
    renderPlayers();
    showNotification(`${data.newPlayer.avatar} ${data.newPlayer.name} a rejoint la partie ${data.newPlayer.isSpectator ? 'comme spectateur ! 👀' : '!'}`);
});

socket.on('update_players', (data) => {
    // update_players peut être soit un tableau simple, soit un objet {players, currentReaderId}
    const serverPlayers = Array.isArray(data) ? data : data.players;
    const newReaderId = Array.isArray(data) ? null : data.currentReaderId;

    enqueueAnimation(async () => {
        players = serverPlayers;
        // Mettre à jour currentReaderId si le serveur le fournit dans cet event
        if (newReaderId != null) {
            currentReaderId = newReaderId;
        }
        renderPlayers();
        // En lobby, rafraîchir l'UI complète (bouton rôle + bouton chef)
        if (gamePhase === 'lobby') {
            prepareNextTurn();
        }
    });
});

socket.on('error_msg', (msg) => showNotification(msg));

function enterGame(phase = 'lobby') {
    audioManager.stopMusic();
    audioManager.playMusic('game', { volume: 0.02 });
    document.getElementById('lobby-screen').classList.add('hidden');
    document.getElementById('game-wrapper').classList.remove('hidden');
    updateCardSkinPickerVisibility();
    document.getElementById('room-badge').innerText = `Room: ${currentRoomCode}`;
    
    window.history.pushState({}, '', `/${currentRoomCode}`);
    
    initRoomBadgeShare();
    setTimeout(() => {
        renderPlayers();
        
        const myPlayer = players.find(p => p.id === MY_ID);
        if (myPlayer && myPlayer.isSpectator) {
            showNotification("👀 Tu as rejoint la partie en cours en tant que spectateur !");
        }
        
        if (phase === 'lobby' || phase === 'drawing' || !currentCard) {
            prepareNextTurn();
        } else {
            proceedWithChosenCard();
        }
    }, 50);
}

// =========================================================
// DÉMARRAGE DE PARTIE (bouton dans le lobby)
// =========================================================


let isGameStarting = false; 

function startGameFromLobby() {
    if (isGameStarting) return; 
    
    isGameStarting = true;
    socket.emit('start_game', currentRoomCode);

    setTimeout(() => {
        isGameStarting = false;
    }, 2000);
}

socket.on('game_started', (data) => {
    const countdownOverlay = document.getElementById('game-countdown-overlay');
    if (countdownOverlay) countdownOverlay.classList.add('hidden');
    isCountingDown = false;

    gamePhase = 'drawing';
    currentCard = null;
    isVoting = false;
    players = data.players;
    currentReaderId = data.currentReaderId;
    renderPlayers();
    prepareNextTurn();
});

function replayGame() {
    audioManager.playSound('ui-click');
    const deck = typeof cartesJSON !== 'undefined' ? [...cartesJSON] :[];
    // On mélange le deck de façon propre pour la nouvelle manche
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    socket.emit('replay_game', { roomCode: currentRoomCode, deck });
    
    // On cache l'écran de victoire uniquement pour le joueur qui a cliqué sur "Rejouer"
    document.getElementById('victory-overlay').classList.add('hidden');
    
    // Reset local des statistiques
    voteStats = { againstMe: {}, byMe: {} };
}

socket.on('game_reset_state', (data) => {
    players = data.players;
    currentReaderId = data.currentReaderId;
    gamePhase = 'lobby';
    cemetery = [];
    currentCard = null;
    isVoting = false;
    window._myVoteValidated = false;
    window._pendingVoteTarget = null;

    // Nettoyage des effets de stress résiduels
    audioManager.stopSound('heartbeat');
    document.body.classList.remove('urgent-flash');

    // Purge le texte de l'ancienne carte pour éviter le flash fantôme
    const cardCategory = document.getElementById('card-category');
    const cardText = document.getElementById('card-text');
    if (cardCategory) cardCategory.innerText = '';
    if (cardText) cardText.innerText = '';
    
    document.getElementById('cemetery-count').innerText = "0";
    document.getElementById('cemetery-cards').innerHTML = "<p class='cemetery-empty'>Aucune carte brûlée pour l'instant...</p>";
    
    renderPlayers();
    prepareNextTurn();
});
// =========================================================
// TOUR DE JEU — PIOCHE
// =========================================================

function startCardDraw() {
    if (currentReaderId !== MY_ID) return;
    audioManager.playSound('ui-click');
    socket.emit('request_draw', currentRoomCode);
}

// Le lecteur reçoit ses 3 vraies cartes
socket.on('draw_result_reader', (data) => {
    pendingThreeCards = data.cards;
    showCardSelection(data.cards);
});

// Les autres voient juste "le lecteur pioche"
socket.on('draw_result_others', () => {
    showOthersWaitingForDraw();
});

function showOthersWaitingForDraw() {
    // Animer le deck (animation de pioche visuelle)
    const deck = document.getElementById('deck');
    deck.classList.add('drawing');
    setTimeout(() => deck.classList.remove('drawing'), 800);
    showNotification(`${players.find(p => p.id === currentReaderId)?.name || 'Le lecteur'} pioche...`);
}

// ─── Overlay de sélection de carte (lecteur uniquement) ───

function showCardSelection(threeChoices) {
    const overlay = document.getElementById('card-selection-overlay');
    const container = document.getElementById('selection-container');
    const title = document.getElementById('selection-title');
    container.innerHTML = '';

    title.innerText = "À toi de choisir la pire carte...";

    threeChoices.forEach((card, index) => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'selectable-card is-reader-choice is-revealed';
        cardDiv.innerHTML = `
            <div class="card-flipper">
                <div class="card-front"></div>
                <div class="card-back">
                    <p class="card-category"># ${card.category}</p>
                    <p class="card-text">${card.text}</p>
                </div>
            </div>
        `;
        cardDiv.onclick = () => revealChosenCard(card, index);
        container.appendChild(cardDiv);
    });

    overlay.classList.remove('hidden');
}

function revealChosenCard(chosenCard, chosenIndex) {
    audioManager.playSound('card-flip', { volume: 0.2 });
    const allCards = document.querySelectorAll('#selection-container .selectable-card');
    allCards.forEach((el, i) => {
        el.onclick = null;
        if (i === chosenIndex) {
            el.classList.remove('is-revealed');
            el.classList.add('is-flipped');
        } else {
            el.style.opacity = '0.3';
            el.style.transform = 'scale(0.9)';
        }
    });

    const keptCards = pendingThreeCards.filter((_, i) => i !== chosenIndex);

    setTimeout(() => {
        document.getElementById('card-selection-overlay').classList.add('hidden');
        // Envoyer la carte choisie au serveur
        socket.emit('card_chosen', {
            roomCode: currentRoomCode,
            card: chosenCard,
            keptCards // Les 2 non-choisies retournent dans le deck serveur
        });
    }, 2000);
}

// Le serveur dit à tout le monde quelle carte a été choisie
socket.on('show_card', (data) => {
    currentCard = data.card;
    proceedWithChosenCard();
});

function proceedWithChosenCard() {
    document.getElementById('card-category').innerText = `# ${currentCard.category}`;
    document.getElementById('card-text').innerText = currentCard.text;
    document.getElementById('waiting-text').classList.add('hidden');
    document.getElementById('current-card').classList.remove('hidden');
    document.getElementById('timer-display').classList.add('hidden');
    document.getElementById('recap-display').classList.add('hidden');
    document.querySelectorAll('.avatar').forEach(el => el.classList.remove('selected-target', 'validated'));
    players.forEach(p => {
        const ptr = document.getElementById(`pointer-${p.id}`);
        if (ptr) ptr.style.opacity = '0';
    });

    if (currentReaderId === MY_ID) {
        document.getElementById('btn-start-vote').classList.remove('hidden');
        document.getElementById('not-reader-text').classList.add('hidden');
        document.getElementById('btn-validate').classList.add('hidden');
    } else {
        document.getElementById('btn-start-vote').classList.add('hidden');
        document.getElementById('not-reader-text').classList.remove('hidden');
        document.getElementById('btn-validate').classList.add('hidden');
    }
}

// =========================================================
// VOTE — Synchronisé par le serveur
// =========================================================

function startVoteTimer() {
    // Le lecteur demande au serveur de démarrer le vote
    socket.emit('start_vote', currentRoomCode);
}

// Le serveur démarre le vote pour tout le monde// Le serveur démarre le vote pour tout le monde// ====== APRÈS ======
// Le serveur démarre le vote pour tout le monde// Le serveur démarre le vote pour tout le monde
socket.on('vote_phase_start', (data) => {
    const { duration, isTieBreak, tieBreakCandidates, tieBreakExcluded } = data;

    gamePhase = 'voting';
    isVoting = true;
    localTimer = duration;
    document.getElementById('btn-start-vote').classList.add('hidden');
    document.getElementById('btn-validate').classList.add('hidden');

    const display = document.getElementById('timer-display');
    display.classList.remove('hidden');
    display.innerText = localTimer;
    display.style.color = '#e74c3c';

    // Stocker les règles de vote
    window._tieBreakCandidates = isTieBreak ? tieBreakCandidates : null;
    window._tieBreakExcluded = isTieBreak ? tieBreakExcluded :[];

    // Mise en évidence des candidats tie-break
    document.querySelectorAll('.avatar').forEach(el => el.classList.remove('tie-candidate'));
    
    const notReaderText = document.getElementById('not-reader-text');
    notReaderText.classList.remove('hidden');

    if (isTieBreak && tieBreakCandidates) {
        tieBreakCandidates.forEach(id => {
            document.getElementById(`avatar-${id}`)?.classList.add('tie-candidate');
        });

        // Gestion du message textuel selon le rôle du joueur
        const amExcluded = window._tieBreakExcluded.includes(MY_ID);
        if (amExcluded) {
            notReaderText.innerHTML = "Tu es en train de te faire juger ! Attends le verdict...";
        } else {
            const candidateNames = tieBreakCandidates.map(id => {
                const p = players.find(player => player.id === id);
                return p ? `<strong style="color:#e67e22">${p.name}</strong>` : '???';
            });
            let namesStr = "";
            if (candidateNames.length === 2) {
                namesStr = candidateNames.join(' et ');
            } else if (candidateNames.length > 2) {
                namesStr = candidateNames.slice(0, -1).join(', ') + ' et ' + candidateNames[candidateNames.length - 1];
            }
            notReaderText.innerHTML = `Tu dois départager ${namesStr} !`;
        }
    } else {
        const myPlayer = players.find(p => p.id === MY_ID);
        if (myPlayer && myPlayer.isSpectator) {
            notReaderText.innerHTML = "👀 Tu es spectateur... observe les joueurs s'entretuer.";
        } else if (myPlayer && myPlayer.isDead) {
            notReaderText.innerHTML = "👻 Tu es mort... regarde les vivants s'entretuer.";
        } else {
            notReaderText.innerHTML = "À toi de voter !";
        }
    }

    audioManager.playSound('vote-start');
});

// Le serveur envoie un tick chaque seconde
socket.on('timer_tick', (data) => {
    localTimer = data.remaining;
    const display = document.getElementById('timer-display');
    if (!display.classList.contains('hidden')) {
        display.innerText = localTimer;
        if (localTimer <= 5) {
            display.style.color = 'red';
            if (localTimer === 5) {
                audioManager.stopSound('vote-tick');
                audioManager.playSound('heartbeat', { loop: true });
            }
            const myPlayer = players.find(p => p.id === MY_ID);
            const amExcluded = window._tieBreakExcluded && window._tieBreakExcluded.includes(MY_ID);
            if (!window._myVoteValidated && !(myPlayer && (myPlayer.isDead || myPlayer.isSpectator)) && !amExcluded) {
                document.body.classList.add('urgent-flash');
            }
        } else {
            audioManager.playSound('vote-tick', { volume: 0.4 });
        }
    }
});

socket.on('timer_fast_forward', (data) => {
    localTimer = data.remaining;
    showNotification("⚡ Tout le monde a voté !");
});

// Quand un joueur pointe en mode transparent
socket.on('pointer_update', (data) => {
    if (GAME_VOTE_MODE === 'transparent') {
        showPointerVisual(data.voterId, data.targetId);
    }
});

// Clic sur un avatar pour voter
function handleVoteClick(targetId) {
    if (!isVoting) return;
    const myPlayer = players.find(p => p.id === MY_ID);
    if (myPlayer && myPlayer.isSpectator) return showNotification("👀 Tu es spectateur, tu ne peux pas voter !");
    if (myPlayer && myPlayer.isDead) return showNotification("👻 Tu es mort ! Les fantômes ne votent pas.");
    if (targetId === MY_ID) return showNotification("⛔ Pas le droit de voter pour toi !");
    const targetPlayer = players.find(p => p.id === targetId);
    if (!targetPlayer || targetPlayer.isSpectator) return showNotification("👀 C'est un spectateur, laisse-le tranquille !");
    if (!targetPlayer || targetPlayer.isDead) return showNotification("💀 On ne tire pas sur un cadavre.");
    if (window._myVoteValidated) return showNotification("🔒 Ton vote est déjà validé !");

    if (window._tieBreakCandidates) {
        if (window._tieBreakExcluded && window._tieBreakExcluded.includes(MY_ID)) {
            return showNotification("Tu es à départager, tu ne peux pas voter !");
        }
        if (!window._tieBreakCandidates.includes(targetId)) {
            return showNotification("Tu dois choisir parmi les joueurs à égalité !");
        }
    }

    // Affichage local du pointeur
    document.querySelectorAll('.avatar').forEach(el => el.classList.remove('selected-target'));
    document.getElementById(`avatar-${targetId}`)?.classList.add('selected-target');
    showPointerVisual(MY_ID, targetId);
    document.getElementById('btn-validate').classList.remove('hidden');

    // On stocke temporairement la cible (pas encore validé)
    window._pendingVoteTarget = targetId;
    if (GAME_VOTE_MODE === 'transparent') {
        socket.emit('point_target', { roomCode: currentRoomCode, targetId: targetId });
    }
}

function validateMyVote() {
    const targetId = window._pendingVoteTarget;
    if (!targetId || window._myVoteValidated) return;

    window._myVoteValidated = true;
    audioManager.playSound('vote-validate', { volume: 0.7 });
    document.getElementById('btn-validate').classList.add('hidden');
    document.body.classList.remove('urgent-flash');

    const notReaderText = document.getElementById('not-reader-text');
    if (notReaderText) {
        notReaderText.innerText = "En attente du vote des autres joueurs...";
        notReaderText.classList.remove('hidden');
    }

    socket.emit('cast_vote', { roomCode: currentRoomCode, targetId });
}

// Confirmation du serveur que mon vote est bien enregistré
socket.on('vote_registered', (data) => {
    // Déjà géré localement, rien de plus
});

// Le serveur prévient que quelqu'un a validé son vote (Cercle vert)
socket.on('player_validated', (data) => {
    const avatarEl = document.getElementById(`avatar-${data.voterId}`);
    if (avatarEl) {
        avatarEl.classList.add('validated');
    }
});

// =========================================================
// RÉSOLUTION — Résultats envoyés par le serveur
// =========================================================

socket.on('afk_players', (data) => {
    // Séquence l'animation AFK dans la file d'attente
    enqueueAnimation(async () => {
        for (const afkInfo of data.afkPlayers) {
            const player = players.find(p => p.id === afkInfo.id);
            if (!player) continue;
            
            player.afkCount = afkInfo.afkCount;
            // 💀 On sécurise l'état local avec la vérité absolue du serveur
            if (afkInfo.isDead) {
                player.isDead = true;
            }
            
            await playCinematic(player);
        }
    });
});

socket.on('round_result', (data) => {
    // On met à jour l'UI instantanément pour stopper les sons et cacher les chronos
    audioManager.stopSound('heartbeat');
    isVoting = false;
    window._myVoteValidated = false;
    window._pendingVoteTarget = null;
    document.body.classList.remove('urgent-flash');
    document.getElementById('timer-display').classList.add('hidden');
    document.getElementById('btn-validate').classList.add('hidden');

    // On séquence le résultat APRES la fin des éventuelles animations AFK
    enqueueAnimation(async () => {
        players = data.players;

        // --- CORRECTION BUG 5: Comptabilisation des statistiques (Ennemis jurés) ---
        Object.entries(data.votes).forEach(([targetId, voterIds]) => {
            voterIds.forEach(voterId => {
                if (targetId === MY_ID) {
                    voteStats.againstMe[voterId] = (voteStats.againstMe[voterId] || 0) + 1;
                }
                if (voterId === MY_ID) {
                    voteStats.byMe[targetId] = (voteStats.byMe[targetId] || 0) + 1;
                }
            });
        });

        if (GAME_VOTE_MODE === 'semi') {
            Object.entries(data.votes).forEach(([targetId, voterIds]) => {
                voterIds.forEach(voterId => showPointerVisual(voterId, targetId));
            });
        }

        if (data.type === 'loser') {
            const loser = players.find(p => p.id === data.loserId);
            const voterIds = data.votes[data.loserId] ||[];
            const voterNames = voterIds.map(id => players.find(p => p.id === id)?.name).filter(Boolean);
            const votersText = voterNames.length <= 1
                ? (voterNames[0] || '?')
                : voterNames.slice(0, -1).join(', ') + ' et ' + voterNames[voterNames.length - 1];
            const survivors = players.filter(p => !p.isDead);
            const isUnanimous = voterIds.length === survivors.length - 1 && survivors.length > 2;

            let recapMessage = "";
            const randomComment = currentCard.comments
                ? currentCard.comments[Math.floor(Math.random() * currentCard.comments.length)]
                : "";
            const punchline = randomComment?.replace(/\$pseudo/g, `<strong style="color:#e74c3c;">${loser?.name}</strong>`);

            if (GAME_VOTE_MODE === 'anonyme') {
                const countText = voterIds.length > 1 ? `${voterIds.length} personnes ont` : `1 personne a`;
                recapMessage = isUnanimous
                    ? `Tout le monde a voté (en lâche) contre <strong style="color:#e74c3c;">${loser?.name}</strong>.<br><br><em>"${punchline}"</em>`
                    : `<strong>${countText}</strong> voté en secret contre <strong style="color:#e74c3c;">${loser?.name}</strong>.`;
            } else {
                recapMessage = isUnanimous
                    ? `Tout le monde désigne <strong style="color:#e74c3c;">${loser?.name}</strong>.<br><br><em>"${punchline}"</em>`
                    : `<strong>${votersText}</strong> ${voterNames.length > 1 ? 'ont' : 'a'} voté contre <strong style="color:#e74c3c;">${loser?.name}</strong>.`;
            }

            const recapEl = document.getElementById('recap-display');
            recapEl.innerHTML = recapMessage;
            recapEl.classList.remove('hidden');

            // On attend que l'animation de transfert soit terminée avant de libérer la file d'attente
            // Timeout de sécurité à 4s pour éviter tout blocage de la file d'animation
            await Promise.race([
                new Promise(resolve => {
                    setTimeout(() => {
                        updatePlayerStack(loser, true);
                        renderPlayers();
                        playHandoverAnimation(currentReaderId, data.loserId, () => {
                            currentReaderId = data.newReaderId;
                            renderPlayers();
                            resolve();
                        });
                    }, 1000);
                }),
                new Promise(resolve => setTimeout(resolve, 4000))
            ]);
            // S'assurer que currentReaderId est bien à jour même si le timeout de sécurité s'est déclenché
            currentReaderId = data.newReaderId;
        }
    });
});

socket.on('no_votes', () => {
    isVoting = false;
    window._myVoteValidated = false;
    document.getElementById('timer-display').classList.add('hidden');
    document.body.classList.remove('urgent-flash');
    enqueueAnimation(async () => {
        showNotification("🤷 Personne n'a voté !");
        await sleep(2000);
    });
});

socket.on('all_targets_dead', () => {
    enqueueAnimation(async () => {
        showNotification("💀 Tous les joueurs ciblés sont morts ! La carte est détruite.");
        await sleep(2000);
    });
});

socket.on('general_tie', () => {
    enqueueAnimation(async () => {
        showNotification("Égalité générale. La carte est détruite !");
        await sleep(2000);
    });
});

socket.on('tie_break_start', (data) => {
    audioManager.stopSound('heartbeat');
    isVoting = false;
    window._myVoteValidated = false;
    document.getElementById('timer-display').classList.add('hidden');
    document.body.classList.remove('urgent-flash');

    document.querySelectorAll('.avatar').forEach(el => {
        el.classList.remove('selected-target', 'validated');
    });
    players.forEach(p => {
        const ptr = document.getElementById(`pointer-${p.id}`);
        if (ptr) ptr.style.opacity = '0';
    });

    enqueueAnimation(async () => {
        await triggerTieAnimation(data.tiedPlayerIds);
    });
});

socket.on('card_burned', (data) => {
    enqueueAnimation(async () => {
        cemetery.push(data.card);
        document.getElementById('cemetery-count').innerText = data.cemCount;
        renderCemetery();
        await burnCardAnimation(data.card);
    });
});

socket.on('next_round', (data) => {
    // Réinitialisation IMMÉDIATE des variables critiques — sans attendre la fin des animations
    gamePhase = 'drawing';
    isVoting = false;
    currentCard = null;
    currentReaderId = data.currentReaderId;
    window._myVoteValidated = false;
    window._pendingVoteTarget = null;
    window._tieBreakCandidates = null;
    window._tieBreakExcluded = [];
    document.body.classList.remove('urgent-flash');
    audioManager.stopSound('heartbeat');

    // Les éléments de vote sont cachés immédiatement
    document.getElementById('timer-display').classList.add('hidden');
    document.getElementById('btn-validate').classList.add('hidden');
    document.getElementById('not-reader-text').classList.add('hidden');

    // La mise à jour visuelle complète passe par la file pour rester après les animations en cours
    enqueueAnimation(async () => {
        players = data.players;
        renderPlayers();
        resetForNextRound();
    });
});

socket.on('game_over', (data) => {
    // Nettoyage immédiat des effets de stress (heartbeat peut rester actif si fin pendant vote)
    audioManager.stopSound('heartbeat');
    document.body.classList.remove('urgent-flash');

    enqueueAnimation(async () => {
        players = data.players;

        // Cas égalité : le serveur envoie winnerIds avec plusieurs IDs et winnerId = null
        const winnerIds = data.winnerIds || (data.winnerId ? [data.winnerId] : []);
        const winners = winnerIds.map(id => players.find(p => p.id === id)).filter(Boolean);

        if (winners.length === 0) return; // Sécurité : ne rien afficher si aucun gagnant résolu

        if (winners.length === 1) {
            showVictory(winners[0]);
        } else {
            showTie(winners);
        }
    });
});

socket.on('deck_empty', (data) => {
    enqueueAnimation(async () => {
        players = data.players;
        endGameBecauseDeckIsEmpty();
    });
});

socket.on('player_disconnected', (data) => {
    enqueueAnimation(async () => {
        players = data.players;
        renderPlayers();
        showNotification(`💔 ${data.playerName} a quitté la partie !`);
    });
});

socket.on('reader_changed', (data) => {
    enqueueAnimation(async () => {
        currentReaderId = data.newReaderId;
        renderPlayers();
        prepareNextTurn();
        if (gamePhase !== 'lobby') {
            const newReader = players.find(p => p.id === data.newReaderId);
            if (newReader) showNotification(`${newReader.avatar} ${newReader.name} doit maintenant piocher.`);
        } else if (data.newReaderId === MY_ID) {
            showNotification("👑 Tu es maintenant le chef de la room !");
        }
    });
});

// =========================================================
// INTERFACE — Fonctions d'affichage (inchangées)
// =========================================================

function prepareNextTurn() {
    // Si un compte à rebours de démarrage est en cours, on ne touche à rien
    if (isCountingDown) return;

    const myPlayer = players.find(p => p.id === MY_ID);
    // On s'appuie sur la phase synchronisée par le serveur
    const inLobby = (gamePhase === 'lobby');

    // Petit outil interne pour éviter les erreurs "null" et simplifier le code
    const safeToggle = (id, show) => {
        const el = document.getElementById(id);
        if (el) {
            if (show) el.classList.remove('hidden');
            else el.classList.add('hidden');
        }
        return el;
    };

    // 1. Gestion de la zone de changement de rôle (Spectateur / Joueur)
    safeToggle('role-toggle-area', inLobby);
    
    if (inLobby) {
        const btn = document.getElementById('btn-toggle-role');
        const icon = document.getElementById('role-icon');
        const text = document.getElementById('role-text');
        
        if (btn && icon && text && myPlayer) {
            if (myPlayer.isSpectator) {
                btn.classList.remove('is-active');
                icon.innerText = "👉";
                text.innerText = "Rejoindre la partie";
            } else {
                btn.classList.add('is-active');
                icon.innerText = "👀";
                text.innerText = "Passer en spectateur";
            }
        }
    }

    // 2. Gestion du texte d'attente et du bouton Chef (Lancer la partie)
    const readerName = players.find(p => p.id === currentReaderId)?.name || '...';

    if (inLobby) {
        if (currentReaderId === MY_ID) {
            safeToggle('start-controls', true);
            safeToggle('waiting-text', false);
        } else {
            safeToggle('start-controls', false);
            const wt = safeToggle('waiting-text', true);
            if (wt) wt.innerText = "En attente du chef de room...";
        }
    } else {
        safeToggle('start-controls', false);
        const wt = safeToggle('waiting-text', true);
        if (wt) {
            wt.innerHTML = `C'est à <strong>${readerName}</strong> de piocher !`;
        }
    }

    // 3. Nettoyage complet de l'interface de vote et des résultats
    const elementsToHide = [
        'current-card', 'recap-display', 'btn-start-vote', 
        'btn-validate', 'timer-display', 'not-reader-text'
    ];
    elementsToHide.forEach(id => safeToggle(id, false));

    // NOUVEAU : On cache tous les boutons Poke actifs
    document.querySelectorAll('.btn-poke').forEach(btn => btn.classList.add('hidden'));

    // Réinitialisation des états logiques de vote
    isVoting = false; 
    window._myVoteValidated = false;
    window._pendingVoteTarget = null;
    window._tieBreakCandidates = null;
    window._tieBreakExcluded = [];

    // 4. Gestion de l'état du Deck (Pioche)
    const deck = document.getElementById('deck');
    if (deck) {
        deck.classList.remove('drawing'); 
        
        if (!inLobby && currentReaderId === MY_ID) {
            deck.style.cursor = 'pointer';
            deck.style.opacity = '1';
            deck.onclick = startCardDraw;
            
            const alivePlayers = players.filter(p => !p.isDead && !p.disconnected && !p.isSpectator);
            if (alivePlayers.length < 3) {
                showNotification("⏳ En attente d'autres joueurs pour piocher...");
            } else {
                showNotification("🃏 C'est ton tour de piocher !");
            }
        } else {
            deck.style.cursor = 'default';
            deck.style.opacity = '0.6';
            deck.onclick = null;
        }
    }
}

let isCountingDown = false;

// Le socket du compte à rebours est parfait ici
socket.on('game_countdown', (data) => {
    const overlay = document.getElementById('game-countdown-overlay');
    const val = document.getElementById('countdown-val');
    overlay.classList.remove('hidden');
    document.getElementById('start-controls').classList.add('hidden');
    document.getElementById('waiting-text').classList.add('hidden');
    isCountingDown = true;
    
    let count = data.seconds;
    val.innerText = count;
    
    const interval = setInterval(() => {
        count--;
        if (count <= 0) {
            clearInterval(interval);
            overlay.classList.add('hidden');
            // Ne pas réafficher les contrôles lobby ici — attendre game_started
        } else {
            val.innerText = count;
            audioManager.playSound('vote-tick');
        }
    }, 1000);
});

socket.on('countdown_cancelled', (data) => {
    isCountingDown = false;
    const overlay = document.getElementById('game-countdown-overlay');
    if (overlay) overlay.classList.add('hidden');
    
    showNotification(`🚫 ${data.reason}`);
    
    // On réaffiche les contrôles du lobby
    prepareNextTurn();
});


function resetForNextRound() {
    document.querySelectorAll('.avatar').forEach(el => el.classList.remove('selected-target', 'validated', 'tie-candidate'));
    players.forEach(p => {
        const ptr = document.getElementById(`pointer-${p.id}`);
        if (ptr) ptr.style.opacity = '0';
    });
    prepareNextTurn();
}

window.addEventListener('resize', () => {
    if (!document.getElementById('game-wrapper').classList.contains('hidden')) {
        renderPlayers();
        restorePointers();
    }
});

function renderPlayers(radiusScale = 1, centerTargetId = null) {
    const table = document.getElementById('table');
    const w = table.clientWidth || 480;
    const h = table.clientHeight || w;
    const centerX = w / 2;
    const centerY = h / 2;
    const radius = (w / 2.5) * radiusScale;

    // 1. On sépare les joueurs actifs et les spectateurs
    const activePlayers = players.filter(p => !p.isSpectator);
    const spectators = players.filter(p => p.isSpectator);

    // 2. Rendu des joueurs actifs autour de la table
    activePlayers.forEach((p, index) => {
        const angle = (index / activePlayers.length) * Math.PI * 2;
        let x = centerX + radius * Math.cos(angle) - 45;
        let y = centerY + radius * Math.sin(angle) - 45;

        if (centerTargetId === p.id) {
            x = centerX - 45;
            y = centerY - 45;
        }

        p.centerX = x + 45;
        p.centerY = y + 45;

        let playerDiv = document.getElementById(`player-${p.id}`);
        if (!playerDiv) {
            playerDiv = document.createElement('div');
            playerDiv.className = 'player';
            playerDiv.id = `player-${p.id}`;
            playerDiv.onclick = () => handleVoteClick(p.id);
            // NOUVEAU : Ajout du bouton Poke dans le template HTML
            playerDiv.innerHTML = `
                <div class="pointer" id="pointer-${p.id}"></div>
                <div class="avatar" id="avatar-${p.id}">${p.avatar}</div>
                <button class="btn-poke hidden" id="poke-btn-${p.id}" onclick="event.stopPropagation(); sendPoke()">👉 Poke</button>
                <div class="player-name">${p.name}</div>
                <div class="player-stack" id="stack-${p.id}" onclick="event.stopPropagation(); showPlayerCards('${p.id}')"></div>
            `;
            table.appendChild(playerDiv);
        }

        // Mise à jour position
        playerDiv.style.left = `${x}px`;
        playerDiv.style.top = `${y}px`;

        // Mise à jour avatar
        const avatarEl = document.getElementById(`avatar-${p.id}`);
        if (avatarEl) {
            avatarEl.innerText = p.avatar;
            if (window._tieBreakCandidates && window._tieBreakCandidates.includes(p.id)) {
                avatarEl.classList.add('tie-candidate');
            }
        }

        // Icône lecteur
        let iconEl = playerDiv.querySelector('.reader-icon');
        if (p.id === currentReaderId && !p.isDead) {
            if (!iconEl) playerDiv.insertAdjacentHTML('afterbegin', '<div class="reader-icon">🎙️</div>');
        } else if (iconEl) {
            iconEl.remove();
        }

        // Classes état
        playerDiv.classList.remove('mutilated', 'executed', 'spectator');
        if (p.afkCount >= 2 && !p.isDead) playerDiv.classList.add('mutilated');
        if (p.isDead || p.disconnected) playerDiv.classList.add('executed');

        // Pointeur mutilé
        const pointerEl = document.getElementById(`pointer-${p.id}`);
        if (pointerEl) {
            pointerEl.classList.toggle('mutilated-pointer', p.afkCount >= 2 && !p.isDead);
        }

        updatePlayerStack(p);
    });

    // 3. Rendu des spectateurs en haut à gauche
    let spectatorsContainer = document.getElementById('spectators-container');
    if (spectatorsContainer) {
        spectatorsContainer.innerHTML = '';
        spectators.forEach(s => {
            const specDiv = document.createElement('div');
            specDiv.className = 'spectator-badge';
            specDiv.innerHTML = `<span>👀</span> <span>${s.avatar} ${s.name}</span>`;
            spectatorsContainer.appendChild(specDiv);
        });
    }

    // 4. Nettoyage des éléments DOM obsolètes
    document.querySelectorAll('.player').forEach(el => {
        const id = el.id.replace('player-', '');
        if (!activePlayers.find(p => String(p.id) === id)) el.remove();
    });
}

function restorePointers() {
    // Rien à faire : les pointeurs sont gérés par les événements serveur
}

function showPointerVisual(voterId, targetId) {
    const voter = players.find(p => p.id === voterId);
    const target = players.find(p => p.id === targetId);
    const pointer = document.getElementById(`pointer-${voterId}`);
    
    if (!pointer || !voter || !target) return;

    // 1. Calcul de l'angle cible en degrés
    const dx = target.centerX - voter.centerX;
    const dy = target.centerY - voter.centerY;
    const targetAngle = Math.atan2(dy, dx) * (180 / Math.PI);

    // 2. Récupération de l'angle actuel (ou 0 par défaut)
    // On utilise une propriété personnalisée pour suivre la rotation totale cumulée
    if (pointer._currentRotation === undefined) {
        pointer._currentRotation = 0;
    }

    const currentAngle = pointer._currentRotation;

    // 3. Calcul du chemin le plus court (Normalisation entre -180 et 180)
    // Formule : ((target - current + 180) % 360 + 360) % 360 - 180
    let delta = (targetAngle - (currentAngle % 360) + 540) % 360 - 180;
    
    // 4. Mise à jour de la rotation cumulée
    pointer._currentRotation = currentAngle + delta;

    // 5. Application du style CSS
    pointer.style.transition = "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s";
    pointer.style.transform = `rotate(${pointer._currentRotation}deg)`;
    pointer.style.opacity = '1';
}

// =========================================================
// ANIMATIONS CINEMATIQUES
// =========================================================

async function playCinematic(player) {
    const table = document.getElementById('table');
    const backdrop = document.getElementById('cinematic-backdrop');
    const leftPane = document.getElementById('left-pane');

    leftPane.classList.add('cinematic-active');
    backdrop.classList.add('active');
    table.classList.add('table-cinematic');
    document.getElementById('deck').style.opacity = '0';
    document.querySelectorAll('.player').forEach(p => p.classList.add('slow-move'));

    if (player.afkCount === 1) await animHumiliation(player);
    else if (player.afkCount === 2) await animMutilation(player);
    else if (player.afkCount >= 3) await animExecution(player);

    document.querySelectorAll('.player').forEach(p => {
        p.classList.remove('slow-move');
        p.style.transition = '';
        p.style.transform = '';
        const avatar = p.querySelector('.avatar');
        if (avatar) avatar.style.transform = '';
    });

    renderPlayers(1, null);
    table.classList.remove('table-cinematic');
    backdrop.classList.remove('active');
    leftPane.classList.remove('cinematic-active');
    document.getElementById('deck').style.opacity = '1';
    await sleep(1000);
}

async function animHumiliation(player) {
    showNotification(`${player.name} s'endort... Moquez vous de lui !`);
    const table = document.getElementById('table');
    renderPlayers(1, player.id);
    await sleep(2500);

    players.forEach(p => {
        if (p.id !== player.id && !p.isDead) showPointerVisual(p.id, player.id);
    });

    let tears = [], laughs = [];
    audioManager.playSound('humiliation');
    let tearInterval = setInterval(() => {
        const tear = document.createElement('div');
        tear.innerText = '💧';
        tear.className = 'tear-emoji';
        tear.style.left = `${player.centerX + (Math.random() - 0.5) * 60 - 15}px`;
        tear.style.top = `${player.centerY - 20}px`;
        table.appendChild(tear);
        tears.push(tear);
    }, 200);

    let laughInterval = setInterval(() => {
        const laughers = players.filter(p => p.id !== player.id && !p.isDead);
        if (!laughers.length) return;
        const laugher = laughers[Math.floor(Math.random() * laughers.length)];
        const haha = document.createElement('div');
        haha.innerText = ['HAHA!', '😂'][Math.floor(Math.random() * 2)];
        haha.className = 'haha-text';
        haha.style.left = `${laugher.centerX + (Math.random() - 0.5) * 40 - 15}px`;
        haha.style.top = `${laugher.centerY - 30 - Math.random() * 20}px`;
        table.appendChild(haha);
        laughs.push(haha);
    }, 180);

    await sleep(3500);
    clearInterval(tearInterval);
    clearInterval(laughInterval);
    tears.forEach(t => t.remove());
    laughs.forEach(l => l.remove());
    players.forEach(p => {
        const ptr = document.getElementById(`pointer-${p.id}`);
        if (ptr) ptr.style.opacity = '0';
    });
}

async function animMutilation(player) {
    showNotification(`🩸 ${player.name} se fait réveiller ! (Mutilation)`);
    const table = document.getElementById('table');
    let executioner = players.find(p => p.id === currentReaderId);
    if (!executioner || executioner.id === player.id || executioner.isDead) {
        executioner = players.find(p => p.id !== player.id && !p.isDead);
    }
    renderPlayers(1, player.id);
    await sleep(100);

    if (executioner) {
        const execDiv = document.getElementById(`player-${executioner.id}`);
        const victimDiv = document.getElementById(`player-${player.id}`);
        const centerX = (table.offsetWidth || 480) / 2;
        const centerY = (table.offsetHeight || 480) / 2;
        execDiv.style.left = `${centerX - 45 + 75}px`;
        execDiv.style.top = `${centerY - 45}px`;
        await sleep(2500);

        execDiv.classList.remove('slow-move');
        execDiv.style.transition = 'transform 0.1s cubic-bezier(0.2, 0.8, 0.8, 1)';

        for (let i = 0; i < 4; i++) {
            execDiv.style.transform = 'translateX(15px) rotate(10deg)';
            await sleep(150);
            execDiv.style.transform = 'translateX(-30px) rotate(-20deg)';
            const punchAudio = new Audio('sounds/mutilation-punch.mp3');
            punchAudio.volume = 1.0;
            punchAudio.play().catch(() => audioManager.playSound('mutilation-punch', { volume: 1.0 }));
            victimDiv.classList.add('humiliated');
            await sleep(150);
            victimDiv.classList.remove('humiliated');
        }
        execDiv.style.transform = '';
    }

    player.avatar = '🤕';
    renderPlayers(1, player.id);
}

async function animExecution(player) {
    showNotification(`💀 ${player.name} est EXÉCUTÉ !`);
    const table = document.getElementById('table');
    let executioner = players.find(p => p.id === currentReaderId);
    if (!executioner || executioner.isDead || executioner.id === player.id) {
        executioner = players.find(p => !p.isDead && p.id !== player.id);
    }
    renderPlayers(1, player.id);
    await sleep(1500);

    if (executioner) {
        const bomb = document.createElement('div');
        bomb.innerText = '💣';
        bomb.className = 'bomb-emoji';
        bomb.style.left = `${executioner.centerX - 25}px`;
        bomb.style.top = `${executioner.centerY - 25}px`;
        table.appendChild(bomb);
        audioManager.playSound('bomb-flight');
        await sleep(30); // Force le navigateur à peindre la position de départ avant la transition
        bomb.style.left = `${player.centerX - 25}px`;
        bomb.style.top = `${player.centerY - 25}px`;
        bomb.style.transform = 'rotate(1080deg)';
        await sleep(1500);
        bomb.remove();
    }
    const explosion = document.createElement('div');
    explosion.innerText = '💥';
    explosion.className = 'explosion-emoji';
    explosion.style.left = `${player.centerX - 50}px`;
    explosion.style.top = `${player.centerY - 50}px`;
    table.appendChild(explosion);
    audioManager.playSound('execution-bomb', { volume: 0.2 });
    player.isDead = true;
    renderPlayers(1, player.id);
    await sleep(1500);
    explosion.remove();
}

// =========================================================
// ANIMATIONS — Handover, Tie, Burn
// =========================================================

function playHandoverAnimation(fromId, toId, callback) {
    const layer = document.getElementById('animation-layer');
    let fromPlayer = players.find(p => p.id === fromId);
    let toPlayer = players.find(p => p.id === toId);
    if (!fromPlayer || fromPlayer.isDead) fromPlayer = players.find(p => !p.isDead);
    if (!toPlayer || !fromPlayer) { if (callback) callback(); return; }

    const animEl = document.createElement('div');
    animEl.className = 'handover-item';
    animEl.innerHTML = `<span class="handover-hand">🫴</span><img class="handover-card card-skin-image" src="${getCurrentCardSkin().image}" alt="">`;
    animEl.style.left = `${fromPlayer.centerX - 45}px`;
    animEl.style.top = `${fromPlayer.centerY - 45}px`;
    layer.appendChild(animEl);
    setTimeout(() => {
        audioManager.playSound('card-swoosh', { volume: 0.1 });
        animEl.style.left = `${toPlayer.centerX - 45}px`;
        animEl.style.top = `${toPlayer.centerY - 45}px`;
    }, 50);
    setTimeout(() => {
        animEl.remove();
        if (callback) callback();
    }, 1500);
}

async function triggerTieAnimation(tiedPlayerIds) {
    const table = document.getElementById('table');
    const backdrop = document.getElementById('cinematic-backdrop');
    const leftPane = document.getElementById('left-pane');

    leftPane.classList.add('cinematic-active');
    backdrop.classList.add('active');
    table.classList.add('table-cinematic');
    document.getElementById('deck').style.opacity = '0';
    document.querySelectorAll('.player').forEach(p => p.classList.add('slow-move'));

    tiedPlayerIds.forEach(id => {
        document.getElementById(`avatar-${id}`)?.classList.add('tie-candidate');
    });
    audioManager.playSound('tie-thunder');

    const tiedNames = tiedPlayerIds
        .map(id => players.find(p => p.id === id)).filter(Boolean)
        .map(p => `${p.avatar} ${p.name}`).join(' vs ');
    showNotification(`⚡ ÉGALITÉ ! ${tiedNames}`);

    const tiedPlayers = tiedPlayerIds.map(id => players.find(p => p.id === id)).filter(Boolean);
    const lightnings = [];
    let lightningActive = true;

    const spawnLightning = () => {
        if (!lightningActive || tiedPlayers.length < 2) return;
        const i = Math.floor(Math.random() * tiedPlayers.length);
        let j = i;
        while (j === i) j = Math.floor(Math.random() * tiedPlayers.length);
        const a = tiedPlayers[i], b = tiedPlayers[j];

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.classList.add('lightning-svg');
        svg.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:50;';

        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        defs.innerHTML = `<filter id="glow-red"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
        svg.appendChild(defs);

        const bolt = createLightningPath(a.centerX, a.centerY, b.centerX, b.centerY);
        bolt.setAttribute('stroke', '#e74c3c');
        bolt.setAttribute('stroke-width', '2.5');
        bolt.setAttribute('fill', 'none');
        bolt.setAttribute('filter', 'url(#glow-red)');
        svg.appendChild(bolt);
        table.appendChild(svg);
        lightnings.push(svg);

        let flickers = 0;
        const fi = setInterval(() => {
            bolt.style.opacity = Math.random() > 0.3 ? (0.6 + Math.random() * 0.4).toFixed(2) : '0';
            if (++flickers > 8) { clearInterval(fi); svg.remove(); }
        }, 80);

        if (lightningActive) setTimeout(spawnLightning, 150 + Math.random() * 200);
    };
    spawnLightning();

    await sleep(3500);
    lightningActive = false;
    lightnings.forEach(s => s.remove());
    tiedPlayerIds.forEach(id => document.getElementById(`avatar-${id}`)?.classList.remove('tie-candidate'));

    document.querySelectorAll('.player').forEach(p => {
        p.classList.remove('slow-move');
        p.style.transition = '';
        p.style.transform = '';
        const avatar = p.querySelector('.avatar');
        if (avatar) avatar.style.transform = '';
    });

    renderPlayers(1, null);
    table.classList.remove('table-cinematic');
    backdrop.classList.remove('active');
    leftPane.classList.remove('cinematic-active');
    document.getElementById('deck').style.opacity = '1';
    await sleep(800);
}

function createLightningPath(x1, y1, x2, y2) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const segments = 8 + Math.floor(Math.random() * 5);
    const points = [];
    const dist = Math.hypot(x2 - x1, y2 - y1) || 1;
    const perpX = -(y2 - y1) / dist;
    const perpY = (x2 - x1) / dist;
    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const px = x1 + (x2 - x1) * t;
        const py = y1 + (y2 - y1) * t;
        const offset = i === 0 || i === segments ? 0 : (Math.random() - 0.5) * 40;
        points.push(`${px + perpX * offset},${py + perpY * offset}`);
    }
    path.setAttribute('d', 'M ' + points.join(' L '));
    return path;
}

async function burnCardAnimation(card) {
    const tieOverlay = document.getElementById('tie-overlay');
    const tieCard = document.getElementById('tie-card');
    document.querySelector('#tie-overlay .tie-subtitle').innerText = "Personne n'est d'accord... La carte est détruite !";
    document.getElementById('tie-category').innerText = `# ${card.category}`;
    document.getElementById('tie-text').innerText = card.text;
    tieOverlay.classList.remove('hidden');
    const flames = [];
    for (let i = 0; i < 15; i++) {
        await sleep(50);
        const flame = document.createElement('div');
        flame.innerText = '🔥';
        flame.className = 'tie-flame';
        flame.style.left = `${10 + Math.random() * 80}%`;
        flame.style.top = `${20 + Math.random() * 60}%`;
        tieCard.appendChild(flame);
        flames.push(flame);
    }
    tieCard.classList.add('burn-animation');
    audioManager.playSound('card-burn');
    await sleep(2500);
    tieOverlay.classList.add('hidden');
    tieCard.classList.remove('burn-animation');
    flames.forEach(f => f.remove());
}

// =========================================================
// FIN DE PARTIE
// =========================================================

function endGameBecauseDeckIsEmpty() {
    if (!document.getElementById('victory-overlay').classList.contains('hidden')) return;
    const alivePlayers = players.filter(p => !p.isDead);
    const contenders = alivePlayers.length ? alivePlayers : players;
    if (!contenders.length) return;
    const bestScore = Math.max(...contenders.map(p => p.score));
    const winners = contenders.filter(p => p.score === bestScore);

    if (winners.length === 1) {
        showNotification("🃏 Plus de cartes disponibles : fin de partie !");
        showVictory(winners[0]);
        const msg = document.getElementById('victory-message');
        if (msg) msg.innerHTML = `${winners[0].avatar} <strong>${winners[0].name}</strong> remporte la partie : le deck est vide.`;
        return;
    }
    const overlay = document.getElementById('victory-overlay');
    document.getElementById('victory-title').innerHTML = "🃏 DECK VIDE 🃏";
    document.getElementById('victory-message').innerHTML = `Égalité entre ${winners.map(p => `${p.avatar} <strong>${p.name}</strong>`).join(', ')} avec ${bestScore} point${bestScore > 1 ? 's' : ''}.`;
    renderRivalrySummary();
    renderEndgameCardsSummary(winners);
    overlay.classList.remove('hidden');
}

function showVictory(winner) {
    audioManager.stopMusic();
    audioManager.playSound('victory');
    
    const myPlayer = players.find(p => p.id === MY_ID);
    const replayBtn = document.querySelector('#victory-overlay .btn-primary');
    if (myPlayer && myPlayer.isSpectator) {
        replayBtn.innerText = "Rejoindre";
    } else {
        replayBtn.innerText = "Rejouer";
    }

    document.getElementById('victory-title').innerHTML = `👑 ${winner.name} ${winner.avatar}`;
    document.getElementById('victory-message').innerHTML = `<strong>${winner.name}</strong> remporte la partie avec ${winner.score} points !`;
    renderRivalrySummary();
    renderEndgameCardsSummary(winner);
    document.getElementById('victory-overlay').classList.remove('hidden');
}

function showTie(winners) {
    audioManager.stopMusic();
    audioManager.playSound('victory');

    const myPlayer = players.find(p => p.id === MY_ID);
    const replayBtn = document.querySelector('#victory-overlay .btn-primary');
    if (myPlayer && myPlayer.isSpectator) {
        replayBtn.innerText = "Rejoindre";
    } else {
        replayBtn.innerText = "Rejouer";
    }

    const score = winners[0].score;
    const names = winners.map(w => `${w.avatar} <strong>${w.name}</strong>`).join(', ');

    document.getElementById('victory-title').innerHTML = `⚖️ ÉGALITÉ ⚖️`;
    document.getElementById('victory-message').innerHTML =
        `${names} terminent à égalité avec ${score} point${score > 1 ? 's' : ''} chacun.`;
    renderRivalrySummary();
    renderEndgameCardsSummary(winners[0]);
    document.getElementById('victory-overlay').classList.remove('hidden');
}

// =========================================================
// CARD SKIN PICKER
// =========================================================

function getCurrentCardSkin() {
    return CARD_SKINS.find(s => s.id === selectedCardSkinId) || CARD_SKINS[0];
}

function applyCardSkin(skinId) {
    const skin = CARD_SKINS.find(s => s.id === skinId) || CARD_SKINS[0];
    selectedCardSkinId = skin.id;
    localStorage.setItem(CARD_SKIN_STORAGE_KEY, skin.id);
    document.documentElement.style.setProperty('--card-back-image', `url('${skin.image}')`);
    document.querySelectorAll('.ambient-card, .floating-card, #deck img, .handover-card, #card-skin-toggle-image').forEach(img => {
        img.src = skin.image;
    });
}

function closeCardSkinMenu() {
    document.getElementById('card-skin-menu')?.classList.add('hidden');
    document.getElementById('card-skin-toggle')?.setAttribute('aria-expanded', 'false');
}

function renderCardSkinMenu() {
    const menu = document.getElementById('card-skin-menu');
    if (!menu) return;
    menu.innerHTML = CARD_SKINS.map(skin => `
        <button class="card-skin-option${skin.id === selectedCardSkinId ? ' selected' : ''}" data-skin-id="${skin.id}" type="button" role="menuitem">
            <img src="${skin.image}" alt="${skin.name}"> <span>${skin.name}</span>
        </button>
    `).join('');
}

function updateCardSkinPickerVisibility() {
    const picker = document.getElementById('card-skin-picker');
    const gameWrapper = document.getElementById('game-wrapper');
    if (!picker || !gameWrapper) return;
    picker.classList.toggle('hidden', !gameWrapper.classList.contains('hidden'));
}

function initCardSkinPicker() {
    const picker = document.getElementById('card-skin-picker');
    const toggle = document.getElementById('card-skin-toggle');
    const menu = document.getElementById('card-skin-menu');
    if (!picker || !toggle || !menu) return;

    const stored = localStorage.getItem(CARD_SKIN_STORAGE_KEY);
    if (stored && CARD_SKINS.some(s => s.id === stored)) selectedCardSkinId = stored;

    renderCardSkinMenu();
    applyCardSkin(selectedCardSkinId);
    updateCardSkinPickerVisibility();

    toggle.addEventListener('click', e => {
        e.stopPropagation();
        const willOpen = menu.classList.contains('hidden');
        if (willOpen) { menu.classList.remove('hidden'); toggle.setAttribute('aria-expanded', 'true'); }
        else closeCardSkinMenu();
    });
    menu.addEventListener('click', e => {
        const option = e.target.closest('.card-skin-option');
        if (!option) return;
        applyCardSkin(option.dataset.skinId);
        renderCardSkinMenu();
        closeCardSkinMenu();
    });
    document.addEventListener('click', e => { if (!picker.contains(e.target)) closeCardSkinMenu(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCardSkinMenu(); });
}

// =========================================================
// INIT LOBBY UI
// =========================================================

function startIdentitySubtitleRotation() {
    const el = document.getElementById('identity-subtitle');
    if (!el || identitySubtitleInterval) return;
    const pick = () => {
        let i;
        do { i = Math.floor(Math.random() * IDENTITY_SUBTITLES.length); }
        while (IDENTITY_SUBTITLES.length > 1 && i === lastIdentitySubtitleIndex);
        lastIdentitySubtitleIndex = i;
        el.textContent = IDENTITY_SUBTITLES[i];
    };
    pick();
    identitySubtitleInterval = true;
}

// =========================================================
// GESTION DU VOLUME
// =========================================================

const VOLUME_STORAGE_KEY = 'les-termes-volume';
let gameVolumes = { global: 1, music: 1, sfx: 1 };

function initVolume() {
    const stored = localStorage.getItem(VOLUME_STORAGE_KEY);
    if (stored) {
        try { gameVolumes = JSON.parse(stored); } catch(e) {}
    }
    
    // Mettre à jour l'UI
    const volGlobal = document.getElementById('vol-global');
    const volMusic = document.getElementById('vol-music');
    const volSfx = document.getElementById('vol-sfx');

    if(volGlobal) volGlobal.value = gameVolumes.global;
    if(volMusic) volMusic.value = gameVolumes.music;
    if(volSfx) volSfx.value = gameVolumes.sfx;

    updateVolumeLabel('val-global', gameVolumes.global);
    updateVolumeLabel('val-music', gameVolumes.music);
    updateVolumeLabel('val-sfx', gameVolumes.sfx);

    applyVolumes();

    // Listeners pour mettre à jour en temps réel
    if(volGlobal) volGlobal.addEventListener('input', (e) => { gameVolumes.global = parseFloat(e.target.value); updateVolumeLabel('val-global', gameVolumes.global); applyVolumes(); saveVolumes(); });
    if(volMusic) volMusic.addEventListener('input', (e) => { gameVolumes.music = parseFloat(e.target.value); updateVolumeLabel('val-music', gameVolumes.music); applyVolumes(); saveVolumes(); });
    if(volSfx) volSfx.addEventListener('input', (e) => { gameVolumes.sfx = parseFloat(e.target.value); updateVolumeLabel('val-sfx', gameVolumes.sfx); applyVolumes(); saveVolumes(); });
}

function updateVolumeLabel(id, value) {
    const el = document.getElementById(id);
    if (el) el.innerText = Math.round(value * 100) + '%';
}

function applyVolumes() {
    // Communique avec audio.js
    if (typeof audioManager !== 'undefined') {
        if (typeof audioManager.setGlobalVolume === 'function') audioManager.setGlobalVolume(gameVolumes.global);
        if (typeof audioManager.setMusicVolume === 'function') audioManager.setMusicVolume(gameVolumes.music);
        if (typeof audioManager.setSfxVolume === 'function') audioManager.setSfxVolume(gameVolumes.sfx);
    }
}

function saveVolumes() {
    localStorage.setItem(VOLUME_STORAGE_KEY, JSON.stringify(gameVolumes));
}

function openVolumeMenu() {
    audioManager.playSound('ui-click');
    document.getElementById('volume-modal').classList.remove('hidden');
}

function closeVolumeMenu() {
    audioManager.playSound('ui-click');
    document.getElementById('volume-modal').classList.add('hidden');
}


function initLobbyUI() {
    initVolume(); // <--- À AJOUTER ICI
    audioManager.playMusic('lobby');
    startIdentitySubtitleRotation();
    initCardSkinPicker();

    const pathCode = window.location.pathname.replace('/', '');
    if (pathCode.length === 4 && !isNaN(pathCode)) {

        document.getElementById('input-room-code').value = pathCode; 
        
        document.getElementById('step-home').classList.add('hidden');
        document.getElementById('step-identity').classList.remove('hidden');
        document.getElementById('identity-subtitle').innerText = "C'est quoi ton p'tit nom ?";
    }

    const pseudoInput = document.getElementById('input-pseudo');
    if (pseudoInput) pseudoInput.placeholder = PSEUDO_PLACEHOLDERS[Math.floor(Math.random() * PSEUDO_PLACEHOLDERS.length)];

    const pointsInput = document.getElementById('input-points');
    if (pointsInput) {
        pointsInput.addEventListener('keydown', e => {
            // Autoriser : chiffres (0-9), touches de contrôle (Backspace, Delete, Tab, Arrows, Home, End)
            const isDigit = e.key >= '0' && e.key <= '9';
            const isControl = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key);
            if (!isDigit && !isControl) e.preventDefault();
        });
        pointsInput.addEventListener('input', () => {
            let v = parseInt(pointsInput.value);
            if (isNaN(v)) return;
            if (v > 15) pointsInput.value = 15;
            if (v < 1) pointsInput.value = 2;
        });
        pointsInput.addEventListener('blur', () => {
            let v = parseInt(pointsInput.value);
            if (isNaN(v) || v < 2) pointsInput.value = 2;
            if (v > 15) pointsInput.value = 15;
        });
    }

    const roomInput = document.getElementById('input-room-name');
    if (roomInput) roomInput.placeholder = ROOM_NAME_PLACEHOLDERS[Math.floor(Math.random() * ROOM_NAME_PLACEHOLDERS.length)];

    const avatarPicker = document.getElementById('avatar-picker');
    const avatarNextBtn = document.getElementById('avatar-next-btn');

    const renderAvatarPage = () => {
        if (!avatarPicker) return;
        const start = avatarPageIndex * AVATAR_PAGE_SIZE;
        avatarPicker.innerHTML = AVATAR_CHOICES.slice(start, start + AVATAR_PAGE_SIZE).map(a =>
            `<div class="avatar-option${a === selectedAvatar ? ' selected' : ''}" data-value="${a}">${a}</div>`
        ).join('');
    };

    if (avatarPicker) {
        renderAvatarPage();
        avatarPicker.addEventListener('click', e => {
            if (e.target.classList.contains('avatar-option')) {
                selectedAvatar = e.target.dataset.value;
                renderAvatarPage();
            }
        });
    }
    if (avatarNextBtn) {
        avatarNextBtn.addEventListener('click', () => {
            avatarPageIndex = (avatarPageIndex + 1) % Math.ceil(AVATAR_CHOICES.length / AVATAR_PAGE_SIZE);
            renderAvatarPage();
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLobbyUI);
} else {
    initLobbyUI();
}

// =========================================================
// UTILITAIRES — Toast, Badge, Cemetery, Player Cards
// =========================================================

function showNotification(msg) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = msg;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('visible'), 10);
    setTimeout(() => { toast.classList.remove('visible'); setTimeout(() => toast.remove(), 400); }, 3500);
}

function initRoomBadgeShare() {
    const badge = document.getElementById('room-badge');
    if (!badge) return;
    badge.title = "Cliquer pour copier le lien d'invitation";
    badge.style.cursor = 'pointer';
    
    const newBadge = badge.cloneNode(true);
    badge.parentNode.replaceChild(newBadge, badge);
    
    newBadge.addEventListener('click', () => {
        const inviteLink = `${window.location.origin}/${currentRoomCode}`;
        navigator.clipboard.writeText(inviteLink).catch(() => {});
        showNotification(`🔗 Lien d'invitation copié !`);
    });
}

function updatePlayerStack(player, animate = false) {
    const stack = document.getElementById(`stack-${player.id}`);
    if (!stack) return;
    const count = player.wonCards.length;
    if (count === 0) { stack.innerHTML = ''; return; }
    const visible = Math.min(count, 4);
    stack.innerHTML = '';
    const currentSkin = getCurrentCardSkin();
    for (let i = 0; i < visible; i++) {
        const mc = document.createElement('div');
        mc.className = 'mini-card' + (animate && i === visible - 1 ? ' new-card' : '');
        mc.style.top = `${(visible - 1 - i) * 2}px`;
        mc.style.left = `${(visible - 1 - i) * 1}px`;
        mc.style.zIndex = i;
        const img = document.createElement('img');
        img.src = currentSkin.image;
        img.className = 'mini-card-img card-skin-image';
        img.alt = '';
        mc.appendChild(img);
        stack.appendChild(mc);
    }
    const badge = document.createElement('div');
    badge.className = 'stack-count';
    badge.innerText = count;
    stack.appendChild(badge);
    stack.title = `${count} carte${count > 1 ? 's' : ''} gagnée${count > 1 ? 's' : ''} — cliquer pour voir`;
}

function showPlayerCards(playerId) {
    const player = players.find(p => p.id === playerId);
    if (!player || !player.wonCards.length) return;
    const overlay = document.getElementById('player-cards-overlay');
    document.getElementById('player-cards-title').innerText = `${player.avatar} ${player.name} — ${player.wonCards.length} carte${player.wonCards.length > 1 ? 's' : ''}`;
    const container = document.getElementById('player-cards-list');
    container.innerHTML = '';
    const hand = document.createElement('div');
    hand.className = 'cards-hand';
    const n = player.wonCards.length;
    const maxAngle = Math.min(8 * (n - 1), 40);
    player.wonCards.forEach((card, i) => {
        const angle = n === 1 ? 0 : -maxAngle / 2 + (maxAngle / (n - 1)) * i;
        const lift = Math.abs(angle) * 0.8;
        const el = document.createElement('div');
        el.className = 'hand-card';
        el.style.transform = `rotate(${angle}deg) translateY(${-lift}px)`;
        el.style.zIndex = i;
        el.style.animationDelay = `${i * 60}ms`;
        el.innerHTML = `<p class="card-category"># ${card.category}</p><p class="hand-card-text">${card.text}</p>`;
        el.addEventListener('mouseenter', () => { el.style.transform = `rotate(${angle}deg) translateY(${-lift - 18}px) scale(1.06)`; el.style.zIndex = 99; });
        el.addEventListener('mouseleave', () => { el.style.transform = `rotate(${angle}deg) translateY(${-lift}px)`; el.style.zIndex = i; });
        hand.appendChild(el);
    });
    container.appendChild(hand);
    overlay.classList.remove('hidden');
}

function addToCemetery(card, reason) {
    cemetery.push({ card, reason, turn: cemetery.length + 1 });
    document.getElementById('cemetery-count').innerText = cemetery.length;
    renderCemetery();
}

function renderCemetery() {
    const container = document.getElementById('cemetery-cards');
    container.innerHTML = '';
    if (!cemetery.length) {
        container.innerHTML = "<p class='cemetery-empty'>Aucune carte brûlée pour l'instant...</p>";
        return;
    }
    [...cemetery].reverse().forEach(entry => {
        const card = entry.card || entry;
        const el = document.createElement('div');
        el.className = 'cemetery-card';
        el.innerHTML = `
            <p class="card-category"># ${card.category}</p>
            <p class="cemetery-card-text">${card.text}</p>
            <p class="cemetery-reason">Égalité — Manche ${entry.turn || ''}</p>
        `;
        container.appendChild(el);
    });
}

function toggleCemetery() {
    document.getElementById('cemetery-overlay').classList.toggle('hidden');
}

// =========================================================
// VICTOIRE — Résumés
// =========================================================

function collectVoteStats() {
    // Appel vide : les stats sont désormais gérées par les événements round_result
}

function getTopTargets(votesMap) {
    const entries = Object.entries(votesMap);
    if (!entries.length) return [];
    const maxCount = Math.max(...entries.map(([, c]) => c));
    return entries.filter(([, c]) => c === maxCount).map(([id]) => id);
}

function formatRivals(ids, fallback = "personne") {
    if (!ids.length) return fallback;
    const names = ids.map(id => players.find(p => p.id === id)).filter(Boolean).map(p => `${p.avatar} ${p.name}`);
    if (!names.length) return fallback;
    if (names.length === 1) return names[0];
    return `${names.slice(0, -1).join(', ')} et ${names[names.length - 1]}`;
}

function renderRivalrySummary() {
    const container = document.getElementById('rivalry-summary');
    if (!container) return;
    const againstMeTop = getTopTargets(voteStats.againstMe);
    const byMeTop = getTopTargets(voteStats.byMe);
    const againstMeCount = againstMeTop.length ? voteStats.againstMe[againstMeTop[0]] : 0;
    const byMeCount = byMeTop.length ? voteStats.byMe[byMeTop[0]] : 0;
    container.innerHTML = `
        <h3 class="victory-section-title">⚔️ Ennemis jurés</h3>
        <div class="rivalry-grid">
            <div class="rivalry-card">
                <p class="rivalry-label">Tu as été le plus ciblé par</p>
                <p class="rivalry-value">${formatRivals(againstMeTop)}</p>
                <p class="rivalry-count">${againstMeCount} vote${againstMeCount > 1 ? 's' : ''} contre toi</p>
            </div>
            <div class="rivalry-card">
                <p class="rivalry-label">Tu as le plus ciblé</p>
                <p class="rivalry-value">${formatRivals(byMeTop)}</p>
                <p class="rivalry-count">${byMeCount} vote${byMeCount > 1 ? 's' : ''} de ta part</p>
            </div>
        </div>
    `;
}

function renderEndgameCardsSummary(winnerOrWinners) {
    const container = document.getElementById('endgame-cards-summary');
    if (!container) return;
    // Accepte un joueur unique ou un tableau de gagnants (cas égalité)
    const winnerIds = Array.isArray(winnerOrWinners)
        ? winnerOrWinners.map(w => w.id)
        : [winnerOrWinners.id];
    const sorted = [
        ...players.filter(p => winnerIds.includes(p.id)),
        ...players.filter(p => !winnerIds.includes(p.id))
    ];
    container.innerHTML = `<h3 class="victory-section-title">🃏 Résumé des cartes</h3><div class="endgame-players-list"></div>`;
    const list = container.querySelector('.endgame-players-list');
    sorted.forEach((player, index) => {
        const isWinner = winnerIds.includes(player.id);
        const row = document.createElement('div');
        row.className = `endgame-player-row${isWinner ? ' winner-row' : ''}`;
        const cardsHTML = player.wonCards.length
            ? player.wonCards.map(c => `<div class="endgame-card"><p class="card-category"># ${c.category}</p><p class="endgame-card-text">${c.text}</p></div>`).join('')
            : `<p class="endgame-empty">Aucune carte gagnée.</p>`;
        row.innerHTML = `
            <div class="endgame-player-head">
                <div class="endgame-player-name">${player.avatar} ${player.name}${isWinner ? (winnerIds.length > 1 ? ' ⚖️' : ' 👑') : ''}</div>
                <div class="endgame-player-score">${player.score} point${player.score > 1 ? 's' : ''}</div>
            </div>
            <div class="endgame-cards-row">${cardsHTML}</div>
        `;
        list.appendChild(row);
    });
}

// =========================================================
// SYSTÈME DE POKE (Anti-AFK)
// =========================================================

socket.on('poke_enabled', (data) => {
    // On n'affiche le bouton que si on n'est PAS le lecteur visé
    if (MY_ID !== data.readerId) {
        const pokeBtn = document.getElementById(`poke-btn-${data.readerId}`);
        if (pokeBtn) pokeBtn.classList.remove('hidden');
    }
});

socket.on('execute_poke', (data) => {
    // Séquence l'animation pour éviter les conflits visuels
    enqueueAnimation(async () => {
        await playPokeAnimation(data.senderId, data.targetId);
    });
});

function sendPoke() {
    audioManager.playSound('ui-click');
    // On cache immédiatement tous les boutons pour éviter le spam
    document.querySelectorAll('.btn-poke').forEach(btn => btn.classList.add('hidden'));
    socket.emit('trigger_poke', currentRoomCode);
}

async function playPokeAnimation(senderId, targetId) {
    const sender = players.find(p => p.id === senderId);
    const target = players.find(p => p.id === targetId);
    if (!sender || !target) return;

    const table = document.getElementById('table');

    // 1. Création du doigt
    const finger = document.createElement('div');
    finger.innerText = '👉';
    finger.className = 'poke-finger';
    // Position de départ (l'envoyeur)
    finger.style.left = `${sender.centerX - 15}px`;
    finger.style.top = `${sender.centerY - 15}px`;
    table.appendChild(finger);

    // Délai vital pour que le navigateur comprenne la position de départ
    await sleep(50);

    // 2. Déplacement vers la cible (le lecteur)
    finger.style.left = `${target.centerX - 15}px`;
    finger.style.top = `${target.centerY - 15}px`;

    // On attend la durée de la transition CSS (400ms)
    await sleep(400);

    // 3. Impact
    audioManager.playSound('ui-click'); // Tu pourras changer par un son 'boing' plus tard si tu veux
    const targetAvatar = document.getElementById(`avatar-${targetId}`);
    if (targetAvatar) {
        targetAvatar.classList.add('avatar-squash');
        setTimeout(() => targetAvatar.classList.remove('avatar-squash'), 300);
    }

    // 4. Nettoyage
    finger.style.opacity = '0';
    await sleep(200);
    finger.remove();
}