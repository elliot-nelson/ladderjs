/**
 * Miscellaneous, individually exported functions that don't fit anywhere else.
 *
 * In many games I'll stick all my random math, geometry, and clipping stuff here,
 * but in this game there's actually not a lot of extra math to do (mostly because
 * we can only move one "character" at a time, and there's not any AI to speak of,
 * so no flood fills or other algorithms to consider).
 */

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
