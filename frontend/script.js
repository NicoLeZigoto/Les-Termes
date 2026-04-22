// =========================================================
// NOUVEAU CODE : LOGIQUE DU LOBBY
// =========================================================

// Gère la navigation de l'Accueil vers l'Étape 1
function goToIdentity() {
    audioManager.playSound('ui-click');
    document.getElementById('step-home').classList.add('hidden');
    document.getElementById('step-identity').classList.remove('hidden');
}

// Gère la navigation de l'Étape 1 vers l'Accueil
function goToHome() {
    audioManager.playSound('ui-click');
    document.getElementById('step-identity').classList.add('hidden');
    document.getElementById('step-home').classList.remove('hidden');
}

// Gère la navigation de l'Étape 2 vers l'Étape 1 (Retour)
function goToStep1() {
    audioManager.playSound('ui-click');
    document.getElementById('step-choose').classList.add('hidden');
    document.getElementById('step-identity').classList.remove('hidden');
}

// Gère la navigation de l'Étape 1 vers l'Étape 2 (Avancer)
function goToStep2() {
    audioManager.playSound('ui-click');
    const pseudoInput = document.getElementById('input-pseudo');
    
    // Vérifie si le champ est vide (ou ne contient que des espaces)
    if (!pseudoInput.value.trim()) {
        showNotification("⚠️ Hé, n'oublie pas de renseigner ton pseudo !");
        pseudoInput.focus(); // Remet le curseur sur le champ
        return; // Stoppe la fonction ici
    }
    
    document.getElementById('step-identity').classList.add('hidden');
    document.getElementById('step-choose').classList.remove('hidden');
}

// Stepper custom pour le nombre de points
function stepPoints(delta) {
    audioManager.playSound('ui-click');
    const input = document.getElementById('input-points');
    const current = parseInt(input.value) || 5;
    const next = Math.min(15, Math.max(2, current + delta));
    input.value = next;
}

// Gère la logique de la création de room
function createRoom() {
    const roomNameInput = document.getElementById('input-room-name');
    const pointsInput = document.getElementById('input-points');

    if (!roomNameInput.value.trim()) {
        showNotification("⚠️ Tu dois donner un nom à ta room !");
        roomNameInput.focus();
        return;
    }

    const points = parseInt(pointsInput.value);
    if (!points || points < 2 || points > 15) {
        showNotification("⚠️ Le score pour gagner doit être compris entre 2 et 15.");
        pointsInput.focus();
        return;
    }

    // Si tout est bon, on lance le jeu
    startGame();
}

// Gère la logique pour rejoindre une room
function joinRoom() {
    const roomCodeInput = document.getElementById('input-room-code');
    const code = roomCodeInput.value.trim();
    
    if (!code) {
        showNotification("⚠️ Tu dois entrer un code pour rejoindre tes potes.");
        roomCodeInput.focus();
        return;
    }
    
    if (code.length !== 4) {
        showNotification("⚠️ Le code de la room doit faire 4 caractères.");
        roomCodeInput.focus();
        return;
    }

    // Si tout est bon, on lance le jeu
    startGame();
}
const PSEUDO_PLACEHOLDERS =[
    "Ex: Joe Dash",
    "Ex: Le T",
    "Ex: Brakav",
    "Ex: Polux",
    "Ex: Belbit",
    "Ex: Guendoul",
    "Ex: Ricky La Pénave",
    "Ex: Jonny L'horloger",
    "Ex: Tromax",
    "Ex: Ératosthène",
    "Ex: Marluxia",
    "Ex: Xylophone",
    "Ex: Guitare ?",
    "Ex: DROP TABLE users; --force",
    "Ex: PILOTE",
    "Ex: Alphonse D'audrey de la cour des Fleurs",
    "Ex: Homme au plus gros sexe d'enfant"
];

const ROOM_NAME_PLACEHOLDERS =[
    "Soirée Raclette",
    "Le Tribunal",
    "Règlement de comptes",
    "Fin des amitiés",
    "Entre Traîtres",
    "Le Dîner de Cons",
    "Guerre Froide",
    "Bain de sang",
    "Réunion de crise",
    "Le Conseil",
    "Copains mais pas gays",
    "Con 101",
    "Sucé-En-Bris",
    "Îles du destin",
];

