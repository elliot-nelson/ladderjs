import { LEVEL_ROWS, LEVEL_COLS } from './Constants';
import LevelData from '../levels/levels.json';

export const Level = {
    LEVELS: LevelData,
    LEVEL_COUNT: LevelData.length,

    load(levelNumber) {
        console.log(Level.LEVELS);
        // As the player keeps playing, level numbers will loop around to beginning
        let level = Level.LEVELS[levelNumber % Level.LEVELS.length];
        if (!level) throw new Error(`No such level number: ${levelNumber}`);

        // Perform some sanity checks on the level layout and extract useful info
        // like player start position and dispenser positions etc.

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
            maxRocks: level.maRrocks,
            layout,
            dispensers,
            player
        };
    }
};
