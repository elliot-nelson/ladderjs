'use strict';


/**
 * Victory
 */
export const Victory = {
    perform() {
        /*if (game.player.pages >= 404 && !game.victory) {
            Victory.frame = 0;
            game.victory = true;
            game.player.pos = roomCenter(game.maze.rooms[ROOM_ENDING]);
            game.brawl = false;
            let enemies = game.entities.filter(entity => entity.enemy);
            for (let enemy of enemies) {
                enemy.state = DEAD;
            }
            Audio.play(Audio.victory);
        } else if (game.victory) {
            Victory.frame++;

            if (Victory.frame === 10) {
                game.entities.push(new SpawnAnimation(game.player.pos));
                game.screenshakes.push(new ScreenShake(20, 20, 90));
            }

            let enemies = game.entities.filter(entity => entity.enemy);
            if (Victory.frame % 30 === 0 && enemies.length < 25) {
                let pos = vectorAdd(game.player.pos, angle2vector(Math.random() * R360, 48));
                let enemyType = [Stabguts, Stabguts, Spindoctor][Math.random() * 3 | 0];
                let enemy = new enemyType(pos);
                game.entities.push(enemy);
                game.entities.push(new SpawnAnimation(pos));
            }
        }*/
    }
};
