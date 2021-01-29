'use strict';

import { game } from './Game';
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
        u: pos.x + Viewport.center.u - game.camera.pos.x,
        v: pos.y + Viewport.center.v - game.camera.pos.y
    };
}

export function uv2xy(pos) {
    return {
        x: pos.u - Viewport.center.u + game.camera.pos.x,
        y: pos.v - Viewport.center.v + game.camera.pos.y
    };
}

export function qr2qrs(pos) {
    return { q: pos.q, r: pos.r, s: -pos.q-pos.r };
}

export function qrs2qr(pos) {
    return { q: pos.q, r: pos.r };
}

// When you "round" a fractional hexagonal value to an integer one (usually to convert
// a mouse click to a hex grid), you can't just `Math.floor()` like you can with standard
// square tiles - you'll never get the behavior right on the angled sides of the hexagons.
//
// To get the behavior you want, you need to convert to cubed coordinates (q,r,s), then
// individually round each one and eliminate the one furthest away from your original value.
export function qrRounded(pos) {
    let qrsA = qr2qrs(pos),
        qrsB = {
            q: Math.round(qrsA.q),
            r: Math.round(qrsA.r),
            s: Math.round(qrsA.s)
        },
        diffQ = Math.abs(qrsA.q - qrsB.q),
        diffR = Math.abs(qrsA.r - qrsB.r),
        diffS = Math.abs(qrsA.s - qrsB.s);

    if (diffQ > diffR && diffQ > diffS) {
        qrsB.q = -qrsB.r-qrsB.s;
    } else if (diffR > diffS) {
        qrsB.r = -qrsB.q-qrsB.s;
    } else {
        qrsB.s = -qrsB.q-qrsB.r;
    }

    return qrs2qr(qrsB);
}

export function clamp(value, min, max) {
    return value < min ? min : value > max ? max : value;
}

export function flood(maze, pos, maxDistance = Infinity) {
    let result = array2d(maze[0].length, maze.length, () => Infinity);
    let stack = [{ ...pos, cost: 0 }];
    while (stack.length > 0) {
        let { q, r, cost } = stack.shift();
        if (result[r][q] <= cost) continue;
        result[r][q] = cost++;
        if (result[r][q] >= maxDistance) continue;
        if (maze[r][q + 1] && result[r][q + 1] > cost)
            stack.push({ q: q + 1, r, cost });
        if (maze[r][q - 1] && result[r][q - 1] > cost)
            stack.push({ q: q - 1, r, cost });
        if (maze[r + 1][q] && result[r + 1][q] > cost)
            stack.push({ q, r: r + 1, cost });
        if (maze[r - 1][q] && result[r - 1][q] > cost)
            stack.push({ q, r: r - 1, cost });
    }
    return result;
}

export function array2d(width, height, fn) {
    return Array.from({ length: height }, () =>
        Array.from({ length: width }, fn)
    );
}

export function tileIsPassable(q, r) {
    if (game.brawl) {
        let room = game.brawl.room;
        if (
            q < room.q ||
            r < room.r ||
            q >= room.q + room.w ||
            r >= room.r + room.h
        )
            return false;
    }
    if (q < 0 || r < 0 || q >= game.maze.w || r >= game.maze.h) return false;
    return !!game.maze.maze[r][q];
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