const IDENTITY_SUBTITLES = [
    "C'est qui ce beau gosse ?",
    "Tu viens souvent ici ?",
    "C'est quoi ton p'tit nom ?",
    "Heeeey mais qui voila !",
    "Hmmmm.. Tu viens jouer ?",
    "Balance ton blaze (et ton 06 si tu veux).",
    "PTDR T KI ?"
];
let identitySubtitleInterval = null;
let lastIdentitySubtitleIndex = -1;
const AVATAR_PAGE_SIZE = 10;
const AVATAR_CHOICES = [
    "😇", "😎", "🤓", "🤡", "🤠", "👽", "👻", "🤖", "💩", "💀",
    "🐵", "🐶", "🐺", "🦊", "🐱", "🦁", "🐯", "🐴", "🦄", "🐷",
    "🐸", "🐼", "🐨", "🐻", "🐔", "🐧", "🦆", "🦉", "🦇", "🐝",
    "🐢", "🐍", "🐙", "🦀", "🐬", "🐳", "🦈", "🐊", "🦖", "🐉",
    "🔥", "⚡", "💎", "🍀", "🍕", "🍔", "🌮", "🎮", "🚀", "👑"
];
let avatarPageIndex = 0;
let selectedAvatar = AVATAR_CHOICES[0];
let currentRoomCode = "0000";
const CARD_SKIN_STORAGE_KEY = 'les-termes-card-skin';
const CARD_SKINS = [
    // Mets ici les noms exacts de tes fichiers images
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
let selectedCardSkinId = CARD_SKINS[0].id;

function getCurrentCardSkin() {
    return CARD_SKINS.find(skin => skin.id === selectedCardSkinId) || CARD_SKINS[0];
}

function applyCardSkin(skinId) {
    const targetSkin = CARD_SKINS.find(skin => skin.id === skinId) || CARD_SKINS[0];
    selectedCardSkinId = targetSkin.id;
    localStorage.setItem(CARD_SKIN_STORAGE_KEY, selectedCardSkinId);

    // Met à jour la variable CSS pour les fonds de cartes
    document.documentElement.style.setProperty('--card-back-image', `url('${targetSkin.image}')`);

    // Met à jour les images du jeu, MAIS on a retiré ".card-skin-option img" de la liste ci-dessous
    document.querySelectorAll('.ambient-card, .floating-card, #deck img, .handover-card, #card-skin-toggle-image').forEach((img) => {
        img.src = targetSkin.image;
    });
}

function closeCardSkinMenu() {
    const menu = document.getElementById('card-skin-menu');
    const toggle = document.getElementById('card-skin-toggle');
    if (!menu || !toggle) return;
    menu.classList.add('hidden');
    toggle.setAttribute('aria-expanded', 'false');
}

function renderCardSkinMenu() {
    const menu = document.getElementById('card-skin-menu');
    if (!menu) return;
    
    menu.innerHTML = CARD_SKINS.map((skin) => `
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

    const storedSkinId = localStorage.getItem(CARD_SKIN_STORAGE_KEY);
    if (storedSkinId && CARD_SKINS.some(skin => skin.id === storedSkinId)) {
        selectedCardSkinId = storedSkinId;
    }

    renderCardSkinMenu();
    applyCardSkin(selectedCardSkinId);
    updateCardSkinPickerVisibility();

    toggle.addEventListener('click', (event) => {
        event.stopPropagation();
        const willOpen = menu.classList.contains('hidden');
        if (willOpen) {
            menu.classList.remove('hidden');
            toggle.setAttribute('aria-expanded', 'true');
        } else {
            closeCardSkinMenu();
        }
    });

    menu.addEventListener('click', (event) => {
        const option = event.target.closest('.card-skin-option');
        if (!option) return;
        const skinId = option.dataset.skinId;
        applyCardSkin(skinId);
        renderCardSkinMenu();
        closeCardSkinMenu();
    });

    document.addEventListener('click', (event) => {
        if (!picker.contains(event.target)) closeCardSkinMenu();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeCardSkinMenu();
    });
}

function startIdentitySubtitleRotation() {
    const subtitleEl = document.getElementById('identity-subtitle');
    if (!subtitleEl || identitySubtitleInterval) return;

    const pickNextSubtitle = () => {
        if (IDENTITY_SUBTITLES.length === 0) return;
        let nextIndex = 0;
        do {
            nextIndex = Math.floor(Math.random() * IDENTITY_SUBTITLES.length);
        } while (IDENTITY_SUBTITLES.length > 1 && nextIndex === lastIdentitySubtitleIndex);

        lastIdentitySubtitleIndex = nextIndex;
        subtitleEl.textContent = IDENTITY_SUBTITLES[nextIndex];
    };

    pickNextSubtitle();
    identitySubtitleInterval = true;
}

function initLobbyUI() {
    audioManager.playMusic('lobby');
    startIdentitySubtitleRotation();
    initCardSkinPicker();

    const pseudoInput = document.getElementById('input-pseudo');
    if (pseudoInput) {
        const randomPlaceholder = PSEUDO_PLACEHOLDERS[Math.floor(Math.random() * PSEUDO_PLACEHOLDERS.length)];
        pseudoInput.placeholder = randomPlaceholder;
    }

    const roomNameInput = document.getElementById('input-room-name');
    if (roomNameInput) {
        const randomRoom = ROOM_NAME_PLACEHOLDERS[Math.floor(Math.random() * ROOM_NAME_PLACEHOLDERS.length)];
        roomNameInput.placeholder = randomRoom;
    }

    const avatarPicker = document.getElementById('avatar-picker');
    const avatarNextBtn = document.getElementById('avatar-next-btn');

    const renderAvatarPage = () => {
        if (!avatarPicker) return;
        const pageCount = Math.ceil(AVATAR_CHOICES.length / AVATAR_PAGE_SIZE);
        const start = avatarPageIndex * AVATAR_PAGE_SIZE;
        const currentPageAvatars = AVATAR_CHOICES.slice(start, start + AVATAR_PAGE_SIZE);

        avatarPicker.innerHTML = currentPageAvatars.map((avatar) => `
            <div class="avatar-option${avatar === selectedAvatar ? ' selected' : ''}" data-value="${avatar}">${avatar}</div>
        `).join('');

        if (avatarNextBtn) {
            avatarNextBtn.title = `Page suivante (${avatarPageIndex + 1}/${pageCount})`;
        }
    };

    if (avatarPicker) {
        renderAvatarPage();

        avatarPicker.addEventListener('click', (event) => {
            const target = event.target;
            if (target.classList.contains('avatar-option')) {
                selectedAvatar = target.dataset.value;
                renderAvatarPage();
            }
        });
    }

    if (avatarNextBtn) {
        avatarNextBtn.addEventListener('click', () => {
            const pageCount = Math.ceil(AVATAR_CHOICES.length / AVATAR_PAGE_SIZE);
            avatarPageIndex = (avatarPageIndex + 1) % pageCount;
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
// CODE ORIGINAL : LOGIQUE DU JEU (Corrigé par nous)
// =========================================================

const MY_ID = 99;
let SCORE_TO_WIN = 5;
let GAME_VOTE_MODE = 'transparent';
let currentReaderId = MY_ID;

let players =[
    { id: 1, name: "Philippe", avatar: "🧦", score: 0, afkCount: 0, isDead: false, wonCards: [] },
    { id: 2, name: "Mathieu", avatar: "🇵🇹", score: 0, afkCount: 0, isDead: false, wonCards: [] },
    { id: 3, name: "Quentin", avatar: "🔉", score: 0, afkCount: 0, isDead: false, wonCards: [] },
    { id: 4, name: "Benjamin", avatar: "🙉", score: 0, afkCount: 0, isDead: false, wonCards: [] }
];

let deckCards = typeof cartesJSON !== 'undefined' ? cartesJSON : [];
let isVoting = false;
let isChoosingCard = false;
let timerInterval;
let currentTimer = 0;
let currentCard = null;
let currentSelections = {}; 
let validatedVotes = {};    
let cemetery = []; // Cartes brûlées
let voteStats = {
    againstMe: {},
    byMe: {}
};

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// Cette fonction est maintenant appelée par createRoom() ou joinRoom()
function startGame() {
    audioManager.stopMusic(); 
    audioManager.playMusic('game', { volume: 0.02 }); 
    const pseudo = document.getElementById('input-pseudo').value || "Moi";
    // Récupère la valeur de l'avatar sélectionné
    const avatar = selectedAvatar;
    
    // Récupère les paramètres de la room
    SCORE_TO_WIN = parseInt(document.getElementById('input-points').value) || 5;
    GAME_VOTE_MODE = document.getElementById('select-vote-mode').value;
    const inputRoomCode = (document.getElementById('input-room-code').value || '').trim();
    currentRoomCode = inputRoomCode || String(Math.floor(1000 + Math.random() * 9000));

    players.push({ id: MY_ID, name: pseudo, avatar: avatar, score: 0, afkCount: 0, isDead: false, wonCards: [] });

    document.getElementById('lobby-screen').classList.add('hidden');
    document.getElementById('game-wrapper').classList.remove('hidden');
    updateCardSkinPickerVisibility();
    document.getElementById('room-badge').innerText = `Room: ${currentRoomCode}`;
    initRoomBadgeShare();
    // Le deck utilise une image, pas besoin de mettre à jour le texte

    setTimeout(() => {
        renderPlayers();
        prepareNextTurn();
    }, 50);
}

window.addEventListener('resize', () => {
    if (!document.getElementById('game-wrapper').classList.contains('hidden')) {
        renderPlayers();
        restorePointers();
    }
});

function renderPlayers(radiusScale = 1, centerTargetId = null) {
    const table = document.getElementById('table');
    // clientWidth/clientHeight correspondent mieux au repère de positionnement
    // des éléments absolus (sans l'épaisseur de bordure), ce qui recentre le cercle.
    const w = table.clientWidth || 480;
    const h = table.clientHeight || w;
    const centerX = w / 2; 
    const centerY = h / 2;
    // MODIFICATION ICI : Le rayon est réduit pour que les joueurs soient plus centrés
    const radius = (w / 2.5) * radiusScale; 

    players.forEach((p, index) => {
        let playerDiv = document.getElementById(`player-${p.id}`);
        
        if (!playerDiv) {
            playerDiv = document.createElement('div');
            playerDiv.className = 'player';
            playerDiv.id = `player-${p.id}`;
            table.appendChild(playerDiv);
            playerDiv.onclick = () => handleVoteClick(p.id);
            
            playerDiv.innerHTML = `
                <div class="pointer" id="pointer-${p.id}"></div>
                <div class="avatar" id="avatar-${p.id}">${p.avatar}</div>
                <div class="player-name">${p.name}</div>
                <div class="player-stack" id="stack-${p.id}" onclick="event.stopPropagation(); showPlayerCards(${p.id})"></div>
            `;
        }

        const angle = (index / players.length) * Math.PI * 2;
        let x = centerX + radius * Math.cos(angle) - 45; 
        let y = centerY + radius * Math.sin(angle) - 45;

        if (centerTargetId === p.id) {
            x = centerX - 45;
            y = centerY - 45;
        }

        p.centerX = x + 45;
        p.centerY = y + 45;

        playerDiv.style.left = `${x}px`;
        playerDiv.style.top = `${y}px`;

        document.getElementById(`avatar-${p.id}`).innerText = p.avatar;
        updatePlayerStack(p);

        let iconEl = playerDiv.querySelector('.reader-icon');
        if (p.id === currentReaderId && !p.isDead) {
            if (!iconEl) playerDiv.insertAdjacentHTML('afterbegin', '<div class="reader-icon">🎙️</div>');
        } else if (iconEl) {
            iconEl.remove();
        }

        playerDiv.classList.remove('mutilated', 'executed');
        if (p.afkCount >= 2 && !p.isDead) playerDiv.classList.add('mutilated');
        if (p.isDead) playerDiv.classList.add('executed');
        
        const pointerEl = document.getElementById(`pointer-${p.id}`);
        if (pointerEl) {
            pointerEl.classList.toggle('mutilated-pointer', p.afkCount >= 2 && !p.isDead);
        }
    });
}

function restorePointers() {
    for (const[voterId, targetId] of Object.entries(currentSelections)) {
        let shouldShow = false;
        if (GAME_VOTE_MODE === 'transparent') shouldShow = true;
        if (parseInt(voterId) === MY_ID) shouldShow = true;
        if (GAME_VOTE_MODE === 'semi' && !isVoting && validatedVotes[voterId]) shouldShow = true;
        if (shouldShow) showPointerVisual(parseInt(voterId), targetId);
    }
}

function showNotification(message) {
    audioManager.playSound('ui-pop', { volume: 0.5 }); 
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

async function copyTextToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return;
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
}

function initRoomBadgeShare() {
    const roomBadge = document.getElementById('room-badge');
    if (!roomBadge || roomBadge.dataset.shareReady === 'true') return;

    roomBadge.style.cursor = 'pointer';
    roomBadge.title = 'Cliquer pour copier le lien de la room';

    roomBadge.addEventListener('click', async () => {
        const placeholderRoomLink = `https://les-termes.app/room/${currentRoomCode}`;
        try {
            await copyTextToClipboard(placeholderRoomLink);
            showNotification('Lien vers la room copiée');
        } catch (error) {
            showNotification('Impossible de copier le lien');
        }
    });

    roomBadge.dataset.shareReady = 'true';
}

