'use strict';

import { Game } from './Game';
import { rgba, createCanvas } from './Util';
import { SpriteSheet } from './SpriteSheet-gen';
import { Viewport } from './Viewport';

/**
 * Sprite
 *
 * Encapsulates loading sprite slices from the spritesheet, organizing them, and
 * modifying them or constructing using primitives. To save space, we use some techniques
 * like storing only a small slice of an image in the spritesheet, then using code
 * to duplicate it, add some randomness, etc.
 */
export const Sprite = {
    // This is an exception to the rule, loading the spritesheet is a special action that
    // happens BEFORE everything is initialized.
    loadSpritesheet(cb) {
        let image = new Image();
        image.onload = cb;
        image.src = SpriteSheet.uri;
        Sprite.sheet = image;
    },

    init() {
        // Base pixel font and icons (see `Text.init` for additional variations)
        Sprite.font = initBasicSprite(SpriteSheet.font2[0]);

        return;
    },

    /**
     * A small helper that draws a sprite onto a canvas, respecting the anchor point of
     * the sprite. Note that the canvas should be PRE-TRANSLATED and PRE-ROTATED, if
     * that's appropriate!
     */
    drawSprite(ctx, sprite, u, v) {
        ctx.drawImage(sprite.img, u - sprite.anchor.x, v - sprite.anchor.y);
    },

    drawViewportSprite(sprite, pos, rotation) {
        let { u, v } = this.viewportSprite2uv(
            sprite,
            pos
        );
        if (rotation) {
            Viewport.ctx.save();
            Viewport.ctx.translate(u + sprite.anchor.x, v + sprite.anchor.y);
            Viewport.ctx.rotate(rotation);
            Viewport.ctx.drawImage(
                sprite.img,
                -sprite.anchor.x,
                -sprite.anchor.y
            );
            Viewport.ctx.restore();
        } else {
            Viewport.ctx.drawImage(sprite.img, u, v);
        }
    },

    viewportSprite2uv(sprite, pos) {
        return {
            u: pos.x - sprite.anchor.x - Game.camera.pos.x + Viewport.center.u,
            v: pos.y - sprite.anchor.y - Game.camera.pos.y + Viewport.center.v
        };
    }
};

// Sprite utility functions

function initBasicSprite(data, anchor) {
    return initDynamicSprite(loadCacheSlice(...data), anchor);
}

function initDynamicSprite(source, anchor) {
    let w = source.width,
        h = source.height;

    return {
        img: source,
        // Hack! Using a flat `.map(initBasicSprite)` is actually going to pass the
        // element INDEX as second argument, resulting in "anchor=1". The right solution
        // here is "typeof anchor === 'object' ?", but to save bytes I avoid using
        // the typeof and instanceof keywords anywhere in the codebase. Hence,
        // "anchor && anchor.x".
        anchor: (anchor && anchor.x) ? anchor : { x: (w / 2) | 0, y: (h / 2) | 0 }
    };
}

function loadCacheSlice(x, y, w, h) {
    const source = Sprite.sheet;
    const sliceCanvas = createCanvas(w, h);
    sliceCanvas.ctx.drawImage(source, x, y, w, h, 0, 0, w, h);
    return sliceCanvas.canvas;
}
