'use strict';

import { Game } from './Game';
import { Viewport } from './Viewport';

export function qr2xy(pos) {
    return {
        x: pos.q * 13,
        y: pos.q * 6 + pos.r * 12
    };
}

export function xy2qr(pos) {
    let qrFraction = {
        q: (pos.x / 13),
        r: ((pos.y - pos.x * 6 / 13) / 12)
    };
    return qrRounded(qrFraction);
}

export function xy2uv(pos) {
    return {
        u: pos.x + Viewport.center.u - Game.camera.pos.x,
        v: pos.y + Viewport.center.v - Game.camera.pos.y
    };
}

export function uv2xy(pos) {
    return {
        x: pos.u - Viewport.center.u + Game.camera.pos.x,
        y: pos.v - Viewport.center.v + Game.camera.pos.y
    };
}

export function qr2qrs(pos) {
    return { q: pos.q, r: pos.r, s: -pos.q-pos.r };
}

export function qrs2qr(pos) {
    return { q: pos.q, r: pos.r };
}

export function tileIsPassable(q, r) {
    if (Game.brawl) {
        let room = Game.brawl.room;
        if (
            q < room.q ||
            r < room.r ||
            q >= room.q + room.w ||
            r >= room.r + room.h
        )
            return false;
    }
    if (q < 0 || r < 0 || q >= Game.maze.w || r >= Game.maze.h) return false;
    return !!Game.maze.maze[r][q];
}

export function rgba(r, g, b, a) {
    return `rgba(${r},${g},${b},${a})`;
}

export function createCanvas(width, height) {
    let canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    let ctx = canvas.getContext('2d');
    return { canvas, ctx };
}

export function roomCenter(room) {
    return {
        x: (room.q + room.w / 2) * TILE_SIZE,
        y: (room.r + room.h / 2) * TILE_SIZE
    };
}

export function partialText(text, t, d) {
    let length = clamp(Math.ceil(t / d * text.length), 0, text.length),
        substr = text.slice(0, length),
        idx = text.indexOf(' ', length - 1);
    if (idx < 0) idx = text.length;
    if (idx - length > 0) substr += '#'.repeat(idx - length);

    return substr;
}
