import { Screen } from './Screen';

export class MainMenu {
    constructor() {
    }

    update() {
    }

    draw() {
        let version = '?';
        let terminal = '?';
        let speed = '?';

        let highScores = [
            `1) 6000  Bob`,
            `2) 6000  Tom`,
            `3) 4000  Wayne`,
            ``,
            ``
        ];

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
            `10970 Ashton Ave.  Suite 312           Play speed: ${speed}`,
            `Los Angeles, Ca  90024                 Move: ↑↓←→/WASD`,
            `                                       Jump: Space`,
            `                                       Stop: Other`,
            ``,
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
