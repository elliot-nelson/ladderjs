/**
 * `GameSession` is a class that represents... well, a game session! It is created when the
 * player presses `P` at the main menu, and ends when the player runs out of lives.
 *
 * The game session tracks values that persist across levels (like number of lives, score,
 * the level number, etc.). Most of the actual in-game logic it hands off to `PlayingField`.
 */

import { PLAY_SPEEDS, SCORE_ROCK, SCORE_STATUE, SCORE_TREASURE, HIDDEN_FACTOR_PLAY_SPEED } from './Constants';
import { Game } from './Game';
import { PlayingField } from './PlayingField';
import { Level } from './Level';
import { Screen } from './Screen';
import { Input } from './Input';

export class GameSession {
    constructor() {
        this.score = 0;
        this.levelNumber = 0;
        this.levelCycle = 1;
        this.lives = 5;
        this.nextLife = 100;
    }

    update() {
        // The `Game` controls the overall game loop, which runs at a fixed 60 frames per second.
        //
        // However, Ladder has the concept of "play speed" which the player can change at the main
        // menu, and it controls how fast the game runs. To accomplish that, we can do a second
        // frame gate here. This gate sets a flag called `moveFrame` IF things can move in this frame.
        //
        // We do it this way so that animations (like the play death animation, or the end-of-level
        // score animation) can run at the same speed no matter what the play speed is.
        let now = new Date().getTime();
        let lastFrame = this.lastFrame || 0;
        let moveFrame = false;

        if (now - lastFrame >= (this.nextFrame || 0)) {
            moveFrame = true;
            this.nextFrame = now + this.moveFrameMillisecondDelay();
        }

        if (this.paused && [Input.Action.PAUSE, Input.Action.RESUME].includes(Input.lastAction())) {
            this.paused = false;
            Input.consume();
        }

        if (!this.paused && Input.lastAction() === Input.Action.PAUSE) {
            this.paused = true;
            Input.consume();
        }

        if (this.paused) return;

        // If we haven't instantiated the playing field yet, create it now.
        if (!this.field) this.field = new PlayingField(this.levelNumber);

        // Hand off to the playing field for actual in-game logic
        this.field.update(moveFrame);

        this.handleCheatCodes();
    }

    draw() {
        if (this.field) this.field.draw();

        let stat = [
            String(this.lives).padStart(2, ' '),
            String(this.levelNumber + 1).padStart(2, ' '),
            String(this.score).padStart(6, ' '),
            this.field ? String(this.field.time).padStart(4, ' ') : ''
        ];
        Screen.write(0, 21, `Lads   ${stat[0]}     Level   ${stat[1]}      Score   ${stat[2]}      Bonus time   ${stat[3]}`);

        if (this.paused) {
            Screen.write(0, 23, 'Paused - type ESCape or RETURN to continue.');
        }
    }

    restartLevel() {
        this.field = undefined;
    }

    startNextLevel() {
        this.field = undefined;
        this.levelNumber++;
        if (this.levelNumber % Level.LEVEL_COUNT === 0) {
            this.levelCycle++;
        }
    }

    updateScore(scoreType) {
        switch (scoreType) {
            case SCORE_ROCK:
                this.score += 200;
                break;
            case SCORE_STATUE:
                this.score += this.field.time;
                break;
            case SCORE_TREASURE:
                // Added repeatedly after winning the level
                this.score += 10;
                break;
        }
    }

    hiddenFactor() {
        // This "hidden" difficulty level increases steadily as the player completes a
        // level cycle (every time they reach the Easy Street level). This makes the
        // game slowly harder as you keep playing.
        return Math.floor(this.levelNumber / Level.LEVEL_COUNT);
    }

    moveFrameMillisecondDelay() {
        // Regardless of play speed, the game gets slightly faster every level cycle
        return Math.floor(PLAY_SPEEDS[Game.playSpeed] - this.hiddenFactor() * HIDDEN_FACTOR_PLAY_SPEED * PLAY_SPEEDS[Game.playSpeed]);
    }

    handleCheatCodes() {
        // Cheat codes are useful for testing, and this game is no exception. Of course
        // THESE cheat codes do not belong here, as they wouldn't be created until 11 years
        // later, but that won't stop me from inserting them anywhere I get the chance!
        //
        // =================     ===============     ===============   ========  ========
        // \\ . . . . . . .\\   //. . . . . . .\\   //. . . . . . .\\  \\. . .\\// . . //
        // ||. . ._____. . .|| ||. . ._____. . .|| ||. . ._____. . .|| || . . .\/ . . .||
        // || . .||   ||. . || || . .||   ||. . || || . .||   ||. . || ||. . . . . . . ||
        // ||. . ||   || . .|| ||. . ||   || . .|| ||. . ||   || . .|| || . | . . . . .||
        // || . .||   ||. _-|| ||-_ .||   ||. . || || . .||   ||. _-|| ||-_.|\ . . . . ||
        // ||. . ||   ||-'  || ||  `-||   || . .|| ||. . ||   ||-'  || ||  `|\_ . .|. .||
        // || . _||   ||    || ||    ||   ||_ . || || . _||   ||    || ||   |\ `-_/| . ||
        // ||_-' ||  .|/    || ||    \|.  || `-_|| ||_-' ||  .|/    || ||   | \  / |-_.||
        // ||    ||_-'      || ||      `-_||    || ||    ||_-'      || ||   | \  / |  `||
        // ||    `'         || ||         `'    || ||    `'         || ||   | \  / |   ||
        // ||            .===' `===.         .==='.`===.         .===' /==. |  \/  |   ||
        // ||         .=='   \_|-_ `===. .==='   _|_   `===. .===' _-|/   `==  \/  |   ||
        // ||      .=='    _-'    `-_  `='    _-'   `-_    `='  _-'   `-_  /|  \/  |   ||
        // ||   .=='    _-'          `-__\._-'         `-_./__-'         `' |. /|  |   ||
        // ||.=='    _-'                                                     `' |  /==.||
        // =='    _-'                                                            \/   `==
        // \   _-'                                                                `-_   /
        //  `''                                                                      ``'
        //
        let recentKeystrokes = Input.history.map(event => event.key).join('').toUpperCase();
        if (recentKeystrokes.match(/IDCLEV(\d\d)/)) {
            // Changing levels is as simple as setting the desired level number
            // and then throwing the current playing field away.
            Input.consume();
            this.levelNumber = parseInt(RegExp.$1, 10);
            this.field = undefined;
        } else if (recentKeystrokes.includes("IDDQD")) {
            Input.consume();
            console.log("god mode");
        } else if (recentKeystrokes.includes("IDKFA")) {
            // Immediately end the current level as if we'd touched the reasure.
            Input.consume();
            this.field.winning = true;
        }
    }
}
