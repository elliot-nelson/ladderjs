'use strict';

import { Sprite } from './Sprite';
import { Input } from './input/Input';

/**
 * Player
 */
export class Player {
    constructor() {
        this.pos = { x: 0, y: 0 };
        this.vel = { x: 0, y: 0 };
        this.bbox = [{ x: -6, y: -6 }, { x: 6, y: 6 }];
        this.hp = 100;
        this.damage = [];
        this.history = [];
        this.facing = { x: 0, y: -1, m: 0 };
        this.radius = 11;
        this.shellsLeft = 4;
        this.shellsMax = 4;
        this.forcedReload = false;
        this.mass = 3;
        this.pages = 0;
        this.deaths = 0;
        this.state = 1;
        this.frames = 29;
    }

    think() {
        this.vel = {
            x: Input.direction.x * Input.direction.m * 0.7,
            y: Input.direction.y * Input.direction.m * 0.7
        };
    }

    draw() {
        let sprite = Sprite.harold[0];
        //let p = { x: Math.round(this.pos.x), y: Math.round(this.pos.y) };
        let p = this.pos;
        Sprite.drawViewportSprite(sprite, p);
    }
}
