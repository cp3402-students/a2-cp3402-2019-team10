(function(){var N=this;N.N2_=N.N2_||{r:[],d:[]},N.N2R=N.N2R||function(){N.N2_.r.push(arguments)},N.N2D=N.N2D||function(){N.N2_.d.push(arguments)}}).call(window);
N2D('SmartSliderFrontendBackgroundAnimation', ['SmartSliderMainAnimationSimple'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param slider
     * @param parameters
     * @param backgroundAnimations
     * @constructor
     */
    function SmartSliderFrontendBackgroundAnimation(slider, parameters, backgroundAnimations) {
        this._currentBackgroundAnimation = false;
        N2Classes.SmartSliderMainAnimationSimple.prototype.constructor.call(this, slider, parameters);
        this.isReverseAllowed = false;

        this.bgAnimationElement = this.sliderElement.find('.n2-ss-background-animation');

        if (this.slider.parameters.perspective > 0) {
            NextendTween.set(this.bgAnimationElement, {
                perspective: this.slider.parameters.perspective
            });
        }

        this.backgroundAnimations = $.extend({
            global: 0,
            color: 'RGBA(51,51,51,1)',
            speed: 'normal'
        }, backgroundAnimations);

        this.backgrounds = slider.backgrounds.getBackgroundImages();

        /**
         * Hack to force browser to better image rendering {@link http://stackoverflow.com/a/14308227/305604}
         * Prevents a Firefox glitch
         */
        slider.backgrounds.hack();
    }

    SmartSliderFrontendBackgroundAnimation.prototype = Object.create(N2Classes.SmartSliderMainAnimationSimple.prototype);
    SmartSliderFrontendBackgroundAnimation.prototype.constructor = SmartSliderFrontendBackgroundAnimation;

    /**
     *
     * @param {N2Classes.FrontendSliderSlide} nextSlide
     * @param {N2Classes.FrontendSliderSlide} currentSlide
     * @returns {boolean|Array.<{N2Classes.SmartSliderBackgroundAnimationAbstract, string}>}
     */
    SmartSliderFrontendBackgroundAnimation.prototype.getBackgroundAnimation = function (currentSlide, nextSlide) {
        if (nextSlide.hasBackgroundVideo() || currentSlide.hasBackgroundVideo()) {
            return false;
        }
        var animations = this.backgroundAnimations.global,
            speed = this.backgroundAnimations.speed;

        if (nextSlide.backgroundAnimation) {
            var backgroundAnimation = nextSlide.backgroundAnimation;
            animations = backgroundAnimation.animation;
            speed = backgroundAnimation.speed;
        }
        if (!animations) {
            return false;
        }
        return [animations[Math.floor(Math.random() * animations.length)], speed];
    };

    /**
     * Initialize the current background animation
     * @param {N2Classes.FrontendSliderSlide} currentSlide
     * @param {N2Classes.FrontendSliderSlide} nextSlide
     * @param reversed
     * @private
     */
    SmartSliderFrontendBackgroundAnimation.prototype._initAnimation = function (currentSlide, nextSlide, reversed) {
        this._currentBackgroundAnimation = false;
        var currentImage = currentSlide.background,
            nextImage = nextSlide.background;

        if (currentImage && nextImage) {
            var backgroundAnimation = this.getBackgroundAnimation(currentSlide, nextSlide);

            if (backgroundAnimation !== false) {
                var durationMultiplier = 1;
                switch (backgroundAnimation[1]) {
                    case 'superSlow10':
                        durationMultiplier = 10;
                        break;
                    case 'superSlow':
                        durationMultiplier = 3;
                        break;
                    case 'slow':
                        durationMultiplier = 1.5;
                        break;
                    case 'fast':
                        durationMultiplier = 0.75;
                        break;
                    case 'superFast':
                        durationMultiplier = 0.5;
                        break;
                }
                this._currentBackgroundAnimation = new N2Classes['SmartSliderBackgroundAnimation' + backgroundAnimation[0].type](this, currentImage.element, nextImage.element, backgroundAnimation[0], durationMultiplier, reversed);

                N2Classes.SmartSliderMainAnimationSimple.prototype._initAnimation.apply(this, arguments);

                this._currentBackgroundAnimation.postSetup();

                this.timeline.set($('<div />'), {
                    opacity: 1, onComplete: $.proxy(function () {
                        if (this._currentBackgroundAnimation) {
                            this._currentBackgroundAnimation.ended();
                            this._currentBackgroundAnimation = false;
                        }
                    }, this)
                });

                return;
            }
        }

        N2Classes.SmartSliderMainAnimationSimple.prototype._initAnimation.apply(this, arguments);
    };

    /**
     * Remove the background animation when the current animation finish
     * @param previousSlideIndex
     * @param currentSlideIndex
     */
    SmartSliderFrontendBackgroundAnimation.prototype.onChangeToComplete = function (previousSlideIndex, currentSlideIndex) {
        if (this._currentBackgroundAnimation) {
            this._currentBackgroundAnimation.ended();
            this._currentBackgroundAnimation = false;
        }
        N2Classes.SmartSliderMainAnimationSimple.prototype.onChangeToComplete.apply(this, arguments);
    };

    SmartSliderFrontendBackgroundAnimation.prototype.onReverseChangeToComplete = function (previousSlideIndex, currentSlideIndex, isSystem) {
        if (this._currentBackgroundAnimation) {
            this._currentBackgroundAnimation.revertEnded();
            this._currentBackgroundAnimation = false;
        }
        N2Classes.SmartSliderMainAnimationSimple.prototype.onReverseChangeToComplete.apply(this, arguments);
    };

    SmartSliderFrontendBackgroundAnimation.prototype.getExtraDelay = function () {
        if (this._currentBackgroundAnimation) {
            return this._currentBackgroundAnimation.getExtraDelay();
        }
        return 0;
    };

    SmartSliderFrontendBackgroundAnimation.prototype.hasBackgroundAnimation = function () {
        return this._currentBackgroundAnimation;
    };

    return SmartSliderFrontendBackgroundAnimation;

});
N2D('SmartSliderBackgroundAnimationAbstract', function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param sliderBackgroundAnimation
     * @param currentImage
     * @param nextImage
     * @param animationProperties
     * @param durationMultiplier
     * @param reversed
     * @constructor
     */
    function SmartSliderBackgroundAnimationAbstract(sliderBackgroundAnimation, currentImage, nextImage, animationProperties, durationMultiplier, reversed) {
        this.durationMultiplier = durationMultiplier;

        this.original = {
            currentImage: currentImage,
            nextImage: nextImage
        };

        this.animationProperties = animationProperties;

        this.reversed = reversed;

        this.sliderBackgroundAnimation = sliderBackgroundAnimation;
        this.timeline = sliderBackgroundAnimation.timeline;

        this.containerElement = sliderBackgroundAnimation.bgAnimationElement;

        this.shiftedBackgroundAnimation = sliderBackgroundAnimation.parameters.shiftedBackgroundAnimation;

        this.clonedImages = {};

    }

    SmartSliderBackgroundAnimationAbstract.prototype.postSetup = function () {
    };

    SmartSliderBackgroundAnimationAbstract.prototype.ended = function () {

    };

    SmartSliderBackgroundAnimationAbstract.prototype.revertEnded = function () {

    };

    SmartSliderBackgroundAnimationAbstract.prototype.placeNextImage = function () {
        this.clonedImages.nextImage = this.original.nextImage.clone().css({
            position: 'absolute',
            top: 0,
            left: 0
        });
        NextendTween.set(this.clonedImages.nextImage, {transform: 'none'});

        this.containerElement.append(this.clonedImages.nextImage);
    };

    SmartSliderBackgroundAnimationAbstract.prototype.placeCurrentImage = function () {
        this.clonedImages.currentImage = this.original.currentImage.clone().css({
            position: 'absolute',
            top: 0,
            left: 0
        });
        NextendTween.set(this.clonedImages.currentImage, {transform: 'none'});

        this.containerElement.append(this.clonedImages.currentImage);
    };

    SmartSliderBackgroundAnimationAbstract.prototype.hideOriginals = function () {
        this.original.currentImage.css('opacity', 0);
        this.original.nextImage.css('opacity', 0);
    };

    SmartSliderBackgroundAnimationAbstract.prototype.resetAll = function () {
        this.original.currentImage.css('opacity', 1);
        this.original.nextImage.css('opacity', 1);
        this.containerElement.html('');
    };

    SmartSliderBackgroundAnimationAbstract.prototype.getExtraDelay = function () {
        return 0;
    };

    return SmartSliderBackgroundAnimationAbstract;
});

