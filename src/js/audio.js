const STORAGE_KEY = 'nigiri-td-audio-muted';

export class AudioManager {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.sfxGain = null;
        this.bgmGain = null;
        this.muted = localStorage.getItem(STORAGE_KEY) !== 'false';
        this.bgmNodes = [];
        this.bgmTimer = null;
        this.bgmPlaying = false;
        this._lastPlay = {};
    }

    _ensureContext() {
        if (this.ctx) return true;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.connect(this.ctx.destination);
            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.value = 0.35;
            this.sfxGain.connect(this.masterGain);
            this.bgmGain = this.ctx.createGain();
            this.bgmGain.gain.value = 0.12;
            this.bgmGain.connect(this.masterGain);
            this._applyMute();
            return true;
        } catch {
            return false;
        }
    }

    _applyMute() {
        if (this.masterGain) {
            this.masterGain.gain.value = this.muted ? 0 : 1;
        }
    }

    toggle() {
        this.muted = !this.muted;
        localStorage.setItem(STORAGE_KEY, this.muted ? 'true' : 'false');
        this._applyMute();
        if (!this.muted && !this.ctx) this._ensureContext();
        if (this.muted) this.stopBGM();
    }

    _canPlay(id, minInterval = 80) {
        if (!this.ctx || this.muted) return false;
        const now = this.ctx.currentTime;
        if (this._lastPlay[id] && now - this._lastPlay[id] < minInterval / 1000) return false;
        this._lastPlay[id] = now;
        return true;
    }

    _osc(type, freq, startT, dur, gainNode, vol = 0.3) {
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = type;
        o.frequency.value = freq;
        g.gain.setValueAtTime(vol, startT);
        g.gain.exponentialRampToValueAtTime(0.001, startT + dur);
        o.connect(g);
        g.connect(gainNode);
        o.start(startT);
        o.stop(startT + dur + 0.05);
    }

    _noise(startT, dur, gainNode, vol = 0.1) {
        const bufSize = this.ctx.sampleRate * dur;
        const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
        const src = this.ctx.createBufferSource();
        src.buffer = buf;
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(vol, startT);
        g.gain.exponentialRampToValueAtTime(0.001, startT + dur);
        const filt = this.ctx.createBiquadFilter();
        filt.type = 'bandpass';
        filt.frequency.value = 3000;
        filt.Q.value = 1;
        src.connect(filt);
        filt.connect(g);
        g.connect(gainNode);
        src.start(startT);
        src.stop(startT + dur + 0.05);
    }

    playClick() {
        if (!this._canPlay('click', 50)) return;
        const t = this.ctx.currentTime;
        this._osc('sine', 800, t, 0.06, this.sfxGain, 0.15);
        this._osc('sine', 1200, t + 0.02, 0.04, this.sfxGain, 0.1);
    }

    playError() {
        if (!this._canPlay('error', 200)) return;
        const t = this.ctx.currentTime;
        this._osc('square', 200, t, 0.12, this.sfxGain, 0.08);
        this._osc('square', 150, t + 0.06, 0.12, this.sfxGain, 0.06);
    }

    playPlace() {
        if (!this._canPlay('place', 100)) return;
        const t = this.ctx.currentTime;
        this._osc('sine', 400, t, 0.08, this.sfxGain, 0.2);
        this._osc('sine', 600, t + 0.05, 0.08, this.sfxGain, 0.2);
        this._osc('sine', 900, t + 0.1, 0.12, this.sfxGain, 0.15);
    }

    playSell() {
        if (!this._canPlay('sell', 100)) return;
        const t = this.ctx.currentTime;
        const notes = [880, 660, 440];
        notes.forEach((f, i) => this._osc('triangle', f, t + i * 0.06, 0.1, this.sfxGain, 0.15));
    }

    playUpgrade() {
        if (!this._canPlay('upgrade', 100)) return;
        const t = this.ctx.currentTime;
        const notes = [523, 659, 784];
        notes.forEach((f, i) => {
            this._osc('sine', f, t + i * 0.08, 0.15, this.sfxGain, 0.2);
            this._osc('triangle', f * 2, t + i * 0.08, 0.1, this.sfxGain, 0.06);
        });
    }

    playChomp() {
        if (!this._canPlay('chomp', 80)) return;
        const t = this.ctx.currentTime;
        const f = 300 + Math.random() * 100;
        this._osc('sawtooth', f, t, 0.05, this.sfxGain, 0.08);
        this._osc('sine', f * 0.5, t + 0.02, 0.06, this.sfxGain, 0.1);
        this._noise(t, 0.04, this.sfxGain, 0.04);
    }

    playThrow() {
        if (!this._canPlay('throw', 80)) return;
        const t = this.ctx.currentTime;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(600, t);
        o.frequency.exponentialRampToValueAtTime(1200, t + 0.08);
        g.gain.setValueAtTime(0.1, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        o.connect(g);
        g.connect(this.sfxGain);
        o.start(t);
        o.stop(t + 0.12);
    }

    playFire() {
        if (!this._canPlay('fire', 150)) return;
        const t = this.ctx.currentTime;
        this._noise(t, 0.2, this.sfxGain, 0.08);
        this._osc('sawtooth', 150, t, 0.15, this.sfxGain, 0.06);
        this._osc('sine', 100, t + 0.05, 0.15, this.sfxGain, 0.05);
    }

    playMulti() {
        if (!this._canPlay('multi', 80)) return;
        const t = this.ctx.currentTime;
        for (let i = 0; i < 3; i++) {
            this._noise(t + i * 0.03, 0.04, this.sfxGain, 0.03);
            this._osc('sine', 500 + i * 200, t + i * 0.03, 0.05, this.sfxGain, 0.06);
        }
    }

    playPop() {
        if (!this._canPlay('pop', 50)) return;
        const t = this.ctx.currentTime;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(400, t);
        o.frequency.exponentialRampToValueAtTime(800, t + 0.05);
        o.frequency.exponentialRampToValueAtTime(200, t + 0.15);
        g.gain.setValueAtTime(0.2, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        o.connect(g);
        g.connect(this.sfxGain);
        o.start(t);
        o.stop(t + 0.2);
        this._osc('triangle', 1200, t + 0.03, 0.08, this.sfxGain, 0.06);
    }

    playWaste() {
        if (!this._canPlay('waste', 200)) return;
        const t = this.ctx.currentTime;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(500, t);
        o.frequency.exponentialRampToValueAtTime(150, t + 0.3);
        g.gain.setValueAtTime(0.15, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        o.connect(g);
        g.connect(this.sfxGain);
        o.start(t);
        o.stop(t + 0.4);
    }

    playWaveStart() {
        if (!this._canPlay('waveStart', 500)) return;
        const t = this.ctx.currentTime;
        const notes = [523, 659, 784, 1047];
        notes.forEach((f, i) => {
            this._osc('triangle', f, t + i * 0.1, 0.15, this.sfxGain, 0.15);
        });
    }

    playRoundComplete() {
        if (!this._canPlay('roundComplete', 500)) return;
        const t = this.ctx.currentTime;
        const notes = [523, 659, 784, 1047, 1319];
        notes.forEach((f, i) => {
            this._osc('sine', f, t + i * 0.1, 0.2, this.sfxGain, 0.15);
            this._osc('triangle', f * 0.5, t + i * 0.1, 0.15, this.sfxGain, 0.05);
        });
    }

    playGameOver() {
        if (!this._canPlay('gameOver', 1000)) return;
        const t = this.ctx.currentTime;
        const notes = [440, 392, 330, 262];
        notes.forEach((f, i) => {
            this._osc('sine', f, t + i * 0.25, 0.4, this.sfxGain, 0.18);
        });
    }

    playVictory() {
        if (!this._canPlay('victory', 1000)) return;
        const t = this.ctx.currentTime;
        const notes = [523, 659, 784, 1047, 784, 1047, 1319];
        notes.forEach((f, i) => {
            this._osc('sine', f, t + i * 0.12, 0.25, this.sfxGain, 0.18);
            this._osc('triangle', f * 2, t + i * 0.12, 0.15, this.sfxGain, 0.05);
        });
        this._osc('sine', 1319, t + 0.84, 0.6, this.sfxGain, 0.12);
    }

    // --- BGM ---

    startBGM() {
        if (this.bgmPlaying) return;
        if (!this._ensureContext()) return;
        this.bgmPlaying = true;
        this._scheduleBGMLoop();
    }

    stopBGM() {
        this.bgmPlaying = false;
        if (this.bgmTimer) {
            clearTimeout(this.bgmTimer);
            this.bgmTimer = null;
        }
        this.bgmNodes.forEach(n => { try { n.stop(); } catch {} });
        this.bgmNodes = [];
    }

    _scheduleBGMLoop() {
        if (!this.bgmPlaying || !this.ctx) return;

        const t = this.ctx.currentTime + 0.05;
        const bpm = 120;
        const beat = 60 / bpm;
        const eighth = beat / 2;

        const C4 = 261.63, D4 = 293.66, E4 = 329.63, G4 = 392.00, A4 = 440.00;
        const C5 = 523.25, D5 = 587.33, E5 = 659.25, G5 = 783.99, A5 = 880.00;
        const R = 0;

        const melody = [
            E4, G4, A4, G4,  E4, D4, C4, R,
            D4, E4, G4, E4,  D4, C4, D4, R,
            E4, G4, A4, C5,  A4, G4, E4, R,
            G4, E4, D4, C4,  D4, E4, D4, R,

            C5, A4, G4, A4,  C5, D5, E5, R,
            D5, C5, A4, G4,  A4, G4, E4, R,
            E4, G4, A4, C5,  D5, C5, A4, G4,
            A4, G4, E4, D4,  C4, D4, E4, R,
        ];

        const bassPattern = [
            C4/2, C4/2, G4/4*0.5, G4/4*0.5,
            D4/2, D4/2, A4/4*0.5, A4/4*0.5,
            E4/2, E4/2, C4/2, C4/2,
            G4/2, G4/2, C4/2, C4/2,
        ];

        const loopDuration = melody.length * eighth;
        const nodes = [];

        melody.forEach((freq, i) => {
            if (freq === 0) return;
            const start = t + i * eighth;
            const dur = eighth * 0.8;

            const o1 = this.ctx.createOscillator();
            const o2 = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            o1.type = 'sine';
            o1.frequency.value = freq;
            o2.type = 'triangle';
            o2.frequency.value = freq;
            g.gain.setValueAtTime(0.12, start);
            g.gain.setValueAtTime(0.1, start + dur * 0.3);
            g.gain.exponentialRampToValueAtTime(0.001, start + dur);
            o1.connect(g);
            o2.connect(g);
            g.connect(this.bgmGain);
            o1.start(start);
            o1.stop(start + dur + 0.02);
            o2.start(start);
            o2.stop(start + dur + 0.02);
            nodes.push(o1, o2);
        });

        bassPattern.forEach((freq, i) => {
            const start = t + i * (loopDuration / bassPattern.length);
            const dur = (loopDuration / bassPattern.length) * 0.6;
            const o = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            o.type = 'sine';
            o.frequency.value = freq;
            g.gain.setValueAtTime(0.06, start);
            g.gain.exponentialRampToValueAtTime(0.001, start + dur);
            o.connect(g);
            g.connect(this.bgmGain);
            o.start(start);
            o.stop(start + dur + 0.02);
            nodes.push(o);
        });

        for (let i = 0; i < melody.length; i += 2) {
            const start = t + i * eighth;
            this._bgmPerc(start, nodes);
        }

        this.bgmNodes = nodes;
        this.bgmTimer = setTimeout(() => {
            if (this.bgmPlaying) this._scheduleBGMLoop();
        }, loopDuration * 1000 - 100);
    }

    _bgmPerc(start, nodes) {
        const bufSize = Math.floor(this.ctx.sampleRate * 0.03);
        const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
        const src = this.ctx.createBufferSource();
        src.buffer = buf;
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(0.03, start);
        g.gain.exponentialRampToValueAtTime(0.001, start + 0.03);
        const filt = this.ctx.createBiquadFilter();
        filt.type = 'highpass';
        filt.frequency.value = 6000;
        src.connect(filt);
        filt.connect(g);
        g.connect(this.bgmGain);
        src.start(start);
        src.stop(start + 0.05);
        nodes.push(src);
    }
}