function prepareNextTurn() {
    let reader = players.find(p => p.id === currentReaderId);
    if (!reader || reader.isDead) {
        const survivors = players.filter(p => !p.isDead);
        if (survivors.length <= 1) return;
        reader = survivors[0];
        currentReaderId = reader.id;
        renderPlayers();
    }

    document.getElementById('reader-name').innerText = reader.name;
    document.getElementById('deck').style.pointerEvents = (currentReaderId === MY_ID) ? 'auto' : 'none';

    if (deckCards.length === 0) {
        endGameBecauseDeckIsEmpty();
        return;
    }

    if (currentReaderId !== MY_ID) {
        setTimeout(() => botDrawCard(), 2000);
    }
}

function startCardDraw() {
    if (isVoting || isChoosingCard) return;
    if (currentReaderId !== MY_ID) return; // sécurité : seul le lecteur actif peut piocher
    if (deckCards.length === 0) {
        endGameBecauseDeckIsEmpty();
        return;
    }
    audioManager.playSound('card-draw', { volume: 0.8 }); 
    isChoosingCard = true;
    document.getElementById('deck').style.pointerEvents = 'none';
    drawCards();
}

function botDrawCard() {
    if (isVoting || isChoosingCard) return;
    if (deckCards.length === 0) {
        endGameBecauseDeckIsEmpty();
        return;
    }
    audioManager.playSound('card-draw', { volume: 0.5 }); 
    isChoosingCard = true;
    drawCards();
}

function drawCards() {
    const threeChoices = [];
    const deckCopy = [...deckCards];
    for (let i = 0; i < 3; i++) {
        if (deckCopy.length === 0) break;
        const randomIndex = Math.floor(Math.random() * deckCopy.length);
        threeChoices.push(deckCopy.splice(randomIndex, 1)[0]);
    }

    const overlay = document.getElementById('card-selection-overlay');
    const container = document.getElementById('selection-container');
    const title = document.getElementById('selection-title');
    container.innerHTML = ''; 

    const isReader = currentReaderId === MY_ID;
    title.innerText = isReader ? "À toi de choisir la pire carte..." : "Le lecteur choisit une carte...";

    threeChoices.forEach((card, index) => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'selectable-card';
        cardDiv.innerHTML = `
            <div class="card-flipper">
                <div class="card-front"></div>
                <div class="card-back">
                    <p class="card-category"># ${card.category}</p>
                    <p class="card-text">${card.text}</p>
                </div>
            </div>
        `;
        
        if (isReader) {
            cardDiv.classList.add('is-reader-choice', 'is-revealed');
            cardDiv.onclick = () => revealChosenCard(card, index);
        }
        
        container.appendChild(cardDiv);
    });

    overlay.classList.remove('hidden');

    if (!isReader) {
        setTimeout(() => {
            const randomChoiceIndex = Math.floor(Math.random() * threeChoices.length);
            revealChosenCard(threeChoices[randomChoiceIndex], randomChoiceIndex);
        }, 3000);
    }
}

function revealChosenCard(chosenCard, chosenIndex) {
    currentCard = chosenCard;
    let selectedDeckIndex = deckCards.indexOf(chosenCard);
    if (selectedDeckIndex === -1) {
        selectedDeckIndex = deckCards.findIndex(card => card.text === chosenCard.text && card.category === chosenCard.category);
    }
    if (selectedDeckIndex !== -1) {
        deckCards.splice(selectedDeckIndex, 1);
    }

    const allSelectableCards = document.querySelectorAll('#selection-container .selectable-card');
    allSelectableCards.forEach((cardEl, index) => {
        cardEl.onclick = null;
        if (index === chosenIndex) {
            audioManager.playSound('card-flip', { volume: 0.2 }); 
            cardEl.classList.remove('is-revealed');
            cardEl.classList.add('is-flipped');
        } else {
            cardEl.style.opacity = '0.3';
            cardEl.style.transform = 'scale(0.9)';
        }
    });

    setTimeout(() => {
        document.getElementById('card-selection-overlay').classList.add('hidden');
        proceedWithChosenCard();
        isChoosingCard = false;
        // Le deck reste désactivé jusqu'au prochain tour (géré par prepareNextTurn)
    }, 2000);
}

