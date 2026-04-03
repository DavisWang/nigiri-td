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

        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            this.mouseX = (e.clientX - rect.left) * scaleX;
            this.mouseY = (e.clientY - rect.top) * scaleY;
        });

        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            this.clicked = true;
            this.clickX = (e.clientX - rect.left) * scaleX;
            this.clickY = (e.clientY - rect.top) * scaleY;
        });

        window.addEventListener('keydown', (e) => {
            if (!this.keysPressed.has(e.key)) {
                this.keysJustPressed.add(e.key);
            }
            this.keysPressed.add(e.key);
        });

        window.addEventListener('keyup', (e) => {
            this.keysPressed.delete(e.key);
        });
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

    endFrame() {
        this.clicked = false;
        this.keysJustPressed.clear();
    }
}
