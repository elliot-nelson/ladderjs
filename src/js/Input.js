
export const Input = {
    // This is a map of in-game actions to the key codes that can be pressed to trigger them.
    Action: {
        UP: ['KeyW', 'ArrowUp'],
        DOWN: ['KeyS', 'ArrowDown'],
        LEFT: ['KeyA', 'ArrowLeft'],
        RIGHT: ['KeyD', 'ArrowRight'],
        JUMP: ['Space'],
        PAUSE: ['KeyEsc']
    },

    init() {
        // Input buffer - new keypress events go into this buffer to be handled
        // during the game's update loop. It's up to the `update()` methods to consume
        // key presses and remove them from the buffer.
        this.buffer = [];

        // Input history - history contains recent key press events in order,
        // removed automatically after a few seconds. This is useful for detecting
        // inputs like cheat codes, for example.
        this.history = [];

        window.addEventListener('keydown', event => {
            let entry = {
                at: new Date().getTime(),
                key: event.key,
                code: event.code
            };
            Input.buffer.push(entry);
            Input.history.push(entry);
            console.log(entry);
        });
    },

    update() {
        let now = new Date().getTime();
        this.history = this.history.filter(entry => entry.at > now - 3000);
    },

    lastKeyPressed() {
        return this.buffer.length > 0 ? this.buffer[this.buffer.length - 1].key : '';
    },

    lastCodePressed() {
        return this.buffer.length > 0 ? this.buffer[this.buffer.length - 1].code : '';
    },

    consume() {
        this.buffer = [];
    },
}
