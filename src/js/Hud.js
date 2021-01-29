'use strict';

import { game } from './Game';
import { HUD_PAGE_U, HUD_PAGE_V, HUD_PAGE_TEXT_U, R90, GROUND, GAME_WIDTH, GAME_HEIGHT } from './Constants';
import { clamp, vectorBetween, vectorAdd, vector2angle, uv2xy, xy2qr, qr2xy, xy2uv } from './Util';
import { Input } from './input/Input';
import { Sprite } from './Sprite';
import { Text } from './Text';
import { Viewport } from './Viewport';
import { ScreenShake } from './ScreenShake';
import { Victory } from './systems/Victory';
import { Canvas } from './Canvas';

/**
 * Hud
 *
 * Health bars, ammo, etc.
 */
export const Hud = {
    init() {
        Hud.tooltipCanvas = new Canvas(GAME_WIDTH, GAME_HEIGHT);
    },

    draw() {
        return;
    },

    drawPageArrow() {
        let page = Hud.closestPage();
        if (page) {
            let vector = vectorBetween(game.player.pos, page.pos);
            let angle = vector2angle(vector);
            vector.m = clamp(vector.m / 2, 16, Viewport.height / 2 - 5);
            if (vector.m > 64) {
                let xy = vectorAdd(game.player.pos, vector);
                let a = Math.sin(game.frame / 60)
                Viewport.ctx.globalAlpha = Math.sin(game.frame / 20) * 0.2 + 0.8;
                Sprite.drawViewportSprite(Sprite.page[2], xy, angle + R90);
                Viewport.ctx.globalAlpha = 1;
            }
        }
    },

    closestPage() {
        let pages = game.entities.filter(entity => entity.page);
        let pos = game.player.pos;
        pages.sort((a, b) => {
            let dist = ((a.pos.x - pos.x) ** 2 + (a.pos.y - pos.y) ** 2) - ((b.pos.x - pos.x) ** 2 + (b.pos.y - pos.y) ** 2);
            return dist;
        });
        return pages[0];
    },

    drawBuildingHover(uv) {
        let anchor = { ...uv };

        if (anchor.u + 100 > Viewport.width) anchor.u -= 100;
        if (anchor.v > 80 + 10) anchor.v -= 80;

        Viewport.ctx.fillStyle = 'rgba(30, 30, 30, 0.9)';
        Viewport.ctx.fillRect(anchor.u, anchor.v, 100, 80);

        Viewport.ctx.strokeStyle = 'rgba(95, 205, 228, 0.9)';
        Viewport.ctx.strokeRect(anchor.u, anchor.v, 100, 80);

        Text.drawText(
            Viewport.ctx,
            Text.splitParagraph(
                'SNIPER TOWER\n\n' +
                '- STRONG VS GROUND\n' +
                '- WEAK VS AIR\n',
                100
            ),
            anchor.u + 4, anchor.v + 4,
            1,
            Text.white,
            Text.shadow
        );

        // random lightning effect!
        //Hud.drawLightning(30, 60, 120, 90);
        Hud.drawLightning(30, 60, uv.u, uv.v);
    },

    drawTooltip(uv, body, cost) {
        Hud.tooltipCanvas.ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        let lines = Text.splitParagraph(body, 100, 0);
        let w = Math.max(...lines.map(line => line.w)), h = lines[lines.length - 1].v + lines[lines.length - 1].h;
        let u = 3, v = 3;

        if (cost) {
            cost = `${cost.ore || 0}@   ${cost.crystal || 0}$`;
            w = Math.max(w, Text.measureWidth(cost), 75);
            h += 10;
        }

        Hud.tooltipCanvas.ctx.fillStyle = '#ead4aa';
        Hud.tooltipCanvas.ctx.fillRect(0, 0, w + 6, h + 6);

        Hud.tooltipCanvas.ctx.fillStyle = '#262b44';
        Hud.tooltipCanvas.ctx.fillRect(1, 1, w + 4, h + 4);

        Hud.tooltipCanvas.ctx.clearRect(0, h + 5, 1, 1);

        if (cost) {
            Text.drawText(Hud.tooltipCanvas.ctx, cost, u + w - Text.measureWidth(cost), v, 1, Text['#fee761'], Text.shadow);
            v += 10;
        }

        Text.drawText(Hud.tooltipCanvas.ctx, lines, u, v, 1, Text['#ead4aa'], Text.shadow);

        Viewport.ctx.globalAlpha = 0.9;
        Viewport.ctx.drawImage(Hud.tooltipCanvas.canvas, uv.u, uv.v - h - 6);
        Viewport.ctx.globalAlpha = 1;

        /*

        let textsize = Text.drawParagraph(
            Hud.tooltipCanvas.ctx,
            body,
            2, 2,
            100, 0,
            1,
            Text.white,
            Text.shadow
        );

        let anchor = { ...uv };

        if (anchor.u + 100 > Viewport.width) anchor.u -= 100;
        if (anchor.v > 80 + 10) anchor.v -= 80;

        Viewport.ctx.fillStyle = 'rgba(30, 30, 30, 0.9)';
        Viewport.ctx.fillRect(anchor.u, anchor.v, 100, 80);

        Viewport.ctx.strokeStyle = 'rgba(95, 205, 228, 0.9)';
        Viewport.ctx.strokeRect(anchor.u, anchor.v, 100, 80);

        Text.drawParagraph(
            Viewport.ctx,
            'SNIPER TOWER\n\n' +
            '- STRONG VS GROUND\n' +
            '- WEAK VS AIR\n',
            anchor.u + 4, anchor.v + 4,
            100 - 8, 80,
            1,
            Text.white,
            Text.shadow
        );

        // random lightning effect!
        //Hud.drawLightning(30, 60, 120, 90);
        Hud.drawLightning(30, 60, uv.u, uv.v);
        */
    },

    drawLightning2(x1, y1, x2, y2) {
        let sections = 10;
        let vector = vectorBetween({ x: x1, y: y1 }, { x: x2, y: y2 });

        Viewport.ctx.strokeStyle = 'rgba(95, 205, 228, 1)';
        Viewport.ctx.strokeStyle = 'rgba(190, 235, 250, 1)';
        Viewport.ctx.lineWidth = 1;

        Viewport.ctx.beginPath();
        Viewport.ctx.moveTo(x1, y1);
        for (let i = 1; i <= sections; i++) {
            let x = x1 + (x2 - x1) * i / sections;
            let y = y1 + (y2 - y1) * i / sections;
            if (i < sections) {
                //x += (Math.random() * (i + 3) - (i + 3) / 2) | 0;
                //y += (Math.random() * (i + 3) - (i + 3) / 2) | 0;
                let offset = Math.random() * 20 - 10;
                if (i > 4 && i < 7) offset *= 1.5;
                x += vector.y * offset;
                y -= vector.x * offset;
            }
            Viewport.ctx.lineTo(x, y);
        }
        Viewport.ctx.stroke();
    },

    drawLightning3(x1, y1, x2, y2) {
        if (!this.lightningOffsets) {
            this.lightningOffsets = Array(8).fill().map((slot, index) => ({
                pos: (index + 1) * 10,
                value: Math.random() * 2 - 1
            }));
            console.log(this.lightningOffsets);
        }

        let vector = vectorBetween({ x: x1, y: y1 }, { x: x2, y: y2 });

        Viewport.ctx.strokeStyle = 'rgba(95, 205, 228, 1)';
        Viewport.ctx.strokeStyle = 'rgba(190, 235, 250, 1)';
        Viewport.ctx.lineWidth = 1;

        Viewport.ctx.beginPath();
        Viewport.ctx.moveTo(x1, y1);
        for (let offset of this.lightningOffsets) {
            // First get the (x,y) along the direct line to the target
            let x = x1 + vector.x * vector.m * offset.pos / 100;
            let y = y1 + vector.y * vector.m * offset.pos / 100;

            // Now we "offset" it (perpendicular to the direct line) by the specified value
            x += vector.y * offset.value * 10;
            y -= vector.x * offset.value * 10;

            Viewport.ctx.lineTo(x, y);
        }
        Viewport.ctx.lineTo(x2, y2);
        Viewport.ctx.stroke();

        for (let offset of this.lightningOffsets) {
            offset.pos += 5;
        }
        if (this.lightningOffsets[0].pos > 10) {
            this.lightningOffsets.unshift({ pos: 1, value: Math.random() * 2 - 1 });
        }
        if (this.lightningOffsets[this.lightningOffsets.length - 1].pos > 99) {
            this.lightningOffsets.pop();
        }
    },

    drawLightning(x1, y1, x2, y2) {
        let vector = vectorBetween({ x: x1, y: y1 }, { x: x2, y: y2 });

        Viewport.ctx.strokeStyle = 'rgba(95, 205, 228, 1)';
        Viewport.ctx.strokeStyle = 'rgba(190, 235, 250, 1)';
        Viewport.ctx.lineWidth = 1;
        Viewport.ctx.fillStyle = 'rgba(190, 235, 250, 1)';

//        Viewport.ctx.beginPath();
//        Viewport.ctx.moveTo(x1, y1);
        let offset = 0;
        for (let i = 0; i < vector.m; i++) {
            let x = x1 + vector.x * i;
            let y = y1 + vector.y * i;

            let calc = Math.random();
            if (calc < 0.33) {
                offset--;
            } else if (calc < 0.66) {
                offset++;
            }

            let choke = 0.98 - (i / vector.m);

            x += vector.y * offset * choke;
            y -= vector.x * offset * choke;

            Viewport.ctx.fillRect(x, y, 1, 1);
        }
    },

    drawControlPanel() {
        let height = 44;
        Viewport.ctx.fillStyle = '#181425';
        Viewport.ctx.fillRect(0, Viewport.height - height, Viewport.width, height);

        Viewport.ctx.fillStyle = '#b55088';
        Viewport.ctx.fillRect(0, Viewport.height - height - 1, Viewport.width, 1);

        Viewport.ctx.fillStyle = '#f6757a';
        Viewport.ctx.fillRect(0, Viewport.height - height - 2, Viewport.width, 1);

        Viewport.ctx.fillStyle = '#c0cbdc';
        Viewport.ctx.fillRect(0, Viewport.height - height - 3, Viewport.width, 1);
    }
};
