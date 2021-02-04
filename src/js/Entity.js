import { State, JUMP_FRAMES } from './Behavior';
import { LEVEL_COLS } from './Constants';

export class Entity {
    applyMovement(field) {
        let repeat = false;

        // This method contains generic "movement" application for all entities, including
        // Lad (player) and Der Rocks (enemies). Things like falling, moving left/right, etc.,
        // work the same for both.
        //
        // (There's a bunch of jump logic in here too, and moving UP, which really only applies
        // to players, but that's OK -- Der Rocks just won't attempt those actions.)

        if (this.nextState) {
            switch (this.state) {
                case State.STOPPED:
                case State.LEFT:
                case State.RIGHT:
                    if ([State.LEFT, State.RIGHT, State.STOPPED].includes(this.nextState)) {
                        this.state = this.nextState;
                        this.nextState = undefined;
                    }
                    break;

                case State.UP:
                case State.DOWN:
                    // Normal
                    if ([State.LEFT, State.RIGHT].includes(this.nextState)) {
                        this.state = this.nextState;
                        this.nextState = undefined;
                    }
                    break;
            }
        }

        if (this.nextState === State.START_JUMP) {
            // Special case: the user wants to jump!
            //
            // If the player is standing on something solid, we initiate a jump based on the current
            // movement of the player. If not, we (sort of) ignore the request to jump... although
            // it does subtly change the behavior upon landing.
            if (field.onSolid(this.x, this.y)) {
                if (this.state === State.STOPPED || this.state === State.FALLING) {
                    this.state = State.JUMP_UP;
                    this.jumpStep = 0;
                    this.nextState = State.STOPPED;
                } else if (this.state === State.LEFT || this.state === State.JUMP_LEFT) {
                    this.state = State.JUMP_LEFT;
                    this.jumpStep = 0;
                    this.nextState = State.LEFT;
                } else if (this.state === State.RIGHT || this.state === State.JUMP_RIGHT) {
                    this.state = State.JUMP_RIGHT;
                    this.jumpStep = 0;
                    this.nextState = State.RIGHT;
                }
            } else {
                if (this.state === State.JUMP_UP || this.state === State.FALLING) {
                    this.nextState = State.STOPPED;
                } else if (this.state === State.JUMP_RIGHT) {
                    this.nextState = State.RIGHT;
                } else if (this.state === State.JUMP_LEFT) {
                    this.nextState = State.LEFT;
                }
            }
        } else if (this.nextState === State.UP && field.isLadder(this.x, this.y)) {
            // Special case: the user wants to go up!
            //
            // If the user is on a ladder, we can start ascending. Note that if the user is not
            // on a ladder we ignore their input, which is intentional -- this allows queued
            // (pacman) input, where we can tap UP a little before reaching the ladder.
            this.state = State.UP;
            this.nextState = undefined;
        } else if (this.nextState === State.DOWN && (field.isLadder(this.x, this.y) || field.isLadder(this.x, this.y + 1))) {
            // Special case: the player wants to go down!
            //
            // If the player is on (or above) a ladder, we can start descending. Note that if the player is not
            // on a ladder we ignore their input, which is intentional -- this allows queued
            // (pacman) input, where we can tap DOWN a little before reaching the ladder.
            this.state = State.DOWN;
            this.nextState = undefined;
        }

        switch (this.state) {
            case State.LEFT:
                if (!field.onSolid(this.x, this.y)) {
                    this.nextState = State.LEFT;
                    this.state = State.FALLING;
                    repeat = true;
                    break;
                }
                if (field.emptySpace(this.x - 1, this.y)) {
                    this.x--;
                } else {
                    this.nextState = State.STOPPED;
                }
                break;

            case State.RIGHT:
                if (!field.onSolid(this.x, this.y)) {
                    this.nextState = State.RIGHT;
                    this.state = State.FALLING;
                    repeat = true;
                    break;
                }
                if (field.emptySpace(this.x + 1, this.y)) {
                    this.x++;
                } else {
                    this.nextState = State.STOPPED;
                }
                break;

            case State.UP:
                if (field.canClimbUp(this.x, this.y - 1)) {
                    this.y--;
                } else {
                    this.state = State.STOPPED;
                }
                break;

            case State.DOWN:
                if (field.canClimbDown(this.x, this.y + 1)) {
                    this.y++;
                } else {
                    this.state = State.STOPPED;
                }
                break;

            case State.JUMP_RIGHT:
            case State.JUMP_LEFT:
            case State.JUMP_UP:
                let step = JUMP_FRAMES[this.state][this.jumpStep];
                if ((this.x + step.x >= 0) && (this.x + step.x < LEVEL_COLS)) {
                    let terrain = field.layout[this.y + step.y][this.x + step.x];
                    if (['=', '|', '-'].includes(terrain)) {
                        if (field.onSolid(this.x, this.y)) {
                            this.state = this.nextState;
                            this.nextState = undefined;
                        } else {
                            switch (this.state) {
                                case State.JUMP_RIGHT:
                                    this.nextState = State.RIGHT;
                                    break;
                                case State.JUMP_LEFT:
                                    this.nextState = State.LEFT;
                                    break;
                                case State.JUMP_UP:
                                    this.nextState = State.UP;
                                    break;
                            }
                            this.state = State.FALLING;
                        }
                    } else if (terrain === 'H') {
                        this.x += step.x;
                        this.y += step.y;
                        this.state = State.STOPPED;
                        this.nextState = undefined;
                    } else {
                        this.x += step.x;
                        this.y += step.y;
                        this.jumpStep++;

                        if (this.jumpStep >= JUMP_FRAMES[this.state].length) {
                            this.state = this.nextState;
                            this.nextState = undefined;
                        }
                    }
                } else {
                    if (field.onSolid(this.x, this.y)) {
                        this.state = this.nextState;
                        this.nextState = undefined;
                    } else {
                        this.state = State.FALLING;
                        this.nextState = State.STOPPED;
                    }
                }
                break;

            case State.FALLING:
                if (field.onSolid(this.x, this.y)) {
                    this.state = this.nextState || State.STOPPED;
                } else {
                    this.y++;
                }
                break;
        }

        // If we were attempting to move somewhere and realized we should be falling instead,
        // we want to re-run the entire algorithm once. This avoids what boils down to a "skipped
        // frame" from the user's point of view.
        if (repeat) return this.applyMovement(field);
    }
}
