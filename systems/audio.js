// =============================================================
// 音效系統 - AudioManager / initAudio / preloadAllSfxBuffers
//           playIntroTheme / stopIntroTheme（首頁背景音樂）
// =============================================================
import { AUDIO_FILES } from '../config/gameConfig.js';
import { gameState } from './gameState.js';
import { saveSettingsToStorage } from '../storage/index.js';

let _introThemeAudio = null;

export function playIntroTheme() {
    if (_introThemeAudio) return;
    _introThemeAudio = new Audio(AUDIO_FILES.introTheme);
    AudioManager._connectMusicElement(_introThemeAudio);
    _introThemeAudio.loop = true;
    _introThemeAudio.currentTime = 0;
    const vol = AudioManager._musicVol() * 0.4;
    _introThemeAudio.volume = Math.max(0, Math.min(1, vol));
    _introThemeAudio.play().catch(() => {});
}

export function stopIntroTheme() {
    if (!_introThemeAudio) return;
    _introThemeAudio.pause();
    _introThemeAudio.currentTime = 0;
    _introThemeAudio = null;
}

export const AudioManager = {
    _sounds: {},
    _music:  null,
    _currentMusicKey: null,
    _ready: false,
    _sfxPools: {},
    _sfxPoolSize: 4,
    _sfxLastPlayed: {},
    _sfxBuffers: {},
    _sfxLoading: {},
    _audioCtx: null,
    _masterGain: null,
    _musicGain: null,
    _sfxGain: null,
    _unlocked: false,
    _preloadDone: false,
    _mobileMasterFadeDone: false,
    _mobileMasterFadeStartMs: 0,
    _mobileMasterFadeEndMs: 0,
    _mediaSourceMap: new Map(),
    _vol: {
        master: 80, music: 70, sfx: 80,
        masterOn: true, musicOn: true, sfxOn: true
    },

    init() {
        if (this._ready) return;
        Object.entries(AUDIO_FILES).forEach(([key, src]) => {
            if (Array.isArray(src)) {
                this._sounds[key] = src.map(s => { const a = new Audio(s); a.preload = 'auto'; return a; });
            } else {
                const a = new Audio(src); a.preload = 'auto';
                this._sounds[key] = a;
            }
        });
        this._ready = true;
        // 預熱常用音效（async，不阻塞）
        if (this._audioCtx) {
            ['eatFruit', 'levelUp', 'hurt', 'attackNormal',
             'archerAttackNormal', 'archerHurt'].forEach(key => {
                this._loadSfxBuffer(key).catch(() => {});
            });
        }
        // Attempt early unlock (may fail without user gesture, that's ok)
        this.unlock().catch(() => {});
    },

    async preloadAllSfxBuffers(onProgress) {
        const canPreloadBuffers = !!this._audioCtx;
        this.init();
        const musicKeys = new Set([
            'introTheme', 'morningTheme', 'nightTheme', 'hunterTheme',
            'bossTheme', 'superBossTheme'
        ]);
        const keys = Object.keys(AUDIO_FILES).filter(key => !musicKeys.has(key));
        const total = keys.length;
        let completed = 0;
        const report = () => {
            if (typeof onProgress === 'function') onProgress(completed, total);
        };

        if (!canPreloadBuffers || !this._audioCtx || total === 0) {
            completed = total;
            report();
            this._preloadDone = true;
            return;
        }

        report();
        await Promise.all(keys.map(key =>
            this._loadSfxBuffer(key)
                .catch(() => null)
                .finally(() => {
                    completed++;
                    report();
                })
        ));
        this._preloadDone = true;
    },

    // Stubs：由 Part A 覆寫；若 Codex 尚未完成則回傳 null
    unlock() {
        if (this._unlocked) return Promise.resolve();
        try {
            if (!this._audioCtx) {
                this._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (!this._masterGain) {
                this._masterGain = this._audioCtx.createGain();
                this._masterGain.connect(this._audioCtx.destination);
            }
            if (!this._musicGain) {
                this._musicGain = this._audioCtx.createGain();
                this._musicGain.connect(this._masterGain);
            }
            if (!this._sfxGain) {
                this._sfxGain = this._audioCtx.createGain();
                this._sfxGain.connect(this._masterGain);
            }
            if (this._music) this._connectMusicElement(this._music);
            if (_introThemeAudio) this._connectMusicElement(_introThemeAudio);

            return this._audioCtx.resume().then(() => {
                this._unlocked = true;
                if (!this._preloadDone) {
                    this.preloadAllSfxBuffers(() => {}).catch(() => {});
                }
                if (gameState.isMobile && !this._mobileMasterFadeDone) {
                    this._mobileMasterFadeDone = true;
                    this._mobileMasterFadeStartMs = Date.now();
                    this._mobileMasterFadeEndMs = this._mobileMasterFadeStartMs + 300;
                    this._applyGainVolumes(true);
                    const master = this._vol.masterOn ? this._vol.master / 100 : 0;
                    const g = this._masterGain.gain;
                    const t = this._audioCtx.currentTime;
                    try {
                        g.cancelScheduledValues(t);
                        g.setValueAtTime(0, t);
                        g.linearRampToValueAtTime(master, t + 0.3);
                    } catch(e) {
                        g.value = master;
                    }
                } else {
                    this._applyGainVolumes();
                }
            }).catch((e) => {
                console.warn('[AudioManager] unlock failed:', e);
                return Promise.resolve();
            });
        } catch(e) {
            return Promise.resolve();
        }
    },

    getContext() {
        return this._audioCtx;
    },

    getSfxGain() {
        return this._sfxGain;
    },

    _applyGainVolumes(keepMasterRamp = false) {
        if (!this._audioCtx || !this._unlocked) return;
        const master = this._vol.masterOn ? this._vol.master / 100 : 0;
        const music  = this._vol.musicOn  ? this._vol.music  / 100 : 0;
        const sfx    = this._vol.sfxOn    ? this._vol.sfx    / 100 : 0;
        if (!keepMasterRamp) this._masterGain.gain.value = master;
        this._musicGain.gain.value  = music;
        this._sfxGain.gain.value    = sfx;
    },

    _connectMusicElement(audio) {
        if (!this._audioCtx || !this._musicGain) return;
        if (this._mediaSourceMap.has(audio)) return;
        try {
            const source = this._audioCtx.createMediaElementSource(audio);
            source.connect(this._musicGain);
            this._mediaSourceMap.set(audio, source);
        } catch(e) {}
    },

    async _loadSfxBuffer(key) {
        if (this._sfxBuffers[key]) return this._sfxBuffers[key];
        if (this._sfxLoading[key]) return this._sfxLoading[key];

        const src = AUDIO_FILES[key];
        if (!src) return null;

        const urls = Array.isArray(src) ? src : [src];

        this._sfxLoading[key] = Promise.all(
            urls.map(url =>
                fetch(url)
                    .then(r => r.arrayBuffer())
                    .then(ab => this._audioCtx.decodeAudioData(ab))
                    .catch(() => null)
            )
        ).then(buffers => {
            const valid = buffers.filter(Boolean);
            if (valid.length === 0) return null;
            this._sfxBuffers[key] = valid.length === 1 ? valid[0] : valid;
            delete this._sfxLoading[key];
            return this._sfxBuffers[key];
        });

        return this._sfxLoading[key];
    },

    _playSfxBuffer(key, random = Math.random) {
        const ctx = this.getContext();
        const gainNode = this.getSfxGain();
        if (!ctx || !gainNode || !this._unlocked) return false;

        const bufferOrArr = this._sfxBuffers[key];
        if (!bufferOrArr) return false;

        // 支援音效變體（陣列隨機選一個）
        const buffer = Array.isArray(bufferOrArr)
            ? bufferOrArr[Math.floor(random() * bufferOrArr.length)]
            : bufferOrArr;
        if (!buffer) return false;

        try {
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(gainNode);
            source.start(0);
            return true;
        } catch(e) {
            return false;
        }
    },

    // 從 settings 物件載入音量（loadSettings 呼叫）
    loadVolume(volumeSettings) {
        if (!volumeSettings) return;
        this._vol = Object.assign({}, this._vol, volumeSettings);
        this.refreshMusicVolume();
        this._applyGainVolumes();
    },

    // 設定單一音量 key（UI 滑桿呼叫）
    setVolume(key, value) {
        this._vol[key] = value;
        // 同步更新 gameState.settings.volume（保持相容）
        if (gameState.settings && gameState.settings.volume) {
            gameState.settings.volume[key] = value;
        }
        this.refreshMusicVolume();
        this._applyGainVolumes();
    },

    // 取得序列化音量（saveSettings 呼叫）
    serializeVolume() {
        return Object.assign({}, this._vol);
    },

    _sfxVol() {
        const v = this._vol;
        if (!v || !v.masterOn || !v.sfxOn) return 0;
        return (v.master / 100) * (v.sfx / 100) * this._mobileFadeScale();
    },

    _musicVol() {
        const v = this._vol;
        if (!v || !v.masterOn || !v.musicOn) return 0;
        return (v.master / 100) * (v.music / 100);
    },

    _mobileFadeScale(now = Date.now(), isMobile = gameState.isMobile) {
        if (!isMobile || !this._mobileMasterFadeEndMs) return 1;
        if (now >= this._mobileMasterFadeEndMs) return 1;
        if (now <= this._mobileMasterFadeStartMs) return 0;
        return Math.max(0, Math.min(1, (now - this._mobileMasterFadeStartMs) / 300));
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

        // 音效節流：同音效 100ms 內只播一次；hurt/attack 類 150ms
        const now = Date.now();
        const throttleMs = (key === 'hurt' || key === 'attack' || key === 'playerAttack')
            ? 150 : 100;
        if (this._sfxLastPlayed[key] && now - this._sfxLastPlayed[key] < throttleMs) return;
        this._sfxLastPlayed[key] = now;

        // 優先用 AudioBuffer（Web Audio API，iOS 不卡頓）
        if (this._playSfxBuffer(key)) return;

        // Fallback：AudioBuffer 未就緒時用舊 HTMLAudio pool
        const audio = this._getPooledAudio(key);
        if (!audio) return;
        audio.volume = vol;
        audio.currentTime = 0;
        audio.play().catch(() => {});

        // 非同步載入 buffer 供下次使用
        if (this._audioCtx && !this._sfxBuffers[key]) {
            this._loadSfxBuffer(key).catch(() => {});
        }
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
        this._music = newAudio;
        this._connectMusicElement(newAudio);

        if (this._musicVol() <= 0) return;

        newAudio.play().catch(() => {});

        let fv = 0;
        const fadeIn = setInterval(() => {
            const target = this._musicVol();

            if (target <= 0) {
                try {
                    newAudio.volume = 0;
                    newAudio.pause();
                } catch(e) {}
                clearInterval(fadeIn);
                return;
            }

            fv = Math.min(target, fv + Math.max(0.02, target / 10));
            try { newAudio.volume = fv; } catch(e) {}
            if (fv >= target) clearInterval(fadeIn);
        }, 50);

        // 音樂開始播放時自動儲存設定（確保音量設定不會因重整而遺失）
        try {
            if (gameState && gameState.settings) {
                saveSettingsToStorage(
                    Object.assign({}, gameState.settings, {
                        volume: this.serializeVolume()
                    })
                );
            }
        } catch(e) {
            // 靜默失敗，不影響音樂播放
        }
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
        const vol = this._musicVol();

        if (this._music) {
            try {
                this._music.volume = vol;
                if (vol <= 0 && !this._music.paused) {
                    this._music.pause();
                } else if (vol > 0 && this._music.paused && this._currentMusicKey) {
                    this._music.play().catch(() => {});
                }
            } catch(e) {}
        }

        if (_introThemeAudio) {
            try {
                const introVol = 0.4 * vol;
                _introThemeAudio.volume = introVol;
                if (introVol <= 0 && !_introThemeAudio.paused) {
                    _introThemeAudio.pause();
                } else if (introVol > 0 && _introThemeAudio.paused) {
                    _introThemeAudio.play().catch(() => {});
                }
            } catch(e) {}
        }

        this._applyGainVolumes();
    }
};

export function initAudio() {
    AudioManager.init();
    AudioManager.playMusic('morningTheme');
}

export function preloadAllSfxBuffers(onProgress) {
    return AudioManager.preloadAllSfxBuffers(onProgress);
}
