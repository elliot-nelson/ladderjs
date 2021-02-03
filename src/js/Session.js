
import { LEVEL_ORDER } from './Constants';
import { Field } from './Field';
import { Screen } from './Screen';
import { sprintf } from 'sprintf-js';

export class Session {
    constructor() {
        this.score = 0;
        this.levelNumber = 0;
        this.levelCycle = 1;
        this.lives = 5;
        this.nextLife = 100;
    }

    update() {
        if (!this.field) {
            this.field = new Field(LEVEL_ORDER[this.levelNumber]);
        }

        this.field.update(this);
    }

    draw() {
        this.field.draw();
        Screen.write(sprintf(
            'Lads   %2d     Level   %2d     Score    %04d                 Bonus time    %4d',
            this.lives,
            this.levelNumber + 1,
            this.score,
            this.field.time
        ));
    }

    restartLevel() {
        this.field = undefined;
    }

    startNextLevel() {
        this.field = undefined;
        this.levelNumber++;
        if (this.levelNumber >= LEVEL_ORDER.length) {
            this.levelCycle++;
            this.levelNumber = 0;
        }
    }
}
