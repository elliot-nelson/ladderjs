import { Text } from './Text';

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
        this.eaters = level.eaters;
        this.treasures = level.treasures;
        this.statues = level.statues;
        this.player = level.player;

        this.score = 0;
    }

    update() {
        console.log(this.player);
        if (this.player.x < 79) {
            this.player.x++;
        }
    }

    draw() {
        // Draw terrain
        let screen = this.terrain.map(row => row.join('')).join('\n');
        Text.drawTextColRow(screen, 0, 0);

        // Draw entities
        for (let treasure of this.treasures) {
            Text.drawTextColRow('$', treasure.x, treasure.y);
        }

        for (let statue of this.statues) {
            Text.drawTextColRow('&', statue.x, statue.y);
        }

        Text.drawTextColRow('p', this.player.x, this.player.y);
    }

    static async loadLevel(levelName) {
        let text = await (await fetch(`levels/${levelName}.txt`)).text();

        let terrain = text.split('\n').map(row => row.split(''));
        let dispensers = [];
        let eaters = [];
        let treasures = [];
        let statues = [];
        let player;

        // Sanity check
        terrain = terrain.slice(0, 20);

        for (let y = 0; y < 20; y++) {
            // Sanity checks
            if (!terrain[y]) terrain[y] = [];
            terrain[y] = terrain[y].slice(0, 80);

            for (let x = 0; x < 80; x++) {
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
                // our list AND we remove them from the "playing field", we'll draw them separately on
                // top of the terrain.

                if (terrain[y][x] === '$') {
                    terrain[y][x] = ' ';
                    treasures.push({ x, y });
                }

                if (terrain[y][x] === '&') {
                    terrain[y][x] = ' ';
                    statues.push({ x, y });
                }

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
            treasures,
            statues,
            player
        };
    }
}
