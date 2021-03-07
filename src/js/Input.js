/**
 * `Input` is a singleton that helps us map keyboard events in the browser
 * to in-game actions.
 *
 * We generally care about two types of input events:
 *
 *  - An "action" is a specific action recognizable by the game, like moving right
 *    or jumping. In theory, if this was a more complicated game, there could be
 *    many ways to cause a specific action (maybe user presses SPACEBAR to jump,
 *    or they click RIGHT MOUSE BUTTON, or they tap A on a gamepad, etc.). For this
 *    reason, it helps to separate processing in-game actions from processing the
 *    raw keyboard events that cause them.
 *
 *  - Actual key presses. There are situations where we need a more broad view of
 *    the user's key presses, for example, if they are typing in their name for a
 *    high score or pressing one of the inputs at the main menu. In this case we
 *    want to know "did the user tap P?", as opposed to mapping the keys to actions.
 */

import { Audio } from './Audio';

// A list of in-game actions that can be performed by the player
const Action = {
    UP:     11,
    DOWN:   12,
    LEFT:   13,
    RIGHT:  14,
    JUMP:   15,
    STOP:   16,
    PAUSE:  17,
    RESUME: 18
};

// A list of key code mappings and what action they perform. Here we hard-code it, but
// you could easily also have the key mappings controlled by settings and let the user
// configure it.
const KeyMapping = {
    KeyW:       Action.UP,
    KeyS:       Action.DOWN,
    KeyA:       Action.LEFT,
    KeyD:       Action.RIGHT,
    ArrowUp:    Action.UP,
    ArrowDown:  Action.DOWN,
    ArrowLeft:  Action.LEFT,
    ArrowRight: Action.RIGHT,
    Space:      Action.JUMP,
    Escape:     Action.PAUSE,
    Enter:      Action.RESUME
};

export const Input = {
    Action,
    KeyMapping,

    init() {
        // Input buffer - new keypress events go into this buffer to be handled
        // during the game's update loop. It's up to the `update()` methods to consume
        // key presses and remove them from the buffer.
        this.buffer = [];

        // Input history - history contains recent key press events in order,
        // removed automatically after a few seconds. This is useful for detecting
        // inputs like cheat codes, for example.
        //
        // (Actually, cheat codes is the only use for this extra history buffer, so
        // if you didn't support cheat codes you could delete it altogether.)
        this.history = [];

        window.addEventListener('keydown', event => {
            let entry = {
                at: new Date().getTime(),
                key: event.key,
                code: event.code,
                action: Input.KeyMapping[event.code] || Input.Action.STOP
            };
            Input.buffer.push(entry);
            Input.history.push(entry);
            console.log(entry);

            // Hack to ensure we initialize audio after user interacts with the game. Sometimes
            // the browser will just ignore attempts to play audio if the user has not interacted
            // with the page yet, but some browsers/versions will actually error out (either
            // stopping the game itself, or preventing later audio playing). So it's better to
            // plan for it explicitly.
            Audio.readyToPlay = true;
        });
    },

    update() {
        let now = new Date().getTime();
        this.history = this.history.filter(entry => entry.at > now - 3000);
    },

    lastKey() {
        // A shortcut helper for code that cares about what KEY was pressed.
        return this.buffer.length > 0 ? this.buffer[this.buffer.length - 1].key : '';
    },

    lastAction() {
        // A shortcut helper for code that cares about what ACTION was taken.
        return this.buffer.length > 0 ? this.buffer[this.buffer.length - 1].action : undefined;
    },

    consume(clearHistory) {
        this.buffer = [];

        // Normally, "consuming" all existing buffer input is something that happens
        // somewhere in the game logic. If we just detected and acted on a cheat code,
        // though, we want to clear the history too, otherwise we'll just keep behaving
        // like the user is entering the cheat code every frame.
        if (clearHistory) this.history = [];
    }
}
