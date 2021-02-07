import { Screen } from './Screen';
import { game } from './Game';
import { Input } from './Input';

export class InstructionsMenu {
    constructor() {
    }

    update() {
        if (Input.lastKeyPressed().toUpperCase() !== '') {
            Input.consume();
            game.showMainMenu();
        }
    }

    draw() {
        Screen.clear();
        Screen.write(0, 0, [
            `You are a Lad trapped in a maze.  Your mission is is to explore the`,
            `dark corridors never before seen by human eyes and find hidden`,
            `treasures and riches.`,
            ``,
            `You control Lad by typing the direction buttons and jumping by`,
            `typing SPACE.  But beware of the falling rocks called Der rocks.`,
            `You must find and grasp the treasures (shown as $) BEFORE the`,
            `bonus time runs out.`,
            ``,
            `A new Lad will be awarded for every 10,000 points.`,
            `Extra points are awarded for touching the gold`,
            `statues (shown as &).  You will receive the bonus time points`,
            `that are left when you have finished the level.`,
            ``,
            `Type an ESCape to pause the game.`,
            ``,
            `Remember, there is more than one way to skin a cat. (Chum)`,
            ``,
            `Good luck Lad.`,
            ``,
            ``,
            ``,
            `Type RETURN to return to main menu:`
        ]);
    }
}
