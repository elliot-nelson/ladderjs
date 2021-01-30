'use strict';

import { Sprite } from './Sprite';
import { Input } from './input/Input';
import { Text } from './Text';
import { Player } from './Player';
import { Viewport } from './Viewport';
import { TITLE, GAME_WIDTH, GAME_HEIGHT } from './Constants';
import { rgba, createCanvas, clamp, partialText, uv2xy, xy2qr } from './Util';
import { Audio } from './Audio';
import { Movement } from './systems/Movement';
import { Victory } from './systems/Victory';
import { Hud } from './Hud';
import { ScreenShake } from './ScreenShake';
import { World } from './World';
import { Terrain } from './Terrain';
import { Field } from './Field';

/**
 * Game state.
 */
export class Game {
    init() {
        Sprite.loadSpritesheet(async () => {
            await Viewport.init();
            await Sprite.init();
            await Terrain.init();
            Text.init();
            Hud.init();
            Input.init();
            Audio.init();
            World.init();

            this.entities = [];
            this.dialogPending = {};
            this.dialogSeen = {};
            this.roomsCleared = {};
            this.shadowOffset = 0;
            this.screenshakes = [];
            this.player = new Player();
            this.entities.push(this.player);
            this.camera = { pos: { x: 0, y: 0 } };
            this.cameraFocus = { pos: { x: 0, y: 0 } };

            this.field = new Field('EasyStreet');
            await this.field.init();

            window.addEventListener('blur', () => this.pause());
            window.addEventListener('focus', () => this.unpause());

            this.start();
        });
    }

    start() {
        this.fps = 30;
        this.frame = 0;
        this.frameTimes = [];
        this.update();
        window.requestAnimationFrame((delta) => this.onFrame(delta));
    }

    onFrame() {
        Viewport.resize();

        let now = new Date().getTime(), lastFrame = this.lastFrame || 0;
        if (now - lastFrame >= 1000 / this.fps) {
            this.update();
            this.lastFrame = now;
        }

        this.draw(Viewport.ctx);
        window.requestAnimationFrame(() => this.onFrame());
    }

    update() {
        // Pull in frame by frame button pushes / keypresses / mouse clicks
        Input.update();

        this.handleInput();
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
        for (let entity of game.entities) {
            if (entity.think) entity.think();
        }

        // perform any queued damage
        //Damage.perform(this.entities);

        // Movement (perform entity velocities to position)
        Movement.perform(this.entities);

        // Dialog scheduling
        //DialogScheduling.perform();

        // Victory conditions
        Victory.perform();

        if (this.field) {
            this.field.update();
        }

        // Culling (typically when an entity dies)
        this.entities = this.entities.filter(entity => !entity.cull);

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

        // Initial "click" to get game started
        if (Input.pressed[Input.Action.ATTACK] && !game.started) game.started = true;

        if (Input.pressed[Input.Action.ATTACK]) {
            // make a laser
            this.laser = 45;
        }
    }

