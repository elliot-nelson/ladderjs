'use strict';

/**
 * Constants
 */

export const TITLE = 'WIZARD WITH A SHOTGUN';

// Spritesheet URI (produced during gulp build)
export const SPRITESHEET_URI = 'sprites.png';

// The playable area. Note that this is the desired dimensions, but the actual on-screen dimensions
// may be larger to maintain aspect ratio (see `Viewport.width` & `Viewport.height`).
export const GAME_WIDTH = 640;
export const GAME_HEIGHT = 400;

// The size of our on-screen characters (given dimensions above, this is 80 cols by 25 rows).
export const CHAR_WIDTH = 8;
export const CHAR_HEIGHT = 16;
export const CHARSHEET_WIDTH = 16 * CHAR_WIDTH;
export const CHARSHEET_HEIGHT = 32 * CHAR_HEIGHT;
