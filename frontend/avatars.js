// =========================================================
// AVATARS — Dictionnaire des assets SVG & moteur de rendu
// =========================================================
// Toutes les formes sont conçues sur une grille 100x100
// pour un alignement automatique sans calcul de coordonnées.

const AVATAR_ASSETS = {

    // ── Silhouettes (corps) ──────────────────────────────────
    shapes: {
        1: { // Blob classique
            path: `<ellipse cx="50" cy="54" rx="34" ry="36"/>`,
            headPath: `<ellipse cx="50" cy="32" rx="22" ry="22"/>`
        },
        2: { // Pion (pentagone arrondi)
            path: `<path d="M50 18 C28 18 18 32 18 50 C18 72 30 84 50 84 C70 84 82 72 82 50 C82 32 72 18 50 18Z"/>`,
            headPath: null
        },
        3: { // Carré arrondi / cube
            path: `<rect x="18" y="22" width="64" height="62" rx="14" ry="14"/>`,
            headPath: null
        },
        4: { // Fantôme
            path: `<path d="M20 30 C20 14 34 8 50 8 C66 8 80 14 80 30 L80 80 C80 80 72 74 64 80 C56 86 56 80 50 80 C44 80 44 86 36 80 C28 74 20 80 20 80 Z"/>`,
            headPath: null
        },
        5: { // Hexagone
            path: `<polygon points="50,10 84,30 84,70 50,90 16,70 16,30"/>`,
            headPath: null
        }
    },

    // ── Yeux ────────────────────────────────────────────────
    eyes: {
        1: { // Yeux neutres — deux cercles simples
            svg: `<g id="eyes">
                <circle cx="38" cy="40" r="5" fill="#1a1a2e"/>
                <circle cx="62" cy="40" r="5" fill="#1a1a2e"/>
            </g>`
        },
        2: { // Yeux fuyants — regard à droite
            svg: `<g id="eyes">
                <circle cx="38" cy="40" r="5.5" fill="white" stroke="#1a1a2e" stroke-width="2"/>
                <circle cx="40" cy="40" r="2.5" fill="#1a1a2e"/>
                <circle cx="62" cy="40" r="5.5" fill="white" stroke="#1a1a2e" stroke-width="2"/>
                <circle cx="64" cy="40" r="2.5" fill="#1a1a2e"/>
            </g>`
        },
        3: { // Yeux paniqués — grands et écarquillés
            svg: `<g id="eyes">
                <circle cx="38" cy="40" r="7" fill="white" stroke="#1a1a2e" stroke-width="2.5"/>
                <circle cx="38" cy="40" r="3.5" fill="#1a1a2e"/>
                <circle cx="62" cy="40" r="7" fill="white" stroke="#1a1a2e" stroke-width="2.5"/>
                <circle cx="62" cy="40" r="3.5" fill="#1a1a2e"/>
            </g>`
        },
        4: { // Yeux plissés / sournois — traits horizontaux
            svg: `<g id="eyes">
                <path d="M31 41 Q38 37 45 41" stroke="#1a1a2e" stroke-width="3" fill="none" stroke-linecap="round"/>
                <path d="M55 41 Q62 37 69 41" stroke="#1a1a2e" stroke-width="3" fill="none" stroke-linecap="round"/>
            </g>`
        },
        5: { // Yeux en croix (X) — mort ou blasé
            svg: `<g id="eyes">
                <line x1="33" y1="35" x2="43" y2="45" stroke="#1a1a2e" stroke-width="3" stroke-linecap="round"/>
                <line x1="43" y1="35" x2="33" y2="45" stroke="#1a1a2e" stroke-width="3" stroke-linecap="round"/>
                <line x1="57" y1="35" x2="67" y2="45" stroke="#1a1a2e" stroke-width="3" stroke-linecap="round"/>
                <line x1="67" y1="35" x2="57" y2="45" stroke="#1a1a2e" stroke-width="3" stroke-linecap="round"/>
            </g>`
        },
        6: { // Clins d'œil — un ouvert, un fermé
            svg: `<g id="eyes">
                <circle cx="38" cy="40" r="5" fill="#1a1a2e"/>
                <path d="M55 40 Q62 35 69 40" stroke="#1a1a2e" stroke-width="3" fill="none" stroke-linecap="round"/>
            </g>`
        },
        7: { // Yeux en amande — style manga
            svg: `<g id="eyes">
                <ellipse cx="38" cy="40" rx="7" ry="5" fill="white" stroke="#1a1a2e" stroke-width="2"/>
                <circle cx="38" cy="40" r="3" fill="#1a1a2e"/>
                <circle cx="36" cy="38" r="1" fill="white"/>
                <ellipse cx="62" cy="40" rx="7" ry="5" fill="white" stroke="#1a1a2e" stroke-width="2"/>
                <circle cx="62" cy="40" r="3" fill="#1a1a2e"/>
                <circle cx="60" cy="38" r="1" fill="white"/>
            </g>`
        },
        8: { // Yeux en spirale — fou ou hypnotisé
            svg: `<g id="eyes">
                <circle cx="38" cy="40" r="7" fill="white" stroke="#1a1a2e" stroke-width="2"/>
                <path d="M38 40 m4 0 a4 4 0 1 0 -8 0 a3 3 0 1 0 6 0 a2 2 0 1 0 -4 0" stroke="#1a1a2e" stroke-width="1.2" fill="none"/>
                <circle cx="62" cy="40" r="7" fill="white" stroke="#1a1a2e" stroke-width="2"/>
                <path d="M62 40 m4 0 a4 4 0 1 0 -8 0 a3 3 0 1 0 6 0 a2 2 0 1 0 -4 0" stroke="#1a1a2e" stroke-width="1.2" fill="none"/>
            </g>`
        }
    },

    // ── Bouches ──────────────────────────────────────────────
    mouths: {
        1: { // Ligne neutre — impassible
            svg: `<line x1="38" y1="62" x2="62" y2="62" stroke="#1a1a2e" stroke-width="3" stroke-linecap="round"/>`
        },
        2: { // Sourire narquois — une seule commissure relevée
            svg: `<path d="M38 64 Q50 60 62 64" stroke="#1a1a2e" stroke-width="3" fill="none" stroke-linecap="round"/>`
        },
        3: { // Sourire franc — arc symétrique
            svg: `<path d="M36 60 Q50 72 64 60" stroke="#1a1a2e" stroke-width="3" fill="none" stroke-linecap="round"/>`
        },
        4: { // Bouche zippée — ligne avec fermeture éclair stylisée
            svg: `<g>
                <line x1="36" y1="62" x2="64" y2="62" stroke="#1a1a2e" stroke-width="3" stroke-linecap="round"/>
                <line x1="42" y1="58" x2="42" y2="66" stroke="#1a1a2e" stroke-width="2" stroke-linecap="round"/>
                <line x1="50" y1="58" x2="50" y2="66" stroke="#1a1a2e" stroke-width="2" stroke-linecap="round"/>
                <line x1="58" y1="58" x2="58" y2="66" stroke="#1a1a2e" stroke-width="2" stroke-linecap="round"/>
            </g>`
        },
        5: { // Grimace — arc inversé, dégoût
            svg: `<path d="M36 66 Q50 56 64 66" stroke="#1a1a2e" stroke-width="3" fill="none" stroke-linecap="round"/>`
        },
        6: { // Bouche ouverte — O de surprise/horreur
            svg: `<ellipse cx="50" cy="63" rx="9" ry="6" fill="#1a1a2e"/>`
        },
        7: { // Sourire denté — montrant les dents
            svg: `<g>
                <path d="M36 60 Q50 72 64 60 L64 64 Q50 76 36 64 Z" fill="#1a1a2e"/>
                <line x1="43" y1="60" x2="43" y2="68" stroke="white" stroke-width="2"/>
                <line x1="50" y1="62" x2="50" y2="70" stroke="white" stroke-width="2"/>
                <line x1="57" y1="60" x2="57" y2="68" stroke="white" stroke-width="2"/>
            </g>`
        },
        8: { // Smirk — coin gauche relevé
            svg: `<path d="M40 63 Q46 59 52 63 Q56 65 62 62" stroke="#1a1a2e" stroke-width="3" fill="none" stroke-linecap="round"/>`
        }
    },

    // ── Accessoires (calque supérieur optionnel) ─────────────
    accessories: {
        0: { svg: `` }, // Aucun
        1: { // Auréole
            svg: `<ellipse cx="50" cy="10" rx="18" ry="5" fill="none" stroke="#f1c40f" stroke-width="3"/>`
        },
        2: { // Cornes de diable
            svg: `<g>
                <polygon points="34,18 28,4 40,14" fill="#e74c3c"/>
                <polygon points="66,18 60,4 72,14" fill="#e74c3c"/>
            </g>`
        },
        3: { // Chapeau haut-de-forme
            svg: `<g>
                <rect x="34" y="4" width="32" height="18" rx="3" fill="#1a1a2e"/>
                <rect x="26" y="20" width="48" height="6" rx="2" fill="#1a1a2e"/>
            </g>`
        },
        4: { // Couronne
            svg: `<polygon points="28,22 28,6 38,14 50,4 62,14 72,6 72,22" fill="#f1c40f" stroke="#e67e22" stroke-width="1.5"/>`
        },
        5: { // Lunettes de soleil
            svg: `<g>
                <rect x="28" y="35" width="18" height="12" rx="4" fill="#1a1a2e" opacity="0.85"/>
                <rect x="54" y="35" width="18" height="12" rx="4" fill="#1a1a2e" opacity="0.85"/>
                <line x1="46" y1="41" x2="54" y2="41" stroke="#1a1a2e" stroke-width="2"/>
                <line x1="22" y1="41" x2="28" y2="41" stroke="#1a1a2e" stroke-width="2"/>
                <line x1="72" y1="41" x2="78" y2="41" stroke="#1a1a2e" stroke-width="2"/>
            </g>`
        }
    }
};

