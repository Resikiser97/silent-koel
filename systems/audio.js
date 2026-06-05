// =============================================================
// 音效系統 - AudioManager / initAudio
//           playIntroTheme / stopIntroTheme（首頁背景音樂）
// =============================================================

let _introThemeAudio = null;

function playIntroTheme() {
    if (_introThemeAudio) return;
    _introThemeAudio = new Audio(AUDIO_FILES.introTheme);
    _introThemeAudio.loop = true;
    _introThemeAudio.currentTime = 0;
    const v = gameState.settings && gameState.settings.volume
        ? gameState.settings.volume
        : DEFAULT_SETTINGS.volume;
    const masterOn = v.masterOn !== false;
    const musicOn  = v.musicOn  !== false;
    const vol = masterOn && musicOn ? (v.master / 100) * (v.music / 100) * 0.4 : 0;
    _introThemeAudio.volume = Math.max(0, Math.min(1, vol));
    _introThemeAudio.play().catch(() => {});
}

function stopIntroTheme() {
    if (!_introThemeAudio) return;
    _introThemeAudio.pause();
    _introThemeAudio.currentTime = 0;
    _introThemeAudio = null;
}

const AudioManager = {
    _sounds: {},
    _music:  null,
    _currentMusicKey: null,
    _ready: false,
    _sfxPools: {},
    _sfxPoolSize: 4,

    init() {
        Object.entries(AUDIO_FILES).forEach(([key, src]) => {
            if (Array.isArray(src)) {
                this._sounds[key] = src.map(s => { const a = new Audio(s); a.preload = 'auto'; return a; });
            } else {
                const a = new Audio(src); a.preload = 'auto';
                this._sounds[key] = a;
            }
        });
        // 預熱常用音效
        ['eatFruit', 'levelUp', 'attacked'].forEach(key => {
            this._getPooledAudio(key);
        });
        this._ready = true;
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

    _getPooledAudio(key) {
        const src = AUDIO_FILES[key];
        if (!src) return null;
        const srcUrl = Array.isArray(src) ? src[0] : src;
        if (!this._sfxPools[key]) {
            this._sfxPools[key] = Array.from({ length: this._sfxPoolSize }, () => {
                const a = new Audio(srcUrl);
                a.volume = this._sfxVol();
                return a;
            });
        }
        const pool = this._sfxPools[key];
        const available = pool.find(a => a.paused || a.ended);
        if (!available) return null;
        return available;
    },

    play(key) {
        if (!this._ready) return;
        const vol = this._sfxVol();
        if (vol <= 0) return;
        const audio = this._getPooledAudio(key);
        if (!audio) return;
        audio.volume = vol;
        audio.currentTime = 0;
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
        if (_introThemeAudio) { try { _introThemeAudio.volume = 0.4 * this._musicVol(); } catch(e) {} }
    }
};

function initAudio() {
    AudioManager.init();
    AudioManager.playMusic('morningTheme');
}
