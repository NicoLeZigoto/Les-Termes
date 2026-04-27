// =========================================================
// MOTEUR AUDIO POUR LES TERMES
// =========================================================
class AudioManager {
    constructor() {
        this.sounds = {};
        this.musicTrack = null;
        this.currentMusicBaseVol = 1.0; // Garde en mémoire le volume de base de la musique en cours
        this.isMuted = false;

        // 1. NOUVELLES VARIABLES DE VOLUME
        this.globalVolume = 1.0;
        this.musicVolume = 1.0;
        this.sfxVolume = 1.0;

        console.log("AudioManager prêt ! 🔊");
    }

    // 2. NOUVELLES MÉTHODES POUR MODIFIER LE VOLUME (Appelées par script.js)
    setGlobalVolume(v) {
        this.globalVolume = v;
        this.updateMusicVolume();
    }

    setMusicVolume(v) {
        this.musicVolume = v;
        this.updateMusicVolume();
    }

    setSfxVolume(v) {
        this.sfxVolume = v;
    }

    // Met à jour le volume de la musique en direct (quand le slider bouge)
    updateMusicVolume() {
        if (this.musicTrack) {
            this.musicTrack.volume = this.currentMusicBaseVol * this.globalVolume * this.musicVolume;
        }
    }

    // Précharge un son pour une lecture instantanée plus tard
    loadSound(name, path) {
        const audio = new Audio(path);
        audio.preload = 'auto';
        this.sounds[name] = audio;
    }

    // Joue un effet sonore
    playSound(name, options = {}) {
        if (this.isMuted || !this.sounds[name]) return;

        const sound = this.sounds[name];
        // On récupère le volume de base (par défaut 1.0 s'il n'est pas précisé)
        const baseVol = options.volume !== undefined ? options.volume : 1.0;
        
        // 3. APPLICATION DU VOLUME SFX (Base * Global * SFX)
        sound.volume = baseVol * this.globalVolume * this.sfxVolume;
        sound.loop = options.loop || false;
        sound.currentTime = 0; // Rembobine si le son est déjà en cours
        sound.play().catch(e => console.error(`Erreur audio[${name}]:`, e));
    }

    // Stoppe un effet sonore (utile pour les sons en boucle comme le coeur)
    stopSound(name) {
        if (!this.sounds[name]) return;
        this.sounds[name].pause();
        this.sounds[name].currentTime = 0;
    }

    // Joue une musique de fond (gère l'arrêt de la précédente)
    playMusic(name, options = {}) {
        if (this.isMuted || !this.sounds[name]) return;

        // Si une autre musique joue, on la stoppe en douceur
        if (this.musicTrack && this.musicTrack.name !== name) {
            this.musicTrack.pause();
        }

        this.musicTrack = this.sounds[name];
        this.musicTrack.name = name; // On stocke le nom pour la vérification
        
        // On stocke le volume de base de la piste (par défaut 0.3)
        this.currentMusicBaseVol = options.volume !== undefined ? options.volume : 0.3;
        
        // 4. APPLICATION DU VOLUME MUSIQUE (Base * Global * Musique)
        this.musicTrack.volume = this.currentMusicBaseVol * this.globalVolume * this.musicVolume;
        this.musicTrack.loop = options.loop !== undefined ? options.loop : true;
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

// --- NOUVEAUX SONS AJOUTÉS ---
audioManager.loadSound('bubble_pop', 'sounds/bubble_pop.mp3');
audioManager.loadSound('countdown_clock', 'sounds/countdown_clock.mp3');
audioManager.loadSound('crypt_door', 'sounds/crypt_door.mp3');
audioManager.loadSound('plastic_snap', 'sounds/plastic_snap.mp3');
audioManager.loadSound('select_beep', 'sounds/select_beep.mp3');
audioManager.loadSound('short_spark', 'sounds/short_spark.mp3');
audioManager.loadSound('sparkle', 'sounds/sparkle.mp3');
audioManager.loadSound('ui_confirm', 'sounds/ui_confirm.mp3');
audioManager.loadSound('ui_fail', 'sounds/ui_fail.mp3');
audioManager.loadSound('whoosh_out', 'sounds/whoosh_out.mp3');
audioManager.loadSound('wind_howl', 'sounds/wind_howl.mp3');