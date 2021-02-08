'use strict';

import { Sprite } from './Sprite';
import { Input } from './Input';
import { Text } from './Text';
import { Viewport } from './Viewport';
import { GAME_WIDTH, GAME_HEIGHT, PLAY_SPEEDS } from './Constants';
import { rgba, createCanvas, clamp, partialText, uv2xy, xy2qr } from './Util';
import { Audio } from './Audio';
import { ScreenShake } from './ScreenShake';
import { Screen } from './Screen';
import { MainMenu } from './MainMenu';
import { InstructionsMenu } from './InstructionsMenu';
import { Session } from './Session';

/**
 * Game state.
 */
export class Game {
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
    }

    start() {
        this.frame = 0;
        this.playSpeed = 0;
        this.menu = new MainMenu();

        window.requestAnimationFrame(() => this.onFrame());
    }

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
    }

    update() {
        // Pull in frame by frame button pushes / keypresses / mouse clicks
        Input.update();

        /*game.camera.pos.x += 0.1;
        game.camera.pos.y -= 0.1;*/

        //if (Input.pressed[Input.Action.MENU]) {
        //    this.paused ? this.unpause() : this.pause();
        //}

        if (this.paused) return;

        // perform any per-frame audio updates
        Audio.update();

        // Behavior (AI, player input, etc.)
        //perform(this.entities); <-- cut to save space

        // perform any queued damage
        //Damage.perform(this.entities);

        // Movement (perform entity velocities to position)

        // Dialog scheduling
        //DialogScheduling.perform();

        // Victory conditions

        if (this.menu) {
            this.menu.update();
        }

        /*    if (!this.session) {
            this.session = new Session();
        }*/

        if (this.session) this.session.update();

        // Culling (typically when an entity dies)

        // Camera logic
        /*let diff = {
            x: this.player.pos.x - this.camera.pos.x,
            y: this.player.pos.y - this.camera.pos.y
        };*/

        /*
        this.camera.pos.x += diff.x * 0.2;
        this.camera.pos.y += diff.y * 0.2;
        */

        // Tick screenshakes and cull finished screenshakes
        this.screenshakes = this.screenshakes.filter(screenshake =>
            screenshake.update()
        );

        // Flickering shadows
        if (game.frame % 6 === 0) this.shadowOffset = (Math.random() * 10) | 0;

        // Intro screenshake
        if (game.frame === 30) game.screenshakes.push(new ScreenShake(20, 20, 20));
    }

    draw() {
        // Reset canvas transform and scale
        Viewport.ctx.setTransform(Viewport.scale, 0, 0, Viewport.scale, 0, 0);

        Viewport.ctx.fillStyle = 'black';
        Viewport.ctx.fillRect(0, 0, Viewport.width, Viewport.height);

        Viewport.ctx.translate((Viewport.width - GAME_WIDTH) / 2 | 0, (Viewport.height - GAME_HEIGHT) / 2 | 0);

        if (this.session) this.session.draw();
        if (this.menu) this.menu.draw();

        Screen.drawToViewport();

        return;

        // Render screenshakes (canvas translation)
        let shakeX = 0, shakeY = 0;
        this.screenshakes.forEach(shake => {
            shakeX += shake.x;
            shakeY += shake.y;
        });
        Viewport.ctx.translate(shakeX, shakeY);

        //Maze.draw();

        for (let entity of this.entities) {
            if (!entity.z || entity.z < 100) entity.draw();
        }

        Viewport.ctx.drawImage(
            Sprite.shadow.img,
            0, 0,
            500, 500,
            -this.shadowOffset, -this.shadowOffset,
            Viewport.width + this.shadowOffset * 2,
            Viewport.height + this.shadowOffset * 2
        );
    }

    pause() {
        if (this.paused) return;
        this.paused = true;
        Audio.pause();
    }

    unpause() {
        if (!this.paused) return;
        this.paused = false;
        Audio.unpause();
    }

    startSession() {
        this.menu = undefined;
        this.session = new Session();
    }

    showMainMenu() {
        this.menu = new MainMenu();
        this.session = undefined;
    }

    showInstructions() {
        this.menu = new InstructionsMenu();
        this.session = undefined;
    }
}

export const game = new Game();