N2D('SmartSliderBackgroundAnimationCubic', ['SmartSliderBackgroundAnimationTiled'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @constructor
     */
    function SmartSliderBackgroundAnimationCubic() {
        if (n2const.isFirefox) {
            $('html').addClass('n2-firefox');
        }
        N2Classes.SmartSliderBackgroundAnimationTiled.prototype.constructor.apply(this, arguments);
    }

    SmartSliderBackgroundAnimationCubic.prototype = Object.create(N2Classes.SmartSliderBackgroundAnimationTiled.prototype);
    SmartSliderBackgroundAnimationCubic.prototype.constructor = SmartSliderBackgroundAnimationCubic;


    SmartSliderBackgroundAnimationCubic.prototype.setup = function () {
        var animation = $.extend(true, {
            columns: 1,
            rows: 1,
            fullCube: true,
            tiles: {
                delay: 0.2,  // Delay between the starting of the tiles sequence. Ex.: #1 batch start: 0s, #2: .2s, #3: .4s
                sequence: 'Parallel' // Parallel, Random, ForwardCol, BackwardCol, ForwardRow, BackwardRow, ForwardDiagonal, BackwardDiagonal
            },
            depth: 50, // Used only when side is "Back"
            main: {
                side: 'Left', // Left, Right, Top, Bottom, Back, BackInvert
                duration: 0.5,
                ease: 'easeInOutCubic',
                direction: 'horizontal', // horizontal, vertical // Used when side points to Back
                real3D: true // Enable perspective
            },
            pre: [], // Animations to play on tiles before main
            post: [] // Animations to play on tiles after main
        }, this.animationProperties);
        animation.fullCube = true;

        if (this.reversed) {
            if (typeof animation.invert !== 'undefined') {
                $.extend(true, animation.main, animation.invert);
            }

            if (typeof animation.invertTiles !== 'undefined') {
                $.extend(animation.tiles, animation.invertTiles);
            }
        }

        N2Classes.SmartSliderBackgroundAnimationTiled.prototype.setup.call(this, animation);
    };

    SmartSliderBackgroundAnimationCubic.prototype.renderTile = function (tile, w, h, animation, totalLeft, totalTop) {

        var d = animation.depth;

        switch (d) {
            case 'width':
                d = w;
                break;
            case 'height':
                d = h;
                break;
        }
        switch (animation.main.side) {
            case 'Top':
            case 'Bottom':
                d = h;
                break;
            case 'Left':
            case 'Right':
                d = w;
                break;
        }

        if (animation.main.real3D) {
            NextendTween.set(tile.get(0), {
                transformStyle: "preserve-3d"
            });
        }
        var cuboid = $('<div class="cuboid"></div>').css({
            position: 'absolute',
            left: '0',
            top: '0',
            width: '100%',
            height: '100%'
        }).appendTo(tile);
        NextendTween.set(cuboid.get(0), {
            transformStyle: "preserve-3d",
            z: -d / 2
        });

        var backRotationZ = 0;
        if (animation.main.direction === 'horizontal') {
            backRotationZ = 180;
        }
        var back = this.getSide(cuboid, w, h, 0, 0, -d / 2, 180, 0, backRotationZ),
            sides = {
                Back: back,
                BackInvert: back
            };
        if (animation.fullCube || animation.main.direction === 'vertical') {
            sides.Bottom = this.getSide(cuboid, w, d, 0, h - d / 2, 0, -90, 0, 0);
            sides.Top = this.getSide(cuboid, w, d, 0, -d / 2, 0, 90, 0, 0);
        }

        sides.Front = this.getSide(cuboid, w, h, 0, 0, d / 2, 0, 0, 0);
        if (animation.fullCube || animation.main.direction === 'horizontal') {
            sides.Left = this.getSide(cuboid, d, h, -d / 2, 0, 0, 0, -90, 0);
            sides.Right = this.getSide(cuboid, d, h, w - d / 2, 0, 0, 0, 90, 0);
        }

        sides.Front.append(this.clonedCurrent().clone().css({
            position: 'absolute',
            top: -totalTop + 'px',
            left: -totalLeft + 'px'
        }));

        sides[animation.main.side].append(this.clonedNext().clone().css({
            position: 'absolute',
            top: -totalTop + 'px',
            left: -totalLeft + 'px'
        }));

        return cuboid;
    };

    SmartSliderBackgroundAnimationCubic.prototype.getSide = function (cuboid, w, h, x, y, z, rX, rY, rZ) {
        var side = $('<div class="n2-3d-side"></div>')
            .css({
                width: w,
                height: h
            })
            .appendTo(cuboid);
        NextendTween.set(side.get(0), {
            x: x,
            y: y,
            z: z,
            rotationX: rX,
            rotationY: rY,
            rotationZ: rZ,
            backfaceVisibility: "hidden"
        });
        return side;
    };

    SmartSliderBackgroundAnimationCubic.prototype.addAnimation = function (animation, cuboids) {
        var duration = animation.duration;
        delete animation.duration;
        this.timeline.to(cuboids, duration * this.durationMultiplier, animation);
    };

    SmartSliderBackgroundAnimationCubic.prototype.transform = function (animation, cuboid, position) {

        for (var i = 0; i < animation.pre.length; i++) {
            var _a = animation.pre[i],
                duration = _a.duration * this.durationMultiplier;
            this.timeline.to(cuboid, duration, _a, position);
            position += duration;
        }

        this['transform' + animation.main.side](animation.main, cuboid, position);
        position += animation.main.duration;

        for (var i = 0; i < animation.post.length; i++) {
            var _a = animation.post[i],
                duration = _a.duration * this.durationMultiplier;
            this.timeline.to(cuboid, duration, _a, position);
            position += duration;
        }
    };

    SmartSliderBackgroundAnimationCubic.prototype.transformLeft = function (main, cuboid, total) {
        this._transform(main, cuboid, total, 0, 90, 0);
    };

    SmartSliderBackgroundAnimationCubic.prototype.transformRight = function (main, cuboid, total) {
        this._transform(main, cuboid, total, 0, -90, 0);
    };

    SmartSliderBackgroundAnimationCubic.prototype.transformTop = function (main, cuboid, total) {
        this._transform(main, cuboid, total, -90, 0, 0);
    };

    SmartSliderBackgroundAnimationCubic.prototype.transformBottom = function (main, cuboid, total) {
        this._transform(main, cuboid, total, 90, 0, 0);
    };

    SmartSliderBackgroundAnimationCubic.prototype.transformBack = function (main, cuboid, total) {
        if (main.direction == 'horizontal') {
            this._transform(main, cuboid, total, 0, 180, 0);
        } else {
            this._transform(main, cuboid, total, 180, 0, 0);
        }
    };

    SmartSliderBackgroundAnimationCubic.prototype.transformBackInvert = function (main, cuboid, total) {
        if (main.direction == 'horizontal') {
            this._transform(main, cuboid, total, 0, -180, 0);
        } else {
            this._transform(main, cuboid, total, -180, 0, 0);
        }
    };

    SmartSliderBackgroundAnimationCubic.prototype._transform = function (main, cuboid, total, rX, rY, rZ) {
        this.timeline.to(cuboid, main.duration * this.durationMultiplier, {
            rotationX: rX,
            rotationY: rY,
            rotationZ: rZ,
            ease: main.ease
        }, total);
    };

    return SmartSliderBackgroundAnimationCubic;
});
N2D('SmartSliderBackgroundAnimationExplode', ['SmartSliderBackgroundAnimationTiled'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @constructor
     */
    function SmartSliderBackgroundAnimationExplode() {
        N2Classes.SmartSliderBackgroundAnimationTiled.prototype.constructor.apply(this, arguments);
    }

    SmartSliderBackgroundAnimationExplode.prototype = Object.create(N2Classes.SmartSliderBackgroundAnimationTiled.prototype);
    SmartSliderBackgroundAnimationExplode.prototype.constructor = SmartSliderBackgroundAnimationExplode;


    SmartSliderBackgroundAnimationExplode.prototype.setup = function () {

        var animation = $.extend(true, {
            columns: 1,
            rows: 1,
            reverse: false,
            tiles: {
                delay: 0, // Delay between the starting of the tiles sequence. Ex.: #1 batch start: 0s, #2: .2s, #3: .4s
                sequence: 'Parallel' // Parallel, Random, ForwardCol, BackwardCol, ForwardRow, BackwardRow, ForwardDiagonal, BackwardDiagonal
            },
            main: {
                duration: 0.5,
                zIndex: 2, // z-index of the current image. Change it to 2 to show it over the second image.
                current: { // Animation of the current tile
                    ease: 'easeInOutCubic'
                }
            }
        }, this.animationProperties);

        this.placeNextImage();
        this.clonedImages.nextImage.css({
            overflow: 'hidden',
            width: '100%',
            height: '100%'
        });

        N2Classes.SmartSliderBackgroundAnimationTiled.prototype.setup.call(this, animation);
    };

    SmartSliderBackgroundAnimationExplode.prototype.renderTile = function (tile, w, h, animation, totalLeft, totalTop) {

        var current = $('<div></div>')
            .css({
                position: 'absolute',
                left: 0,
                top: 0,
                width: w,
                height: h,
                overflow: 'hidden',
                zIndex: animation.main.zIndex
            })
            .append(this.clonedCurrent().clone().css({
                position: 'absolute',
                top: -totalTop + 'px',
                left: -totalLeft + 'px'
            }))
            .appendTo(tile);

        NextendTween.set(tile.get(0), {
            transformPerspective: 1000,
            transformStyle: "preserve-3d"
        });

        return {
            current: current,
            tile: tile
        }
    };

    SmartSliderBackgroundAnimationExplode.prototype.transform = function (animation, animatable, total) {

        var current = $.extend(true, {}, animation.main.current);

        current.rotationX = (Math.random() * 3 - 1) * 90;
        current.rotationY = (Math.random() * 3 - 1) * 90;
        current.rotationZ = (Math.random() * 3 - 1) * 90;
        this.timeline.to(animatable.tile, animation.main.duration * this.durationMultiplier, current, total);
    };


    return SmartSliderBackgroundAnimationExplode;
});

