'use strict';

import { Sprite } from './Sprite';
import { State, JUMP_FRAMES } from './Behavior';
import { Input } from './input/Input';
import { Text } from './Text';
import { LEVEL_ROWS, LEVEL_COLS } from './Constants';


/**
 * Player
 */
export class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.state = State.STOPPED;
        this.nextState = State.STOPPED;
        this.jumpStep = 0;
    }

    update(field) {
        let repeat = false;

        if (Input.pressed[Input.Action.LEFT]) {
            this.nextState = State.LEFT;
        }

        if (Input.pressed[Input.Action.RIGHT]) {
            this.nextState = State.RIGHT;
        }

        if (Input.pressed[Input.Action.UP]) {
            this.nextState = State.UP;
        }

        if (Input.pressed[Input.Action.DOWN]) {
            this.nextState = State.DOWN;
        }

        if (Input.pressed[Input.Action.JUMP]) {
            this.nextState = State.START_JUMP;
        }

        // If we are stopped or moving left or right, and we are asked to do something,
        // then try to do it.
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
                    console.log('x--');
                    this.x--;
                } else {
                    console.log('stop');
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
                    console.log('x+-');
                    this.x++;
                } else {
                    console.log('stop');
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
                console.log(this.state, this.jumpStep, JUMP_FRAMES[this.state].length);
                if ((this.x + step.x >= 0) && (this.x + step.x < LEVEL_COLS)) {
                    let terrain = field.terrain[this.y + step.y][this.x + step.x];
                    if (['=', '|', '-'].includes(terrain)) {
                        if (field.onSolid(this.x, this.y)) {
                            console.log('a');
                            this.state = this.nextState;
                            this.nextState = undefined;
                        } else {
                            console.log('b');
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
                            console.log('c');
                        this.x += step.x;
                        this.y += step.y;
                        this.state = State.STOPPED;
                        this.nextState = undefined;
                    } else {
                            console.log('d');
                        this.x += step.x;
                        this.y += step.y;
                        this.jumpStep++;

                        if (this.jumpStep >= JUMP_FRAMES[this.state].length) {
                            this.state = this.nextState;
                            this.nextState = undefined;
                        }
                    }
                } else {
                            console.log('e');
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

        /*
        { If stopped or going left or going right and     }
        { request to do something else, then try to do it }
        IF (a.DirRequest <> NONE) THEN BEGIN
          CASE a.Dir OF
            STOPPED, PENDING:
              IF a.DirRequest IN [LEFT, RIGHT, UP, DOWN, FALLING] THEN
                UpdateDir(a);

            JUMPUP:
              IF a.DirRequest = LEFT THEN
                a.Dir := JUMPLEFT
              ELSE IF a.DirRequest = RIGHT THEN
                a.Dir := JUMPRIGHT;

            RIGHT:
              IF a.DirRequest IN [LEFT, STOPPED] THEN
                UpdateDir(a);

            LEFT:
              IF a.DirRequest IN [RIGHT, STOPPED] THEN
                UpdateDir(a);

            UP, DOWN:
              IF a.DirRequest IN [STOPPED, UP, DOWN, RIGHT, LEFT] THEN
                UpdateDir(a);

            JUMPUP:
              IF a.DirRequest = LEFT THEN
                a.Dir := JUMPLEFT
              ELSE
                a.Dir := JUMPRIGHT;

            JUMPRIGHT, JUMPLEFT:
              IF a.DirRequest = STOPPED THEN
                UpdateDir(a);

            PENDING:
              UpdateDir(a);

          END;
        END;


        if (this.nextState) {
            if (field.onSolid(this) && this.nextState

        if (field.onSolid(this)) {
            if (this.nextState) {
                if (this.nextState === State.JUMP_START) {
                    if (this.state ===
                this.state = this.nextState;
                this.nextState = undefined;

                if (this.state === State.JUMP_START) {

                }
            }

        }

        if (this.state === State.JUMPING) {
            let dir = this.jumpFrames.shift();
            this.x += dir.x;
            this.y += dir.y;

            if (this.jumpFrames.length === 0) {
                this.state = this.nextState;
            }
        }
        */

        if (repeat) return this.update(field);
    }

    draw() {
        let char = 'g';

        switch (this.state) {
            case State.RIGHT:
            case State.JUMP_RIGHT:
            case State.UP:
            case State.DOWN:
                char = 'p';
                break;

            case State.LEFT:
            case State.JUMP_LEFT:
                char = 'q';
                break;

            case State.FALLING:
                char = 'b';
                break;
        }

        Text.drawTextColRow(char, this.x, this.y);
    }
}