// ── Palette de couleurs prédéfinies ──────────────────────────
const AVATAR_COLORS = [
    "#e74c3c", // Rouge
    "#e67e22", // Orange
    "#f1c40f", // Jaune
    "#2ecc71", // Vert
    "#1abc9c", // Turquoise
    "#3498db", // Bleu
    "#9b59b6", // Violet
    "#e91e8c", // Rose
    "#607d8b", // Gris bleu
    "#795548", // Marron
    "#ecf0f1", // Blanc cassé
    "#34495e"  // Ardoise
];

// ── Compte de variantes disponibles ─────────────────────────
const AVATAR_COUNTS = {
    shapes: Object.keys(AVATAR_ASSETS.shapes).length,
    eyes: Object.keys(AVATAR_ASSETS.eyes).length,
    mouths: Object.keys(AVATAR_ASSETS.mouths).length,
    accessories: Object.keys(AVATAR_ASSETS.accessories).length - 1 // exclut le 0 "aucun"
};

// =========================================================
// MOTEUR DE RENDU — generateAvatarSVG(avatarCode)
// =========================================================
// avatarCode = { color: "#HEX", shapeId, eyesId, mouthId, accessoryId }
// Retourne une chaîne SVG complète prête à injecter via innerHTML.

function generateAvatarSVG(avatarCode, size = 90) {
    const { color = "#3498db", shapeId = 1, eyesId = 1, mouthId = 1, accessoryId = 0 } = avatarCode || {};

    const shape = AVATAR_ASSETS.shapes[shapeId] || AVATAR_ASSETS.shapes[1];
    const eyes  = AVATAR_ASSETS.eyes[eyesId]   || AVATAR_ASSETS.eyes[1];
    const mouth = AVATAR_ASSETS.mouths[mouthId] || AVATAR_ASSETS.mouths[1];
    const acc   = AVATAR_ASSETS.accessories[accessoryId] || AVATAR_ASSETS.accessories[0];

    // Contour légèrement plus sombre que la couleur de fond
    const strokeColor = "#1a1a2e";

    // Construction calque par calque
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"
        width="${size}" height="${size}" style="display:block;overflow:visible">
        <!-- Z1 : Silhouette -->
        <g id="avatar-body" fill="${color}" stroke="${strokeColor}" stroke-width="3.5" stroke-linejoin="round">
            ${shape.path}
            ${shape.headPath ? `<g fill="${color}" stroke="${strokeColor}" stroke-width="3.5">${shape.headPath}</g>` : ''}
        </g>
        <!-- Z2 : Yeux -->
        ${eyes.svg}
        <!-- Z3 : Bouche -->
        ${mouth.svg}
        <!-- Z4 : Accessoire -->
        ${acc.svg}
    </svg>`;
}

// =========================================================
// ÉTAT LOCAL DE L'AVATAR DU JOUEUR (Lobby)
// =========================================================

let myAvatarCode = {
    color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
    shapeId: 1,
    eyesId: 1,
    mouthId: 1,
    accessoryId: 0
};

// ── Mise à jour de la préview dans le lobby ──────────────────
function updateAvatarPreview() {
    const preview = document.getElementById('avatar-svg-preview');
    if (preview) {
        preview.innerHTML = generateAvatarSVG(myAvatarCode, 120);
    }
}

// ── Navigation circulaire ─────────────────────────────────────
function cycleAvatarProp(prop, delta) {
    const maxMap = {
        shapeId: AVATAR_COUNTS.shapes,
        eyesId: AVATAR_COUNTS.eyes,
        mouthId: AVATAR_COUNTS.mouths,
        accessoryId: AVATAR_COUNTS.accessories + 1 // inclut le 0
    };
    const max = maxMap[prop] || 1;
    let next = myAvatarCode[prop] + delta;
    if (next > max) next = prop === 'accessoryId' ? 0 : 1;
    if (next < (prop === 'accessoryId' ? 0 : 1)) next = max;
    myAvatarCode[prop] = next;
    updateAvatarPreview();
    syncAvatarToServer();
}

// ── Couleur ───────────────────────────────────────────────────
function selectAvatarColor(hex) {
    myAvatarCode.color = hex;
    // Mise à jour de l'état actif sur les pastilles
    document.querySelectorAll('.color-swatch').forEach(el => {
        el.classList.toggle('active', el.dataset.color === hex);
    });
    updateAvatarPreview();
    syncAvatarToServer();
}

// ── Aléatoire ─────────────────────────────────────────────────
function randomizeAvatar() {
    myAvatarCode = {
        color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
        shapeId: Math.ceil(Math.random() * AVATAR_COUNTS.shapes),
        eyesId: Math.ceil(Math.random() * AVATAR_COUNTS.eyes),
        mouthId: Math.ceil(Math.random() * AVATAR_COUNTS.mouths),
        accessoryId: Math.floor(Math.random() * (AVATAR_COUNTS.accessories + 1))
    };
    // Sync couleur active
    document.querySelectorAll('.color-swatch').forEach(el => {
        el.classList.toggle('active', el.dataset.color === myAvatarCode.color);
    });
    updateAvatarPreview();
    syncAvatarToServer();
}

// ── Envoi au serveur ─────────────────────────────────────────
function syncAvatarToServer() {
    if (typeof socket !== 'undefined' && typeof currentRoomCode !== 'undefined' && currentRoomCode !== '0000') {
        socket.emit('update_avatar', { roomCode: currentRoomCode, avatarCode: myAvatarCode });
    }
}

// =========================================================
// INIT DU PICKER (appelée dans renderAvatarPicker)
// =========================================================

function initAvatarPicker() {
    const container = document.getElementById('avatar-creator-container');
    if (!container) return;

    container.innerHTML = `
        <div class="avatar-creator">

            <!-- Préview centrale -->
            <div class="avatar-preview-zone">
                <div id="avatar-svg-preview"></div>
            </div>

            <!-- Palette couleurs -->
            <div class="avatar-section">
                <span class="avatar-section-label">Couleur</span>
                <div class="color-palette">
                    ${AVATAR_COLORS.map(hex => `
                        <button class="color-swatch ${hex === myAvatarCode.color ? 'active' : ''}"
                            data-color="${hex}"
                            style="background:${hex}"
                            onclick="selectAvatarColor('${hex}')"
                            type="button">
                        </button>
                    `).join('')}
                </div>
            </div>

            <!-- Sélecteur Silhouette -->
            <div class="avatar-section">
                <span class="avatar-section-label">Silhouette</span>
                <div class="avatar-selector-row">
                    <button class="avatar-nav-arrow" onclick="cycleAvatarProp('shapeId', -1)" type="button">◀</button>
                    <span class="avatar-trait-preview" id="preview-shape">
                        <svg viewBox="0 0 100 100" width="44" height="44">
                            <g fill="${myAvatarCode.color}" stroke="#1a1a2e" stroke-width="3.5">
                                ${AVATAR_ASSETS.shapes[myAvatarCode.shapeId].path}
                            </g>
                        </svg>
                    </span>
                    <button class="avatar-nav-arrow" onclick="cycleAvatarProp('shapeId', 1)" type="button">▶</button>
                </div>
            </div>

            <!-- Sélecteur Yeux -->
            <div class="avatar-section">
                <span class="avatar-section-label">Yeux</span>
                <div class="avatar-selector-row">
                    <button class="avatar-nav-arrow" onclick="cycleAvatarProp('eyesId', -1)" type="button">◀</button>
                    <span class="avatar-trait-preview" id="preview-eyes">
                        <svg viewBox="0 0 100 100" width="44" height="44">
                            <rect width="100" height="100" fill="transparent"/>
                            ${AVATAR_ASSETS.eyes[myAvatarCode.eyesId].svg}
                        </svg>
                    </span>
                    <button class="avatar-nav-arrow" onclick="cycleAvatarProp('eyesId', 1)" type="button">▶</button>
                </div>
            </div>

            <!-- Sélecteur Bouche -->
            <div class="avatar-section">
                <span class="avatar-section-label">Bouche</span>
                <div class="avatar-selector-row">
                    <button class="avatar-nav-arrow" onclick="cycleAvatarProp('mouthId', -1)" type="button">◀</button>
                    <span class="avatar-trait-preview" id="preview-mouth">
                        <svg viewBox="0 0 100 100" width="44" height="44">
                            <rect width="100" height="100" fill="transparent"/>
                            ${AVATAR_ASSETS.mouths[myAvatarCode.mouthId].svg}
                        </svg>
                    </span>
                    <button class="avatar-nav-arrow" onclick="cycleAvatarProp('mouthId', 1)" type="button">▶</button>
                </div>
            </div>

            <!-- Sélecteur Accessoire -->
            <div class="avatar-section">
                <span class="avatar-section-label">Accessoire</span>
                <div class="avatar-selector-row">
                    <button class="avatar-nav-arrow" onclick="cycleAvatarProp('accessoryId', -1)" type="button">◀</button>
                    <span class="avatar-trait-preview" id="preview-acc">
                        <svg viewBox="0 0 100 100" width="44" height="44">
                            <rect width="100" height="100" fill="transparent"/>
                            ${AVATAR_ASSETS.accessories[myAvatarCode.accessoryId].svg}
                        </svg>
                    </span>
                    <button class="avatar-nav-arrow" onclick="cycleAvatarProp('accessoryId', 1)" type="button">▶</button>
                </div>
            </div>

            <!-- Bouton dés -->
            <button class="btn-random-avatar" onclick="randomizeAvatar()" type="button">🎲 Aléatoire</button>
        </div>
    `;

    updateAvatarPreview();
}

// Met à jour les previews individuelles des traits sans reconstruire tout le DOM
function refreshTraitPreviews() {
    const previewShape = document.getElementById('preview-shape');
    if (previewShape) {
        previewShape.innerHTML = `<svg viewBox="0 0 100 100" width="44" height="44">
            <g fill="${myAvatarCode.color}" stroke="#1a1a2e" stroke-width="3.5">
                ${AVATAR_ASSETS.shapes[myAvatarCode.shapeId].path}
            </g>
        </svg>`;
    }
    const previewEyes = document.getElementById('preview-eyes');
    if (previewEyes) {
        previewEyes.innerHTML = `<svg viewBox="0 0 100 100" width="44" height="44">
            <rect width="100" height="100" fill="transparent"/>
            ${AVATAR_ASSETS.eyes[myAvatarCode.eyesId].svg}
        </svg>`;
    }
    const previewMouth = document.getElementById('preview-mouth');
    if (previewMouth) {
        previewMouth.innerHTML = `<svg viewBox="0 0 100 100" width="44" height="44">
            <rect width="100" height="100" fill="transparent"/>
            ${AVATAR_ASSETS.mouths[myAvatarCode.mouthId].svg}
        </svg>`;
    }
    const previewAcc = document.getElementById('preview-acc');
    if (previewAcc) {
        previewAcc.innerHTML = `<svg viewBox="0 0 100 100" width="44" height="44">
            <rect width="100" height="100" fill="transparent"/>
            ${AVATAR_ASSETS.accessories[myAvatarCode.accessoryId].svg}
        </svg>`;
    }
}