function endGameBecauseDeckIsEmpty() {
    if (!document.getElementById('victory-overlay').classList.contains('hidden')) return;

    const alivePlayers = players.filter(p => !p.isDead);
    const contenders = alivePlayers.length ? alivePlayers : players;
    if (contenders.length === 0) return;

    const bestScore = Math.max(...contenders.map(p => p.score));
    const winners = contenders.filter(p => p.score === bestScore);

    if (winners.length === 1) {
        const winner = winners[0];
        showNotification("🃏 Plus de cartes disponibles : fin de partie !");
        showVictory(winner);
        const msg = document.getElementById('victory-message');
        if (msg) {
            msg.innerHTML = `${winner.avatar} <strong>${winner.name}</strong> remporte la partie : le deck est vide.`;
        }
        return;
    }

    const overlay = document.getElementById('victory-overlay');
    const title = document.getElementById('victory-title');
    const msg = document.getElementById('victory-message');

    title.innerHTML = "🃏 DECK VIDE 🃏";
    msg.innerHTML = `Égalité en tête entre ${winners.map(p => `${p.avatar} <strong>${p.name}</strong>`).join(", ")} avec ${bestScore} point${bestScore > 1 ? "s" : ""}.`;
    renderRivalrySummary();
    renderEndgameCardsSummary(winners[0]);
    overlay.classList.remove('hidden');
    showNotification("🃏 Plus de cartes disponibles : fin de partie !");
}

function proceedWithChosenCard() {
    currentSelections = {};
    validatedVotes = {};
    document.querySelectorAll('.avatar').forEach(el => el.classList.remove('selected-target', 'validated'));
    
    document.getElementById('card-category').innerText = `# ${currentCard.category}`;
    document.getElementById('card-text').innerText = currentCard.text;
    
    document.getElementById('waiting-text').classList.add('hidden');
    document.getElementById('current-card').classList.remove('hidden');
    
    if (currentReaderId === MY_ID) {
        document.getElementById('btn-start-vote').classList.remove('hidden');
        document.getElementById('not-reader-text').classList.add('hidden');
    } else {
        document.getElementById('btn-start-vote').classList.add('hidden');
        document.getElementById('not-reader-text').classList.remove('hidden');
        setTimeout(() => startVoteTimer(), 2000);
    }
}

function startVoteTimer() {
    audioManager.playSound('vote-start'); 
    isVoting = true;
    currentTimer = 15;
    
    document.getElementById('btn-start-vote').classList.add('hidden'); 
    document.getElementById('not-reader-text').classList.add('hidden'); 
    
    const display = document.getElementById('timer-display');
    display.classList.remove('hidden'); 
    display.innerText = currentTimer;
    display.style.color = '#e74c3c'; 
    
    triggerAIVotes();

    timerInterval = setInterval(() => {
        currentTimer--;
        display.innerText = currentTimer;

        if (currentTimer > 5) { 
            audioManager.playSound('vote-tick', { volume: 0.4 }); 
        } else {
            display.style.color = "red";
            if (currentTimer === 5) {
                audioManager.stopSound('vote-tick'); // Coupe complètement le tick avant le heartbeat
                audioManager.playSound('heartbeat', { loop: true }); 
            }
            const myPlayer = players.find(p => p.id === MY_ID);
            if (!validatedVotes[MY_ID] && !(myPlayer && myPlayer.isDead)) {
                document.body.classList.add('urgent-flash');
            }
        }
        if (currentTimer <= 0) {
            handleTimeOut(); 
        }
    }, 1000);
}

function handleVoteClick(targetId) {
    if (!isVoting) return;
    const myPlayer = players.find(p => p.id === MY_ID);
    if (myPlayer && myPlayer.isDead) return showNotification("👻 Tu es mort ! Les fantômes ne votent pas.");
    if (targetId === MY_ID) return showNotification("⛔ Pas le droit de voter pour toi !");
    const targetPlayer = players.find(p => p.id === targetId);
    if (targetPlayer.isDead) return showNotification("💀 On ne tire pas sur un cadavre, il est exécuté.");
    if (validatedVotes[MY_ID]) return showNotification("🔒 Ton vote est déjà validé !");

    // En mode tie-break
    if (window._tieBreakCandidates) {
        // Si je suis un des 2 joueurs à départager (égalité 2v2), je ne peux pas voter
        if (window._tieBreakExcluded && window._tieBreakExcluded.includes(MY_ID)) {
            return showNotification("Tu es à départager, tu ne peux pas voter !");
        }
        // On ne peut voter que pour les candidats à l'égalité
        if (!window._tieBreakCandidates.includes(targetId)) {
            return showNotification("Tu dois choisir parmi les joueurs à égalité !");
        }
    }
    
    currentSelections[MY_ID] = targetId;
    document.querySelectorAll('.avatar').forEach(el => el.classList.remove('selected-target'));
    document.getElementById(`avatar-${targetId}`).classList.add('selected-target');
    showPointerVisual(MY_ID, targetId);
    document.getElementById('btn-validate').classList.remove('hidden');
}

function showPointerVisual(voterId, targetId) {
    const voter = players.find(p => p.id === voterId);
    const target = players.find(p => p.id === targetId);
    const pointer = document.getElementById(`pointer-${voterId}`);
    if(!pointer) return;

    const dx = target.centerX - voter.centerX;
    const dy = target.centerY - voter.centerY;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    
    pointer.style.transform = `rotate(${angle}deg)`;
    pointer.style.opacity = '1';
}

function validateMyVote() {
    const myPlayer = players.find(p => p.id === MY_ID);
    if (myPlayer && myPlayer.isDead) return;
    if(!currentSelections[MY_ID]) return;
    validatedVotes[MY_ID] = currentSelections[MY_ID];

    audioManager.playSound('vote-validate', { volume: 0.7 }); 
    
    document.getElementById('btn-validate').classList.add('hidden');
    document.getElementById(`avatar-${MY_ID}`).classList.add('validated');
    document.body.classList.remove('urgent-flash');
    
    checkFastForward();
}

function triggerAIVotes() {
    players.forEach(p => {
        if (p.id === MY_ID || p.isDead) return;
        const thinkDelay = Math.floor(Math.random() * 8000) + 2000;
        setTimeout(() => {
            if (!isVoting || validatedVotes[p.id]) return;
            const possibleTargets = players.filter(t => t.id !== p.id && !t.isDead);
            if (possibleTargets.length === 0) return;
            const target = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
            currentSelections[p.id] = target.id;
            
            if (GAME_VOTE_MODE === 'transparent') {
                showPointerVisual(p.id, target.id);
            }
            
            setTimeout(() => {
                if (!isVoting) return;
                validatedVotes[p.id] = target.id;
                document.getElementById(`avatar-${p.id}`).classList.add('validated');
                checkFastForward();
            }, 1000);
        }, thinkDelay);
    });
}

function checkFastForward() {
    const alivePlayersCount = players.filter(p => !p.isDead).length;
    if (Object.keys(validatedVotes).length === alivePlayersCount) {
        if (currentTimer > 5) currentTimer = 5; 
    }
}

