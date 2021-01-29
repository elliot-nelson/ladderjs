import { Viewport } from './Viewport';
import { Sprite } from './Sprite';
import { Terrain } from './Terrain';

export const World = {
    init() {
        World.reset();
    },

    reset() {
        World.terrain = [
            { t: 't_tree1', x: 0, y: 0 },
            { t: 't_tree2', x: 50, y: 20 },
            { t: 't_tree3', x: 100, y: -20 }
        ];

        World.entities = [];
    },

    think() {
    },

    draw() {
        for (let terrain of World.terrain) {
            Sprite.drawViewportSprite(Sprite.terrain[terrain.t], terrain);
        }
    }
};
