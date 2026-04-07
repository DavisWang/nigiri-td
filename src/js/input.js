export class InputManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.mouseX = 0;
        this.mouseY = 0;
        this.clicked = false;
        this.clickX = 0;
        this.clickY = 0;
        this.keysPressed = new Set();
        this.keysJustPressed = new Set();
        this.codesPressed = new Set();
        this.codesJustPressed = new Set();

        const rectScale = () => {
            const rect = canvas.getBoundingClientRect();
            const sx = canvas.width / rect.width;
            const sy = canvas.height / rect.height;
            return { rect, sx, sy };
        };

        const setFromClient = (clientX, clientY) => {
            const { rect, sx, sy } = rectScale();
            this.mouseX = (clientX - rect.left) * sx;
            this.mouseY = (clientY - rect.top) * sy;
        };

        const registerClick = () => {
            this.clicked = true;
            this.clickX = this.mouseX;
            this.clickY = this.mouseY;
        };

        if (window.PointerEvent) {
            canvas.addEventListener('pointermove', (e) => {
                setFromClient(e.clientX, e.clientY);
            });

            canvas.addEventListener('pointerdown', (e) => {
                if (!e.isPrimary) return;
                if (e.pointerType === 'mouse' && e.button !== 0) return;
                setFromClient(e.clientX, e.clientY);
                try {
                    canvas.setPointerCapture(e.pointerId);
                } catch {
                    /* ignore */
                }
            });

            canvas.addEventListener('pointerup', (e) => {
                if (!e.isPrimary) return;
                if (e.pointerType === 'mouse' && e.button !== 0) return;
                setFromClient(e.clientX, e.clientY);
                registerClick();
                try {
                    canvas.releasePointerCapture(e.pointerId);
                } catch {
                    /* ignore */
                }
            });

            canvas.addEventListener('pointercancel', (e) => {
                try {
                    canvas.releasePointerCapture(e.pointerId);
                } catch {
                    /* ignore */
                }
            });
        } else {
            canvas.addEventListener('mousemove', (e) => {
                setFromClient(e.clientX, e.clientY);
            });

            canvas.addEventListener('click', (e) => {
                setFromClient(e.clientX, e.clientY);
                registerClick();
            });

            const touchOpts = { passive: false };
            canvas.addEventListener('touchstart', (e) => {
                if (e.targetTouches.length === 1) {
                    const t = e.targetTouches[0];
                    setFromClient(t.clientX, t.clientY);
                }
            }, touchOpts);

            canvas.addEventListener('touchmove', (e) => {
                if (e.targetTouches.length === 1) {
                    e.preventDefault();
                    const t = e.targetTouches[0];
                    setFromClient(t.clientX, t.clientY);
                }
            }, touchOpts);

            canvas.addEventListener('touchend', (e) => {
                if (e.changedTouches.length >= 1) {
                    e.preventDefault();
                    const t = e.changedTouches[0];
                    setFromClient(t.clientX, t.clientY);
                    registerClick();
                }
            }, touchOpts);
        }

        window.addEventListener('keydown', (e) => {
            if (!this.keysPressed.has(e.key)) {
                this.keysJustPressed.add(e.key);
            }
            this.keysPressed.add(e.key);
            if (!this.codesPressed.has(e.code)) {
                this.codesJustPressed.add(e.code);
            }
            this.codesPressed.add(e.code);
        });

        window.addEventListener('keyup', (e) => {
            this.keysPressed.delete(e.key);
            this.codesPressed.delete(e.code);
        });

        canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    consumeClick() {
        if (this.clicked) {
            this.clicked = false;
            return { x: this.clickX, y: this.clickY };
        }
        return null;
    }

    wasKeyPressed(key) {
        return this.keysJustPressed.has(key);
    }

    /** Physical key, e.g. `NumpadAdd` / `NumpadSubtract` (stable across layouts). */
    wasCodePressed(code) {
        return this.codesJustPressed.has(code);
    }

    endFrame() {
        this.clicked = false;
        this.keysJustPressed.clear();
        this.codesJustPressed.clear();
    }
}
