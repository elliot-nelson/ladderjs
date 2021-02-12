/**
 * Constants
 */

// Spritesheet URI (produced during gulp build)
export const SPRITESHEET_URI = 'sprites.png';

// The playable area. Note that this is the desired dimensions, but the actual on-screen dimensions
// may be larger to maintain aspect ratio (see `Viewport.width` & `Viewport.height`).
export const GAME_WIDTH = 640;
export const GAME_HEIGHT = 400;

// The "screen area". This is an ASCII game and so most of the game logic doesn't care about browser
// pixels, we care about the ASCII display area (80x25).
export const SCREEN_WIDTH = 80;
export const SCREEN_HEIGHT = 25;

// The size of our on-screen characters (given dimensions above, this is 80 cols by 25 rows).
export const CHAR_WIDTH = 8;
export const CHAR_HEIGHT = 16;
export const CHARSHEET_WIDTH = 16 * CHAR_WIDTH;
export const CHARSHEET_HEIGHT = 32 * CHAR_HEIGHT;

// Fixed level size
export const LEVEL_ROWS = 20;
export const LEVEL_COLS = 79;

// Play speeds, expressed as frames per second.
//
// According to the original, the play speeds had millisecond delays of:
//   [100ms, 50ms, 25ms, 13ms, 7ms].
//
// This would mean the effective FPS was:
//   [10, 20, 40, 76, 142].
//
// I think this is way too high, and might not be accurate (it doesn't count
// time spent drawing the screen and running the game's logic, which might
// be a significant number of milliseconds). From memory, each speed was about
// 50% faster than the previous one, so that's what I've set here.
export const PLAY_SPEEDS = [120, 100, 90, 50, 30];

// Maximum number of rocks on screen at once
export const MAX_ROCKS = 7;

// Each dispenser on the level increases max rocks by 1
export const DISPENSER_MAX_ROCKS = 1;

// Hidden difficulty factor - the game gets 5% faster each level cycle
export const HIDDEN_FACTOR_PLAY_SPEED = 0.05;

// Hidden difficulty factor - the maximum number of rocks increases each level cycle
export const HIDDEN_FACTOR_MAX_ROCKS = 2;

// Score events (note, these are just identifiers for the types of score increases, not
// actual score values).
export const SCORE_ROCK = 1;
export const SCORE_STATUE = 2;
export const SCORE_TREASURE = 3;
