/**
 * A collection of states and functions related to entities.
 */

import { LEVEL_COLS } from './Constants';
import { Audio } from './Audio';

// A list of states usable by entities. Some states only apply to players (rocks can't jump).
//
// Many of these are actually DIRECTIONS, but since this game has "pac man movement", a
// direction is a state -- the player will keep moving in the tapped direction until the player
// enters a new input.
export const State = {
    STOPPED:    1,         // Standing still
    UP:         2,         // Moving up (player only)
    LEFT:       3,         // Moving left
    DOWN:       4,         // Moving down
    RIGHT:      5,         // Moving right
    FALLING:    6,         // Falling
    START_JUMP: 7,         // About to start a jump (player only)
    JUMP_LEFT:  8,         // Jumping left (player only)
    JUMP_RIGHT: 9,         // Jumping right (player only)
    JUMP_UP:    10,        // Jumping straight up (player only)
    DYING:      11,        // Dying (used as a death animation)
    DEAD:       12         // Dead (for player, restart level; for rock, disappear)
};

// This constant controls the "shape" of the left, right, and straight-up jumps by
// the player. Note that the straight-up jump gets 1 frame less of airtime than
// the left and right jumps.
export const JUMP_FRAMES = {
    [State.JUMP_RIGHT]: [
        { x: 1, y: -1 },
        { x: 1, y: -1 },
        { x: 1, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 1, y: 1 }
    ],
    [State.JUMP_LEFT]: [
        { x: -1, y: -1 },
        { x: -1, y: -1 },
        { x: -1, y: 0 },
        { x: -1, y: 0 },
        { x: -1, y: 1 },
        { x: -1, y: 1 }
    ],
    [State.JUMP_UP]: [
        { x: 0, y: -1 },
        { x: 0, y: -1 },
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: 1 },
        { x: 0, y: 0 }
    ]
};

