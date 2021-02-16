/**
 * `Game` is a singleton that represents the running game in the browser,
 * initializes game submodules, and handles the top-level game loop.
 */

import { Sprite } from './Sprite';
import { Input } from './Input';
import { Text } from './Text';
import { Viewport } from './Viewport';
import { GAME_WIDTH, GAME_HEIGHT, PLAY_SPEEDS } from './Constants';
import { Audio } from './Audio';
import { Screen } from './Screen';
import { MainMenu } from './MainMenu';
import { InstructionsMenu } from './InstructionsMenu';
import { GameSession } from './GameSession';

export const Game = {
    init() {
        Sprite.loadSpritesheet(async () => {
            await Viewport.init();
            await Screen.init();
            await Sprite.init();
            await Text.init();
            await Input.init();
            await Audio.init();

            window.addEventListener('blur', () => this.pause());
            window.addEventListener('focus', () => this.unpause());

            this.start();
        });
    },

    start() {
        this.frame = 0;
        this.playSpeed = 0;
        this.menu = new MainMenu();

        window.requestAnimationFrame(() => this.onFrame());
    },

    onFrame() {
        let fps = 60;
        let now = new Date().getTime();
        let lastFrame = this.lastFrame || 0;

        // Note: we are using `requestAnimationFrame`, which will call our onFrame handler
        // 60 times per second in most cases. However, it can be higher (the browser may
        // respect the user's refresh settings, which could be 120Hz or higher for example).
        //
        // It's safest to have a check like we do here, where we explicitly limit the number
        // of update calls to 60 times per second.
        if (now - lastFrame >= 1000 / fps) {
            this.update();
            this.lastFrame = now;
        }

        Viewport.resize();
        this.draw();

        window.requestAnimationFrame(() => this.onFrame());
    },

    update() {
        // Pull in frame by frame button pushes / keypresses / mouse clicks
        Input.update();

        // perform any per-frame audio updates
        Audio.update();

        if (this.menu) {
            this.menu.update();
        }

        if (this.session) this.session.update();
    },

    draw() {
        // Reset canvas transform and scale
        Viewport.ctx.setTransform(Viewport.scale, 0, 0, Viewport.scale, 0, 0);

        // Clear canvas
        Viewport.ctx.fillStyle = '#141414';
        Viewport.ctx.fillRect(0, 0, Viewport.width, Viewport.height);

        // Center the 80x25 character "screen" in the viewport
        Viewport.ctx.translate((Viewport.width - GAME_WIDTH) / 2 | 0, (Viewport.height - GAME_HEIGHT) / 2 | 0);

        // Hand off control to our submodules to draw whatever they'd like. For all the submodules
        // below us, "drawing" means writing text to the Screen.
        Screen.clear();
        if (this.session) this.session.draw();
        if (this.menu) this.menu.draw();

        // Render the text on the screen to the viewport.
        Screen.drawToViewport();
    },

    pause() {
        if (this.paused) return;
        this.paused = true;
        Audio.pause();
    },

    unpause() {
        if (!this.paused) return;
        this.paused = false;
        Audio.unpause();
    },

    startSession() {
        this.menu = undefined;
        this.session = new GameSession();
    },

    showMainMenu() {
        this.menu = new MainMenu();
        this.session = undefined;
    },

    showInstructions() {
        this.menu = new InstructionsMenu();
        this.session = undefined;
    }
};