    draw() {
        // Reset canvas transform and scale
        Viewport.ctx.setTransform(Viewport.scale, 0, 0, Viewport.scale, 0, 0);

        Viewport.ctx.fillStyle = 'black';
        Viewport.ctx.fillRect(0, 0, Viewport.width, Viewport.height);

        Viewport.ctx.translate((Viewport.width - GAME_WIDTH) / 2 | 0, (Viewport.height - GAME_HEIGHT) / 2 | 0);

        //Viewport.ctx.fillStyle = 'black';
        //Viewport.ctx.fillRect(-Viewport.width, -Viewport.height, Viewport.width * 2, Viewport.height * 2);

        //Viewport.ctx.fillStyle = 'black';
        //Viewport.ctx.font = '32px East Sea Dokdo';
        //Viewport.ctx.fillText('harold is heavy', 50, 50);

        World.draw();

        //Viewport.ctx.fillStyle = 'black';
        //Viewport.ctx.fillRect(-100, 1, 200, 200);

        //this.board.draw();

        //Hud.draw();

        for (let entity of game.entities) {
            entity.draw();
        }

//        Maze.draw();
        Viewport.ctx.font = '16px \'DejaVu Sans Mono\'';
        Viewport.ctx.fillStyle = 'black';
        Viewport.ctx.fillText('hello ┘┘ ┙┛ ├ ┘ ', 10, 10);

        let screen = [
            '00' + '*'.repeat(78),
            '01' + '.'.repeat(78),
            '02 Hey everybody, give me my part people. HP 80     / ATTACK DRAGON',
            '03 ===== ..... .....',
            '04 ...a┘a┘.................',
            '05 ........................',
            '06 ......|...+++......@....',
            '07 ......|.................',
            '08 ......\\---....$.........',
            '09 ........................',
            '10' + '='.repeat(70),
            '11',
            '12' + String(Math.random()),
            '13',
            '14',
            '15' + (' '.repeat(game.frame % 60)) + '@',
            '16',
            '17',
            '18   ' + this.fps,
            '19',
            '20',
            '21',
            '22',
            '23',
            '24'
        ].join('\n');
/*
        screen = '04 ...a┘a┘.................';

        screen = [
            '─│┌┐└┘├┤┬┴┼',
            '═║╔╗╚╝╠╣╦╩╬'
        ].join('\n');*/

        //Text.drawText(Viewport.ctx, Text.splitParagraph(screen, Viewport.width), 0, 0, 1, Text.terminal, Text.terminal_shadow);

        if (this.field) {
            this.field.draw();
        }

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

        Hud.draw();

        for (let entity of this.entities) {
            if (entity.z && entity.z > 100) entity.draw();
        }

        if (game.frame < 120) {
            Viewport.ctx.fillStyle = rgba(0, 0, 0, 1 - game.frame / 120);
            Viewport.fillViewportRect();
        }

        if (game.frame >= 30 && !game.started) {
            //let width = Text.measureWidth(TITLE, 3);
            Text.drawText(
                Viewport.ctx, TITLE, Viewport.center.u - Text.measureWidth(TITLE, 3) / 2, Viewport.center.v, 3,
                Text.white,
                Text.red
            );
        }

        if (game.victory) {
            Viewport.ctx.fillStyle = rgba(240, 0, 0, clamp(Victory.frame / 1800, 0, 0.7));
            Viewport.fillViewportRect();

            let text = 'WAIT! THE PORTAL HOME... \n \nIT STINKS LIKE ROTTEN MEAT, BUT IT LOOKS LIKE YOU ARE STUCK IN THE DUNGEONS. \n \nWELCOME HOME...';
            Text.drawParagraph(
                Viewport.ctx,
                partialText(text, Victory.frame, 600),
                40, 40,
                Viewport.width - 80,
                Viewport.ctx.height - 80,
                2,
                Text.white,
                Text.red
            );
        }

        if (this.laser === 45) {
            Audio.play([1.43,,739,.1,.5,.4,2,2.91,,-0.4,,,,,7.2,.1,.04,,,.94]); // Random 219
        }

        if (this.laser >= 41) {
            Viewport.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            Viewport.fillViewportRect();
        } else if (this.laser >= 38) {
            Viewport.ctx.fillStyle = 'rgba(128, 255, 128, 0.7)';
            Viewport.fillViewportRect();
        } else if (this.laser >= 35) {
            Viewport.ctx.fillStyle = 'rgba(128, 255, 128, 0.5)';
            Viewport.fillViewportRect();
        } else if (this.laser >= 32) {
            Viewport.ctx.fillStyle = 'rgba(128, 255, 128, 0.3)';
            Viewport.fillViewportRect();
        }

        /* laser code
        if (this.laser > 0 && this.laser < 42) {
            let center = (Viewport.width / 2) | 0, x = 0;
            for (let y = -5; y < Viewport.height; y++) {
                let choices = [-1, 0, 0, 1];
                if (x < -10) choices[0] = 1;
                if (x > 10) choices[3] = -1;

                //let vx = x + Math.sin(y + ((this.frame / 10) % 10)) * Math.cos(this.frame / 19) * 10;
                Viewport.ctx.fillStyle = 'rgba(50,200,50,1)';
                Viewport.ctx.fillRect(center + x - 10, y, this.laser > 35 ? 30 : 20, 1);
                x += choices[(Math.random() * 4) | 0];
            }
        }
        this.laser--;
        */

/*
            for (let i = 0; i < 5; i++) {
                let column = (Math.random() * Viewport.width) | 0;
                let row = ((Math.random() * Viewport.height) | 0) - 50;
                let length = ((Math.random() * 50) | 0) + 50;
                let color = [
                    //'rgba(34, 179, 34, 1)',  // base color
                    'rgba(39, 204, 39, 1)',    // brighter version
                    'rgba(25, 128, 25, 1)',    // darker version
                    'rgba(195, 230, 195, 1)'
                ][(Math.random() * 3) | 0];

                this.laserRand = this.laserRand || [];
                this.laserRand.push([column, row, length, color, 30]);
            }

            for (let laser of this.laserRand) {
                laser[4]--;
                Viewport.ctx.fillStyle = laser[3];
                Viewport.ctx.fillRect(laser[0], laser[1], 1, laser[2]);

                laser[1]+=2;
                console.log(laser[3]);
            }

            this.laserRand = this.laserRand.filter(l => l[4] > 0);*/

            /*
            canvas.ctx.fillRect(x, y, 1, 1);
            src/js/Sprite.js:    canvas.ctx.fillRect(0, 0, 500, 500);
            src/js/Sprite.js:    canvas.ctx.fillRect(0, 0, 32, 32);
            src/js/Sprite.js:    canvas.ctx.fillRect(0, 0, source.width, source.height);
            src/js/Viewport.js:        Viewport.ctx.fillRect(0, 0, Viewport.width, Vi
                */

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

    handleInput() {
        if (Input.pointer) {
            let xy = uv2xy(Input.pointer);
            let qr = xy2qr(xy);
            this.gridHovered = qr;

            if (Input.pressed[Input.Action.ATTACK]) {
                this.gridSelected = qr;
            }
        } else {
            this.gridHovered = undefined;
        }
    }

    async nextLevel() {
        this.field = undefined;

        let nextField = new Field('EasyStreet');
        await nextField.init();
        this.field = nextField;
    }
}

export const game = new Game();
