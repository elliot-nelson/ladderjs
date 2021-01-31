import { Text } from './Text';
import { Player } from './Player';
import { Rock } from './Rock';
import { LEVEL_COLS, LEVEL_ROWS } from './Constants';
import { game } from './Game';
import { State } from './Behavior';
import { Screen } from './Screen';

/**
 * Field
 *
 * The "field" represents the current level, or, "playing field". A new playing field is created
 * every time you start a level, so we attach everything about the currently played level to
 * the field -- positions of treasure, the player, victory conditions, etc.
 */
export class Field {
    constructor(levelName) {
        this.levelName = levelName;
    }

    async init() {
        let level = await Field.loadLevel(this.levelName);

        this.terrain = level.terrain;
        this.dispensers = level.dispensers;
        this.rocks = [];
        this.eaters = level.eaters;
        console.log(level.player);
        this.player = new Player(level.player.x, level.player.y);

        this.score = 0;
    }

    update() {
        // Move player based on user input
        this.player.update(this);
        console.log(['updated', this.player.x, this.player.y]);

        // Check if player should be dead (before moving rocks)
        this.checkIfPlayerShouldDie();

        // Move rocks
        for (let rock of this.rocks) rock.update(this);

        // Check if player should be dead (after moving rocks)
        this.checkIfPlayerShouldDie();

        // Collect statues
        if (this.isStatue(this.player.x, this.player.y)) {
            this.terrain[this.player.y][this.player.x] = ' ';
            this.score += 1000;
        }

        // Collect treasure (ends the current level)
        if (this.isTreasure(this.player.x, this.player.y)) {
            game.nextLevel();
        }

        // Dispense new rocks
        if (this.rocks.length < 3 && Math.random() > 0.9) {
            let dispenser = this.dispensers[Math.floor(Math.random() * this.dispensers.length)];
            this.rocks.push(new Rock(dispenser));
        }

        // Kill dead rocks
        this.rocks = this.rocks.filter(rock => rock.state !== State.DEAD);

        // Kill player
        if (this.player.state === State.DEAD) {
            game.nextLevel();
        }
    }

    draw() {
        Screen.clear();

        // Draw terrain
        Screen.write(this.terrain.map(row => row.join('')), 0, 0);

        this.player.draw();

        this.rocks.forEach(rock => rock.draw());

        // Score
        Screen.write(String(this.score), 0, 21);

        // Lives
        Screen.write(String(4), 8, 21);
    }

    onSolid(x, y) {
        return ['=', '-', 'H', '|'].includes(this.terrain[y + 1][x]) || this.terrain[y][x] === 'H';
    }

    emptySpace(x, y) {
        if (x < 0 || x > LEVEL_COLS) {
            return true;
        } else {
            return !(this.terrain[y][x] in ['|', '=']);
        }
    }

    isLadder(x, y) {
        return this.terrain[y][x] === 'H';
    }

    isStatue(x, y) {
        return this.terrain[y][x] === '&';
    }

    isTreasure(x, y) {
        return this.terrain[y][x] === '$';
    }

    isEater(x, y) {
        return this.terrain[y][x] === '*';
    }

    isFire(x, y) {
        return this.terrain[y][x] === '^';
    }

    canClimbUp(x, y) {
        return ['H', '&', '$'].includes(this.terrain[y][x]);
    }

    canClimbDown(x, y) {
        return ['H', '&', '$', ' ', '^', '.'].includes(this.terrain[y][x]);
    }

    checkIfPlayerShouldDie() {
        if (this.player.state === State.DYING || this.player.state === State.DEAD) return;

        if (this.isFire(this.player.x, this.player.y)) {
            this.player.state = State.DYING;
        }

        for (let i = 0; i < this.rocks.length; i++) {
            if (this.player.x === this.rocks[i].x && this.player.y === this.rocks[i].y) {
                this.player.state = State.DYING;
                this.rocks.splice(i, 1);
                break;
            }
        }
    }

    static async loadLevel(levelName) {
        let text = await (await fetch(`levels/${levelName}.txt`)).text();

        let terrain = text.split('\n').map(row => row.split(''));
        let dispensers = [];
        let eaters = [];
        let player;

        // Sanity check
        terrain = terrain.slice(0, LEVEL_ROWS);

        for (let y = 0; y < LEVEL_ROWS; y++) {
            // Sanity checks
            if (!terrain[y]) terrain[y] = [];
            terrain[y] = terrain[y].slice(0, LEVEL_COLS);

            for (let x = 0; x < LEVEL_COLS; x++) {
                // Sanity check
                if (!terrain[y][x]) terrain[y][x] = ' ';

                // Der Dispensers (V) and Der Eaters (*) have behaviors, so it is convenient for us
                // to construct a list of them, but they are permanent parts of the terrain, so we can
                // leave them as part of the level and draw them normally.

                if (terrain[y][x] === 'V') {
                    dispensers.push({ x, y });
                }

                if (terrain[y][x] === '*') {
                    eaters.push({ x, y });
                }

                // Treasure ($), Statues (&), and the Lad (p) are transient - the player moves around and
                // can pick up the treasures and statues. That's why for these elements, we add them to
                // our lists AND we remove them from the "playing field", we'll draw them separately on
                // top of the terrain.

                if (terrain[y][x] === 'p') {
                    terrain[y][x] = ' ';
                    player = { x, y };
                }

                // Everything else, like floors (=), walls (|), ladders (H) and fire (^), is part of the
                // terrain. The Lad interacts with them, but we can handle that during our movement checks.
            }
        }

        return {
            terrain,
            dispensers,
            eaters,
            player
        };
    }
}
