import { Text } from './Text';
import { Player } from './Player';
import { Rock } from './Rock';
import { LEVEL_COLS, LEVEL_ROWS, SCORE_ROCK, SCORE_STATUE, SCORE_TREASURE, MAX_ROCKS, DISPENSER_MAX_ROCKS, HIDDEN_FACTOR_MAX_ROCKS } from './Constants';
import { game } from './Game';
import { State } from './Behavior';
import { Screen } from './Screen';
import { Level } from './Level';

/**
 * Field
 *
 * The "field" represents the current level, or, "playing field". A new playing field is created
 * every time you start a level, so we attach everything about the currently played level to
 * the field -- positions of treasure, the player, victory conditions, etc.
 */
export class Field {
    constructor(levelNumber) {
        let level = Level.load(levelNumber);

        // Store level-related info
        this.layout = level.layout;
        this.dispensers = level.dispensers;
        this.time = 2000;

        // Initialize player
        this.player = new Player(level.player.x, level.player.y);

        // Initialize list of rocks (empty)
        this.rocks = [];

        // Not winning yet (while "winning" the player stops moving and we add up the bonus score)
        this.winning = false;
    }

    update(moveFrame) {
        if (this.winning) {
            game.session.updateScore(SCORE_TREASURE);
            this.time -= 10;
            if (this.time < 0) game.session.startNextLevel();
            return;
        }

        if (this.time > 0 && moveFrame) this.time--;

        let oldX = this.player.x, oldY = this.player.y;

        // Move player based on user input
        this.player.update(this, moveFrame);

        if (oldX !== this.player.x && oldY === this.player.y) {
            if (this.isDisappearingFloor(oldX, oldY + 1)) {
                this.layout[oldY + 1][oldX] = ' ';
            }
        }

        // Check if player should be dead (before moving rocks)
        if (moveFrame) this.checkIfPlayerShouldDie(game.session);

        // Move rocks
        for (let rock of this.rocks) rock.update(this, moveFrame);

        // Check if player should be dead (after moving rocks)
        if (moveFrame) this.checkIfPlayerShouldDie(game.session);

        if (moveFrame) {
            // Collect statues
            if (this.isStatue(this.player.x, this.player.y)) {
                this.layout[this.player.y][this.player.x] = ' ';
                game.session.updateScore(SCORE_STATUE);
            }

            // Collect treasure (ends the current level)
            if (this.isTreasure(this.player.x, this.player.y)) {
                this.winning = true;
                return;
            }

            // Interact with trampolines
            if (this.isTrampoline(this.player.x, this.player.y)) {
                switch (Math.floor(Math.random() * 5)) {
                    case 0:
                        this.player.state = State.LEFT;
                        this.player.nextState = undefined;
                        break;
                    case 1:
                        this.player.state = State.RIGHT;
                        this.player.nextState = undefined;
                        break;
                    case 2:
                        this.player.state = State.JUMP_UP;
                        this.player.nextState = undefined;
                        this.player.jumpStep = 0;
                        break;
                    case 3:
                        this.player.state = State.JUMP_LEFT;
                        this.player.nextState = State.LEFT;
                        this.player.jumpStep = 0;
                        break;
                    case 4:
                        this.player.state = State.JUMP_RIGHT;
                        this.player.nextState = State.RIGHT;
                        this.player.jumpStep = 0;
                        break;
                }
            }

            // Kill dead rocks
            this.rocks = this.rocks.filter(rock => rock.state !== State.DEAD);

            // Dispense new rocks
            if (this.rocks.length < this.maxRocks() && Math.random() > 0.91) {
                let dispenser = this.dispensers[Math.floor(Math.random() * this.dispensers.length)];
                this.rocks.push(new Rock(dispenser));
            }

            // Kill player
            if (this.player.state === State.DEAD) {
                game.session.restartLevel();
            }
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

    isTrampoline(x, y) {
        return this.layout[y][x] === '.';
    }

    isEater(x, y) {
        return this.layout[y][x] === '*';
    }

    isFire(x, y) {
        return this.layout[y][x] === '^';
    }

    isDisappearingFloor(x, y) {
        return this.layout[y][x] === '-';
    }

    canClimbUp(x, y) {
        if (y < 0) return false;
        return ['H', '&', '$'].includes(this.layout[y][x]);
    }

    canClimbDown(x, y) {
        return ['H', '&', '$', ' ', '^', '.'].includes(this.layout[y][x]);
    }

    checkIfPlayerShouldDie() {
        if (this.player.state === State.DYING || this.player.state === State.DEAD) return;

        if (this.isFire(this.player.x, this.player.y)) {
            this.player.state = State.DYING;
        }

        if (this.time <= 0) {
            this.player.state = State.DYING;
        }

        for (let i = 0; i < this.rocks.length; i++) {
            if (this.player.x === this.rocks[i].x) {
                if (this.player.y === this.rocks[i].y) {
                    this.player.state = State.DYING;
                    this.rocks.splice(i, 1);
                    break;
                } else if (this.player.y === this.rocks[i].y - 1 && this.emptySpace(this.player.x, this.player.y + 1)) {
                    game.session.updateScore(SCORE_ROCK);
                } else if (this.player.y === this.rocks[i].y - 2 && this.emptySpace(this.player.x, this.player.y + 1) && this.emptySpace(this.player.x, this.player.y + 2)) {
                    game.session.updateScore(SCORE_ROCK);
                }
            }
        }
    }

    maxRocks() {
        return MAX_ROCKS + this.dispensers.length * DISPENSER_MAX_ROCKS + game.session.hiddenFactor() * HIDDEN_FACTOR_MAX_ROCKS;
    }
}
