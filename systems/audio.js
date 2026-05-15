// =============================================================
// 音效系統 - AudioManager / initAudio
// =============================================================

const AudioManager = {
    _sounds: {},
    _music:  null,
    _currentMusicKey: null,

    init() {
        Object.entries(AUDIO_FILES).forEach(([key, src]) => {
            if (Array.isArray(src)) {
                this._sounds[key] = src.map(s => { const a = new Audio(s); a.preload = 'auto'; return a; });
            } else {
                const a = new Audio(src); a.preload = 'auto';
                this._sounds[key] = a;
            }
        });
    },

    _sfxVol() {
        const v = gameState.settings.volume;
        if (!v.masterOn || !v.sfxOn) return 0;
        return (v.master / 100) * (v.sfx / 100);
    },

    _musicVol() {
        const v = gameState.settings.volume;
        if (!v.masterOn || !v.musicOn) return 0;
        return (v.master / 100) * (v.music / 100);
    },

    play(key) {
        const src = this._sounds[key];
        if (!src) return;
        const vol = this._sfxVol();
        let audio;
        if (Array.isArray(src)) {
            audio = src[Math.floor(Math.random() * src.length)].cloneNode();
        } else {
            audio = src.cloneNode();
        }
        audio.volume = vol;
        audio.play().catch(() => {});
    },

    playMusic(key) {
        if (this._currentMusicKey === key) {
            if (this._music) { try { this._music.volume = this._musicVol(); } catch(e) {} }
            return;
        }
        const srcEntry = this._sounds[key];
        if (!srcEntry) return;
        const newAudio = Array.isArray(srcEntry) ? srcEntry[0] : srcEntry;

        const oldMusic = this._music;
        if (oldMusic && !oldMusic.paused) {
            let ov = oldMusic.volume;
            const step = Math.max(0.02, ov / 10);
            const fadeOut = setInterval(() => {
                ov = Math.max(0, ov - step);
                try { oldMusic.volume = ov; } catch(e) {}
                if (ov <= 0) { clearInterval(fadeOut); oldMusic.pause(); oldMusic.currentTime = 0; }
            }, 50);
        }

        this._currentMusicKey = key;
        newAudio.loop = true;
        newAudio.currentTime = 0;
        newAudio.volume = 0;
        newAudio.play().catch(() => {});
        this._music = newAudio;

        const target = this._musicVol();
        let fv = 0;
        const step = Math.max(0.02, target / 10);
        const fadeIn = setInterval(() => {
            fv = Math.min(target, fv + step);
            try { newAudio.volume = fv; } catch(e) {}
            if (fv >= target) clearInterval(fadeIn);
        }, 50);
    },

    stopMusic() {
        if (this._music) {
            this._music.pause();
            this._music.currentTime = 0;
            this._music = null;
        }
        this._currentMusicKey = null;
    },

    refreshMusicVolume() {
        if (this._music) { try { this._music.volume = this._musicVol(); } catch(e) {} }
    }
};

function initAudio() {
    AudioManager.init();
    AudioManager.playMusic('morningTheme');
}
