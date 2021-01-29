'use strict';

import { Sprite } from './Sprite';
import { rgba, createCanvas } from './Util';
import { CHAR_WIDTH, CHAR_HEIGHT, CHARSHEET_WIDTH } from './Constants';

// In our character sheet, chars 0x00-0x7F are standard ASCII, below that we put whatever
// characters are convenient for us. Here we can choose to map unicode characters to positions
// 0x80+ in the charsheet, making it easy for us to render things like special characters,
// box drawing characters, etc.
const SUPPORTED_UNICODE_CHARS = [
    '─│┌┐└┘├┤┬┴┼╳╳╳╳╳',
    '═║╔╗╚╝╠╣╦╩╬╳╳╳╳╳'
].join('');

const UNICODE_CHAR_MAP = SUPPORTED_UNICODE_CHARS.split('').reduce((map, char, idx) => {
    map[char] = 0x80 + idx;
    return map;
}, {});

/**
 * Text
 *
 * Utilities for drawing text using in-game pixel font.
 */
export const Text = {
    init() {
        Text.white = Sprite.font.img;

        Text.black = recolor(Text.white, rgba(0, 0, 0, 1));
        Text.black_shadow = recolor(Text.white, rgba(90, 20, 90, 0.15));
        Text.blue = recolor(Text.white, rgba(200, 40, 220, 1));
        Text.blue_shadow = recolor(Text.white, rgba(240, 50, 200, 0.2));
        Text.shadow = recolor(Text.white, rgba(240, 240, 255, 0.25));
        Text.red = recolor(Text.white, rgba(240, 50, 50, 1));

        Text.terminal = recolor(Text.white, rgba(51, 255, 0, 1));
        Text.terminal_shadow = recolor(Text.white, rgba(255, 255, 255, 0.3));

        Text.terminal = recolor(Text.white, rgba(51, 255, 0, 0.9));
        Text.terminal_shadow = undefined;

        Text['#ead4aa'] = recolor(Text.white, '#ead4aa');
        Text['#fee761'] = recolor(Text.white, '#fee761');
        Text['#ff0044'] = recolor(Text.white, '#ff0044');
    },

    drawText(ctx, text, u, v, scale = 1, font = Text.white, shadow) {
        if (Array.isArray(text)) {
            for (let block of text) {
                Text.drawText(ctx, block.text, u + block.u * scale, v + block.v * scale, scale, font, shadow);
            }
            return;
        }

        for (let idx = 0; idx < text.length; idx++) {
            let c = UNICODE_CHAR_MAP[text[idx]] || text.charCodeAt(idx);
            let k = (c - 0) * (CHAR_WIDTH);
            if (shadow) {
                ctx.drawImage(
                    shadow,
                    k % CHARSHEET_WIDTH,
                    Math.floor(k / CHARSHEET_WIDTH) * CHAR_HEIGHT,
                    CHAR_WIDTH,
                    CHAR_HEIGHT,
                    u + 1,
                    v,
                    CHAR_WIDTH * scale,
                    CHAR_HEIGHT * scale
                );
            }
            ctx.drawImage(
                font,
                k % CHARSHEET_WIDTH,
                Math.floor(k / CHARSHEET_WIDTH) * CHAR_HEIGHT,
                CHAR_WIDTH,
                CHAR_HEIGHT,
                u,
                v,
                CHAR_WIDTH * scale,
                CHAR_HEIGHT * scale
            );
            u += CHAR_WIDTH * scale;
        }
    },

    /*
    drawRightText(ctx, text, u, v, scale = 1, font = Text.white, shadow) {
        u -= Text.measureWidth(text, scale);
        Text.drawText(ctx, text, u, v, scale, font, shadow);
    },
    */

    measureWidth(text, scale = 1) {
        return text.split('').reduce((sum, c) => sum + CHAR_WIDTH, 0) * scale;
    },

    splitParagraph(text, w, h) {
        let cu = 0, cv = 0;
        let next = () => ({ text: '', u: cu, v: cv });
        let wip = next();
        let list = [];

        for (let c of text.split('')) {
            let cWidth = Text.measureWidth(c, 1);
            if (c === '\n' || cu + cWidth > w) {
                let saved = '';
                if (c !== '\n' && c !== ' ') {
                    let space = wip.text.split(' ');
                    if (space.length > 1) {
                        saved = space.pop();
                        wip.text = space.join(' ');
                    }
                }
                if (wip.text.length > 0) list.push(wip);
                cu = 0;
                cv += (CHAR_HEIGHT);
                wip = next();
                if (saved.length > 0) {
                    wip.text = saved;
                    cu += Text.measureWidth(wip.text, 1);
                }
            } else {
                cu += cWidth;
            }
            if (c !== '\n') {
                wip.text = wip.text + c;
            }
        }

        if (wip.text.length > 0) list.push(wip);

        return list.map(line => ({
            ...line,
            w: Text.measureWidth(line.text, 1),
            h: CHAR_HEIGHT
        }));
    }
};

// Text utility functions

function recolor(font, color) {
    let canvas = createCanvas(font.width, font.height);
    canvas.ctx.fillStyle = color;
    canvas.ctx.fillRect(0, 0, font.width, font.height);
    canvas.ctx.globalCompositeOperation = 'destination-in';
    canvas.ctx.drawImage(font, 0, 0);
    return canvas.canvas;
}
