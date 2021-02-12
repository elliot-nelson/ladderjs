
// This is our list of STATES. Each entity starts out in one of these states and can move between
// them based on events that happen in the Game (Note that some of these are directions, but
// since an entity keeps moving in the direction it is going unless stopped, directions are
// states in this Game)
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
    ],
};
