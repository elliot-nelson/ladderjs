/**
 * `Audio` is a singleton that controls sound effects within the game.
 *
 * The original game was only capable of the built-in "BEEP" sound in
 * the terminal, and used it for score bumps (playing it repeatedly
 * if you win a level, similar to the way we do in this version).
 *
 * We have a little more flexibility here and we're using very simple
 * sounds built using zzfx. For examples like these check out the zzfx
 * project, especially the soundboard at:
 *
 *     https://codepen.io/KilledByAPixel/details/BaowKzv
 */

import { zzfx, zzfxP, zzfxX } from './lib/zzfx';
import { zzfxM } from './lib/zzfxm';

export const Audio = {
    init() {
        Audio.readyToPlay = false;

        Audio.ctx = zzfxX;
        Audio.gain_ = Audio.ctx.createGain();
        Audio.gain_.connect(Audio.ctx.destination);
        zzfx.destination_ = Audio.gain_;

        // Sounds
        Audio.begin = [,,539,0,.04,.29,1,1.92,,,567,.02,.02,,,,.04];
        Audio.jump = [,.1,75,.03,.08,.17,1,1.88,7.83,,,,,.4];
        Audio.score = [.7,.08,1675,,.06,.16,1,1.82,,,837,.06];
        Audio.dying = [,,925,.04,.3,.6,1,.3,,6.27,-184,.09,.17];

        // Sound throttling - for sounds that might play too often, we
        // can setup a throttle so X milliseconds must pass before playing
        // that particular sound again.
        Audio.soundThrottle = new Map();
        Audio.soundDelays = new Map();
        Audio.soundDelays.set(Audio.score, 160);
    },

    update() {
        if (!Audio.readyToPlay) return;

        if (!Audio.musicPlaying) {
            //Audio.bgmusicnode = zzfxP(...Audio.song);
            //Audio.bgmusicnode.loop = true;
            Audio.musicPlaying = true;
        }
    },

    play(sound) {
        if (!Audio.readyToPlay) return;

        let now = new Date().getTime();
        let allowed = Audio.soundThrottle.get(sound) || 0;
        let delay = Audio.soundDelays.get(sound) || 0;

        if (now >= allowed) {
            zzfx(...sound);
            Audio.soundThrottle.set(sound, now + delay);
        }
    },

    // It's important we do pausing and unpausing as specific events and not in general update(),
    // because update() is triggered by the animation frame trigger which does not run if the
    // page is not visible. (So, if you want the music to fade in the background, for example,
    // that's not helpful if it won't work because you aren't looking at the page!)

    pause() {
        Audio.gain_.gain.linearRampToValueAtTime(0, Audio.ctx.currentTime + 1);
    },

    unpause() {
        Audio.gain_.gain.linearRampToValueAtTime(1, Audio.ctx.currentTime + 1);
    }
};
