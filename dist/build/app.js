(function () {
    'use strict';

    /**
     * Constants
     */

    const TITLE = 'WIZARD WITH A SHOTGUN';

    // The playable area. Note that this is the desired dimensions, but the actual on-screen dimensions
    // may be larger to maintain aspect ratio (see `Viewport.width` & `Viewport.height`).
    const GAME_WIDTH = 640;
    const GAME_HEIGHT = 400;

    // The "screen area". This is an ASCII game and so most of the game logic doesn't care about browser
    // pixels, we care about the ASCII display area (80x25).
    const SCREEN_WIDTH = 80;
    const SCREEN_HEIGHT = 25;

    // The size of our on-screen characters (given dimensions above, this is 80 cols by 25 rows).
    const CHAR_WIDTH = 8;
    const CHAR_HEIGHT = 16;
    const CHARSHEET_WIDTH = 16 * CHAR_WIDTH;

    // Game constants, copied from the original game
    const LEVEL_ROWS = 20;
    const LEVEL_COLS = 79;

    // Play speeds, expressed as frames per second. Each number is evenly divisible into 1000ms.
    const PLAY_SPEEDS = [10, 20, 40, 76, 142];

    // Playable levels (see `Levels-gen.js` for the level data)
    const LEVEL_ORDER = [
        'Easy Street',
        'Long Island',
        'Ghost Town',
        'Tunnel Vision'
    ];

    // Score events (note, these are just identifiers for the types of score increases, not
    // actual score values).
    const SCORE_ROCK = 0;
    const SCORE_STATUE = 1;
    const SCORE_TREASURE = 2;

    /**
     * Viewport
     *
     * Represents the game display (for us, a canvas).
     */
    const Viewport = {
        init() {
            Viewport.canvas = document.getElementById('canvas');
            Viewport.ctx = Viewport.canvas.getContext('2d');
            Viewport.resize(true);
        },

        // Resize the canvas to give us approximately our desired game display size.
        //
        // Rather than attempt to explain it, here's a concrete example:
        //
        //     we start with a desired game dimension:   480x270px
        //          get the actual browser dimensions:  1309x468px
        //          factor in the display's DPI ratio:  2618x936px
        //         now calculate the horizontal scale:       5.45x
        //                     and the vertical scale:       3.46x
        //            our new offical game scaling is:        5.4x
        //       and our official viewport dimensions:   484x173px
        //
        // This approach emphasizes correct aspect ratio and maintains full-window rendering, at
        // the potential cost of limiting visibility of the game itself in either the X or Y axis.
        // If you use this approach, make sure your GUI can "float" (otherwise there may be whole
        // UI elements the player cannot see!).
        resize(force) {
            let dpi = window.devicePixelRatio,
                width = Viewport.canvas.clientWidth,
                height = Viewport.canvas.clientHeight,
                dpiWidth = width * dpi,
                dpiHeight = height * dpi;

            if (
                force ||
                Viewport.canvas.width !== dpiWidth ||
                Viewport.canvas.height !== dpiHeight
            ) {
                Viewport.canvas.width = dpiWidth;
                Viewport.canvas.height = dpiHeight;

                Viewport.scale = ((Math.min(dpiWidth / GAME_WIDTH, dpiHeight / GAME_HEIGHT) * 10) | 0) / 10;
                Viewport.width = Math.ceil(dpiWidth / Viewport.scale);
                Viewport.height = Math.ceil(dpiHeight / Viewport.scale);
                Viewport.center = {
                    u: (Viewport.width / 2) | 0,
                    v: (Viewport.height / 2) | 0
                };
                Viewport.clientWidth = width;
                Viewport.clientHeight = height;

                // Note: smoothing flag gets reset on every resize by some browsers, which is why
                // we do it here.
                Viewport.ctx.imageSmoothingEnabled = false;
            }

            // We do this every frame, not just on resize, due to browser sometimes "forgetting".
            //Viewport.canvas.style.cursor = 'none';
        },

        fillViewportRect() {
            Viewport.ctx.fillRect(0, 0, Viewport.width, Viewport.height);
        }
    };

    function xy2qr(pos) {
        let qrFraction = {
            q: (pos.x / 13),
            r: ((pos.y - pos.x * 6 / 13) / 12)
        };
        return qrRounded(qrFraction);
    }

    function uv2xy(pos) {
        return {
            x: pos.u - Viewport.center.u + game.camera.pos.x,
            y: pos.v - Viewport.center.v + game.camera.pos.y
        };
    }

    function qr2qrs(pos) {
        return { q: pos.q, r: pos.r, s: -pos.q-pos.r };
    }

    function qrs2qr(pos) {
        return { q: pos.q, r: pos.r };
    }

    // When you "round" a fractional hexagonal value to an integer one (usually to convert
    // a mouse click to a hex grid), you can't just `Math.floor()` like you can with standard
    // square tiles - you'll never get the behavior right on the angled sides of the hexagons.
    //
    // To get the behavior you want, you need to convert to cubed coordinates (q,r,s), then
    // individually round each one and eliminate the one furthest away from your original value.
    function qrRounded(pos) {
        let qrsA = qr2qrs(pos),
            qrsB = {
                q: Math.round(qrsA.q),
                r: Math.round(qrsA.r),
                s: Math.round(qrsA.s)
            },
            diffQ = Math.abs(qrsA.q - qrsB.q),
            diffR = Math.abs(qrsA.r - qrsB.r),
            diffS = Math.abs(qrsA.s - qrsB.s);

        if (diffQ > diffR && diffQ > diffS) {
            qrsB.q = -qrsB.r-qrsB.s;
        } else if (diffR > diffS) {
            qrsB.r = -qrsB.q-qrsB.s;
        } else {
            qrsB.s = -qrsB.q-qrsB.r;
        }

        return qrs2qr(qrsB);
    }

    function rgba(r, g, b, a) {
        return `rgba(${r},${g},${b},${a})`;
    }

    function createCanvas(width, height) {
        let canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        let ctx = canvas.getContext('2d');
        return { canvas, ctx };
    }

    /**
     * This module is generated by `gulp buildAssets`.
     */
    const SpriteSheet =
        /* <generated> */
    { font: [ [ 128, 0, 128, 448 ] ],
      font2: [ [ 0, 0, 128, 512 ] ],
      harold: [ [ 226, 459, 19, 12 ] ],
      t_tree1: [ [ 166, 448, 30, 19 ] ],
      t_tree2: [ [ 128, 448, 38, 16 ] ],
      t_tree3: [ [ 196, 448, 30, 16 ] ],
      t_tree4: [ [ 226, 448, 27, 11 ] ],
      t_treeplatform1: [ [ 245, 459, 9, 5 ] ],
      tree1: [ [ 166, 448, 30, 19 ] ],
      tree2: [ [ 128, 448, 38, 16 ] ],
      tree3: [ [ 196, 448, 30, 16 ] ],
      tree4: [ [ 226, 448, 27, 11 ] ],
      treeplatform1: [ [ 245, 459, 9, 5 ] ],
      base64:
       'data:image/png;base64,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' };
    /* </generated> */

    const Terrain = {
        objects: {},

        init() {
        }
    };

    /**
     * Sprite
     *
     * Encapsulates loading sprite slices from the spritesheet, organizing them, and
     * modifying them or constructing using primitives. To save space, we use some techniques
     * like storing only a small slice of an image in the spritesheet, then using code
     * to duplicate it, add some randomness, etc.
     */
    const Sprite = {
        // This is an exception to the rule, loading the spritesheet is a special action that
        // happens BEFORE everything is initialized.
        loadSpritesheet(cb) {
            let image = new Image();
            image.onload = cb;
            image.src = SpriteSheet.base64;
            Sprite.sheet = image;
        },

        init() {
            Sprite.harold = [
                initBasicSprite(SpriteSheet.harold[0], { x: 7, y: 11 })
            ];

            Sprite.terrain = loadTerrain();

            // Base pixel font and icons (see `Text.init` for additional variations)
            Sprite.font = initBasicSprite(SpriteSheet.font2[0]);

            return;
        },

        /**
         * A small helper that draws a sprite onto a canvas, respecting the anchor point of
         * the sprite. Note that the canvas should be PRE-TRANSLATED and PRE-ROTATED, if
         * that's appropriate!
         */
        drawSprite(ctx, sprite, u, v) {
            ctx.drawImage(sprite.img, u - sprite.anchor.x, v - sprite.anchor.y);
        },

        drawViewportSprite(sprite, pos, rotation) {
            let { u, v } = this.viewportSprite2uv(
                sprite,
                pos
            );
            if (rotation) {
                Viewport.ctx.save();
                Viewport.ctx.translate(u + sprite.anchor.x, v + sprite.anchor.y);
                Viewport.ctx.rotate(rotation);
                Viewport.ctx.drawImage(
                    sprite.img,
                    -sprite.anchor.x,
                    -sprite.anchor.y
                );
                Viewport.ctx.restore();
            } else {
                Viewport.ctx.drawImage(sprite.img, u, v);
            }
        },

        viewportSprite2uv(sprite, pos) {
            return {
                u: pos.x - sprite.anchor.x - game.camera.pos.x + Viewport.center.u,
                v: pos.y - sprite.anchor.y - game.camera.pos.y + Viewport.center.v
            };
        }
    };

    // Sprite utility functions

    function initBasicSprite(data, anchor) {
        return initDynamicSprite(loadCacheSlice(...data), anchor);
    }

    function initDynamicSprite(source, anchor) {
        let w = source.width,
            h = source.height;

        return {
            img: source,
            // Hack! Using a flat `.map(initBasicSprite)` is actually going to pass the
            // element INDEX as second argument, resulting in "anchor=1". The right solution
            // here is "typeof anchor === 'object' ?", but to save bytes I avoid using
            // the typeof and instanceof keywords anywhere in the codebase. Hence,
            // "anchor && anchor.x".
            anchor: (anchor && anchor.x) ? anchor : { x: (w / 2) | 0, y: (h / 2) | 0 }
        };
    }

    function loadCacheSlice(x, y, w, h) {
        const source = Sprite.sheet;
        const sliceCanvas = createCanvas(w, h);
        sliceCanvas.ctx.drawImage(source, x, y, w, h, 0, 0, w, h);
        return sliceCanvas.canvas;
    }

    function processTerrain(key) {
        let source = loadCacheSlice(...SpriteSheet[key][0]);
        let canvas = createCanvas(source.width, source.height);
        canvas.ctx.drawImage(source, 0, 0);
        let im = canvas.ctx.getImageData(0, 0, source.width, source.height);

        let floors = [];

        for (let y = 0; y < source.height; y++) {
            let min = Infinity, max = -Infinity;
            for (let x = 0; x < source.width; x++) {
                if (im.data[(y * source.width + x) * 4] === 128) {
                    console.log('DOGGIT');
                    min = Math.min(min, x);
                    max = Math.max(max, x);
                }
            }
            if (min <= max) {
                floors.push([{ x: min, y }, { x: max, y }]);
            }
        }

        canvas.ctx.globalCompositeOperation = 'source-atop';
        canvas.ctx.fillStyle = rgba(0, 0, 0, 1);
        canvas.ctx.fillRect(0, 0, source.width, source.height);

        return { sprite: canvas.canvas, floors };
    }

    function loadTerrain() {
        let keys = Object.keys(SpriteSheet).filter(key => key.startsWith('t_'));
        return Object.fromEntries(
            keys.map(key => {
                let parsed = processTerrain(key);
                parsed.sprite = initDynamicSprite(parsed.sprite, { x: 0, y: 0 });

                Terrain.objects[key] = parsed;
                return [key, parsed.sprite];
            })
        );
    }

    /**
     * KeyboardAdapter
     *
     * Maps keyboard inputs to game inputs.
     */
    const KeyboardAdapter = {
        init() {
            KeyboardAdapter.map = {
                KeyW:        Input.Action.UP,
                KeyA:        Input.Action.LEFT,
                KeyS:        Input.Action.DOWN,
                KeyD:        Input.Action.RIGHT,
                ArrowUp:     Input.Action.UP,
                ArrowLeft:   Input.Action.LEFT,
                ArrowDown:   Input.Action.DOWN,
                ArrowRight:  Input.Action.RIGHT,
                Space:       Input.Action.JUMP,
                Escape:      Input.Action.MENU
            };

            // For keyboard, we support 8-point movement (S, E, SE, etc.)
            KeyboardAdapter.arrowDirections = [
                { x:  0, y:  0, m: 0 },
                { x:  0, y: -1, m: 1 },
                { x:  0, y:  1, m: 1 },
                { x:  0, y:  0, m: 0 },
                { x: -1, y:  0, m: 1 },
                { x: -1, y: -1, m: 1 },
                { x: -1, y:  1, m: 1 },
                { x: -1, y:  0, m: 1 },
                { x:  1, y:  0, m: 1 },
                { x:  1, y: -1, m: 1 },
                { x:  1, y:  1, m: 1 },
                { x:  1, y:  0, m: 1 },
                { x:  0, y:  0, m: 0 },
                { x:  0, y: -1, m: 1 },
                { x:  0, y:  1, m: 1 },
                { x:  0, y:  0, m: 0 }
            ];

            KeyboardAdapter.held = [];

            window.addEventListener('keydown', event => {
                let k = KeyboardAdapter.map[event.code];
                // Debugging - key presses
                // console.log(event.key, event.keyCode, event.code, k);
                //console.log(event.code);
                //console.log(event);
                if (k) {
                    KeyboardAdapter.held[k] = true;
                }
                Input.buffer.push({ key: event.key, at: new Date().getTime() });
            });

            window.addEventListener('keyup', event => {
                let k = KeyboardAdapter.map[event.code];
                if (k) {
                    KeyboardAdapter.held[k] = false;
                }
            });

            KeyboardAdapter.reset();
        },

        update() {
            // For keyboards, we want to convert the state of the various arrow keys being held down
            // into a directional vector. We use the browser's event to handle the held state of
            // the other action buttons, so we don't need to process them here.
            let state =
                (KeyboardAdapter.held[Input.Action.UP] ? 1 : 0) +
                (KeyboardAdapter.held[Input.Action.DOWN] ? 2 : 0) +
                (KeyboardAdapter.held[Input.Action.LEFT] ? 4 : 0) +
                (KeyboardAdapter.held[Input.Action.RIGHT] ? 8 : 0);

            KeyboardAdapter.direction = KeyboardAdapter.arrowDirections[state];
        },

        reset() {
            KeyboardAdapter.direction = KeyboardAdapter.arrowDirections[0];
            for (let action of Object.values(Input.Action)) {
                KeyboardAdapter.held[action] = false;
            }
        }
    };

    // zzfx() - the universal entry point -- returns a AudioBufferSourceNode
    const zzfx=(...t)=>zzfxP(zzfxG(...t));

    // zzfxP() - the sound player -- returns a AudioBufferSourceNode
    const zzfxP=(...t)=>{let e=zzfxX.createBufferSource(),f=zzfxX.createBuffer(t.length,t[0].length,zzfxR);t.map((d,i)=>f.getChannelData(i).set(d)),e.buffer=f,e.connect(zzfx.destination_),e.start();return e};

    // zzfxG() - the sound generator -- returns an array of sample data
    const zzfxG=(q=1,k=.05,c=220,e=0,t=0,u=.1,r=0,F=1,v=0,z=0,w=0,A=0,l=0,B=0,x=0,G=0,d=0,y=1,m=0,C=0)=>{let b=2*Math.PI,H=v*=500*b/zzfxR**2,I=(0<x?1:-1)*b/4,D=c*=(1+2*k*Math.random()-k)*b/zzfxR,Z=[],g=0,E=0,a=0,n=1,J=0,K=0,f=0,p,h;e=99+zzfxR*e;m*=zzfxR;t*=zzfxR;u*=zzfxR;d*=zzfxR;z*=500*b/zzfxR**3;x*=b/zzfxR;w*=b/zzfxR;A*=zzfxR;l=zzfxR*l|0;for(h=e+m+t+u+d|0;a<h;Z[a++]=f)++K%(100*G|0)||(f=r?1<r?2<r?3<r?Math.sin((g%b)**3):Math.max(Math.min(Math.tan(g),1),-1):1-(2*g/b%2+2)%2:1-4*Math.abs(Math.round(g/b)-g/b):Math.sin(g),f=(l?1-C+C*Math.sin(2*Math.PI*a/l):1)*(0<f?1:-1)*Math.abs(f)**F*q*zzfxV*(a<e?a/e:a<e+m?1-(a-e)/m*(1-y):a<e+m+t?y:a<h-d?(h-a-d)/u*y:0),f=d?f/2+(d>a?0:(a<h-d?1:(h-a)/d)*Z[a-d|0]/2):f),p=(c+=v+=z)*Math.sin(E*x-I),g+=p-p*B*(1-1E9*(Math.sin(a)+1)%2),E+=p-p*B*(1-1E9*(Math.sin(a)**2+1)%2),n&&++n>A&&(c+=w,D+=w,n=0),!l||++J%l||(c=D,v=H,n=n||1);return Z};

    // zzfxV - global volume
    const zzfxV=.3;

    // zzfxR - global sample rate
    const zzfxR=44100;

    // zzfxX - the common audio context
    const zzfxX=new(top.AudioContext||webkitAudioContext);

    // destination for zzfx and zzfxm sounds
    zzfx.destination_ = zzfxX.destination;

    /**
     * ZzFX Music Renderer v2.0.2 by Keith Clark
     */

    /**
     * @typedef Channel
     * @type {Array.<Number>}
     * @property {Number} 0 - Channel instrument
     * @property {Number} 1 - Channel panning (-1 to +1)
     * @property {Number} 2 - Note
     */

    /**
     * @typedef Pattern
     * @type {Array.<Channel>}
     */

    /**
     * @typedef Instrument
     * @type {Array.<Number>} ZzFX sound parameters
     */

    /**
     * Generate a song
     *
     * @param {Array.<Instrument>} instruments - Array of ZzFX sound paramaters.
     * @param {Array.<Pattern>} patterns - Array of pattern data.
     * @param {Array.<Number>} sequence - Array of pattern indexes.
     * @param {Number} [speed=125] - Playback speed of the song (in BPM).
     * @returns {Array.<Array.<Number>>} Left and right channel sample data.
     */

    const zzfxM = (instruments, patterns, sequence, BPM = 125) => {
        let instrumentParameters,
            i,
            j,
            k,
            note,
            sample,
            patternChannel,
            notFirstBeat,
            stop,
            instrument,
            pitch,
            attenuation,
            outSampleOffset,
            sampleOffset,
            nextSampleOffset,
            sampleBuffer = [],
            leftChannelBuffer = [],
            rightChannelBuffer = [],
            channelIndex = 0,
            panning,
            hasMore = 1,
            sampleCache = {},
            beatLength = ((zzfxR / BPM) * 60) >> 2;

        // for each channel in order until there are no more
        for (; hasMore; channelIndex++) {
            // reset current values
            sampleBuffer = [(hasMore = notFirstBeat = pitch = outSampleOffset = 0)];

            // for each pattern in sequence
            sequence.map((patternIndex, sequenceIndex) => {
                // get pattern for current channel, use empty 1 note pattern if none found
                patternChannel = patterns[patternIndex][channelIndex] || [0, 0, 0];

                // check if there are more channels
                hasMore |= !!patterns[patternIndex][channelIndex];

                // get next offset, use the length of first channel
                nextSampleOffset =
                    outSampleOffset +
                    (patterns[patternIndex][0].length - 2 - !notFirstBeat) *
                        beatLength;

                // for each beat in pattern, plus one extra if end of sequence
                for (
                    i = 2, k = outSampleOffset;
                    i <
                    patternChannel.length + (sequenceIndex == sequence.length - 1);
                    notFirstBeat = ++i
                ) {
                    // <channel-note>
                    note = patternChannel[i];

                    // stop if different instrument or new note
                    stop = (instrument != (patternChannel[0] || 0)) | note | 0;

                    // fill buffer with samples for previous beat, most cpu intensive part
                    for (
                        j = 0;
                        j < beatLength && notFirstBeat;
                        // fade off attenuation at end of beat if stopping note, prevents clicking
                        j++ > beatLength - 99 && stop
                            ? (attenuation += (attenuation < 1) / 99)
                            : 0
                    ) {
                        // copy sample to stereo buffers with panning
                        sample =
                            ((1 - attenuation) * sampleBuffer[sampleOffset++]) /
                                2 || 0;
                        leftChannelBuffer[k] =
                            (leftChannelBuffer[k] || 0) + sample * panning - sample;
                        rightChannelBuffer[k] =
                            (rightChannelBuffer[k++] || 0) +
                            sample * panning +
                            sample;
                    }

                    // set up for next note
                    if (note) {
                        // set attenuation
                        attenuation = note % 1;
                        panning = patternChannel[1] || 0;
                        if ((note |= 0)) {
                            // get cached sample
                            sampleBuffer = sampleCache[
                                [
                                    (instrument =
                                        patternChannel[(sampleOffset = 0)] || 0),
                                    note
                                ]
                            ] =
                                sampleCache[[instrument, note]] ||
                                // add sample to cache
                                ((instrumentParameters = [
                                    ...instruments[instrument]
                                ]),
                                (instrumentParameters[2] *=
                                    2 ** ((note - 12) / 12)),
                                zzfxG(...instrumentParameters));
                        }
                    }
                }

                // update the sample offset
                outSampleOffset = nextSampleOffset;
            });
        }

        return [leftChannelBuffer, rightChannelBuffer];
    };

    const ObliqueMystique = [[[1.3,0,23,,,.2,3,5],[1.5,0,4e3,,,.03,2,1.25,,,,,.02,6.8,-.3,,.5],[.7,0,2100,,,.2,3,3,,,-400,,,2],[,0,655,,,.11,2,1.65,,,,,,3.8,-.1,.1]],[[[,-.5,13,,,,,,13,,,,,,13,,,,,,13,,,,,,13,,,,14,,,,13,,,,,,13,,,,,,13,,,,,,13,,,,,,13,,,,14,,,,],[1,.3,13,,13,,13,,13,,,,13,,13,,13,,13,,13,,,,13,,13,,13,,13,,13,,13,,13,,13,,13,,,,13,,13,,13,,13,,13,,,,13,,13,,13,,13,,13,,],[2,1,,,,,,,,,13,,,,,,,,,,,,13,,,,,,,,,,,,,,,,,,,,13,,,,,,,,,,,,13,,,,,,,,,,,,],[,.6,,,,,13,,18,,19,,,,,,,,19,,18,,,,16,,,,13,,,,,,,,,,13,,18,,19,,,,,,,,18,19,18,,,,13,14,13,,16,,18,,19,,],[3,-1,,,13,,,,,,,,,,,,13,,,,,,,,,,,,,,,,,,,,13,,,,,,,,,,,,13,,,,,,,,,,,,,,13,13,13,13]],[[,-.5,13,,,,,,13,,,,,,13,,,,,,13,,,,,,13,,,,14,,,,13,,,,,,13,,,,,,13,,,,,,13,,,,,,13,,,,14,,,,],[1,.3,13,,13,,13,,13,,,,13,,13,,13,,13,,13,,,,13,,13,,13,,13,,13,,13,,13,,13,,13,,,,13,,13,,13,,13,,13,,,,13,,13,,13,,13,,13,,],[2,1,,,,,,,,,13,,,,,,,,,,,,13,,,,,,,,,,,,,,,,,,,,13,,,,,,,,,,,,13,,,,,,,,,,,,]]],[1,1,0,0,0,0,1,0],,];

    const Audio = {
        init() {
            Audio.readyToPlay = false;

            Audio.ctx = zzfxX;
            Audio.gain_ = Audio.ctx.createGain();
            Audio.gain_.connect(Audio.ctx.destination);
            zzfx.destination_ = Audio.gain_;

            Audio.shotgun = [,0.01,140,0.01,0.02,0.45,4,2.42,0.1,-0.1,,,,1.2,,0.3,0.04,0.8,0.02];
            Audio.page = [,,1233,,.01,.2,1,1.43,,,539,.1,,,,,,.51,.03,.01];
            Audio.shellReload = [,,68,0.01,,0.14,1,1.53,7.5,0.1,50,0.02,-0.01,-0.2,0.1,0.2,,0.47,0.01];
            Audio.damage = [,,391,,.19,.01,2,.54,-4,20,,,,,,,.02,.9];
            Audio.alarm = [,,970,.12,.25,.35,,.39,8.1,,10,.1,.2,,.1,,,.6,.09,.13];
            // [,,961,.05,.06,1.17,1,4.67,.8,,,,,.8,-0.8,.1,.49,.62,.09];
            Audio.victory = [,,454,.06,.86,.71,2,.63,-0.7,1.7,-83,.09,.27,.3,.2,,.18,.95,.02,.02];
            Audio.song = zzfxM(...ObliqueMystique);

            // Save our background music in os13k, for fun!
            localStorage[`OS13kMusic,${TITLE} - Oblique Mystique`] = JSON.stringify(ObliqueMystique);
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
            zzfx(...sound);
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

    /**
     * MouseAdapter
     *
     * Maps mouse inputs to game inputs.
     */
    const MouseAdapter = {
        init() {
            this.map = [];
            this.map[0] = Input.Action.ATTACK; // LMB
            this.map[2] = Input.Action.RELOAD; // RMB

            this.held = [];

            window.addEventListener('mousemove', event => {
                if (!this.pointer) this.pointer = {};
                this.pointer.u = ((event.clientX * Viewport.width) / Viewport.clientWidth) | 0;
                this.pointer.v = ((event.clientY * Viewport.height) / Viewport.clientHeight) | 0;
            });

            window.addEventListener('mouseout', () => {
                this.pointer = undefined;
            });

            window.addEventListener('mousedown', event => {
                let k = this.map[event.button];
                if (k) this.held[k] = true;

                // Hack to ensure we initialize audio after user interacts with game
                Audio.readyToPlay = true;
            });

            window.addEventListener('mouseup', event => {
                let k = this.map[event.button];
                if (k) this.held[k] = false;
            });

            window.addEventListener('click', event => {
                event.preventDefault();
            });

            window.addEventListener('contextmenu', event => {
                let k = this.map[event.button];
                if (k) this.held[k] = true;
                this.releaseRMBTick = 2;
                event.preventDefault();
            });

            MouseAdapter.reset();
        },

        update() {
            // Hacks: ideally we could use mousedown and mouseup for all clicks and preventDefault to
            // avoid opening the browser's context menu. This hasn't worked for me so far when clicking
            // on a canvas, so I need to use the context menu event to capture a right mouse click instead.
            //
            // We fake a down/up for RMB clicks, which means we can't determine how long the RMB is held
            // (but luckily we don't need to for this game).
            if (this.releaseRMBTick) {
                this.releaseRMBTick--;
                if (this.releaseRMBTick === 0) {
                    this.held[Input.Action.RELOAD] = false;
                }
            }
        },

        reset() {
            this.pointer = undefined;
            for (let action of Object.values(Input.Action)) {
                this.held[action] = false;
            }
        }
    };

    //import { GamepadAdapter } from './GamepadAdapter';
    //import { NormalVector } from './Geometry';

    /**
     * This is our abstract game input handler.
     *
     * Each frame, we'll collect input data from all of our supported input adapters,
     * and turn it into game input. This game input can then be used by the game
     * update for the frame.
     *
     * The input adapters give us data like "key X pressed", or "right mouse button
     * clicked", or "button B" pressed, and these are translated into a game input
     * like "dodge".
     */
    const Input = {
        // Game Inputs
        //
        // Note that moving the player around is actually not considered an action; it's
        // a separate non-action input called "direction". It just so happens that on
        // keyboard, for example, pressing the "down arrow" key is considered both a
        // press of the in-game DOWN action and a directional input. It's up to the input
        // consumer to decide which input is relevant (if any). For example, on a menu,
        // we may consume the DOWN/UP actions to navigate the menu, but ignore directional
        // inputs.
        //
        Action: {
            UP:     31,
            DOWN:   32,
            LEFT:   33,
            RIGHT:  34,
            JUMP:   35,
            ATTACK: 21,
            RELOAD: 30,
            MENU: 96,
            MUTE: 97,
            FREEZE: 98
        },

        init() {
            // A vector representing the direction the user is pressing/facing,
            // separate from pressing and releasing inputs. Treating "direction"
            // separately makes it easier to handle gamepad sticks.
            this.direction = { x: 0, y: 0, m: 0 };

            // "Pressed" means an input was pressed THIS FRAME.
            this.pressed = {};

            // "Released" means an input was released THIS FRAME.
            this.released = {};

            // "Held" means an input is held down. The input was "Pressed" either
            // this frame or in a past frame, and has not been "Released" yet.
            this.held = {};

            // How many frames was this input held down by the player. If [held]
            // is false, it represents how long the input was last held down.
            this.framesHeld = {};

            this.buffer = [];

            KeyboardAdapter.init();
            MouseAdapter.init();
            //GamepadAdapter.init();
        },

        update() {
            // We could have some kind of "input adapter toggle", but it's easier to just treat all inputs
            // as valid -- if you're pressing the "attack" button on either gamepad or keyboard, then you're
            // attacking. For directional input, we instead check whether there's movement on the thumbstick,
            // and we use it if there is -- otherwise we try to extract movement from the keyboard instead.

            KeyboardAdapter.update();
            MouseAdapter.update();
            //GamepadAdapter.update();

            for (let action of Object.values(Input.Action)) {
                let held = MouseAdapter.held[action] || KeyboardAdapter.held[action];
                //let held = GamepadAdapter.held[action] || KeyboardAdapter.held[action];
                this.pressed[action] = !this.held[action] && held;
                this.released[action] = this.held[action] && !held;

                if (this.pressed[action]) {
                    this.framesHeld[action] = 1;
                } else if (this.held[action] && held) {
                    this.framesHeld[action]++;
                }

                this.held[action] = held;
            }

            this.pointer = MouseAdapter.pointer;
            this.direction = KeyboardAdapter.direction;
            //this.direction = this.gamepad.direction.m > 0 ? this.gamepad.direction : this.keyboard.direction;

            let now = new Date().getTime();
            this.buffer = this.buffer.filter(entry => entry.at > now - 3000);
        },

        lastKeyPressed() {
            return this.buffer.length > 0 ? this.buffer[this.buffer.length - 1].key : '';
        },

        consume() {
            this.buffer = [];
        },

        onDown(action) {},
        onUp(action) {},
    };

    // In our character sheet, chars 0x00-0x7F are standard ASCII, below that we put whatever
    // characters are convenient for us. Here we can choose to map unicode characters to positions
    // 0x80+ in the charsheet, making it easy for us to render things like special characters,
    // box drawing characters, etc.
    const SUPPORTED_UNICODE_CHARS = [
        '─│┌┐└┘├┤┬┴┼╳╳╳╳╳',
        '═║╔╗╚╝╠╣╦╩╬╳╳╳╳╳',
        '↑↓←→╳╳╳╳╳╳╳╳╳╳╳╳'
    ].join('');

    const UNICODE_CHAR_MAP = SUPPORTED_UNICODE_CHARS.split('').reduce((map, char, idx) => {
        map[char] = 0x80 + idx;
        return map;
    }, {});

    /**
     * Text
     *
     * Utilities for drawing text using in-game pixel font.
     */
    const Text = {
        init() {
            Text.white = Sprite.font.img;

            Text.black = recolor(Text.white, rgba(0, 0, 0, 1));
            Text.black_shadow = recolor(Text.white, rgba(90, 20, 90, 0.15));
            Text.blue = recolor(Text.white, rgba(200, 40, 220, 1));
            Text.blue_shadow = recolor(Text.white, rgba(240, 50, 200, 0.2));
            Text.shadow = recolor(Text.white, rgba(240, 240, 255, 0.25));
            Text.red = recolor(Text.white, rgba(240, 50, 50, 1));

            Text.terminal = recolor(Text.white, rgba(51, 255, 0, 1));
            Text.terminal_shadow = recolor(Text.white, rgba(255, 255, 255, 0.3));

            Text.terminal = recolor(Text.white, rgba(51, 255, 0, 0.9));
            Text.terminal_shadow = undefined;

            Text['#ead4aa'] = recolor(Text.white, '#ead4aa');
            Text['#fee761'] = recolor(Text.white, '#fee761');
            Text['#ff0044'] = recolor(Text.white, '#ff0044');
        },

        drawText(ctx, text, u, v, scale = 1, font = Text.white, shadow) {
            if (Array.isArray(text)) {
                for (let block of text) {
                    Text.drawText(ctx, block.text, u + block.u * scale, v + block.v * scale, scale, font, shadow);
                }
                return;
            }

            for (let idx = 0; idx < text.length; idx++) {
                let c = UNICODE_CHAR_MAP[text[idx]] || text.charCodeAt(idx);
                let k = (c - 0) * (CHAR_WIDTH);
                if (shadow) {
                    ctx.drawImage(
                        shadow,
                        k % CHARSHEET_WIDTH,
                        Math.floor(k / CHARSHEET_WIDTH) * CHAR_HEIGHT,
                        CHAR_WIDTH,
                        CHAR_HEIGHT,
                        u + 1,
                        v,
                        CHAR_WIDTH * scale,
                        CHAR_HEIGHT * scale
                    );
                }
                ctx.drawImage(
                    font,
                    k % CHARSHEET_WIDTH,
                    Math.floor(k / CHARSHEET_WIDTH) * CHAR_HEIGHT,
                    CHAR_WIDTH,
                    CHAR_HEIGHT,
                    u,
                    v,
                    CHAR_WIDTH * scale,
                    CHAR_HEIGHT * scale
                );
                u += CHAR_WIDTH * scale;
            }
        },

        /*
        drawRightText(ctx, text, u, v, scale = 1, font = Text.white, shadow) {
            u -= Text.measureWidth(text, scale);
            Text.drawText(ctx, text, u, v, scale, font, shadow);
        },
        */

        measureWidth(text, scale = 1) {
            return text.split('').reduce((sum, c) => sum + CHAR_WIDTH, 0) * scale;
        },

        splitParagraph(text, w, h) {
            let cu = 0, cv = 0;
            let next = () => ({ text: '', u: cu, v: cv });
            let wip = next();
            let list = [];

            for (let c of text.split('')) {
                let cWidth = Text.measureWidth(c, 1);
                if (c === '\n' || cu + cWidth > w) {
                    let saved = '';
                    if (c !== '\n' && c !== ' ') {
                        let space = wip.text.split(' ');
                        if (space.length > 1) {
                            saved = space.pop();
                            wip.text = space.join(' ');
                        }
                    }
                    if (wip.text.length > 0) list.push(wip);
                    cu = 0;
                    cv += (CHAR_HEIGHT);
                    wip = next();
                    if (saved.length > 0) {
                        wip.text = saved;
                        cu += Text.measureWidth(wip.text, 1);
                    }
                } else {
                    cu += cWidth;
                }
                if (c !== '\n') {
                    wip.text = wip.text + c;
                }
            }

            if (wip.text.length > 0) list.push(wip);

            return list.map(line => ({
                ...line,
                w: Text.measureWidth(line.text, 1),
                h: CHAR_HEIGHT
            }));
        },

        drawTextColRow(text, col, row) {
            Text.drawText(Viewport.ctx, Text.splitParagraph(text, Viewport.width), col * CHAR_WIDTH, row * CHAR_HEIGHT, 1, Text.terminal, Text.terminal_shadow);
        }
    };

    // Text utility functions

    function recolor(font, color) {
        let canvas = createCanvas(font.width, font.height);
        canvas.ctx.fillStyle = color;
        canvas.ctx.fillRect(0, 0, font.width, font.height);
        canvas.ctx.globalCompositeOperation = 'destination-in';
        canvas.ctx.drawImage(font, 0, 0);
        return canvas.canvas;
    }

    /**
     * Hud
     *
     * Health bars, ammo, etc.
     */
    const Hud = {
        init() {
    //        Hud.tooltipCanvas = new Canvas(GAME_WIDTH, GAME_HEIGHT);
        },

        draw() {
            return;
        },
    /*
        drawPageArrow() {
            let page = Hud.closestPage();
            if (page) {
                let vector = vectorBetween(game.player.pos, page.pos);
                let angle = vector2angle(vector);
                vector.m = clamp(vector.m / 2, 16, Viewport.height / 2 - 5);
                if (vector.m > 64) {
                    let xy = vectorAdd(game.player.pos, vector);
                    let a = Math.sin(game.frame / 60)
                    Viewport.ctx.globalAlpha = Math.sin(game.frame / 20) * 0.2 + 0.8;
                    Sprite.drawViewportSprite(Sprite.page[2], xy, angle + R90);
                    Viewport.ctx.globalAlpha = 1;
                }
            }
        },

        closestPage() {
            let pages = game.entities.filter(entity => entity.page);
            let pos = game.player.pos;
            pages.sort((a, b) => {
                let dist = ((a.pos.x - pos.x) ** 2 + (a.pos.y - pos.y) ** 2) - ((b.pos.x - pos.x) ** 2 + (b.pos.y - pos.y) ** 2);
                return dist;
            });
            return pages[0];
        },

        drawBuildingHover(uv) {
            let anchor = { ...uv };

            if (anchor.u + 100 > Viewport.width) anchor.u -= 100;
            if (anchor.v > 80 + 10) anchor.v -= 80;

            Viewport.ctx.fillStyle = 'rgba(30, 30, 30, 0.9)';
            Viewport.ctx.fillRect(anchor.u, anchor.v, 100, 80);

            Viewport.ctx.strokeStyle = 'rgba(95, 205, 228, 0.9)';
            Viewport.ctx.strokeRect(anchor.u, anchor.v, 100, 80);

            Text.drawText(
                Viewport.ctx,
                Text.splitParagraph(
                    'SNIPER TOWER\n\n' +
                    '- STRONG VS GROUND\n' +
                    '- WEAK VS AIR\n',
                    100
                ),
                anchor.u + 4, anchor.v + 4,
                1,
                Text.white,
                Text.shadow
            );

            // random lightning effect!
            //Hud.drawLightning(30, 60, 120, 90);
            Hud.drawLightning(30, 60, uv.u, uv.v);
        },

        drawTooltip(uv, body, cost) {
            Hud.tooltipCanvas.ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

            let lines = Text.splitParagraph(body, 100, 0);
            let w = Math.max(...lines.map(line => line.w)), h = lines[lines.length - 1].v + lines[lines.length - 1].h;
            let u = 3, v = 3;

            if (cost) {
                cost = `${cost.ore || 0}@   ${cost.crystal || 0}$`;
                w = Math.max(w, Text.measureWidth(cost), 75);
                h += 10;
            }

            Hud.tooltipCanvas.ctx.fillStyle = '#ead4aa';
            Hud.tooltipCanvas.ctx.fillRect(0, 0, w + 6, h + 6);

            Hud.tooltipCanvas.ctx.fillStyle = '#262b44';
            Hud.tooltipCanvas.ctx.fillRect(1, 1, w + 4, h + 4);

            Hud.tooltipCanvas.ctx.clearRect(0, h + 5, 1, 1);

            if (cost) {
                Text.drawText(Hud.tooltipCanvas.ctx, cost, u + w - Text.measureWidth(cost), v, 1, Text['#fee761'], Text.shadow);
                v += 10;
            }

            Text.drawText(Hud.tooltipCanvas.ctx, lines, u, v, 1, Text['#ead4aa'], Text.shadow);

            Viewport.ctx.globalAlpha = 0.9;
            Viewport.ctx.drawImage(Hud.tooltipCanvas.canvas, uv.u, uv.v - h - 6);
            Viewport.ctx.globalAlpha = 1;

            /*

            let textsize = Text.drawParagraph(
                Hud.tooltipCanvas.ctx,
                body,
                2, 2,
                100, 0,
                1,
                Text.white,
                Text.shadow
            );

            let anchor = { ...uv };

            if (anchor.u + 100 > Viewport.width) anchor.u -= 100;
            if (anchor.v > 80 + 10) anchor.v -= 80;

            Viewport.ctx.fillStyle = 'rgba(30, 30, 30, 0.9)';
            Viewport.ctx.fillRect(anchor.u, anchor.v, 100, 80);

            Viewport.ctx.strokeStyle = 'rgba(95, 205, 228, 0.9)';
            Viewport.ctx.strokeRect(anchor.u, anchor.v, 100, 80);

            Text.drawParagraph(
                Viewport.ctx,
                'SNIPER TOWER\n\n' +
                '- STRONG VS GROUND\n' +
                '- WEAK VS AIR\n',
                anchor.u + 4, anchor.v + 4,
                100 - 8, 80,
                1,
                Text.white,
                Text.shadow
            );

            // random lightning effect!
            //Hud.drawLightning(30, 60, 120, 90);
            Hud.drawLightning(30, 60, uv.u, uv.v);

        },

        drawLightning2(x1, y1, x2, y2) {
            let sections = 10;
            let vector = vectorBetween({ x: x1, y: y1 }, { x: x2, y: y2 });

            Viewport.ctx.strokeStyle = 'rgba(95, 205, 228, 1)';
            Viewport.ctx.strokeStyle = 'rgba(190, 235, 250, 1)';
            Viewport.ctx.lineWidth = 1;

            Viewport.ctx.beginPath();
            Viewport.ctx.moveTo(x1, y1);
            for (let i = 1; i <= sections; i++) {
                let x = x1 + (x2 - x1) * i / sections;
                let y = y1 + (y2 - y1) * i / sections;
                if (i < sections) {
                    //x += (Math.random() * (i + 3) - (i + 3) / 2) | 0;
                    //y += (Math.random() * (i + 3) - (i + 3) / 2) | 0;
                    let offset = Math.random() * 20 - 10;
                    if (i > 4 && i < 7) offset *= 1.5;
                    x += vector.y * offset;
                    y -= vector.x * offset;
                }
                Viewport.ctx.lineTo(x, y);
            }
            Viewport.ctx.stroke();
        },

        drawLightning3(x1, y1, x2, y2) {
            if (!this.lightningOffsets) {
                this.lightningOffsets = Array(8).fill().map((slot, index) => ({
                    pos: (index + 1) * 10,
                    value: Math.random() * 2 - 1
                }));
                console.log(this.lightningOffsets);
            }

            let vector = vectorBetween({ x: x1, y: y1 }, { x: x2, y: y2 });

            Viewport.ctx.strokeStyle = 'rgba(95, 205, 228, 1)';
            Viewport.ctx.strokeStyle = 'rgba(190, 235, 250, 1)';
            Viewport.ctx.lineWidth = 1;

            Viewport.ctx.beginPath();
            Viewport.ctx.moveTo(x1, y1);
            for (let offset of this.lightningOffsets) {
                // First get the (x,y) along the direct line to the target
                let x = x1 + vector.x * vector.m * offset.pos / 100;
                let y = y1 + vector.y * vector.m * offset.pos / 100;

                // Now we "offset" it (perpendicular to the direct line) by the specified value
                x += vector.y * offset.value * 10;
                y -= vector.x * offset.value * 10;

                Viewport.ctx.lineTo(x, y);
            }
            Viewport.ctx.lineTo(x2, y2);
            Viewport.ctx.stroke();

            for (let offset of this.lightningOffsets) {
                offset.pos += 5;
            }
            if (this.lightningOffsets[0].pos > 10) {
                this.lightningOffsets.unshift({ pos: 1, value: Math.random() * 2 - 1 });
            }
            if (this.lightningOffsets[this.lightningOffsets.length - 1].pos > 99) {
                this.lightningOffsets.pop();
            }
        },

        drawLightning(x1, y1, x2, y2) {
            let vector = vectorBetween({ x: x1, y: y1 }, { x: x2, y: y2 });

            Viewport.ctx.strokeStyle = 'rgba(95, 205, 228, 1)';
            Viewport.ctx.strokeStyle = 'rgba(190, 235, 250, 1)';
            Viewport.ctx.lineWidth = 1;
            Viewport.ctx.fillStyle = 'rgba(190, 235, 250, 1)';

    //        Viewport.ctx.beginPath();
    //        Viewport.ctx.moveTo(x1, y1);
            let offset = 0;
            for (let i = 0; i < vector.m; i++) {
                let x = x1 + vector.x * i;
                let y = y1 + vector.y * i;

                let calc = Math.random();
                if (calc < 0.33) {
                    offset--;
                } else if (calc < 0.66) {
                    offset++;
                }

                let choke = 0.98 - (i / vector.m);

                x += vector.y * offset * choke;
                y -= vector.x * offset * choke;

                Viewport.ctx.fillRect(x, y, 1, 1);
            }
        },

        drawControlPanel() {
            let height = 44;
            Viewport.ctx.fillStyle = '#181425';
            Viewport.ctx.fillRect(0, Viewport.height - height, Viewport.width, height);

            Viewport.ctx.fillStyle = '#b55088';
            Viewport.ctx.fillRect(0, Viewport.height - height - 1, Viewport.width, 1);

            Viewport.ctx.fillStyle = '#f6757a';
            Viewport.ctx.fillRect(0, Viewport.height - height - 2, Viewport.width, 1);

            Viewport.ctx.fillStyle = '#c0cbdc';
            Viewport.ctx.fillRect(0, Viewport.height - height - 3, Viewport.width, 1);
        }
        */
    };

    // https://jonny.morrill.me/en/blog/gamedev-how-to-implement-a-camera-shake-effect/

    /**
     * Shake it baby.
     */
    class ScreenShake {
        constructor(frames, hAmplitude, vAmplitude) {
            this.frames = frames;
            this.hAmplitude = hAmplitude;
            this.vAmplitude = vAmplitude;
            this.hSamples = [];
            this.vSamples = [];

            var sampleCount = frames / 2;
            for (let i = 0; i < sampleCount; i++) {
                this.hSamples.push(Math.random() * 2 - 1);
                this.vSamples.push(Math.random() * 2 - 1);
            }
            this.frame = -1;
        }

        update() {
            this.frame++;
            if (this.frame >= this.frames) {
                return false;
            }

            //let s = (this.frames / 10) * (this.frame / this.frames);
            let s = this.frame / 2;
            let s0 = s | 0;
            let s1 = s0 + 1;
            let decay = 1 - this.frame / this.frames;

            this.x =
                this.hAmplitude *
                decay *
                (this.hSamples[s0] +
                    (s - s0) * (this.hSamples[s1] - this.hSamples[s0]));
            this.y =
                this.vAmplitude *
                decay *
                (this.vSamples[s0] +
                    (s - s0) * (this.vSamples[s1] - this.vSamples[s0]));

            return true;
        }
    }

    // This is our list of STATES. Each entity starts out in one of these states and can move between
    // them based on events that happen in the game. (Note that some of these are directions, but
    // since an entity keeps moving in the direction it is going unless stopped, directions are
    // states in this game.)
    const State = {
        STOPPED:    1,         // Standing still
        UP:         2,         // Moving up (player only)
        LEFT:       3,         // Moving left
        DOWN:       4,         // Moving down
        RIGHT:      5,         // Moving right
        FALLING:    6,         // Falling
        START_JUMP: 7,         // About to start a jump (player only)
        JUMP_LEFT:  8,         // Jumping left (player only)
        JUMP_RIGHT: 9,         // Jumping right (player only)
        JUMP_UP:    10,        // Jumping straight up (player only)
        DYING:      11,        // Dying (used as a death animation)
        DEAD:       12         // Dead (for player, restart level; for rock, disappear)
    };

    const JUMP_FRAMES = {
        [State.JUMP_RIGHT]: [
            { x: 1, y: -1 },
            { x: 1, y: -1 },
            { x: 1, y: 0 },
            { x: 1, y: 0 },
            { x: 1, y: 1 },
            { x: 1, y: 1 }
        ],
        [State.JUMP_LEFT]: [
            { x: -1, y: -1 },
            { x: -1, y: -1 },
            { x: -1, y: 0 },
            { x: -1, y: 0 },
            { x: -1, y: 1 },
            { x: -1, y: 1 }
        ],
        [State.JUMP_UP]: [
            { x: 0, y: -1 },
            { x: 0, y: -1 },
            { x: 0, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: 1 },
            { x: 0, y: 0 }
        ],
    };

    class Entity {
        applyMovement(field) {
            let repeat = false;

            // This method contains generic "movement" application for all entities, including
            // Lad (player) and Der Rocks (enemies). Things like falling, moving left/right, etc.,
            // work the same for both.
            //
            // (There's a bunch of jump logic in here too, and moving UP, which really only applies
            // to players, but that's OK -- Der Rocks just won't attempt those actions.)

            if (this.nextState) {
                switch (this.state) {
                    case State.STOPPED:
                    case State.LEFT:
                    case State.RIGHT:
                        if ([State.LEFT, State.RIGHT, State.STOPPED].includes(this.nextState)) {
                            this.state = this.nextState;
                            this.nextState = undefined;
                        }
                        break;

                    case State.UP:
                    case State.DOWN:
                        // Normal
                        if ([State.LEFT, State.RIGHT].includes(this.nextState)) {
                            this.state = this.nextState;
                            this.nextState = undefined;
                        }
                        break;
                }
            }

            if (this.nextState === State.START_JUMP) {
                // Special case: the user wants to jump!
                //
                // If the player is standing on something solid, we initiate a jump based on the current
                // movement of the player. If not, we (sort of) ignore the request to jump... although
                // it does subtly change the behavior upon landing.
                if (field.onSolid(this.x, this.y)) {
                    if (this.state === State.STOPPED || this.state === State.FALLING) {
                        this.state = State.JUMP_UP;
                        this.jumpStep = 0;
                        this.nextState = State.STOPPED;
                    } else if (this.state === State.LEFT || this.state === State.JUMP_LEFT) {
                        this.state = State.JUMP_LEFT;
                        this.jumpStep = 0;
                        this.nextState = State.LEFT;
                    } else if (this.state === State.RIGHT || this.state === State.JUMP_RIGHT) {
                        this.state = State.JUMP_RIGHT;
                        this.jumpStep = 0;
                        this.nextState = State.RIGHT;
                    }
                } else {
                    if (this.state === State.JUMP_UP || this.state === State.FALLING) {
                        this.nextState = State.STOPPED;
                    } else if (this.state === State.JUMP_RIGHT) {
                        this.nextState = State.RIGHT;
                    } else if (this.state === State.JUMP_LEFT) {
                        this.nextState = State.LEFT;
                    }
                }
            } else if (this.nextState === State.UP && field.isLadder(this.x, this.y)) {
                // Special case: the user wants to go up!
                //
                // If the user is on a ladder, we can start ascending. Note that if the user is not
                // on a ladder we ignore their input, which is intentional -- this allows queued
                // (pacman) input, where we can tap UP a little before reaching the ladder.
                this.state = State.UP;
                this.nextState = undefined;
            } else if (this.nextState === State.DOWN && (field.isLadder(this.x, this.y) || field.isLadder(this.x, this.y + 1))) {
                // Special case: the player wants to go down!
                //
                // If the player is on (or above) a ladder, we can start descending. Note that if the player is not
                // on a ladder we ignore their input, which is intentional -- this allows queued
                // (pacman) input, where we can tap DOWN a little before reaching the ladder.
                this.state = State.DOWN;
                this.nextState = undefined;
            }

            switch (this.state) {
                case State.LEFT:
                    if (!field.onSolid(this.x, this.y)) {
                        this.nextState = State.LEFT;
                        this.state = State.FALLING;
                        repeat = true;
                        break;
                    }
                    if (field.emptySpace(this.x - 1, this.y)) {
                        this.x--;
                    } else {
                        this.nextState = State.STOPPED;
                    }
                    break;

                case State.RIGHT:
                    if (!field.onSolid(this.x, this.y)) {
                        this.nextState = State.RIGHT;
                        this.state = State.FALLING;
                        repeat = true;
                        break;
                    }
                    if (field.emptySpace(this.x + 1, this.y)) {
                        this.x++;
                    } else {
                        this.nextState = State.STOPPED;
                    }
                    break;

                case State.UP:
                    if (field.canClimbUp(this.x, this.y - 1)) {
                        this.y--;
                    } else {
                        this.state = State.STOPPED;
                    }
                    break;

                case State.DOWN:
                    if (field.canClimbDown(this.x, this.y + 1)) {
                        this.y++;
                    } else {
                        this.state = State.STOPPED;
                    }
                    break;

                case State.JUMP_RIGHT:
                case State.JUMP_LEFT:
                case State.JUMP_UP:
                    let step = JUMP_FRAMES[this.state][this.jumpStep];
                    if ((this.x + step.x >= 0) && (this.x + step.x < LEVEL_COLS)) {
                        let terrain = field.layout[this.y + step.y][this.x + step.x];
                        if (['=', '|', '-'].includes(terrain)) {
                            if (field.onSolid(this.x, this.y)) {
                                this.state = this.nextState;
                                this.nextState = undefined;
                            } else {
                                switch (this.state) {
                                    case State.JUMP_RIGHT:
                                        this.nextState = State.RIGHT;
                                        break;
                                    case State.JUMP_LEFT:
                                        this.nextState = State.LEFT;
                                        break;
                                    case State.JUMP_UP:
                                        this.nextState = State.UP;
                                        break;
                                }
                                this.state = State.FALLING;
                            }
                        } else if (terrain === 'H') {
                            this.x += step.x;
                            this.y += step.y;
                            this.state = State.STOPPED;
                            this.nextState = undefined;
                        } else {
                            this.x += step.x;
                            this.y += step.y;
                            this.jumpStep++;

                            if (this.jumpStep >= JUMP_FRAMES[this.state].length) {
                                this.state = this.nextState;
                                this.nextState = undefined;
                            }
                        }
                    } else {
                        if (field.onSolid(this.x, this.y)) {
                            this.state = this.nextState;
                            this.nextState = undefined;
                        } else {
                            this.state = State.FALLING;
                            this.nextState = State.STOPPED;
                        }
                    }
                    break;

                case State.FALLING:
                    if (field.onSolid(this.x, this.y)) {
                        this.state = this.nextState || State.STOPPED;
                    } else {
                        this.y++;
                    }
                    break;
            }

            // If we were attempting to move somewhere and realized we should be falling instead,
            // we want to re-run the entire algorithm once. This avoids what boils down to a "skipped
            // frame" from the user's point of view.
            if (repeat) return this.applyMovement(field);
        }
    }

    const Screen = {
        init() {
            this.screen = [];
            for (let y = 0; y < SCREEN_HEIGHT; y++) {
                this.screen.push([]);
            }
            this.clear();
        },

        clear() {
            for (let y = 0; y < SCREEN_HEIGHT; y++) {
                for (let x = 0; x < SCREEN_WIDTH; x++) {
                    this.screen[y][x] = ' ';
                }
            }
        },

        write(x, y, text) {
            if (!Array.isArray(text)) text = [text];

            for (let j = 0; j < text.length; j++) {
                for (let i = 0; i < text[j].length; i++) {
                    this.screen[y + j][x + i] = text[j][i];
                }
            }
        },

        drawToViewport() {
            let text = this.screen.map(row => row.join('')).join('\n');

            Text.drawText(
                Viewport.ctx,
                Text.splitParagraph(text, Viewport.width),
                0, 0,
                1,
                Text.terminal, Text.terminal_shadow
            );
        }
    };

    const DEATH_FRAMES = ['p', 'b', 'd', 'q', 'p', 'b', 'd', 'q', '-', '-', '_'];

    /**
     * Player
     */
    class Player extends Entity {
        constructor(x, y) {
            super();
            this.x = x;
            this.y = y;
            this.state = State.STOPPED;
            this.nextState = State.STOPPED;
            this.jumpStep = 0;
            this.deathStep = 0;
            console.log('player constructed', x, y);
        }

        update(field) {
            if (this.state === State.DYING) {
                this.deathStep++;
                if (this.deathStep >= DEATH_FRAMES.length) this.state = State.DEAD;
            }

            if (this.state === State.DYING || this.state === State.DEAD) return;

            if (Input.pressed[Input.Action.LEFT]) {
                this.nextState = State.LEFT;
            }

            if (Input.pressed[Input.Action.RIGHT]) {
                this.nextState = State.RIGHT;
            }

            if (Input.pressed[Input.Action.UP]) {
                this.nextState = State.UP;
            }

            if (Input.pressed[Input.Action.DOWN]) {
                this.nextState = State.DOWN;
            }

            if (Input.pressed[Input.Action.JUMP]) {
                this.nextState = State.START_JUMP;
            }

            return this.applyMovement(field);
        }

        draw() {
            let char = 'g';

            switch (this.state) {
                case State.RIGHT:
                case State.JUMP_RIGHT:
                case State.UP:
                case State.DOWN:
                    char = 'p';
                    break;

                case State.LEFT:
                case State.JUMP_LEFT:
                    char = 'q';
                    break;

                case State.FALLING:
                    char = 'b';
                    break;

                case State.DYING:
                    char = DEATH_FRAMES[this.deathStep];
                    break;

                case State.DEAD:
                    char = '_';
                    break;
            }

            Screen.write(this.x, this.y, char);
        }
    }

    const DEATH_FRAMES$1 = ['%', ':'];

    class Rock extends Entity {
        constructor(dispenser) {
            super();
            this.x = dispenser.x;
            this.y = dispenser.y + 1;
            this.state = State.FALLING;
            this.nextState = undefined;
            this.deathStep = 0;
        }

        update(field) {
            if (this.state === State.DYING) {
                this.deathStep++;
                if (this.deathStep >= DEATH_FRAMES$1.length) this.state = State.DEAD;
            }

            if (this.state === State.DYING || this.state === State.DEAD) return;

            if (this.state === State.STOPPED) {
                if (this.x === 0 || !field.emptySpace(this.x - 1, this.y)) {
                    this.nextState = State.RIGHT;
                } else if (this.x === LEVEL_COLS - 1 || !field.emptySpace(this.x + 1, this.y)) {
                    this.nextState = State.LEFT;
                } else {
                    this.nextState = Math.random() > 0.5 ? State.LEFT : State.RIGHT;
                }
            }

            if (this.x === 0 && this.state === State.LEFT) {
                this.state = State.RIGHT;
            }

            if (this.x === LEVEL_COLS - 1 && this.state === State.RIGHT) {
                this.state = State.LEFT;
            }

            if (this.state !== State.FALLING && !field.onSolid(this.x, this.y)) {
                this.nextState = State.FALLING;
            }

            if (field.isLadder(this.x, this.y + 1) && [State.LEFT, State.RIGHT].includes(this.state)) {
                let r = Math.floor(Math.random() * 4);
                this.nextState = [State.LEFT, State.RIGHT, State.DOWN, State.DOWN][r];
            }

            if (field.isEater(this.x, this.y)) {
                this.state = State.DYING;
                return;
            }

            this.applyMovement(field);
        }

        draw() {
            let char = 'o';

            switch (this.state) {
                case State.DYING:
                    char = DEATH_FRAMES$1[this.deathStep];
                    break;
                case State.DEAD:
                    return;
            }

            Screen.write(this.x, this.y, char);
        }
    }

    var LevelData = [
    	{
    		name: "Easy Street",
    		time: 35,
    		maxRocks: 5,
    		layout: [
    			"                                       V                 $                     ",
    			"                                                         H                     ",
    			"                H                                        H                     ",
    			"       =========H==================================================            ",
    			"                H                                                              ",
    			"                H                                                              ",
    			"                H          H                             H                     ",
    			"================H==========H==================   ========H=====================",
    			"                &          H                             H          |       |  ",
    			"                                                         H         Easy Street ",
    			"                H                                        H                     ",
    			"       =========H==========H=========  =======================                 ",
    			"                H                                                              ",
    			"                H                                                              ",
    			"                H                                        H                     ",
    			"======================== ====================== =========H==============       ",
    			"                                                         H                     ",
    			"                                                         H                     ",
    			"*    p                                                   H                    *",
    			"==============================================================================="
    		]
    	},
    	{
    		name: "Long Island",
    		time: 45,
    		maxRocks: 8,
    		layout: [
    			"                                                                          $    ",
    			"                                                                   &      H    ",
    			"    H       |V                                                     V|     H    ",
    			"====H======================= ========================= ======================  ",
    			"    H                                                                          ",
    			"    H                                                                          ",
    			"    H                    & |                         . .                  H    ",
    			"========================== ======  =================== ===================H==  ",
    			"                                                                          H    ",
    			"                                  |                                       H    ",
    			"    H                             |                 .  .                  H    ",
    			"====H=====================   ======  ================  ======================  ",
    			"    H                                                                          ",
    			"    H                      |                                                   ",
    			"    H                      |                        .   .                 H    ",
    			"=========================  ========    ==============   ==================H==  ",
    			"                                                                          H    ",
    			"==============                      |                                     H    ",
    			" Long Island |   p         *        |                 *                   H    ",
    			"==============================================================================="
    		]
    	},
    	{
    		name: "Ghost Town",
    		time: 35,
    		maxRocks: 5,
    		layout: [
    			"                            V               V           V               $      ",
    			"                                                                       $$$     ",
    			"     p    H                                                    H      $$$$$   H",
    			"==========H===                                                =H==============H",
    			"          H                                                    H              H",
    			"          H                              &                     H              H",
    			"     ==============   ====     =    ======    =   ====    =====H=====         H",
    			"    G              ^^^    ^^^^^ ^^^^      ^^^^ ^^^    ^^^                     $",
    			"    h                                                                 |        ",
    			"    o     |                     H                             &       |        ",
    			"    s     ======================H============================== ===========    ",
    			"    t        &                  H                                              ",
    			"                                H                                              ",
    			"              |                 H                 H                   H        ",
    			"    T         ==================H=================H===================H======= ",
    			"    o                                             H                   H        ",
    			"    w                                                                 H        ",
    			"    n                           ^                                     H        ",
    			"*                              ^^^                                    H       *",
    			"==============================================================================="
    		]
    	},
    	{
    		name: "Tunnel Vision",
    		time: 36,
    		rocks: 5,
    		layout: [
    			"                                            V                       V          ",
    			"                                                                               ",
    			"     H             H                         |                H                ",
    			"=====H=====--======H==========================     ===----====H===========     ",
    			"     H             H                |&&                       H                ",
    			"     H             H                ==================        H                ",
    			"     H             H                       tunnel  H          H                ",
    			"     H           =======---===----=================H=         H           H    ",
    			"     H         |                           vision  H          H           H    ",
    			"     H         =========---&      -----============H          H           H    ",
    			"     H           H                                 H |        H           H    ",
    			"     H           H=========----===----================        H  ==============",
    			"                 H                                        &   H                ",
    			"                 H                                        |   H                ",
    			"====---====      H                                        |   H                ",
    			"|         |    ================---===---===================   H                ",
    			"|   ===   |                                                   H        H    p  ",
    			"|    $    |                                                   H     ===H=======",
    			"|*  $$$  *|   *                *       *                     *H       *H       ",
    			"==============================================================================="
    		]
    	},
    	{
    		name: "Point of No Return",
    		time: 35,
    		maxRocks: 7,
    		layout: [
    			"         $                                                                     ",
    			"         H                                                   V                 ",
    			"         H                                                                     ",
    			"         HHHHHHHHHHHHH     .HHHHHHHHHHHHHH                          H    p     ",
    			"         &                   V           H                        ==H==========",
    			"                                         H                          H          ",
    			"   H                                     H        .                 H          ",
    			"===H==============-----------============H====                      H          ",
    			"   H                                                      H         H          ",
    			"   H                                                 =====H==============      ",
    			"   H                                     H                H                    ",
    			"   H              &..^^^.....^..^ . ^^   H==---------     H                    ",
    			"   H         ============================H    &           H             H      ",
    			"   H         ===      ===      ===       H    ---------=================H======",
    			"   H                                     H                              H      ",
    			"   H                          &          H          &                   H      ",
    			"   ==========-------------------------=======----------===================     ",
    			"                                                                               ",
    			"^^^*         ^^^^^^^^^^^^^^^^^^^^^^^^^*     *^^^^^^^^^^*Point of No Return*^^^^",
    			"==============================================================================="
    		]
    	},
    	{
    		name: "Bug City",
    		time: 37,
    		maxRocks: 6,
    		layout: [
    			"        Bug City             HHHHHHHH                          V               ",
    			"                           HHH      HHH                                        ",
    			"   H                                          >mmmmmmmm                        ",
    			"   H===============                   ====================          H          ",
    			"   H              |=====       \\  /         V                  =====H==========",
    			"   H                            \\/                                  H          ",
    			"   H                                        | $                     H          ",
    			"   H           H                            | H                     H          ",
    			"   H       ====H=======          p          |&H    H                H          ",
    			"   H           H             ======================H           ======          ",
    			"   H           H      &|                           H                    H      ",
    			"   H           H      &|                    H      H     }{        =====H====  ",
    			"===H===&       H       =====================H      H                    H      ",
    			"               H                            H      H                    H      ",
    			"               H                            H      &                    H      ",
    			"         ======H===   =======    H    <>    &                           H      ",
    			"                                 H==========       =====     =     ============",
    			"     }i{                         H                                             ",
    			"*                                H                                            *",
    			"==============================================================================="
    		]
    	},
    	{
    		name: "GangLand",
    		time: 32,
    		maxRocks: 6,
    		layout: [
    			"                    =Gang Land=                             V                  ",
    			"                   ==      _  ==                                      .        ",
    			"      p    H        |  [] |_| |                  &                    .  H     ",
    			"===========H        |     |_| |       H         ===   ===================H     ",
    			"      V    H        =============     H======                            H     ",
    			"           H                          H                     &            H     ",
    			"           H                          H                |    |            H     ",
    			"    H      H        ^^^&&^^^ & ^  ^^^ H           H    |    =============H     ",
    			"    H======H   =======================H===========H=====          &      H     ",
    			"    H                                 H           H    |         &&&     H     ",
    			"    H                                 H           H    |        &&&&&    H     ",
    			"    H                                 H           H    |    =============H     ",
    			"              =====------=================        H    |       $     $         ",
    			"                                         |        H    |      $$$   $$$        ",
    			"====------===                            |        H    |     $$$$$ $$$$$       ",
    			"            |       =                    | =============    ============       ",
    			"            |       $                     ^          &                         ",
    			"            |^^^^^^^^^^^^^^      $ ^              ======                       ",
    			"*                   .      &   ^ H*^                    ^  ^       ^^^^^^^^^^^^",
    			"==============================================================================="
    		]
    	}
    ];

    const Level = {
        LEVELS: LevelData,

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

    /**
     * Field
     *
     * The "field" represents the current level, or, "playing field". A new playing field is created
     * every time you start a level, so we attach everything about the currently played level to
     * the field -- positions of treasure, the player, victory conditions, etc.
     */
    class Field {
        constructor(levelNumber) {
            let level = Level.load(levelNumber);

            this.layout = level.layout;
            this.dispensers = level.dispensers;
            this.time = level.time;
            this.maxRocks = level.rocks;
            this.rocks = [];
            this.player = new Player(level.player.x, level.player.y);
        }

        update(session) {
            let oldX = this.player.x, oldY = this.player.y;

            // Move player based on user input
            this.player.update(this);

            if (oldX !== this.player.x && oldY === this.player.y) {
                if (this.isDisappearingFloor(oldX, oldY + 1)) {
                    this.layout[oldY + 1][oldX] = ' ';
                }
            }

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

        isDisappearingFloor(x, y) {
            return this.layout[y][x] === '-';
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
    }

    class MainMenu {
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

    class InstructionsMenu {
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

    class Session {
        constructor() {
            this.score = 0;
            this.levelNumber = 0;
            this.levelCycle = 1;
            this.lives = 5;
            this.nextLife = 100;
        }

        update() {
            if (!this.field) {
                this.field = new Field(this.levelNumber);
            }

            this.field.update(this);

            let recentKeystrokes = Input.buffer.map(event => event.key).join('').toUpperCase();

            if (recentKeystrokes.match(/IDCLEV(\d\d)/)) {
                Input.consume();
                this.field = undefined;
                this.levelNumber = parseInt(RegExp.$1, 10);
            } else if (recentKeystrokes.includes("IDDQD")) {
                Input.consume();
                console.log("god mode");
            }
        }

        draw() {
            Screen.clear();

            if (this.field) this.field.draw();

            let stat = [
                String(this.lives).padStart(2, ' '),
                String(this.levelNumber + 1).padStart(2, ' '),
                String(this.score).padStart(4, '0'),
                this.field ? String(this.field.time).padStart(4, ' ') : ''
            ];
            Screen.write(0, 21, `Lads   ${stat[0]}   Level   ${stat[1]}    Score   ${stat[2]}    Bonus time   ${stat[3]}`);
        }

        restartLevel() {
            this.field = undefined;
        }

        startNextLevel() {
            this.field = undefined;
            this.levelNumber++;
            if (this.levelNumber % LEVEL_ORDER.length === 0) {
                this.levelCycle++;
            }
        }

        updateScore(scoreType) {
            switch (scoreType) {
                case SCORE_ROCK:
                    this.score += 2;
                    break;
                case SCORE_STATUE:
                    this.score += this.field.time;
                    break;
                case SCORE_TREASURE:
                    // Called repeatedly during the end-of-level event.
                    this.score += 1;
                    break;
            }
        }
    }

    /**
     * Game state.
     */
    class Game {
        init() {
            Sprite.loadSpritesheet(async () => {
                await Viewport.init();
                await Screen.init();
                await Sprite.init();
                await Terrain.init();
                Text.init();
                Hud.init();
                Input.init();
                Audio.init();

                this.entities = [];
                this.dialogPending = {};
                this.dialogSeen = {};
                this.roomsCleared = {};
                this.shadowOffset = 0;
                this.screenshakes = [];
                this.camera = { pos: { x: 0, y: 0 } };
                this.cameraFocus = { pos: { x: 0, y: 0 } };

                window.addEventListener('blur', () => this.pause());
                window.addEventListener('focus', () => this.unpause());

                this.start();
            });
        }

        start() {
            this.fps = 20;
            this.frame = 0;
            this.frameTimes = [];

            this.menu = new MainMenu();

            this.playSpeed = 0;

            this.update();
            window.requestAnimationFrame((delta) => this.onFrame(delta));
        }

        onFrame() {
            // If we're in a menu screen, default to a reasonable 30 FPS.
            // If we're in a game, use the player's selected play speed.
            let desiredFps = this.session ? PLAY_SPEEDS[this.playSpeed] : 30;
            let now = new Date().getTime();
            let lastFrame = this.lastFrame || 0;

            if (now - lastFrame >= 1000 / desiredFps) {
                this.update();
                this.lastFrame = now;
            }

            // No matter what the game FPS is, we'll resize and redraw the screen
            // on every browser animation frame (usually 60 FPS).
            Viewport.resize();
            this.draw(Viewport.ctx);
            window.requestAnimationFrame(() => this.onFrame());
        }

        update() {
            // Pull in frame by frame button pushes / keypresses / mouse clicks
            Input.update();

            this.handleInput();
            /*game.camera.pos.x += 0.1;
            game.camera.pos.y -= 0.1;*/

            //if (Input.pressed[Input.Action.MENU]) {
            //    this.paused ? this.unpause() : this.pause();
            //}

            if (this.paused) return;

            // perform any per-frame audio updates
            Audio.update();

            // Behavior (AI, player input, etc.)
            //perform(this.entities); <-- cut to save space

            // perform any queued damage
            //Damage.perform(this.entities);

            // Movement (perform entity velocities to position)

            // Dialog scheduling
            //DialogScheduling.perform();

            // Victory conditions

            if (this.menu) {
                this.menu.update();
            }

            /*    if (!this.session) {
                this.session = new Session();
            }*/

            if (this.session) this.session.update();

            // Culling (typically when an entity dies)

            // Camera logic
            /*let diff = {
                x: this.player.pos.x - this.camera.pos.x,
                y: this.player.pos.y - this.camera.pos.y
            };*/

            /*
            this.camera.pos.x += diff.x * 0.2;
            this.camera.pos.y += diff.y * 0.2;
            */

            // Tick screenshakes and cull finished screenshakes
            this.screenshakes = this.screenshakes.filter(screenshake =>
                screenshake.update()
            );

            // Flickering shadows
            if (game.frame % 6 === 0) this.shadowOffset = (Math.random() * 10) | 0;

            // Intro screenshake
            if (game.frame === 30) game.screenshakes.push(new ScreenShake(20, 20, 20));

            // Initial "click" to get game started
            if (Input.pressed[Input.Action.ATTACK] && !game.started) game.started = true;

            if (Input.pressed[Input.Action.ATTACK]) {
                // make a laser
                this.laser = 45;
            }
        }

        draw() {
            // Reset canvas transform and scale
            Viewport.ctx.setTransform(Viewport.scale, 0, 0, Viewport.scale, 0, 0);

            Viewport.ctx.fillStyle = 'black';
            Viewport.ctx.fillRect(0, 0, Viewport.width, Viewport.height);

            Viewport.ctx.translate((Viewport.width - GAME_WIDTH) / 2 | 0, (Viewport.height - GAME_HEIGHT) / 2 | 0);

            if (this.session) this.session.draw();
            if (this.menu) this.menu.draw();

            Screen.drawToViewport();

            return;

            /* laser code
            if (this.laser > 0 && this.laser < 42) {
                let center = (Viewport.width / 2) | 0, x = 0;
                for (let y = -5; y < Viewport.height; y++) {
                    let choices = [-1, 0, 0, 1];
                    if (x < -10) choices[0] = 1;
                    if (x > 10) choices[3] = -1;

                    //let vx = x + Math.sin(y + ((this.frame / 10) % 10)) * Math.cos(this.frame / 19) * 10;
                    Viewport.ctx.fillStyle = 'rgba(50,200,50,1)';
                    Viewport.ctx.fillRect(center + x - 10, y, this.laser > 35 ? 30 : 20, 1);
                    x += choices[(Math.random() * 4) | 0];
                }
            }
            this.laser--;
            */

    /*
                for (let i = 0; i < 5; i++) {
                    let column = (Math.random() * Viewport.width) | 0;
                    let row = ((Math.random() * Viewport.height) | 0) - 50;
                    let length = ((Math.random() * 50) | 0) + 50;
                    let color = [
                        //'rgba(34, 179, 34, 1)',  // base color
                        'rgba(39, 204, 39, 1)',    // brighter version
                        'rgba(25, 128, 25, 1)',    // darker version
                        'rgba(195, 230, 195, 1)'
                    ][(Math.random() * 3) | 0];

                    this.laserRand = this.laserRand || [];
                    this.laserRand.push([column, row, length, color, 30]);
                }

                for (let laser of this.laserRand) {
                    laser[4]--;
                    Viewport.ctx.fillStyle = laser[3];
                    Viewport.ctx.fillRect(laser[0], laser[1], 1, laser[2]);

                    laser[1]+=2;
                    console.log(laser[3]);
                }

                this.laserRand = this.laserRand.filter(l => l[4] > 0);*/

                /*
                canvas.ctx.fillRect(x, y, 1, 1);
                src/js/Sprite.js:    canvas.ctx.fillRect(0, 0, 500, 500);
                src/js/Sprite.js:    canvas.ctx.fillRect(0, 0, 32, 32);
                src/js/Sprite.js:    canvas.ctx.fillRect(0, 0, source.width, source.height);
                src/js/Viewport.js:        Viewport.ctx.fillRect(0, 0, Viewport.width, Vi
                    */

        }

        pause() {
            if (this.paused) return;
            this.paused = true;
            Audio.pause();
        }

        unpause() {
            if (!this.paused) return;
            this.paused = false;
            Audio.unpause();
        }

        handleInput() {
            if (Input.pointer) {
                let xy = uv2xy(Input.pointer);
                let qr = xy2qr(xy);
                this.gridHovered = qr;

                if (Input.pressed[Input.Action.ATTACK]) {
                    this.gridSelected = qr;
                }
            } else {
                this.gridHovered = undefined;
            }
        }

        startSession() {
            this.menu = undefined;
            this.session = new Session();
        }

        showMainMenu() {
            this.menu = new MainMenu();
            this.session = undefined;
        }

        showInstructions() {
            this.menu = new InstructionsMenu();
            this.session = undefined;
        }
    }

    const game = new Game();

    /**
     * Create and launch game.
     */
    game.init();

}());
