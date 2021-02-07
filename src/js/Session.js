
import { PLAY_SPEEDS, SCORE_ROCK, SCORE_STATUE, SCORE_TREASURE } from './Constants';
import { Field } from './Field';
import { Screen } from './Screen';
import { Input } from './Input';
import { game } from './Game';

export class Session {
    constructor() {
        this.score = 0;
        this.levelNumber = 0;
        this.levelCycle = 1;
        this.lives = 5;
        this.nextLife = 100;
    }

    update() {
        // The overall game loop runs at a fixed 60 frames per second, but the Play Speed selected
        // at the main menu controls how fast the game runs. To accomplish that, we do a second
        // time check here, and unless this is a "move frame", we skip all the logic related to
        // moving entities.
        //
        // This setup allows us to have things like death animations look the same regardless of
        // the Play Speed selected.
        let moveFps = PLAY_SPEEDS[game.playSpeed];
        let now = new Date().getTime();
        let lastFrame = this.lastFrame || 0;
        let moveFrame = false;

        if (now - lastFrame >= 1000 / moveFps) {
            moveFrame = true;
            this.lastFrame = now;
        }

        if (!this.field) {
            this.field = new Field(this.levelNumber);
        }

        this.field.update(moveFrame);

        let recentKeystrokes = Input.buffer.map(event => event.key).join('').toUpperCase();

        if (recentKeystrokes.match(/IDCLEV(\d\d)/)) {
            Input.consume();
            this.field = undefined;
            this.levelNumber = parseInt(RegExp.$1, 10);
        } else if (recentKeystrokes.includes("IDDQD")) {
            Input.consume();
            console.log("god mode");
        }
    }

    draw() {
        Screen.clear();

        if (this.field) this.field.draw();

        let stat = [
            String(this.lives).padStart(2, ' '),
            String(this.levelNumber + 1).padStart(2, ' '),
            String(this.score).padStart(4, '0'),
            this.field ? String(this.field.time).padStart(4, ' ') : ''
        ];
        Screen.write(0, 21, `Lads   ${stat[0]}   Level   ${stat[1]}    Score   ${stat[2]}    Bonus time   ${stat[3]}`);
    }

    restartLevel() {
        this.field = undefined;
    }

    startNextLevel() {
        this.field = undefined;
        this.levelNumber++;
        if (this.levelNumber % Levels.LEVEL_COUNT === 0) {
            this.levelCycle++;
        }
    }

    updateScore(scoreType) {
        switch (scoreType) {
            case SCORE_ROCK:
                this.score += 2;
                break;
            case SCORE_STATUE:
                this.score += this.field.time;
                break;
            case SCORE_TREASURE:
                // Called repeatedly during the end-of-level event.
                this.score += 1;
                break;
        }
    }
}
