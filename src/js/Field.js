import { Text } from './Text';
import { Player } from './Player';
import { Rock } from './Rock';
import { LEVEL_COLS, LEVEL_ROWS, SCORE_ROCK, SCORE_STATUE, SCORE_TREASURE } from './Constants';
import { game } from './Game';
import { State } from './Behavior';
import { Screen } from './Screen';
import { Levels } from './Levels-gen';

/**
 * Field
 *
 * The "field" represents the current level, or, "playing field". A new playing field is created
 * every time you start a level, so we attach everything about the currently played level to
 * the field -- positions of treasure, the player, victory conditions, etc.
 */
export class Field {
    constructor(levelName) {
        let level = Field.loadLevel(levelName);

        this.levelName = levelName;
        this.layout = level.layout;
        this.dispensers = level.dispensers;
        this.time = level.time;
        this.maxRocks = level.rocks;
        this.rocks = [];
        this.player = new Player(level.player.x, level.player.y);
    }

    update(session) {
        // Move player based on user input
        this.player.update(this);

        // Check if player should be dead (before moving rocks)
        this.checkIfPlayerShouldDie(session);

        // Move rocks
        for (let rock of this.rocks) rock.update(this);

        // Check if player should be dead (after moving rocks)
        this.checkIfPlayerShouldDie(session);

        // Collect statues
        if (this.isStatue(this.player.x, this.player.y)) {
            this.layout[this.player.y][this.player.x] = ' ';
            session.updateScore(SCORE_STATUE);
        }

        // Collect treasure (ends the current level)
        if (this.isTreasure(this.player.x, this.player.y)) {
            session.startNextLevel();
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
            session.restartLevel();
        }
    }

    draw() {
        // Draw layout
        Screen.write(0, 0, this.layout.map(row => row.join('')));

        // Draw player
        this.player.draw();

        // Draw rocks
        this.rocks.forEach(rock => rock.draw());
    }

    onSolid(x, y) {
        return ['=', '-', 'H', '|'].includes(this.layout[y + 1][x]) || this.layout[y][x] === 'H';
    }

    emptySpace(x, y) {
        if (x < 0 || x >= LEVEL_COLS) {
            return false;
        } else {
            return !['|', '='].includes(this.layout[y][x]);
        }
    }

    isLadder(x, y) {
        return this.layout[y][x] === 'H';
    }

    isStatue(x, y) {
        return this.layout[y][x] === '&';
    }

    isTreasure(x, y) {
        return this.layout[y][x] === '$';
    }

    isEater(x, y) {
        return this.layout[y][x] === '*';
    }

    isFire(x, y) {
        return this.layout[y][x] === '^';
    }

    canClimbUp(x, y) {
        return ['H', '&', '$'].includes(this.layout[y][x]);
    }

    canClimbDown(x, y) {
        return ['H', '&', '$', ' ', '^', '.'].includes(this.layout[y][x]);
    }

    checkIfPlayerShouldDie(session) {
        if (this.player.state === State.DYING || this.player.state === State.DEAD) return;

        if (this.isFire(this.player.x, this.player.y)) {
            this.player.state = State.DYING;
        }

        for (let i = 0; i < this.rocks.length; i++) {
            if (this.player.x === this.rocks[i].x) {
                if (this.player.y === this.rocks[i].y) {
                    this.player.state = State.DYING;
                    this.rocks.splice(i, 1);
                    break;
                } else if (this.player.y === this.rocks[i].y - 1 && this.emptySpace(this.player.x, this.player.y + 1)) {
                    session.updateScore(SCORE_ROCK);
                } else if (this.player.y === this.rocks[i].y - 2 && this.emptySpace(this.player.x, this.player.y + 1) && this.emptySpace(this.player.x, this.player.y + 2)) {
                    session.updateScore(SCORE_ROCK);
                }
            }
        }
    }

    static loadLevel(levelName) {
        let level = Levels.find(level => level.name === levelName);
        if (!level) throw new Error(`No such level: ${levelName}`);

        let layout = level.layout.map(row => row.split(''));
        let dispensers = [];
        let player;

        // Sanity check
        layout = layout.slice(0, LEVEL_ROWS);

        for (let y = 0; y < LEVEL_ROWS; y++) {
            // Sanity checks
            if (!layout[y]) layout[y] = [];
            layout[y] = layout[y].slice(0, LEVEL_COLS);

            for (let x = 0; x < LEVEL_COLS; x++) {
                // Sanity check
                if (!layout[y][x]) layout[y][x] = ' ';

                // Der Dispensers (V) and Der Eaters (*) have behaviors, so it is convenient for us
                // to construct a list of them, but they are permanent parts of the layout, so we can
                // leave them as part of the level and draw them normally.

                if (layout[y][x] === 'V') {
                    dispensers.push({ x, y });
                }

                // Treasure ($), Statues (&), and the Lad (p) are transient - the player moves around and
                // can pick up the treasures and statues. That's why for these elements, we add them to
                // our lists AND we remove them from the "playing field", we'll draw them separately on
                // top of the layout.

                if (layout[y][x] === 'p') {
                    layout[y][x] = ' ';
                    player = { x, y };
                }

                // Everything else, like floors (=), walls (|), ladders (H) and fire (^), is part of the
                // layout. The Lad interacts with them, but we can handle that during our movement checks.
            }
        }

        return {
            name: level.name,
            time: level.time,
            rocks: level.rocks,
            layout,
            dispensers,
            player
        };
    }
}
