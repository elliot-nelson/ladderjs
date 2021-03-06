/**
 * `MainMenu` is a class that represents a screen the user can view. Instances of
 * MainMenu are constructed whenever we want the user to go to the main menu, and
 * thrown away when we're done.
 */

import { PLAY_SPEEDS } from './Constants';
import { GameVersion } from './GameVersion-gen.json';
import { Screen } from './Screen';
import { Game } from './Game';
import { Input } from './Input';

export class MainMenu {
    update() {
        switch (Input.lastKey().toUpperCase()) {
            case 'P':
                Input.consume();
                Game.startSession();
                break;
            case 'L':
                Input.consume();
                Game.playSpeed = (Game.playSpeed + 1) % PLAY_SPEEDS.length;
                break;
            case 'I':
                Input.consume();
                Game.showInstructions();
                break;
            case 'E':
                Input.consume();
                Game.showInstructions();
                break;
        }
    }

    draw() {
        let terminal = 'Quiche MkII';

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
            `                                       Version:    ${GameVersion}`,
            `(c) 1982, 1983 Yahoo Software          Terminal:   ${terminal}`,
            `10970 Ashton Ave.  Suite 312           Play speed: ${Game.playSpeed + 1} / ${PLAY_SPEEDS.length}`,
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