async function handleTimeOut() {
    clearInterval(timerInterval);
    audioManager.stopSound('heartbeat'); 
    isVoting = false;
    document.body.classList.remove('urgent-flash');
    document.getElementById('btn-validate').classList.add('hidden');
    document.getElementById('timer-display').classList.add('hidden');
    let afkPlayers = players.filter(p => !p.isDead && !validatedVotes[p.id]);
    
    if (afkPlayers.length > 0) {
        for (let p of afkPlayers) {
            p.afkCount++;
            await playCinematic(p);
        }
    }
    proceedToResolution();
}

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
        p.style.transition = ""; 
        p.style.transform = "";
        const avatar = p.querySelector('.avatar');
        if(avatar) avatar.style.transform = "";
    });

    renderPlayers(1, null); 
    table.classList.remove('table-cinematic');
    backdrop.classList.remove('active');
    leftPane.classList.remove('cinematic-active');
    document.getElementById('deck').style.opacity = '1';
    await sleep(1000); 
}

// ANIMATION 1 : HUMILIATION (AVEC les pointeurs)
async function animHumiliation(player) {
    showNotification(`${player.name} s'endort... Moquez vous de lui !`);
    const table = document.getElementById('table');
    renderPlayers(1, player.id);
    await sleep(2500);

    // Les autres joueurs pointent la victime
    players.forEach(p => {
        if (p.id !== player.id && !p.isDead) {
            showPointerVisual(p.id, player.id);
        }
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
        if (laughers.length === 0) return;
        const laugher = laughers[Math.floor(Math.random() * laughers.length)];
        const haha = document.createElement('div');
        haha.innerText = ['HAHA!', '😂'][Math.floor(Math.random()*2)];
        haha.className = 'haha-text';
        haha.style.left = `${laugher.centerX + (Math.random()-0.5)*40 - 15}px`;
        haha.style.top = `${laugher.centerY - 30 - Math.random()*20}px`;
        table.appendChild(haha);
        laughs.push(haha);
    }, 180);

    await sleep(3500);
    clearInterval(tearInterval);
    clearInterval(laughInterval);
    tears.forEach(t => t.remove());
    laughs.forEach(l => l.remove());
    
    // Nettoyage des pointeurs
    players.forEach(p => {
        const ptr = document.getElementById(`pointer-${p.id}`);
        if(ptr) ptr.style.opacity = '0';
    });
}

// ANIMATION 2 : MUTILATION (SANS les pointeurs)
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
        execDiv.style.transition = "transform 0.1s cubic-bezier(0.2, 0.8, 0.8, 1)";
        
        for (let i = 0; i < 4; i++) {
            // 1. Le bourreau lève le bras
            execDiv.style.transform = "translateX(15px) rotate(10deg)";
            await sleep(150);
            
            // 2. Le bourreau FRAPPE — son joué via new Audio() pour chaque coup
            execDiv.style.transform = "translateX(-30px) rotate(-20deg)";
            const punchAudio = new Audio('sounds/mutilation-punch.mp3');
            punchAudio.volume = 1.0;
            punchAudio.play().catch(() => audioManager.playSound('mutilation-punch', { volume: 1.0 }));
            victimDiv.classList.add('humiliated');
            
            await sleep(150);
            victimDiv.classList.remove('humiliated');
        }
        execDiv.style.transform = "";
    }

    player.avatar = '🤕';
    // On s'assure de bien re-render le joueur avec son nouvel avatar
    renderPlayers(1, player.id); 
    await sleep(800);
}

// ANIMATION 3 : EXECUTION
async function animExecution(player) {
    showNotification(`☠️ ${player.name} est EXÉCUTÉ !`);
    const table = document.getElementById('table');
    let executioner = players.find(p => p.id === currentReaderId);
    if (!executioner || executioner.id === player.id || executioner.isDead) {
        executioner = players.find(p => p.id !== player.id && !p.isDead);
    }
    renderPlayers(1, player.id);
    await sleep(2500);
    if (executioner) {
        const bomb = document.createElement('div');
        bomb.innerText = '💣';
        bomb.className = 'bomb-emoji';
        bomb.style.left = `${executioner.centerX - 25}px`;
        bomb.style.top = `${executioner.centerY - 25}px`;
        table.appendChild(bomb);
        audioManager.playSound('bomb-flight'); // Son lancé AVANT le délai pour accompagner le vol
        bomb.style.left = `${player.centerX - 25}px`;
        bomb.style.top = `${player.centerY - 25}px`;
        bomb.style.transform = `rotate(1080deg)`;
        await sleep(1500);
        bomb.remove();
    }
    const explosion = document.createElement('div');
    explosion.innerText = '💥';
    explosion.className = 'explosion-emoji';
    explosion.style.left = `${player.centerX - 50}px`;
    explosion.style.top = `${player.centerY - 50}px`;
    table.appendChild(explosion);
    audioManager.playSound('execution-bomb', { volume: 0.2 }); // ✅ Syntaxe corrigée 
    player.isDead = true; 
    renderPlayers(1, player.id);
    await sleep(1500);
    explosion.remove();
}

function proceedToResolution() {
    audioManager.stopSound('heartbeat');  
    collectVoteStats();
    const survivors = players.filter(p => !p.isDead);
    if (survivors.length <= 1) {
        showNotification("💀 Tout le monde est mort (ou presque)... Fin de la partie !");
        return setTimeout(() => location.reload(), 4000);
    }
    if (GAME_VOTE_MODE === 'semi') {
        for (const[voterId, targetId] of Object.entries(validatedVotes)) {
            showPointerVisual(parseInt(voterId), targetId);
        }
    }
    let voteCounts = {};
    let totalVotes = 0;
    Object.values(validatedVotes).forEach(targetId => {
        voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
        totalVotes++;
    });
    if (totalVotes === 0) {
        showNotification(`🤷‍♂️ Personne n'a voté !`);
        return resetForNextRound();
    }
    let maxVotes = 0;
    let losers = [];
    for (const [id, count] of Object.entries(voteCounts)) {
        if (count > maxVotes) {
            maxVotes = count;
            losers = [parseInt(id)];
        } else if (count === maxVotes) {
            losers.push(parseInt(id));
        }
    }

    // --- CORRECTION BUG : Ignorer les joueurs exécutés ---
    let aliveLosers = losers.filter(id => {
        const p = players.find(player => player.id === id);
        return p && !p.isDead;
    });

    if (aliveLosers.length === 0) {
        showNotification("💀 Tous les joueurs ciblés sont morts ! La carte est détruite.");
        return burnCard();
    }

    losers = aliveLosers;
    // -----------------------------------------------------

    if (losers.length === 1) {
        const loser = players.find(p => p.id === losers[0]);
        const voterIds = Object.keys(validatedVotes).filter(vId => validatedVotes[vId] === loser.id);
        const voterNames = voterIds.map(vId => players.find(p => p.id === parseInt(vId)).name);
        let votersText = "";
        if (voterNames.length === 1) votersText = voterNames[0];
        else votersText = voterNames.slice(0, -1).join(", ") + " et " + voterNames[voterNames.length - 1];
        const randomComment = currentCard.comments[Math.floor(Math.random() * currentCard.comments.length)];
        const punchline = randomComment.replace(/\$pseudo/g, `<strong style="color: #e74c3c;">${loser.name}</strong>`);
        const isUnanimous = (voterNames.length === survivors.length - 1 && survivors.length > 2);
        let recapMessage = "";
        if (GAME_VOTE_MODE === 'anonyme') {
            const countText = voterIds.length > 1 ? `${voterIds.length} personnes ont` : `1 personne a`;
            if (isUnanimous) {
                recapMessage = `<strong>UNANIMITÉ !</strong> Tout le monde a voté (en lâche) contre <strong style="color: #e74c3c;">${loser.name}</strong>.<br><br><em>💬 "${punchline}"</em>`;
            } else {
                recapMessage = `<strong>${countText}</strong> voté en secret contre <strong style="color: #e74c3c;">${loser.name}</strong>.`;
            }
        } else {
            if (isUnanimous) {
                recapMessage = `<strong>UNANIMITÉ !</strong> Tout le monde est d'accord pour désigner <strong style="color: #e74c3c;">${loser.name}</strong>.<br><br><em>💬 "${punchline}"</em>`;
            } else {
                let ont = voterNames.length > 1 ? "ont" : "a";
                recapMessage = `<strong>${votersText}</strong> ${ont} voté contre <strong style="color: #e74c3c;">${loser.name}</strong>.`;
            }
        }
        const recapEl = document.getElementById('recap-display');
        recapEl.innerHTML = recapMessage;
        recapEl.classList.remove('hidden');
        setTimeout(() => {
            playHandoverAnimation(currentReaderId, loser.id, () => {
                loser.score = Number(loser.score) + 1;
                loser.wonCards.push(currentCard);
                updatePlayerStack(loser, true);
                currentReaderId = loser.id; 
                renderPlayers();
                if (loser.score >= SCORE_TO_WIN) {
                    showVictory(loser);
                } else {
                    resetForNextRound();
                }
            });
        }, 6000); 
    } else if (losers.length > 1) {
        // --- CORRECTION BUG : Égalité parfaite ---
        if (losers.length === survivors.length) {
            showNotification("⚖️ Égalité générale ! Personne n'est d'accord, la carte est détruite.");
            burnCard();
        } else {
            triggerTieAnimation(losers);
        }
    }
}