N2D('SmartSliderBackgroundAnimationExplodeReversed', ['SmartSliderBackgroundAnimationTiled'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @constructor
     */
    function SmartSliderBackgroundAnimationExplodeReversed() {
        N2Classes.SmartSliderBackgroundAnimationTiled.prototype.constructor.apply(this, arguments);
    }

    SmartSliderBackgroundAnimationExplodeReversed.prototype = Object.create(N2Classes.SmartSliderBackgroundAnimationTiled.prototype);
    SmartSliderBackgroundAnimationExplodeReversed.prototype.constructor = SmartSliderBackgroundAnimationExplodeReversed;


    SmartSliderBackgroundAnimationExplodeReversed.prototype.setup = function () {

        var animation = $.extend(true, {
            columns: 1,
            rows: 1,
            reverse: false,
            tiles: {
                delay: 0, // Delay between the starting of the tiles sequence. Ex.: #1 batch start: 0s, #2: .2s, #3: .4s
                sequence: 'Parallel' // Parallel, Random, ForwardCol, BackwardCol, ForwardRow, BackwardRow, ForwardDiagonal, BackwardDiagonal
            },
            main: {
                duration: 0.5,
                zIndex: 2, // z-index of the current image. Change it to 2 to show it over the second image.
                current: { // Animation of the current tile
                    ease: 'easeInOutCubic'
                }
            }
        }, this.animationProperties);

        this.placeCurrentImage();
        this.clonedImages.currentImage.css({
            overflow: 'hidden',
            width: '100%',
            height: '100%'
        });

        N2Classes.SmartSliderBackgroundAnimationTiled.prototype.setup.call(this, animation);
    };

    SmartSliderBackgroundAnimationExplodeReversed.prototype.renderTile = function (tile, w, h, animation, totalLeft, totalTop) {

        var next = $('<div></div>')
            .css({
                position: 'absolute',
                left: 0,
                top: 0,
                width: w,
                height: h,
                overflow: 'hidden',
                zIndex: animation.main.zIndex
            })
            .append(this.clonedNext().clone().css({
                position: 'absolute',
                top: -totalTop + 'px',
                left: -totalLeft + 'px'
            }))
            .appendTo(tile);

        NextendTween.set(tile.get(0), {
            transformPerspective: 1000,
            transformStyle: "preserve-3d"
        });

        return {
            next: next,
            tile: tile
        }
    };

    SmartSliderBackgroundAnimationExplodeReversed.prototype.transform = function (animation, animatable, total) {

        var current = $.extend(true, {}, animation.main.current);

        current.rotationX = (Math.random() * 3 - 1) * 90;
        current.rotationY = (Math.random() * 3 - 1) * 90;
        current.rotationZ = (Math.random() * 3 - 1) * 30;
        this.timeline.from(animatable.tile, animation.main.duration * this.durationMultiplier, current, total);
    };

    return SmartSliderBackgroundAnimationExplodeReversed;
});
N2D('SmartSliderBackgroundAnimationFlat', ['SmartSliderBackgroundAnimationTiled'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @constructor
     */
    function SmartSliderBackgroundAnimationFlat() {
        N2Classes.SmartSliderBackgroundAnimationTiled.prototype.constructor.apply(this, arguments);
    }

    SmartSliderBackgroundAnimationFlat.prototype = Object.create(N2Classes.SmartSliderBackgroundAnimationTiled.prototype);
    SmartSliderBackgroundAnimationFlat.prototype.constructor = SmartSliderBackgroundAnimationFlat;

    SmartSliderBackgroundAnimationFlat.prototype.setup = function () {

        var animation = $.extend(true, {
            columns: 1,
            rows: 1,
            tiles: {
                cropOuter: false,
                crop: true,
                delay: 0, // Delay between the starting of the tiles sequence. Ex.: #1 batch start: 0s, #2: .2s, #3: .4s
                sequence: 'Parallel' // Parallel, Random, ForwardCol, BackwardCol, ForwardRow, BackwardRow, ForwardDiagonal, BackwardDiagonal
            },
            main: {
                type: 'next',  // Enable animation on the specified tile: current, next, both
                duration: 0.5,
                real3D: true, // Enable perspective
                zIndex: 1, // z-index of the current image. Change it to 2 to show it over the second image.
                current: { // Animation of the current tile
                    ease: 'easeInOutCubic'
                },
                next: { // Animation of the next tile
                    ease: 'easeInOutCubic'
                }
            }
        }, this.animationProperties);

        if (this.reversed) {
            if (typeof animation.invert !== 'undefined') {
                $.extend(true, animation.main, animation.invert);
            }

            if (typeof animation.invertTiles !== 'undefined') {
                $.extend(animation.tiles, animation.invertTiles);
            }
        }

        N2Classes.SmartSliderBackgroundAnimationTiled.prototype.setup.call(this, animation);

        if (animation.tiles.cropOuter) {
            this.container.css('overflow', 'hidden');
        }
    };

    SmartSliderBackgroundAnimationFlat.prototype.renderTile = function (tile, w, h, animation, totalLeft, totalTop) {

        if (animation.tiles.crop) {
            tile.css('overflow', 'hidden');
        }

        var current = $('<div></div>')
            .css({
                position: 'absolute',
                left: 0,
                top: 0,
                width: w,
                height: h,
                overflow: 'hidden',
                zIndex: animation.main.zIndex
            })
            .append(this.clonedCurrent().clone().css({
                position: 'absolute',
                top: -totalTop + 'px',
                left: -totalLeft + 'px'
            }))
            .appendTo(tile);
        var next = $('<div></div>')
            .css({
                position: 'absolute',
                left: 0,
                top: 0,
                width: w,
                height: h,
                overflow: 'hidden',
                zIndex: 1
            })
            .append(this.clonedNext().clone().css({
                position: 'absolute',
                top: -totalTop + 'px',
                left: -totalLeft + 'px'
            }))
            .appendTo(tile);

        if (animation.main.real3D) {
            NextendTween.set(tile.get(0), {
                transformStyle: "preserve-3d"
            });
            NextendTween.set(current.get(0), {
                transformStyle: "preserve-3d"
            });
            NextendTween.set(next.get(0), {
                transformStyle: "preserve-3d"
            });
        }

        return {
            current: current,
            next: next
        }
    };

    SmartSliderBackgroundAnimationFlat.prototype.transform = function (animation, animatable, total) {

        var main = animation.main;

        if (main.type == 'current' || main.type == 'both') {
            this.timeline.to(animatable.current, main.duration * this.durationMultiplier, main.current, total);
        }

        if (main.type == 'next' || main.type == 'both') {
            this.timeline.from(animatable.next, main.duration * this.durationMultiplier, main.next, total);
        }
    };

    return SmartSliderBackgroundAnimationFlat;
});
N2D('SmartSliderBackgroundAnimationSlices', ['SmartSliderBackgroundAnimationFluxAbstract'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @constructor
     */
    function SmartSliderBackgroundAnimationSlices() {
        N2Classes.SmartSliderBackgroundAnimationFluxAbstract.prototype.constructor.apply(this, arguments);

        this.setup();
    }

    SmartSliderBackgroundAnimationSlices.prototype = Object.create(N2Classes.SmartSliderBackgroundAnimationFluxAbstract.prototype);
    SmartSliderBackgroundAnimationSlices.prototype.constructor = SmartSliderBackgroundAnimationSlices;

    SmartSliderBackgroundAnimationSlices.prototype.setup = function () {

        var animation = $.extend(true, {
            slices: 6,
            direction: 'horizontal',
            isReversed: false,
            tiles: {
                delay: 0.05,
                sequence: 'normal',
                duration: 0.6,
                stages: [
                    {}, {}, {}
                ]
            }
        }, this.animationProperties);

        var container = $('<div></div>').css({
            position: 'absolute',
            left: 0,
            top: 0,
            width: this.w,
            height: this.h,
            overflow: 'hidden'
        });
        this.container = container;
        NextendTween.set(container.get(0), {
            force3D: true,
            perspective: 1000
        });

        var animatables = [],
            add;

        if (animation.direction === 'horizontal') {
            var rowHeight = Math.floor(this.h / animation.slices),
                rowRemainder = this.h - (animation.slices * rowHeight),
                rowAddPerLoop = Math.ceil(rowRemainder / animation.slices),
                thisRowRemainder = rowRemainder,
                totalTop = 0;

            for (var row = 0; row < animation.slices; row++) {
                var thisRowHeight = rowHeight;

                if (thisRowRemainder > 0) {
                    add = thisRowRemainder >= rowAddPerLoop ? rowAddPerLoop : thisRowRemainder;
                    thisRowHeight += add;
                    thisRowRemainder -= add;
                }

                animatables.push($('<div class="tile tile-colored-overlay tile-' + row + '"></div>').css({
                    position: 'absolute',
                    top: totalTop + 'px',
                    left: 0,
                    width: '100%',
                    height: thisRowHeight + 'px',
                    zIndex: 1000000
                }).appendTo(container));

                totalTop += thisRowHeight;
            }
            animation.tiles.stages[0].x = this.w;
            animation.tiles.stages[1].x = 0;
            animation.tiles.stages[2].x = -this.w;

        } else if (animation.direction === 'vertical') {

            var colWidth = Math.floor(this.w / animation.slices),
                colRemainder = this.w - (animation.slices * colWidth),
                colAddPerLoop = Math.ceil(colRemainder / animation.slices),
                totalLeft = 0;

            for (var col = 0; col < animation.slices; col++) {
                var thisColWidth = colWidth;

                if (colRemainder > 0) {
                    add = colRemainder >= colAddPerLoop ? colAddPerLoop : colRemainder;
                    thisColWidth += add;
                    colRemainder -= add;
                }

                animatables.push($('<div class="tile tile-colored-overlay tile-' + row + '"></div>').css({
                    position: 'absolute',
                    top: 0,
                    left: totalLeft + 'px',
                    width: thisColWidth + 'px',
                    height: '100%',
                    zIndex: 1000000
                }).appendTo(container));

                totalLeft += thisColWidth;
            }

            animation.tiles.stages[0].y = this.h;
            animation.tiles.stages[1].y = 0;
            animation.tiles.stages[2].y = -this.h;
        }

        if ((this.reversed && !animation.isReversed) || (!this.reversed && animation.isReversed)) {
            animation.tiles.stages = animation.tiles.stages.reverse();
        }

        var current = $('<div></div>')
            .css({
                position: 'absolute',
                left: 0,
                top: 0,
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                zIndex: 99999
            })
            .append(this.clonedCurrent().clone().css({
                position: 'absolute',
                top: 0,
                left: 0
            }))
            .appendTo(container);

        var next = $('<div></div>')
            .css({
                position: 'absolute',
                left: 0,
                top: 0,
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                zIndex: 99999,
                opacity: 0
            })
            .append(this.clonedNext().clone().css({
                position: 'absolute',
                top: 0,
                left: 0
            }))
            .appendTo(container);

        var time = this.timeline.totalDuration();
        switch (animation.tiles.sequence) {
            case 'FromSide':
                var middle = Math.floor(animation.slices / 2);
                for (var i = 0; i < animatables.length; i++) {
                    this.timeline.fromTo(animatables[i], animation.tiles.duration * this.durationMultiplier, animation.tiles.stages[0], animation.tiles.stages[1], time + animation.tiles.delay * Math.abs(Math.abs(middle - i) - middle));
                }
                break;
            case 'FromCenter':
                var middle = Math.floor(animation.slices / 2);
                for (var i = 0; i < animatables.length; i++) {
                    this.timeline.fromTo(animatables[i], animation.tiles.duration * this.durationMultiplier, animation.tiles.stages[0], animation.tiles.stages[1], time + animation.tiles.delay * Math.abs(middle - i));
                }
                break;

            default:
                for (var i = 0; i < animatables.length; i++) {
                    this.timeline.fromTo(animatables[i], animation.tiles.duration * this.durationMultiplier, animation.tiles.stages[0], animation.tiles.stages[1], time + animation.tiles.delay * i);
                }
                break;
        }

        this.timeline.set(current, {
            display: 'none'
        });

        this.timeline.set(next, {
            opacity: 1
        });

        var time2 = this.timeline.totalDuration() + 0.3;


        switch (animation.tiles.sequence) {
            case 'FromSide':
                var middle = Math.floor(animation.slices / 2);
                for (var i = 0; i < animatables.length; i++) {
                    this.timeline.to(animatables[i], animation.tiles.duration * this.durationMultiplier, animation.tiles.stages[2], time2 + animation.tiles.delay * Math.abs(Math.abs(middle - i) - middle));
                }
                break;
            case 'FromCenter':
                var middle = Math.floor(animation.slices / 2);
                for (var i = 0; i < animatables.length; i++) {
                    this.timeline.to(animatables[i], animation.tiles.duration * this.durationMultiplier, animation.tiles.stages[2], time2 + animation.tiles.delay * Math.abs(middle - i));
                }
                break;

            default:
                for (var i = 0; i < animatables.length; i++) {
                    this.timeline.to(animatables[i], animation.tiles.duration * this.durationMultiplier, animation.tiles.stages[2], time2 + animation.tiles.delay * i);
                }
                break;
        }

        if (animation.nextImage !== undefined) {
            this.timeline.fromTo(next, this.timeline.totalDuration() - time2 + 1, animation.nextImage[0], animation.nextImage[1], time2);
        }

        this.duration = this.timeline.totalDuration() - time;

        container.appendTo(this.containerElement);
        this.preSetup();
    };

    return SmartSliderBackgroundAnimationSlices;
});
N2D('SmartSliderBackgroundAnimationSlixes', ['SmartSliderBackgroundAnimationTiled'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @constructor
     */
    function SmartSliderBackgroundAnimationSlixes() {
        N2Classes.SmartSliderBackgroundAnimationTiled.prototype.constructor.apply(this, arguments);
    }

    SmartSliderBackgroundAnimationSlixes.prototype = Object.create(N2Classes.SmartSliderBackgroundAnimationTiled.prototype);
    SmartSliderBackgroundAnimationSlixes.prototype.constructor = SmartSliderBackgroundAnimationSlixes;


    SmartSliderBackgroundAnimationSlixes.prototype.setup = function () {

        var animation = $.extend(true, {
            columns: 2,
            rows: 2,
            main: {
                duration: 2,
                zIndex: 2 // z-index of the current image. Change it to 2 to show it over the second image.
            }
        }, this.animationProperties);

        this.placeNextImage();
        this.clonedImages.nextImage.css({
            overflow: 'hidden',
            width: '100%',
            height: '100%'
        });

        N2Classes.SmartSliderBackgroundAnimationTiled.prototype.setup.call(this, animation);
    };

    SmartSliderBackgroundAnimationSlixes.prototype.renderTile = function (tile, w, h, animation, totalLeft, totalTop) {
        this.container.css('overflow', 'hidden');

        var current = $('<div></div>')
            .css({
                position: 'absolute',
                left: 0,
                top: 0,
                width: w,
                height: h,
                overflow: 'hidden',
                zIndex: animation.main.zIndex
            })
            .append(this.clonedCurrent().clone().css({
                position: 'absolute',
                top: -totalTop + 'px',
                left: -totalLeft + 'px'
            }))
            .appendTo(tile);

        NextendTween.set(tile.get(0), {
            transformPerspective: 1000,
            transformStyle: "preserve-3d"
        });

        return {
            current: current,
            tile: tile
        }
    };

    SmartSliderBackgroundAnimationSlixes.prototype.animate = function (animation, animatables, animatablesMulti) {

        this.timeline.to(animatablesMulti[0][0].tile, animation.main.duration * this.durationMultiplier, {
            left: '-50%',
            ease: 'easeInOutCubic'
        }, 0);
        this.timeline.to(animatablesMulti[0][1].tile, animation.main.duration * this.durationMultiplier, {
            left: '-50%',
            ease: 'easeInOutCubic'
        }, 0.3);

        this.timeline.to(animatablesMulti[1][0].tile, animation.main.duration * this.durationMultiplier, {
            left: '100%',
            ease: 'easeInOutCubic'
        }, 0.15);
        this.timeline.to(animatablesMulti[1][1].tile, animation.main.duration * this.durationMultiplier, {
            left: '100%',
            ease: 'easeInOutCubic'
        }, 0.45);

        $('<div />').css({
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            overflow: 'hidden'
        }).prependTo(this.clonedImages.nextImage.parent()).append(this.clonedImages.nextImage);

        this.timeline.fromTo(this.clonedImages.nextImage, animation.main.duration * this.durationMultiplier, {
            scale: 1.3
        }, {
            scale: 1
        }, 0.45);
    };

    return SmartSliderBackgroundAnimationSlixes;
});
N2D('SmartSliderBackgroundAnimationTiled', ['SmartSliderBackgroundAnimationFluxAbstract'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     * @abstract
     *
     * @constructor
     */
    function SmartSliderBackgroundAnimationTiled() {
        N2Classes.SmartSliderBackgroundAnimationFluxAbstract.prototype.constructor.apply(this, arguments);

        this.setup();
    }

    SmartSliderBackgroundAnimationTiled.prototype = Object.create(N2Classes.SmartSliderBackgroundAnimationFluxAbstract.prototype);
    SmartSliderBackgroundAnimationTiled.prototype.constructor = SmartSliderBackgroundAnimationTiled;

    SmartSliderBackgroundAnimationTiled.prototype.setup = function (animation) {

        var container = $('<div></div>').css({
            position: 'absolute',
            left: 0,
            top: 0,
            width: this.w,
            height: this.h
        });
        this.container = container;
        NextendTween.set(container.get(0), {
            force3D: true,
            perspective: 1000
        });

        var animatablesMulti = [],
            animatables = [];

        var columns = animation.columns,
            rows = animation.rows,
            colWidth = Math.floor(this.w / columns),
            rowHeight = Math.floor(this.h / rows);

        var colRemainder = this.w - (columns * colWidth),
            colAddPerLoop = Math.ceil(colRemainder / columns),
            rowRemainder = this.h - (rows * rowHeight),
            rowAddPerLoop = Math.ceil(rowRemainder / rows),
            totalLeft = 0;

        for (var col = 0; col < columns; col++) {
            animatablesMulti[col] = [];
            var thisColWidth = colWidth,
                totalTop = 0;

            if (colRemainder > 0) {
                var add = colRemainder >= colAddPerLoop ? colAddPerLoop : colRemainder;
                thisColWidth += add;
                colRemainder -= add;
            }

            var thisRowRemainder = rowRemainder;

            for (var row = 0; row < rows; row++) {
                var thisRowHeight = rowHeight;

                if (thisRowRemainder > 0) {
                    var add = thisRowRemainder >= rowAddPerLoop ? rowAddPerLoop : thisRowRemainder;
                    thisRowHeight += add;
                    thisRowRemainder -= add;
                }
                var tile = $('<div class="tile tile-' + col + '-' + row + '"></div>').css({
                    position: 'absolute',
                    top: totalTop + 'px',
                    left: totalLeft + 'px',
                    width: thisColWidth + 'px',
                    height: thisRowHeight + 'px',
                    zIndex: -Math.abs(col - parseInt(columns / 2)) + columns - Math.abs(row - parseInt(rows / 2))
                }).appendTo(container);

                var animatable = this.renderTile(tile, thisColWidth, thisRowHeight, animation, totalLeft, totalTop);
                animatables.push(animatable);
                animatablesMulti[col][row] = animatable;

                totalTop += thisRowHeight;
            }
            totalLeft += thisColWidth;
        }

        container.appendTo(this.containerElement);

        this.preSetup();

        this.animate(animation, animatables, animatablesMulti);
    };

    SmartSliderBackgroundAnimationTiled.prototype.animate = function (animation, animatables, animatablesMulti) {
        this['sequence' + animation.tiles.sequence]($.proxy(this.transform, this, animation), animatables, animatablesMulti, animation.tiles.delay * this.durationMultiplier);
    };

    SmartSliderBackgroundAnimationTiled.prototype.sequenceParallel = function (transform, cuboids) {
        transform(cuboids, null);
    };

    SmartSliderBackgroundAnimationTiled.prototype.sequenceRandom = function (transform, cuboids, cuboidsMulti, delay) {
        var total = this.timeline.totalDuration();
        for (var i = 0; i < cuboids.length; i++) {
            transform(cuboids[i], total + Math.random() * delay);
        }
    };

    SmartSliderBackgroundAnimationTiled.prototype.sequenceForwardCol = function (transform, cuboids, cuboidsMulti, delay) {
        var total = this.timeline.totalDuration();
        for (var i = 0; i < cuboids.length; i++) {
            transform(cuboids[i], total + delay * i);
        }
    };

    SmartSliderBackgroundAnimationTiled.prototype.sequenceBackwardCol = function (transform, cuboids, cuboidsMulti, delay) {
        var total = this.timeline.totalDuration(),
            length = cuboids.length - 1;
        for (var i = 0; i < cuboids.length; i++) {
            transform(cuboids[i], total + delay * (length - i));
        }
    };

    SmartSliderBackgroundAnimationTiled.prototype.sequenceForwardRow = function (transform, cuboids, cuboidsMulti, delay) {
        var total = this.timeline.totalDuration(),
            i = 0;
        for (var row = 0; row < cuboidsMulti[0].length; row++) {
            for (var col = 0; col < cuboidsMulti.length; col++) {
                transform(cuboidsMulti[col][row], total + delay * i);
                i++;
            }
        }
    };

    SmartSliderBackgroundAnimationTiled.prototype.sequenceBackwardRow = function (transform, cuboids, cuboidsMulti, delay) {
        var total = this.timeline.totalDuration(),
            i = cuboids.length - 1;
        for (var row = 0; row < cuboidsMulti[0].length; row++) {
            for (var col = 0; col < cuboidsMulti.length; col++) {
                transform(cuboidsMulti[col][row], total + delay * i);
                i--;
            }
        }
    };

    SmartSliderBackgroundAnimationTiled.prototype.sequenceForwardDiagonal = function (transform, cuboids, cuboidsMulti, delay) {
        var total = this.timeline.totalDuration();
        for (var row = 0; row < cuboidsMulti[0].length; row++) {
            for (var col = 0; col < cuboidsMulti.length; col++) {
                transform(cuboidsMulti[col][row], total + delay * (col + row));
            }
        }
    };

    SmartSliderBackgroundAnimationTiled.prototype.sequenceBackwardDiagonal = function (transform, cuboids, cuboidsMulti, delay) {
        var total = this.timeline.totalDuration(),
            length = cuboidsMulti[0].length + cuboidsMulti.length - 2;
        for (var row = 0; row < cuboidsMulti[0].length; row++) {
            for (var col = 0; col < cuboidsMulti.length; col++) {
                transform(cuboidsMulti[col][row], total + delay * (length - col - row));
            }
        }
    };

    return SmartSliderBackgroundAnimationTiled;
});
N2D('SmartSliderBackgroundAnimationTurn', ['SmartSliderBackgroundAnimationFluxAbstract'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @constructor
     */
    function SmartSliderBackgroundAnimationTurn() {
        N2Classes.SmartSliderBackgroundAnimationFluxAbstract.prototype.constructor.apply(this, arguments);

        var animation = $.extend(true, {
            perspective: this.w * 1.5,
            duration: 0.8,
            direction: 'left'
        }, this.animationProperties);

        if (this.reversed) {
            if (animation.direction == 'left') {
                animation.direction = 'right';
            } else {
                animation.direction = 'left';
            }
        }

        var w2 = parseInt(this.w / 2);

        this.clonedCurrent().css({
            'position': 'absolute',
            'top': 0,
            'left': (animation.direction == 'left' ? -1 * (this.w / 2) : 0)
        });

        this.clonedNext().css({
            'position': 'absolute',
            'top': 0,
            'left': (animation.direction == 'left' ? 0 : -1 * (this.w / 2))
        });

        var tab = $('<div class="tab"></div>').css({
            width: w2,
            height: this.h,
            position: 'absolute',
            top: '0px',
            left: animation.direction == 'left' ? w2 : '0',
            'z-index': 101
        });

        NextendTween.set(tab, {
            transformStyle: 'preserve-3d',
            transformOrigin: animation.direction == 'left' ? '0px 0px' : w2 + 'px 0px'
        });

        var front = $('<div class="n2-ff-3d"></div>').append(this.clonedCurrent())
            .css({
                width: w2,
                height: this.h,
                position: 'absolute',
                top: 0,
                left: 0,
                '-webkit-transform': 'translateZ(0.1px)',
                overflow: 'hidden'
            })
            .appendTo(tab);

        NextendTween.set(front, {
            backfaceVisibility: 'hidden',
            transformStyle: 'preserve-3d'
        });


        var back = $('<div class="n2-ff-3d"></div>')
            .append(this.clonedNext())
            .appendTo(tab)
            .css({
                width: w2,
                height: this.h,
                position: 'absolute',
                top: 0,
                left: 0,
                overflow: 'hidden'
            });

        NextendTween.set(back, {
            backfaceVisibility: 'hidden',
            transformStyle: 'preserve-3d',
            rotationY: 180,
            rotationZ: 0
        });

        var current = $('<div></div>')
                .append(this.clonedCurrent().clone().css('left', (animation.direction == 'left' ? 0 : -w2))).css({
                    position: 'absolute',
                    top: 0,
                    left: animation.direction == 'left' ? '0' : w2,
                    width: w2,
                    height: this.h,
                    zIndex: 100,
                    overflow: 'hidden'
                }),
            overlay = $('<div class="overlay"></div>').css({
                position: 'absolute',
                top: 0,
                left: animation.direction == 'left' ? w2 : 0,
                width: w2,
                height: this.h,
                background: '#000',
                opacity: 1,
                overflow: 'hidden'
            }),

            container = $('<div></div>').css({
                width: this.w,
                height: this.h,
                position: 'absolute',
                top: 0,
                left: 0
            }).append(tab).append(current).append(overlay);


        NextendTween.set(container, {
            perspective: animation.perspective,
            perspectiveOrigin: '50% 50%'
        });

        this.placeNextImage();
        this.clonedImages.nextImage.css({
            overflow: 'hidden',
            width: '100%',
            height: '100%'
        });

        this.containerElement.append(container);

        this.preSetup();

        this.timeline.to(tab.get(0), animation.duration * this.durationMultiplier, {
            rotationY: (animation.direction == 'left' ? -180 : 180)
        }, 0);

        this.timeline.to(overlay.get(0), animation.duration * this.durationMultiplier, {
            opacity: 0
        }, 0);
    };

    SmartSliderBackgroundAnimationTurn.prototype = Object.create(N2Classes.SmartSliderBackgroundAnimationFluxAbstract.prototype);
    SmartSliderBackgroundAnimationTurn.prototype.constructor = SmartSliderBackgroundAnimationTurn;


    SmartSliderBackgroundAnimationTurn.prototype.getExtraDelay = function () {
        return 0;
    };

    return SmartSliderBackgroundAnimationTurn;
});
N2D('SmartSliderBackgroundAnimationFluxAbstract', ['SmartSliderBackgroundAnimationAbstract'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @constructor
     */
    function SmartSliderBackgroundAnimationFluxAbstract() {
        this.shiftedPreSetup = false;
        this._clonedCurrent = false;
        this._clonedNext = false;

        N2Classes.SmartSliderBackgroundAnimationAbstract.prototype.constructor.apply(this, arguments);

        this.w = this.original.currentImage.width();
        this.h = this.original.currentImage.height();

        this.initCSS();
    }

    SmartSliderBackgroundAnimationFluxAbstract.prototype = Object.create(N2Classes.SmartSliderBackgroundAnimationAbstract.prototype);
    SmartSliderBackgroundAnimationFluxAbstract.prototype.constructor = SmartSliderBackgroundAnimationFluxAbstract;

    var inited = false;
    SmartSliderBackgroundAnimationFluxAbstract.prototype.initCSS = function () {
        if (!inited) {
            var rules = [
                '.n2-ss-background-animation{position:absolute;top:0;left:0;width:100%;height:100%;z-index:3}',
                '.n2-ss-background-animation .n2-ss-slide-background {z-index: auto;}',
                '.n2-ss-background-animation img{max-width:none}',
                '.n2-ss-background-animation .n2-3d-side{position:absolute;left:0;top:0;overflow:hidden;background:' + this.sliderBackgroundAnimation.backgroundAnimations.color + '}',
                '.n2-firefox .n2-ss-background-animation .n2-3d-side{outline:transparent solid 1px}',
                '.n2-ss-background-animation .n2-ff-3d,.n2-ss-background-animation .tile{outline:transparent solid 1px}',
                '.tile-colored-overlay{z-index:100000;background:' + this.sliderBackgroundAnimation.backgroundAnimations.color + '}'
            ];


            $('<style type="text/css">' + rules.join('') + '</style>')
                .appendTo('head');
            inited = true;
        }
    };

    SmartSliderBackgroundAnimationFluxAbstract.prototype.clonedCurrent = function () {
        if (!this._clonedCurrent) {
            this._clonedCurrent = this.original.currentImage
                .clone()
                .css({
                    width: this.w,
                    height: this.h
                });
            NextendTween.set(this._clonedCurrent, {transform: 'none'});
        }
        return this._clonedCurrent;
    };

    SmartSliderBackgroundAnimationFluxAbstract.prototype.clonedNext = function () {
        if (!this._clonedNext) {
            this._clonedNext = this.original.nextImage
                .clone()
                .css({
                    width: this.w,
                    height: this.h
                });
            NextendTween.set(this._clonedNext, {transform: 'none'});
        }
        return this._clonedNext;
    };

    SmartSliderBackgroundAnimationFluxAbstract.prototype.preSetup = function () {
        if (this.shiftedBackgroundAnimation != 0) {
            this.shiftedPreSetup = true;
        } else {
            this._preSetup();
        }
    };

    SmartSliderBackgroundAnimationFluxAbstract.prototype._preSetup = function (skipFadeOut) {
        this.timeline.to(this.original.currentImage.get(0), this.getExtraDelay(), {
            opacity: 0
        }, 0);

        this.original.nextImage.css('opacity', 0);
    };

    SmartSliderBackgroundAnimationFluxAbstract.prototype.postSetup = function () {
        this.timeline.to(this.original.nextImage.get(0), this.getExtraDelay(), {
            opacity: 1
        });
    };

    SmartSliderBackgroundAnimationFluxAbstract.prototype.getExtraDelay = function () {
        return .2;
    };

    SmartSliderBackgroundAnimationFluxAbstract.prototype.ended = function () {
        this.original.currentImage.css('opacity', 1);
        this.containerElement.html('');
    };

    SmartSliderBackgroundAnimationFluxAbstract.prototype.revertEnded = function () {
        this.original.nextImage.css('opacity', 1);
        this.containerElement.html('');
    };

    return SmartSliderBackgroundAnimationFluxAbstract;
});
N2D('smartslider-backgroundanimation')