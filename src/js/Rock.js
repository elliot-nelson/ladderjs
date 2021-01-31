import { Text } from './Text';
import { State } from './Behavior';
import { LEVEL_COLS } from './Constants';
import { Entity } from './Entity';

export class Rock extends Entity {
    constructor(dispenser) {
        super();
        this.x = dispenser.x;
        this.y = dispenser.y + 1;
        this.state = State.FALLING;
        this.nextState = undefined;
    }

    update(field) {
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
            return false;
        }

        this.applyMovement(field);

        return true;
    }

    draw() {
        Text.drawTextColRow('o', this.x, this.y);
    }
}
