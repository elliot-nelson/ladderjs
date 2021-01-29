'use strict';

import { game } from './Game';
import { WALL_TOP, WALL_RIGHT, WALL_BOTTOM, WALL_LEFT, OPEN_TOP, OPEN_RIGHT, OPEN_BOTTOM, OPEN_LEFT, DIALOG_START_A, DIALOG_START_B, DIALOG_HINT_1, DIALOG_HINT_2, DIALOG_HINT_3, R360, TILE_SIZE } from './Constants';
import { rgba, xy2uv, qr2xy } from './Util';
import { Viewport } from './Viewport';
import { Sprite } from './Sprite';
import { Text } from './Text';

/**
 * Viewport
 *
 * Represents the game display (for us, a canvas).
 */
export const Maze = {
    draw() {
        let offset = {
            x: Viewport.center.u - game.camera.pos.x,
            y: Viewport.center.v - game.camera.pos.y
        };

        let map = [
            [0, 0, 1, 2, 1],
            [0, 1, 1, 1, 1],
            [1, 2, 1, 1, 1],
            [1, 1, 1, 2, 0],
            [1, 1, 1, 0, 0]
        ];

        for (let r = 0; r < map.length; r++) {
            for (let q = 0; q < map[0].length; q++) {
                let x = q * 13 + offset.x,
                    y = q * 6 + r * 12 + offset.y;

                x = qr2xy({ q, r }).x;
                y = qr2xy({ q, r }).y;

                let sprite = Sprite.tiles[map[r][q]];
                if (sprite) {
                    Sprite.drawViewportSprite(sprite, { x, y });
                    //Viewport.ctx.drawImage(sprite.img, x, y);
                }
            }
        }
    },

    xdraw() {
        let ctx = Viewport.ctx, maze = game.maze;

        let offset = {
            x: Viewport.center.u - game.camera.pos.x,
            y: Viewport.center.v - game.camera.pos.y
        };

        let r1 = 0,
            r2 = maze.h,
            q1 = 0,
            q2 = maze.w;

        if (game.brawl) {
            r1 = game.brawl.room.r;
            r2 = r1 + game.brawl.room.h;
            q1 = game.brawl.room.q;
            q2 = q1 + game.brawl.room.w;

            // During brawl, everything outside the room is hidden
            Viewport.ctx.fillStyle = rgba(10, 10, 10, 1);
            Viewport.fillViewportRect();
        } else {
            // Render wall tiles across the entire background
            Viewport.ctx.drawImage(Sprite.tilebg.img, -16 - game.camera.pos.x % 32, -8 - game.camera.pos.y % 32);
        }

        for (let r = r1; r < r2; r++) {
            for (let q = q1; q < q2; q++) {
                let x = q * 32 + offset.x,
                    y = r * 32 + offset.y;
                if (x < -50 || y < -50 || x > 500 || y > 500) continue;

                let sprite = Sprite.tiles[maze.maze[r][q] ? 1 : 0];
                ctx.drawImage(sprite.img, x, y);
            }
        }

        for (let r = r1; r < r2; r++) {
            for (let q = q1; q < q2; q++) {
                let x = q * 32 + offset.x,
                    y = r * 32 + offset.y;
                if (x < -50 || y < -50 || x > 500 || y > 500) continue;

                let coords = [
                    [0, 0, 36, 4, x - 2, y - 2, 36, 4],
                    [32, 0, 4, 36, x + 30, y - 2, 4, 36],
                    [0, 32, 36, 4, x - 2, y + 30, 36, 4],
                    [0, 0, 4, 36, x - 2, y - 2, 4, 36]
                ];

                for (let i = 0; i < 4; i++) {
                    if (maze.walls[r][q] & (WALL_TOP << i)) {
                        ctx.drawImage(Sprite.walls.img, ...coords[i]);
                    }
                }

                if (game.brawl) {
                    for (let i = 0; i < 4; i++) {
                        if (maze.walls[r][q] & (OPEN_TOP << i)) {
                            ctx.drawImage(Sprite.gates.img, ...coords[i]);
                        }
                    }
                }
            }
        }

        if (!game.brawl) {
            for (let room of Object.values(maze.rooms)) {
                if (room.roomNumber >= 3 && !game.roomsCleared[room.roomNumber]) {
                    let uv = xy2uv({
                        x: (room.q + room.w / 2) * TILE_SIZE,
                        y: (room.r + room.h / 2) * TILE_SIZE
                    });
                    Viewport.ctx.globalAlpha = 1 - (game.frame % 30) / 30;
                    Text.drawText(Viewport.ctx, '!', uv.u - 4, uv.v - 10, 4, Text.red, Text.blue_shadow);
                    Viewport.ctx.globalAlpha = 1;
                }
            }
        }
    }
};
