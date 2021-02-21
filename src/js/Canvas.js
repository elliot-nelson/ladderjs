/**
 * `Canvas` is a utility class that represents a detached canvas.
 *
 * In HTML5, you can create as many canvas objects as you want that are not
 * actually attached to the DOM, so they won't be visible on-screen. This is
 * useful for creating all kinds of things:
 *
 *   - back buffers
 *   - temporary scratch pads for recoloring / resizing images
 *   - cutting sprites from a larger spritesheet
 *   - etc.
 *
 * I use this class as an easy-to-read way for other code to pass around
 * a "Canvas" object that has both the DOM object and the 2D context attached to it.
 *
 * (It's important to have both because they have different purposes... for example,
 * if you're creating a scratch pad, you need the context in order to draw on the
 * scratch pad, but you need the canvas DOM object in order to use it as a source
 * to draw onto another canvas.)
 */
export class Canvas {
    constructor(width, height) {
        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext('2d');
    }
}
