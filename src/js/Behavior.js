
// This is our list of STATES. Each entity starts out in one of these states and can move between
// them based on events that happen in the game. (Note that some of these are directions, but
// since an entity keeps moving in the direction it is going unless stopped, directions are
// states in this game.)
export const State = {
    PENDING:    0,
    STOPPED:    1,
    UP:         2,
    LEFT:       3,
    DOWN:       4,
    RIGHT:      5,
    FALLING:    6,
    START_JUMP: 7,
    JUMP_LEFT:  8,
    JUMP_RIGHT: 9,
    JUMP_UP:    10
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