function playHandoverAnimation(fromId, toId, callback) {
    const layer = document.getElementById('animation-layer');
    let fromPlayer = players.find(p => p.id === fromId);
    let toPlayer = players.find(p => p.id === toId);
    if(!fromPlayer || fromPlayer.isDead) fromPlayer = players.find(p => !p.isDead);
    const animEl = document.createElement('div');
    animEl.className = 'handover-item';
    animEl.innerHTML = `<span class="handover-hand">🫴</span><img class="handover-card card-skin-image" src="${getCurrentCardSkin().image}" alt="">`;
    animEl.style.left = `${fromPlayer.centerX - 45}px`;
    animEl.style.top = `${fromPlayer.centerY - 45}px`;
    layer.appendChild(animEl);
    setTimeout(() => {
        audioManager.playSound('card-swoosh'), { volume: 0.1 }; 
        animEl.style.left = `${toPlayer.centerX - 45}px`;
        animEl.style.top = `${toPlayer.centerY - 45}px`;
    }, 50);
    setTimeout(() => {
        animEl.remove();
        callback(); 
    }, 1500);
}

async function triggerTieAnimation(tiedPlayerIds) {
    // --- Cinématique éclairs entre les joueurs à égalité ---  
    const table = document.getElementById('table');
    const backdrop = document.getElementById('cinematic-backdrop');
    const leftPane = document.getElementById('left-pane');

    leftPane.classList.add('cinematic-active');
    backdrop.classList.add('active');
    table.classList.add('table-cinematic');
    document.getElementById('deck').style.opacity = '0';
    document.querySelectorAll('.player').forEach(p => p.classList.add('slow-move'));

    tiedPlayerIds.forEach(id => {
        const avatarEl = document.getElementById(`avatar-${id}`);
        if (avatarEl) avatarEl.classList.add('tie-candidate');
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
        const a = tiedPlayers[i];
        const b = tiedPlayers[j];

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.classList.add('lightning-svg');
        svg.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:50;';

        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        defs.innerHTML = `<filter id="glow-red" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
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
        const flickerInterval = setInterval(() => {
            bolt.style.opacity = Math.random() > 0.3 ? (0.6 + Math.random() * 0.4).toFixed(2) : '0';
            flickers++;
            if (flickers > 8) {
                clearInterval(flickerInterval);
                svg.remove();
                const idx = lightnings.indexOf(svg);
                if (idx > -1) lightnings.splice(idx, 1);
            }
        }, 80);

        if (lightningActive) setTimeout(spawnLightning, 150 + Math.random() * 200);
    };
    spawnLightning();

    await sleep(3500);

    lightningActive = false;
    lightnings.forEach(s => s.remove());
    lightnings.length = 0;
    tiedPlayerIds.forEach(id => {
        document.getElementById(`avatar-${id}`)?.classList.remove('tie-candidate');
    });

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

    startTieBreakVote(tiedPlayerIds);
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

function startTieBreakVote(tiedPlayerIds) {
    // Réinitialise l'état du vote
    currentSelections = {};
    validatedVotes = {};
    document.querySelectorAll('.avatar').forEach(el => el.classList.remove('selected-target', 'validated'));
    players.forEach(p => { const ptr = document.getElementById(`pointer-${p.id}`); if (ptr) ptr.style.opacity = '0'; });
    document.getElementById('current-card').classList.remove('hidden');
    document.getElementById('waiting-text').classList.add('hidden');
    document.getElementById('recap-display').classList.add('hidden');
    document.getElementById('btn-validate').classList.add('hidden');
    document.getElementById('btn-start-vote').classList.add('hidden');
    document.getElementById('not-reader-text').classList.add('hidden');

    // Mise en évidence des candidats à départager
    tiedPlayerIds.forEach(id => {
        document.getElementById(`avatar-${id}`)?.classList.add('tie-candidate');
    });

    const isTwoWayTie = tiedPlayerIds.length === 2;

    if (isTwoWayTie) {
        showNotification(`Égalité — Les autres tranchent !`);
    } else {
        showNotification(`Revote ! Choisissez parmi les ${tiedPlayerIds.length} joueurs à égalité.`);
    }

    audioManager.playSound('vote-start'); // Lance l'audio du vote

    isVoting = true;
    currentTimer = 15;
    const display = document.getElementById('timer-display');
    display.innerText = `⚖️ ${currentTimer}`;
    display.classList.remove('hidden');
    display.style.color = '#e67e22';

    // Votes des bots
    players.forEach(p => {
        if (p.id === MY_ID || p.isDead) return;
        // En cas d'égalité à 2, les candidats ne votent pas
        if (isTwoWayTie && tiedPlayerIds.includes(p.id)) return;
        const thinkDelay = Math.floor(Math.random() * 6000) + 1500;
        setTimeout(() => {
            if (!isVoting) return;
            // Cible uniquement les candidats (sauf soi-même si on est candidat)
            const targets = tiedPlayerIds
                .filter(id => id !== p.id)
                .map(id => players.find(pl => pl.id === id)).filter(Boolean);
            if (targets.length === 0) return;
            const target = targets[Math.floor(Math.random() * targets.length)];
            currentSelections[p.id] = target.id;
            if (GAME_VOTE_MODE === 'transparent') showPointerVisual(p.id, target.id);
            setTimeout(() => {
                if (!isVoting) return;
                validatedVotes[p.id] = target.id;
                document.getElementById(`avatar-${p.id}`)?.classList.add('validated');
                checkFastForwardTieBreak(tiedPlayerIds, isTwoWayTie);
            }, 1000);
        }, thinkDelay);
    });

    // Stocke les règles du tie-break pour handleVoteClick :
    // - _tieBreakCandidates : on ne peut voter que pour ces joueurs
    // - _tieBreakExcluded : ces joueurs ne peuvent pas voter du tout (cas 2 joueurs)
    window._tieBreakCandidates = tiedPlayerIds;
    window._tieBreakExcluded = isTwoWayTie ? tiedPlayerIds : [];

    timerInterval = setInterval(() => {
        currentTimer--;
        display.innerText = `${currentTimer}`;
        if (currentTimer > 5) { 
            audioManager.playSound('vote-tick', { volume: 0.4 }); 
        } else if (currentTimer === 5) {
            audioManager.stopSound('vote-tick'); // Coupe le tick avant le heartbeat
            audioManager.playSound('heartbeat', { loop: true }); 
        }
        if (currentTimer <= 5) {
            display.style.color = 'red';
            const myPlayer = players.find(p => p.id === MY_ID);
            const iExcluded = isTwoWayTie && tiedPlayerIds.includes(MY_ID);
            if (!validatedVotes[MY_ID] && !(myPlayer && myPlayer.isDead) && !iExcluded) {
                document.body.classList.add('urgent-flash');
            }
        }
        if (currentTimer <= 0) {
            // Fait appel à notre nouvelle fonction asynchrone pour gérer les punitions !
            handleTieBreakTimeOut(tiedPlayerIds);
        }
    }, 1000);
}

async function handleTieBreakTimeOut(tiedPlayerIds) {
    clearInterval(timerInterval);
    audioManager.stopSound('heartbeat'); // Coupe le son si jamais il tournait
    isVoting = false;
    
    document.body.classList.remove('urgent-flash');
    document.getElementById('timer-display').classList.add('hidden');
    document.getElementById('btn-validate').classList.add('hidden');

    // On récupère les joueurs exclus du vote (ex: les 2 joueurs à égalité)
    const excluded = window._tieBreakExcluded || [];
    
    // On cible les AFK : vivants + pas exclus du vote + n'ont pas validé
    let afkPlayers = players.filter(p => !p.isDead && !excluded.includes(p.id) && !validatedVotes[p.id]);
    
    // S'il y a des lâches, on les punit un par un
    if (afkPlayers.length > 0) {
        for (let p of afkPlayers) {
            p.afkCount++;
            await playCinematic(p); // Humiliation, Mutilation ou Exécution !
        }
    }

    // On nettoie l'interface des candidats
    tiedPlayerIds.forEach(id => {
        document.getElementById(`avatar-${id}`)?.classList.remove('tie-candidate');
    });

    // On passe enfin à la résolution de l'égalité
    resolveTieBreak(tiedPlayerIds);
}

function checkFastForwardTieBreak(tiedPlayerIds, isTwoWayTie) {
    const excluded = (isTwoWayTie && window._tieBreakExcluded) ? window._tieBreakExcluded : [];
    const eligibleCount = players.filter(p => !p.isDead && !excluded.includes(p.id)).length;
    if (Object.keys(validatedVotes).length >= eligibleCount) {
        if (currentTimer > 5) currentTimer = 5;
    }
}

function resolveTieBreak(tiedPlayerIds) {
    window._tieBreakCandidates = null;
    window._tieBreakExcluded = null;
    audioManager.stopSound('heartbeat');

    // Recompte les votes du tie-break
    let voteCounts = {};
    Object.values(validatedVotes).forEach(targetId => {
        voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
    });

    let maxVotes = 0;
    let newLosers = [];
    for (const [id, count] of Object.entries(voteCounts)) {
        const numId = parseInt(id);
        if (!tiedPlayerIds.includes(numId)) continue; // on ne compte que les votes sur les candidats
        if (count > maxVotes) {
            maxVotes = count;
            newLosers = [numId];
        } else if (count === maxVotes) {
            newLosers.push(numId);
        }
    }

    if (newLosers.length === 0) {
        // Personne n'a voté → on brûle la carte
        return burnCard();
    }

    // --- CORRECTION BUG : Ignorer les joueurs exécutés ---
    let aliveNewLosers = newLosers.filter(id => {
        const p = players.find(player => player.id === id);
        return p && !p.isDead;
    });

    if (aliveNewLosers.length === 0) {
        showNotification("💀 Les joueurs ciblés sont morts ! La carte est détruite.");
        return burnCard();
    }

    newLosers = aliveNewLosers;
    // -----------------------------------------------------

    if (newLosers.length === 1) {
        // Un gagnant du tie-break trouvé !
        const loser = players.find(p => p.id === newLosers[0]);
        const voterIds = Object.keys(validatedVotes).filter(vId => validatedVotes[vId] === loser.id);
        const voterNames = voterIds.map(vId => players.find(p => p.id === parseInt(vId))?.name).filter(Boolean);
        let votersText = voterNames.length === 1
            ? voterNames[0]
            : voterNames.slice(0, -1).join(', ') + ' et ' + voterNames[voterNames.length - 1];

        const recapEl = document.getElementById('recap-display');
        recapEl.innerHTML = `<strong>${votersText}</strong> ${voterNames.length > 1 ? 'ont' : 'a'} désigné <strong style="color:#e74c3c;">${loser.name}</strong>.`;
        recapEl.classList.remove('hidden');

        setTimeout(() => {
            playHandoverAnimation(currentReaderId, loser.id, () => {
                loser.score = Number(loser.score) + 1;
                loser.wonCards.push(currentCard);
                updatePlayerStack(loser, true);
                currentReaderId = loser.id;
                renderPlayers();
                if (loser.score >= SCORE_TO_WIN) {
                    showVictory(loser);
                } else {
                    resetForNextRound();
                }
            });
        }, 4000);
    } else {
        // Toujours égalité → on brûle la carte
        burnCard();
    }
}

async function burnCard() {
    showNotification(`🔥 Toujours égalité ! La carte est détruite.`);
    audioManager.playSound('card-burn'); 
    const tieOverlay = document.getElementById('tie-overlay');
    const tieCard = document.getElementById('tie-card');
    document.querySelector('#tie-overlay .tie-subtitle').innerText = `Personne n'est d'accord... La carte est détruite !`;
    document.getElementById('tie-category').innerText = `# ${currentCard.category}`;
    document.getElementById('tie-text').innerText = currentCard.text;
    tieOverlay.classList.remove('hidden');
    const flameCount = 15;
    const flames = [];
    for (let i = 0; i < flameCount; i++) {
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
    await sleep(2500);
    tieOverlay.classList.add('hidden');
    tieCard.classList.remove('burn-animation');
    flames.forEach(f => f.remove());
    addToCemetery(currentCard, 'tie');
    resetForNextRound();
}

function resetForNextRound() {
    document.getElementById('current-card').classList.add('hidden');
    document.getElementById('recap-display').classList.add('hidden');
    document.getElementById('waiting-text').classList.remove('hidden');
    document.querySelectorAll('.avatar').forEach(el => el.classList.remove('selected-target', 'validated'));
    players.forEach(p => {
        const ptr = document.getElementById(`pointer-${p.id}`);
        if(ptr) ptr.style.opacity = '0';
    });
    prepareNextTurn(); 
}

function showVictory(winner) {
    audioManager.stopMusic(); 
    audioManager.playSound('victory'); 
    const overlay = document.getElementById('victory-overlay');
    const title = document.getElementById('victory-title');
    const msg = document.getElementById('victory-message');
    title.innerHTML = `👑 ${winner.name} ${winner.avatar}`;
    msg.innerHTML = `<strong>${winner.name}</strong>, Les termes ont été dit tu remportes la partie avec ${winner.score} points !`;
    renderRivalrySummary();
    renderEndgameCardsSummary(winner);
    overlay.classList.remove('hidden');
}

function collectVoteStats() {
    Object.entries(validatedVotes).forEach(([voterIdRaw, targetId]) => {
        const voterId = parseInt(voterIdRaw);

        if (targetId === MY_ID && voterId !== MY_ID) {
            voteStats.againstMe[voterId] = (voteStats.againstMe[voterId] || 0) + 1;
        }

        if (voterId === MY_ID && targetId !== MY_ID) {
            voteStats.byMe[targetId] = (voteStats.byMe[targetId] || 0) + 1;
        }
    });
}

function getTopTargets(votesMap) {
    const entries = Object.entries(votesMap);
    if (!entries.length) return [];

    let maxCount = 0;
    entries.forEach(([, count]) => {
        if (count > maxCount) maxCount = count;
    });

    return entries
        .filter(([, count]) => count === maxCount)
        .map(([id]) => parseInt(id));
}

function formatRivals(ids, fallback = "personne") {
    if (!ids.length) return fallback;
    const names = ids
        .map(id => players.find(p => p.id === id))
        .filter(Boolean)
        .map(p => `${p.avatar} ${p.name}`);

    if (!names.length) return fallback;
    if (names.length === 1) return names[0];
    return `${names.slice(0, -1).join(", ")} et ${names[names.length - 1]}`;
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

function renderEndgameCardsSummary(winner) {
    const container = document.getElementById('endgame-cards-summary');
    if (!container) return;

    const sortedPlayers = [winner, ...players.filter(p => p.id !== winner.id)];
    container.innerHTML = `
        <h3 class="victory-section-title">🃏 Résumé des cartes</h3>
        <div class="endgame-players-list"></div>
    `;

    const list = container.querySelector('.endgame-players-list');
    sortedPlayers.forEach((player, index) => {
        const row = document.createElement('div');
        row.className = `endgame-player-row${index === 0 ? ' winner-row' : ''}`;
        const cardsHTML = player.wonCards.length
            ? player.wonCards.map(card => `
                <div class="endgame-card">
                    <p class="card-category"># ${card.category}</p>
                    <p class="endgame-card-text">${card.text}</p>
                </div>
            `).join('')
            : `<p class="endgame-empty">Aucune carte gagnée.</p>`;

        row.innerHTML = `
            <div class="endgame-player-head">
                <div class="endgame-player-name">${player.avatar} ${player.name}${index === 0 ? ' 👑' : ''}</div>
                <div class="endgame-player-score">${player.score} point${player.score > 1 ? 's' : ''}</div>
            </div>
            <div class="endgame-cards-row">${cardsHTML}</div>
        `;
        list.appendChild(row);
    });
}

function updatePlayerStack(player, animate = false) {
    const stack = document.getElementById(`stack-${player.id}`);
    if (!stack) return;
    const count = player.wonCards.length;
    if (count === 0) { stack.innerHTML = ''; return; }

    // On affiche au max 4 mini-cartes visuelles (pour pas que ça déborde)
    const visible = Math.min(count, 4);
    // Reconstruit seulement si le nombre a changé
    if (stack.children.length !== visible + 1) { // +1 pour le badge
        stack.innerHTML = '';
        for (let i = 0; i < visible; i++) {
            const mc = document.createElement('div');
            mc.className = 'mini-card' + (animate && i === visible - 1 ? ' new-card' : '');
            // Décalage empilé : la première est en dessous
            mc.style.top = `${(visible - 1 - i) * 2}px`;
            mc.style.left = `${(visible - 1 - i) * 1}px`;
            mc.style.zIndex = i;
            stack.appendChild(mc);
        }
        const badge = document.createElement('div');
        badge.className = 'stack-count';
        badge.innerText = count;
        stack.appendChild(badge);
    } else {
        // Juste mettre à jour le badge
        const badge = stack.querySelector('.stack-count');
        if (badge) badge.innerText = count;
    }
    stack.title = `${count} carte${count > 1 ? 's' : ''} gagnée${count > 1 ? 's' : ''} — cliquer pour voir`;
}

function showPlayerCards(playerId) {
    const player = players.find(p => p.id === playerId);
    if (!player) return;
    if (player.wonCards.length === 0) return;

    const overlay = document.getElementById('player-cards-overlay');
    const title = document.getElementById('player-cards-title');
    const container = document.getElementById('player-cards-list');

    title.innerText = `${player.avatar} ${player.name} — ${player.wonCards.length} carte${player.wonCards.length > 1 ? 's' : ''}`;
    container.innerHTML = '';

    // Affichage en "main" : cartes en éventail
    const hand = document.createElement('div');
    hand.className = 'cards-hand';
    const n = player.wonCards.length;
    const maxAngle = Math.min(8 * (n - 1), 40); // éventail max 40°
    player.wonCards.forEach((card, i) => {
        const angle = n === 1 ? 0 : -maxAngle / 2 + (maxAngle / (n - 1)) * i;
        const lift = Math.abs(angle) * 0.8; // les cartes du milieu montent un peu
        const el = document.createElement('div');
        el.className = 'hand-card';
        el.style.transform = `rotate(${angle}deg) translateY(${-lift}px)`;
        el.style.zIndex = i;
        el.style.animationDelay = `${i * 60}ms`;
        el.innerHTML = `
            <p class="card-category"># ${card.category}</p>
            <p class="hand-card-text">${card.text}</p>
        `;
        // Hover : soulève la carte
        el.addEventListener('mouseenter', () => {
            el.style.transform = `rotate(${angle}deg) translateY(${-lift - 18}px) scale(1.06)`;
            el.style.zIndex = 99;
        });
        el.addEventListener('mouseleave', () => {
            el.style.transform = `rotate(${angle}deg) translateY(${-lift}px)`;
            el.style.zIndex = i;
        });
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
    if (cemetery.length === 0) {
        container.innerHTML = '<p class="cemetery-empty">Aucune carte brûlée pour l\'instant...</p>';
        return;
    }
    [...cemetery].reverse().forEach(entry => {
        const el = document.createElement('div');
        el.className = 'cemetery-card';
        el.innerHTML = `
            <p class="card-category"># ${entry.card.category}</p>
            <p class="cemetery-card-text">${entry.card.text}</p>
            <p class="cemetery-reason">⚖️ Égalité — Manche ${entry.turn}</p>
        `;
        container.appendChild(el);
    });
}

function toggleCemetery() {
    const overlay = document.getElementById('cemetery-overlay');
    overlay.classList.toggle('hidden');
}