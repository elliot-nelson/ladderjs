'use strict';

import { Sprite } from './Sprite';
import { State, JUMP_FRAMES } from './Behavior';
import { Input } from './input/Input';
import { Text } from './Text';
import { LEVEL_ROWS, LEVEL_COLS } from './Constants';
import { Entity } from './Entity';
import { Screen } from './Screen';
import { game } from './Game';

const DEATH_FRAMES = ['p', 'b', 'd', 'q', 'p', 'b', 'd', 'q', '-', '-', '_'];

/**
 * Player
 */
export class Player extends Entity {
    constructor(x, y) {
        super();
        this.x = x;
        this.y = y;
        this.state = State.STOPPED;
        this.nextState = State.STOPPED;
        this.jumpStep = 0;
        this.deathStep = 0;
        console.log('player constructed', x, y);
    }

    update(move) {
        if (this.state === State.DYING) {
            this.deathStep++;
            if (this.deathStep >= DEATH_FRAMES.length) this.state = State.DEAD;
        }

        if (this.state === State.DYING || this.state === State.DEAD) return;

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

        console.log(move);
        if (move)
            return this.applyMovement(game.session.field);
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

            case State.DYING:
                char = DEATH_FRAMES[this.deathStep];
                break;

            case State.DEAD:
                char = '_';
                break;
        }

        Screen.write(this.x, this.y, char);
    }
}
