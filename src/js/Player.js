'use strict';

import { game } from './Game';
import { R6, R90, DIALOG_HINT_DEATH, DIALOG_HINT_DMG, DIALOG_START_A, DIALOG_START_B, DIALOG_HINT_1, DIALOG_HINT_2, DIALOG_HINT_3 } from './Constants';
import { vectorBetween, vector2point, normalizeVector, uv2xy, vector2angle, roomCenter } from './Util';
import { Sprite } from './Sprite';
import { Input } from './input/Input';
import { ShotgunBlast } from './ShotgunBlast';
import { SPAWN, HUNT, ATTACK, RELOAD, DEAD } from './systems/Behavior';
import { ReloadAnimation } from './ReloadAnimation';
import { Audio } from './Audio';
import { Gore } from './Gore';
import { Viewport } from './Viewport';
import { SpawnAnimation } from './SpawnAnimation';
import { Page } from './Page';
import { ScreenShake } from './ScreenShake';

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
