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

            window.addEventListener('blur', () => this.lostFocus());
            window.addEventListener('focus', () => this.gainedFocus());

            this.start();
        });
    },

    start() {
        this.frame = 0;
        this.playSpeed = 0;
        this.showMainMenu();

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
            this.frame++;
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

        // Clear canvas. Note we don't go for pure black but rather a dark gray, to simulate
        // the relatively bright phosphors on the Kaypro II. (We are going to add scan lines
        // at the end which will appear to darken the whole screen, so the overall effect
        // will be a little darker than this color.)
        Viewport.ctx.fillStyle = '#181818';
        Viewport.ctx.fillRect(0, 0, Viewport.width, Viewport.height);

        // Center the 80x25 character "screen" in the viewport
        Viewport.ctx.translate((Viewport.width - GAME_WIDTH) / 2 | 0, (Viewport.height - GAME_HEIGHT) / 2 | 0);

        // Hand off control to our submodules to draw whatever they'd like. For all the submodules
        // below us, "drawing" means writing text to the Screen.
        Screen.clear();
        if (this.session) this.session.draw();
        if (this.menu) this.menu.draw();

        // Render the text on the screen to the viewport.
        Screen.draw(Viewport.ctx);

        // After drawing the "screen" (characters), add scan lines on top. Our scan lines are almost
        // not visible, but move slowly and introduce subtle visual shifts in the characters on screen,
        // which is the effect we are going for.
        //
        // (Technically scan lines should be IN BETWEEN rows of pixels, and what we're actually simulating
        // here is our eyeballs clocking the screen refresh. We're going for a general feeling here.)
        Viewport.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        for (let y = Math.floor(-Viewport.height / 2) - 4; y < Viewport.height + 4; y += 4) {
            let r = ((this.frame / 5) % 4) + y;
            Viewport.ctx.fillRect(-Viewport.width, r, Viewport.width * 2, 2);
        }
    },

    startSession() {
        this.menu = undefined;
        this.session = new GameSession();

        // Hide the github link while in a game session
        document.getElementsByClassName('github-corner')[0].className = 'github-corner hidden';
    },

    showMainMenu() {
        this.menu = new MainMenu();
        this.session = undefined;

        // Show github link again when returning from a game
        document.getElementsByClassName('github-corner')[0].className = 'github-corner';
    },

    showInstructions() {
        this.menu = new InstructionsMenu();
        this.session = undefined;
    },

    lostFocus() {
        // If we lose focus (the user switched tabs, or tabbed away from the browser),
        // automatically pause the game session if there is one.
        if (this.session) this.session.paused = true;
    },

    gainedFocus() {
        // Do nothing - we'll let the user hit enter to resume playing.
    }
};
