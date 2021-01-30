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

    // The size of our on-screen characters (given dimensions above, this is 80 cols by 25 rows).
    const CHAR_WIDTH = 8;
    const CHAR_HEIGHT = 16;
    const CHARSHEET_WIDTH = 16 * CHAR_WIDTH;

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
                if (k) {
                    KeyboardAdapter.held[k] = true;
                }
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
            UP: 11,
            DOWN: 12,
            LEFT: 13,
            RIGHT: 14,
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
        '═║╔╗╚╝╠╣╦╩╬╳╳╳╳╳'
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
     * Player
     */
    class Player {
        constructor() {
            this.pos = { x: 0, y: 0 };
            this.vel = { x: 0, y: 0 };
            this.bbox = [{ x: -6, y: -6 }, { x: 6, y: 6 }];
            this.hp = 100;
            this.damage = [];
            this.history = [];
            this.facing = { x: 0, y: -1, m: 0 };
            this.radius = 11;
            this.shellsLeft = 4;
            this.shellsMax = 4;
            this.forcedReload = false;
            this.mass = 3;
            this.pages = 0;
            this.deaths = 0;
            this.state = 1;
            this.frames = 29;
        }

        think() {
            this.vel = {
                x: Input.direction.x * Input.direction.m * 0.7,
                y: Input.direction.y * Input.direction.m * 0.7
            };
        }

        draw() {
            let sprite = Sprite.harold[0];
            //let p = { x: Math.round(this.pos.x), y: Math.round(this.pos.y) };
            let p = this.pos;
            Sprite.drawViewportSprite(sprite, p);
        }
    }

    /**
     * Movement
     */
    const Movement = {
        perform() {
        }

        /*
        perform(entities) {
            // Movement only applies to active entities with positions and velocities
            let movers = entities.filter(
                entity => entity.pos && entity.vel && !entity.cull
            );

            for (let i = 0; i < movers.length; i++) {
                let mover = movers[i];
                mover.pos.x += mover.vel.x;
                mover.pos.y += mover.vel.y;

                let bounds = [
                    { x: mover.pos.x + mover.bbox[0].x, y: mover.pos.y + mover.bbox[0].y },
                    { x: mover.pos.x + mover.bbox[1].x, y: mover.pos.y + mover.bbox[1].y }
                ];

                for (let terrain of World.terrain) {
                    let floors = Terrain.objects[terrain.t].floors.map(floor =>
                        floor.map(p => ({ x: p.x + terrain.x, y: p.y + terrain.y }))
                    );
                    for (let floor of floors) {
                        if (intersectRectangles(bounds, floor)) {
                            mover.pos.y = floor[1].y + mover.bbox[0].y;
                        }
                    }
                }
            }

            /*for (let i = 0; i < movers.length; i++) {
                let mover = movers[i];

                let movingBounds = [
                    {
                        x: mover.pos.x - mover.bbox[0].x,
                        y: mover.pos.y - mover.bbox[0].y
                    },
                    {
                        x: mover.pos.x + mover.bbox[1].x + mover.vel.x,
                        y: mover.pos.y + mover.bbox[1].y + mover.vel.y
                    }
                ];

                console.log("===");
                for (let terrain of World.terrain) {
                    console.log("terrain");
                    let floors = Terrain.objects[terrain.t].floors.map(floor => [
                        { x: terrain.x + floor[0].x, y: terrain.y + floor[0].y },
                        { x: terrain.x + floor[1].x, y: terrain.y + floor[1].y }
                    ]);

                    for (let floor of floors) {
                        console.log("floor");
                        if (intersectRectangles(movingBounds, floor)) {
                            let diff = movingBounds[1].y - floor[0].y;
                            console.log(diff, movingBounds[1].y, floor[0].y);
                            mover.vel.y -= diff;
                            console.log(mover.vel.y);

                            movingBounds = [
                                {
                                    x: mover.pos.x - mover.bbox[0].x,
                                    y: mover.pos.y - mover.bbox[0].y
                                },
                                {
                                    x: mover.pos.x + mover.bbox[1].x + mover.vel.x,
                                    y: mover.pos.y + mover.bbox[1].y + mover.vel.y
                                }
                            ];
                            console.log(movingBounds);
                        }
                    }
                }
                console.log("===");

                mover.pos.x += mover.vel.x;
                mover.pos.y += mover.vel.y;


            }

            return;
            // Very basic "rounds" of collision resolution, since we have no real physics.
            // (As usual, "detecting" a collision is not the hard part... we need to resolve
            // them too!)
            for (let rounds = 0; rounds < 5; rounds++) {
                // Each pair of entities only needs to interact once.
                for (let i = 0; i < movers.length - 1; i++) {
                    for (let j = i + 1; j < movers.length; j++) {
                        Movement.clipVelocityEntityVsEntity(movers[i], movers[j]);
                    }
                }

                for (let entity of movers) {
                    Movement.clipVelocityAgainstWalls(entity);
                }
            }

            // Now we perform all movement, even if it's not going to be perfect.
            for (let entity of movers) {
                entity.pos.x += entity.vel.x;
                entity.pos.y += entity.vel.y;
            }
        },

        clipVelocityEntityVsEntity(entity, other) {
            if (entity.noClipEntity || other.noClipEntity) return;

            let hit = intersectCircleCircle(
                entity.pos,
                entity.radius,
                entity.vel,
                other.pos,
                other.radius,
                other.vel
            );
            if (hit) {
                if (entity.bounce && other.bounce) {
                    entity.vel.x = -hit.nx * hit.m;
                    entity.vel.y = -hit.ny * hit.m;
                    other.vel.x = hit.nx * hit.m;
                    other.vel.y = hit.ny * hit.m;
                } else {
                    // Not a bug: we "add" the mass of the opposing entity to our own velocity when deciding who
                    // is at fault for the collision. Entity velocities adjust in relation to their fault level.
                    let entityM = normalizeVector(entity.vel).m + other.mass,
                        otherM = normalizeVector(other.vel).m + entity.mass,
                        entityI = entity.bounce ? 0.1 : 1,
                        otherI = other.bounce ? 0.1 : 1;
                    entity.vel.x -=
                        (hit.nx * hit.m * entityI * entityM) / (entityM + otherM);
                    entity.vel.y -=
                        (hit.ny * hit.m * entityI * entityM) / (entityM + otherM);
                    other.vel.x +=
                        (hit.nx * hit.m * otherI * otherM) / (entityM + otherM);
                    other.vel.y +=
                        (hit.ny * hit.m * otherI * otherM) / (entityM + otherM);
                }
            }
        },

        clipVelocityAgainstWalls(entity) {
            if (entity.noClipWall) return;

            for (let tile of tilesHitByCircle(
                entity.pos,
                entity.vel,
                entity.radius
            )) {
                if (!tileIsPassable(tile.q, tile.r)) {
                    let bounds = [
                        qr2xy(tile),
                        qr2xy({ q: tile.q + 1, r: tile.r + 1 })
                    ];
                    let hit = intersectCircleRectangle(
                        entity.pos,
                        {
                            x: entity.pos.x + entity.vel.x,
                            y: entity.pos.y + entity.vel.y
                        },
                        entity.radius,
                        bounds
                    );

                    // The "math" part of detecting collision with walls is buried in the geometry functions
                    // above, but it's not the whole story -- if we do detect a collision, we still need to
                    // decide what to do about it.
                    //
                    // If the normal vector is horizontal or vertical, we zero out the portion of the vector
                    // moving into the wall, allowing frictionless sliding (if we wanted to perform friction,
                    // we could also reduce the other axis slightly).
                    //
                    // If the normal vector is not 90*, we "back up" off the wall by exactly the normal vector.
                    // If the player runs into a corner at EXACTLY a 45 degree angle, they will simply "stick"
                    // on it -- but one degree left or right and they'll slide around the corner onto the wall,
                    // which is the desired result.
                    if (hit) {
                        if (entity.bounce) {
                            if (hit.nx === 0) {
                                entity.vel.y = -entity.vel.y;
                            } else if (hit.ny === 0) {
                                entity.vel.x = -entity.vel.x;
                            } else {
                                entity.vel.x += hit.nx;
                                entity.vel.y += hit.ny;
                            }
                        } else {
                            if (hit.nx === 0) {
                                entity.vel.y = hit.y - entity.pos.y;
                            } else if (hit.ny === 0) {
                                entity.vel.x = hit.x - entity.pos.x;
                            } else {
                                entity.vel.x += hit.nx;
                                entity.vel.y += hit.ny;
                            }
                        }
                    }
                }
            }
        }
        */
    };

    /**
     * Victory
     */
    const Victory = {
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

    const World = {
        init() {
            World.reset();
        },

        reset() {
            World.terrain = [
                { t: 't_tree1', x: 0, y: 0 },
                { t: 't_tree2', x: 50, y: 20 },
                { t: 't_tree3', x: 100, y: -20 }
            ];

            World.entities = [];
        },

        think() {
        },

        draw() {
            for (let terrain of World.terrain) {
                Sprite.drawViewportSprite(Sprite.terrain[terrain.t], terrain);
            }
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

    /**
     * Game state.
     */
    class Game {
        init() {
            Sprite.loadSpritesheet(async () => {
                await Viewport.init();
                await Sprite.init();
                await Terrain.init();
                Text.init();
                Hud.init();
                Input.init();
                Audio.init();
                World.init();

                this.entities = [];
                this.dialogPending = {};
                this.dialogSeen = {};
                this.roomsCleared = {};
                this.shadowOffset = 0;
                this.screenshakes = [];
                this.player = new Player();
                this.entities.push(this.player);
                this.camera = { pos: { x: 0, y: 0 } };
                this.cameraFocus = { pos: { x: 0, y: 0 } };

                this.field = new Field('EasyStreet');
                await this.field.init();

                window.addEventListener('blur', () => this.pause());
                window.addEventListener('focus', () => this.unpause());

                this.start();
            });
        }

        start() {
            this.fps = 30;
            this.frame = 0;
            this.frameTimes = [];
            this.update();
            window.requestAnimationFrame((delta) => this.onFrame(delta));
        }

        onFrame() {
            Viewport.resize();

            let now = new Date().getTime(), lastFrame = this.lastFrame || 0;
            if (now - lastFrame >= 1000 / this.fps) {
                this.update();
                this.lastFrame = now;
            }

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
            for (let entity of game.entities) {
                if (entity.think) entity.think();
            }

            // perform any queued damage
            //Damage.perform(this.entities);

            // Movement (perform entity velocities to position)
            Movement.perform(this.entities);

            // Dialog scheduling
            //DialogScheduling.perform();

            // Victory conditions
            Victory.perform();

            this.field.update();

            // Culling (typically when an entity dies)
            this.entities = this.entities.filter(entity => !entity.cull);

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

            //Viewport.ctx.fillStyle = 'black';
            //Viewport.ctx.fillRect(-Viewport.width, -Viewport.height, Viewport.width * 2, Viewport.height * 2);

            //Viewport.ctx.fillStyle = 'black';
            //Viewport.ctx.font = '32px East Sea Dokdo';
            //Viewport.ctx.fillText('harold is heavy', 50, 50);

            World.draw();

            //Viewport.ctx.fillStyle = 'black';
            //Viewport.ctx.fillRect(-100, 1, 200, 200);

            //this.board.draw();

            //Hud.draw();

            for (let entity of game.entities) {
                entity.draw();
            }

    //        Maze.draw();
            Viewport.ctx.font = '16px \'DejaVu Sans Mono\'';
            Viewport.ctx.fillStyle = 'black';
            Viewport.ctx.fillText('hello ┘┘ ┙┛ ├ ┘ ', 10, 10);

            let screen = [
                '00' + '*'.repeat(78),
                '01' + '.'.repeat(78),
                '02 Hey everybody, give me my part people. HP 80     / ATTACK DRAGON',
                '03 ===== ..... .....',
                '04 ...a┘a┘.................',
                '05 ........................',
                '06 ......|...+++......@....',
                '07 ......|.................',
                '08 ......\\---....$.........',
                '09 ........................',
                '10' + '='.repeat(70),
                '11',
                '12' + String(Math.random()),
                '13',
                '14',
                '15' + (' '.repeat(game.frame % 60)) + '@',
                '16',
                '17',
                '18   ' + this.fps,
                '19',
                '20',
                '21',
                '22',
                '23',
                '24'
            ].join('\n');
    /*
            screen = '04 ...a┘a┘.................';

            screen = [
                '─│┌┐└┘├┤┬┴┼',
                '═║╔╗╚╝╠╣╦╩╬'
            ].join('\n');*/

            //Text.drawText(Viewport.ctx, Text.splitParagraph(screen, Viewport.width), 0, 0, 1, Text.terminal, Text.terminal_shadow);

            this.field.draw();

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
    }

    const game = new Game();

    /**
     * Create and launch game.
     */
    game.init();

}());
