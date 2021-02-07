import { Text } from './Text';
import { State } from './Behavior';
import { LEVEL_COLS } from './Constants';
import { Entity } from './Entity';
import { Screen } from './Screen';

const DEATH_FRAMES = ['%', ':'];

export class Rock extends Entity {
    constructor(dispenser) {
        super();
        this.x = dispenser.x;
        this.y = dispenser.y;
        this.state = State.FALLING;
        this.nextState = undefined;
        this.deathStep = 0;
    }

    update(field) {
        if (this.state === State.DYING) {
            this.deathStep++;
            if (this.deathStep >= DEATH_FRAMES.length) this.state = State.DEAD;
        }

        if (this.state === State.DYING || this.state === State.DEAD) return;

        if (this.state === State.STOPPED) {
            if (this.x === 0 || !field.emptySpace(this.x - 1, this.y)) {
                this.nextState = State.RIGHT;
            } else if (this.x === LEVEL_COLS - 1 || !field.emptySpace(this.x + 1, this.y)) {
                this.nextState = State.LEFT;
            } else {
                this.nextState = Math.random() > 0.5 ? State.LEFT : State.RIGHT;
            }
        }

        if (this.x === 0 && this.state === State.LEFT) {
            this.state = State.RIGHT;
        }

        if (this.x === LEVEL_COLS - 1 && this.state === State.RIGHT) {
            this.state = State.LEFT;
        }

        if (this.state !== State.FALLING && !field.onSolid(this.x, this.y)) {
            this.nextState = State.FALLING;
        }

        if (field.isLadder(this.x, this.y + 1) && [State.LEFT, State.RIGHT].includes(this.state)) {
            let r = Math.floor(Math.random() * 4);
            this.nextState = [State.LEFT, State.RIGHT, State.DOWN, State.DOWN][r];
        }

        if (field.isEater(this.x, this.y)) {
            this.state = State.DYING;
            return;
        }

        this.applyMovement(field);
    }

    draw() {
        let char = 'o';

        switch (this.state) {
            case State.DYING:
                char = DEATH_FRAMES[this.deathStep];
                break;
            case State.DEAD:
                return;
        }

        Screen.write(this.x, this.y, char);
    }
}
