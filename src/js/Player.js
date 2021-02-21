'use strict';

import { Sprite } from './Sprite';
import { State, JUMP_FRAMES } from './Behavior';
import { Input } from './Input';
import { Text } from './Text';
import { LEVEL_ROWS, LEVEL_COLS } from './Constants';
import { Entity } from './Entity';
import { Screen } from './Screen';
import { Game } from './Game';

const DEATH_FRAMES = ['p', 'p', 'b', 'd', 'd', 'q', 'p', 'p', 'b', 'd', 'd', 'q', '-', '-', '_', '_', '_', '_', '_'];

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

    update(field, moveFrame) {
        if (this.state === State.DYING) {
            this.deathStep++;
            if (this.deathStep >= DEATH_FRAMES.length) this.state = State.DEAD;
        }

        if (this.state === State.DYING || this.state === State.DEAD) return;

        if (!moveFrame) return;

        let action = Input.lastAction();

        if (action === Input.Action.LEFT) {
            this.nextState = State.LEFT;
            Input.consume();
        } else if (action === Input.Action.RIGHT) {
            this.nextState = State.RIGHT;
            Input.consume();
        } else if (action === Input.Action.UP) {
            this.nextState = State.UP;
            Input.consume();
        } else if (action === Input.Action.DOWN) {
            this.nextState = State.DOWN;
            Input.consume();
        } else if (action === Input.Action.JUMP) {
            this.nextState = State.START_JUMP;
            Input.consume();
        }

        return this.applyMovement(field);
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

    kill() {
        // Just a convenience method for killing the player.
        //
        // Note that "killing" the player just puts it in a dying state, we'll play
        // a little death animation as rocks move about before the player actually dies,
        // at which point they will lose a life and the level starts over.
        if (this.state != State.DYING && this.state != State.DEAD) {
            this.state = State.DYING;
        }
    }
}
