import { Screen } from './Screen';
import { game } from './Game';
import { PLAY_SPEEDS } from './Constants';
import { Input } from './input/Input';

export class MainMenu {
    constructor() {
    }

    update() {
        switch (Input.lastKeyPressed().toUpperCase()) {
            case 'P':
                Input.consume();
                game.startSession();
                break;
            case 'L':
                Input.consume();
                game.playSpeed = (game.playSpeed + 1) % PLAY_SPEEDS.length;
                break;
            case 'I':
                Input.consume();
                game.showInstructions();
                break;
            case 'E':
                Input.consume();
                game.showInstructions();
                break;
        }
    }

    draw() {
        let version = '?';
        let terminal = '?';

        let highScores = [
            `1) 6000  Bob`,
            `2) 6000  Tom`,
            `3) 4000  Wayne`,
            ``,
            ``
        ];

        Screen.clear();
        Screen.write(0, 0, [
            `               LL                     dd       dd`,
            `               LL                     dd       dd                      tm`,
            `               LL         aaaa     ddddd    ddddd    eeee   rrrrrrr`,
            `               LL        aa  aa   dd  dd   dd  dd   ee  ee  rr    rr`,
            `               LL        aa  aa   dd  dd   dd  dd   eeeeee  rr`,
            `               LL        aa  aa   dd  dd   dd  dd   ee      rr`,
            `               LLLLLLLL   aaa aa   ddd dd   ddd dd   eeee   rr`,
            ``,
            `                                       Version:    ${version}`,
            `(c) 1982, 1983 Yahoo Software          Terminal:   ${terminal}`,
            `10970 Ashton Ave.  Suite 312           Play speed: ${game.playSpeed + 1} / ${PLAY_SPEEDS.length}`,
            `Los Angeles, Ca  90024                 Move = ↑↓←→/WASD, Jump = Space,`,
            `                                       Stop = Other`,
            ``,
            `P = Play game                          High Scores`,
            `L = Change level of difficulty         ${highScores[0]}`,
            `C = Configure Ladder                   ${highScores[1]}`,
            `I = Instructions                       ${highScores[2]}`,
            `E = Exit Ladder                        ${highScores[3]}`,
            `                                       ${highScores[4]}`,
            ``,
            `Enter one of the above:`
        ]);
    }
}