export function applyEntityMovement(entity, field) {
    let repeat = false;

    // This method contains generic "movement" application for all entities, including
    // Lad (player) and Der Rocks (enemies). Things like falling, moving left/right, etc.,
    // work the same for both.
    //
    // (There's a bunch of jump logic in here too, and moving UP, which really only applies
    // to players, but that's OK -- Der Rocks just won't attempt those actions.)

    if (entity.nextState) {
        switch (entity.state) {
            case State.STOPPED:
            case State.LEFT:
            case State.RIGHT:
                if ([State.LEFT, State.RIGHT, State.STOPPED].includes(entity.nextState)) {
                    entity.state = entity.nextState;
                    entity.nextState = undefined;
                }
                break;

            case State.UP:
            case State.DOWN:
                // Normal
                if ([State.LEFT, State.RIGHT].includes(entity.nextState)) {
                    entity.state = entity.nextState;
                    entity.nextState = undefined;
                }
                break;

            case State.JUMP_LEFT:
            case State.JUMP_RIGHT:
            case State.JUMP_UP:
                if (entity.nextState === State.RIGHT && entity.state != State.JUMP_RIGHT) {
                    entity.state = State.JUMP_RIGHT;
                    entity.nextState = State.RIGHT;
                }
                if (entity.nextState === State.LEFT && entity.state != State.JUMP_LEFT) {
                    entity.state = State.JUMP_LEFT;
                    entity.nextState = State.LEFT;
                }
                if (entity.nextState === State.DOWN) {
                    entity.state = State.FALLING;
                    entity.nextState = undefined;
                }
                if (entity.nextState === State.UP) {
                    // Special case: leave UP in the queue for later
                }
                break;
        }
    }

    if (entity.nextState === State.START_JUMP) {
        // Special case: the user wants to jump!
        //
        // If the player is standing on something solid, we initiate a jump based on the current
        // movement of the player.
        if (field.onSolid(entity.x, entity.y)) {
            if (entity.state === State.STOPPED || entity.state === State.FALLING) {
                entity.state = State.JUMP_UP;
                entity.jumpStep = 0;
                entity.nextState = State.STOPPED;
            } else if (entity.state === State.LEFT || entity.state === State.JUMP_LEFT) {
                entity.state = State.JUMP_LEFT;
                entity.jumpStep = 0;
                entity.nextState = State.LEFT;
            } else if (entity.state === State.RIGHT || entity.state === State.JUMP_RIGHT) {
                entity.state = State.JUMP_RIGHT;
                entity.jumpStep = 0;
                entity.nextState = State.RIGHT;
            }
            Audio.play(Audio.jump);
        } else {
            // Special case: leave START_JUMP in the queue for later.
            //
            // This lets the user tap jump a few frames before hitting the ground to
            // chain-jump, especially at higher speeds bouncing off 1-wide platforms.
        }
    } else if (entity.nextState === State.UP && field.isLadder(entity.x, entity.y)) {
        // Special case: the user wants to go up!
        //
        // If the user is on a ladder, we can start ascending. Note that if the user is not
        // on a ladder we ignore their input, which is intentional -- this allows queued
        // (pacman) input, where we can tap UP a little before reaching the ladder.
        entity.state = State.UP;
        entity.nextState = undefined;
    } else if (entity.nextState === State.DOWN && (field.isLadder(entity.x, entity.y) || field.isLadder(entity.x, entity.y + 1))) {
        // Special case: the player wants to go down!
        //
        // If the player is on (or above) a ladder, we can start descending. Note that if the player is not
        // on a ladder we ignore their input, which is intentional -- this allows queued
        // (pacman) input, where we can tap DOWN a little before reaching the ladder.
        entity.state = State.DOWN;
        entity.nextState = undefined;
    }

    switch (entity.state) {
        case State.LEFT:
            if (!field.onSolid(entity.x, entity.y)) {
                entity.nextState = State.LEFT;
                entity.state = State.FALLING;
                repeat = true;
                break;
            }
            if (field.emptySpace(entity.x - 1, entity.y)) {
                entity.x--;
            } else {
                entity.nextState = State.STOPPED;
            }
            break;

        case State.RIGHT:
            if (!field.onSolid(entity.x, entity.y)) {
                entity.nextState = State.RIGHT;
                entity.state = State.FALLING;
                repeat = true;
                break;
            }
            if (field.emptySpace(entity.x + 1, entity.y)) {
                entity.x++;
            } else {
                entity.nextState = State.STOPPED;
            }
            break;

        case State.UP:
            if (field.canClimbUp(entity.x, entity.y - 1)) {
                entity.y--;
            } else {
                entity.state = State.STOPPED;
            }
            break;

        case State.DOWN:
            if (field.canClimbDown(entity.x, entity.y + 1)) {
                entity.y++;
            } else {
                entity.state = State.STOPPED;
            }
            break;

        case State.JUMP_RIGHT:
        case State.JUMP_LEFT:
        case State.JUMP_UP:
            let step = JUMP_FRAMES[entity.state][entity.jumpStep];
            if ((entity.x + step.x >= 0) && (entity.x + step.x < LEVEL_COLS)) {
                let terrain = field.layout[entity.y + step.y][entity.x + step.x];
                if (['=', '|', '-'].includes(terrain)) {
                    if (field.onSolid(entity.x, entity.y)) {
                        entity.state = entity.nextState;
                        entity.nextState = undefined;
                    } else {
                        switch (entity.state) {
                            case State.JUMP_RIGHT:
                                entity.nextState = State.RIGHT;
                                break;
                            case State.JUMP_LEFT:
                                entity.nextState = State.LEFT;
                                break;
                            case State.JUMP_UP:
                                entity.nextState = State.UP;
                                break;
                        }
                        entity.state = State.FALLING;
                    }
                } else if (terrain === 'H') {
                    entity.x += step.x;
                    entity.y += step.y;

                    if (entity.nextState === State.UP) {
                        entity.state = State.UP;
                    } else {
                        entity.state = State.STOPPED;
                    }
                    entity.nextState = undefined;
                } else {
                    entity.x += step.x;
                    entity.y += step.y;
                    entity.jumpStep++;

                    if (entity.jumpStep >= JUMP_FRAMES[entity.state].length) {
                        switch (entity.state) {
                            case State.JUMP_RIGHT:
                                entity.state = State.RIGHT;
                                break;
                            case State.JUMP_LEFT:
                                entity.state = State.LEFT;
                                break;
                            case State.JUMP_UP:
                                entity.state = State.UP;
                                break;
                        }
                    }
                }
            } else {
                if (field.onSolid(entity.x, entity.y)) {
                    entity.state = entity.nextState;
                    entity.nextState = undefined;
                } else {
                    entity.state = State.FALLING;
                    entity.nextState = State.STOPPED;
                }
            }
            break;

        case State.FALLING:
            if (field.onSolid(entity.x, entity.y)) {
                entity.state = entity.nextState || State.STOPPED;
            } else {
                entity.y++;
            }
            break;
    }

    // If we were attempting to move somewhere and realized we should be falling instead,
    // we want to re-run the entire algorithm once. This avoids what boils down to a "skipped
    // frame" from the user's point of view.
    if (repeat) return applyEntityMovement(entity, field);
}
