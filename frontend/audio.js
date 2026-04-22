// =========================================================
// MOTEUR AUDIO POUR LES TERMES
// =========================================================
class AudioManager {
    constructor() {
        this.sounds = {};
        this.musicTrack = null;
        this.isMuted = false;
        console.log("AudioManager prêt ! 🔊");
    }

    // Précharge un son pour une lecture instantanée plus tard
    loadSound(name, path) {
        const audio = new Audio(path);
        audio.preload = 'auto';
        this.sounds[name] = audio;
    }

    // Joue un effet sonore
    playSound(name, options = { volume: 1.0, loop: false }) {
        if (this.isMuted || !this.sounds[name]) return;

        const sound = this.sounds[name];
        sound.volume = options.volume || 1.0;
        sound.loop = options.loop || false;
        sound.currentTime = 0; // Rembobine si le son est déjà en cours
        sound.play().catch(e => console.error(`Erreur audio [${name}]:`, e));
    }

    // Stoppe un effet sonore (utile pour les sons en boucle comme le coeur)
    stopSound(name) {
        if (!this.sounds[name]) return;
        this.sounds[name].pause();
        this.sounds[name].currentTime = 0;
    }

    // Joue une musique de fond (gère l'arrêt de la précédente)
    playMusic(name, options = { volume: 0.3, loop: true }) {
        if (this.isMuted || !this.sounds[name]) return;

        // Si une autre musique joue, on la stoppe en douceur
        if (this.musicTrack && this.musicTrack.name !== name) {
            this.musicTrack.pause();
        }

        this.musicTrack = this.sounds[name];
        this.musicTrack.name = name; // On stocke le nom pour la vérification
        this.musicTrack.volume = options.volume || 0.3;
        this.musicTrack.loop = options.loop || true;
        this.musicTrack.play().catch(e => console.error(`Erreur musique [${name}]:`, e));
    }

    // Stoppe la musique de fond
    stopMusic() {
        if (this.musicTrack) {
            this.musicTrack.pause();
            this.musicTrack = null;
        }
    }
}

// On crée une instance globale de notre manager
const audioManager = new AudioManager();

// =========================================================
// ON PRÉCHARGE TOUS LES SONS DU JEU ICI
// =========================================================
// Tu devras remplacer les chemins par tes propres fichiers !

// Musiques
audioManager.loadSound('lobby', 'sounds/music-lobby.mp3');
audioManager.loadSound('game', 'sounds/music-game.mp3');
audioManager.loadSound('victory', 'sounds/music-victory.mp3');

// Interface (UI)
audioManager.loadSound('ui-click', 'sounds/ui-click.mp3');
audioManager.loadSound('ui-pop', 'sounds/ui-pop.mp3');
audioManager.loadSound('notification', 'sounds/notification.mp3');

// Cartes
audioManager.loadSound('card-draw', 'sounds/card-draw.mp3');
audioManager.loadSound('card-flip', 'sounds/card-flip.mp3');
audioManager.loadSound('card-swoosh', 'sounds/card-swoosh.mp3');
audioManager.loadSound('card-burn', 'sounds/card-burn.mp3');

// Vote
audioManager.loadSound('vote-start', 'sounds/vote-start-gong.mp3');
audioManager.loadSound('vote-tick', 'sounds/vote-tick.mp3');
audioManager.loadSound('heartbeat', 'sounds/heartbeat.mp3');
audioManager.loadSound('vote-validate', 'sounds/vote-validate.mp3');

// Cinématiques
audioManager.loadSound('humiliation', 'sounds/humiliation-laughs.mp3');
audioManager.loadSound('mutilation', 'sounds/mutilation-punch.mp3');
audioManager.loadSound('execution-bomb', 'sounds/execution-bomb.mp3');
audioManager.loadSound('tie-thunder', 'sounds/tie-thunder.mp3');