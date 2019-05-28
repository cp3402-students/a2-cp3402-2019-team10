(function(){var N=this;N.N2_=N.N2_||{r:[],d:[]},N.N2R=N.N2R||function(){N.N2_.r.push(arguments)},N.N2D=N.N2D||function(){N.N2_.d.push(arguments)}}).call(window);
N2D('SmartSliderBackgrounds', function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param slider
     * @constructor
     */
    function SmartSliderBackgrounds(slider) {
        this.device = null;

        //this.load = $.Deferred();

        this.slider = slider;
        this.hasFixed = false;

        this.lazyLoad = slider.parameters.lazyLoad;
        this.lazyLoadNeighbor = slider.parameters.lazyLoadNeighbor;

        this.deviceDeferred = $.Deferred();

        this.slider.sliderElement.one('SliderDevice', $.proxy(this.onSlideDeviceChangedFirst, this));
        this.slider.sliderElement.on('visibleSlidesChanged', $.proxy(this.onVisibleSlidesChanged, this));
        this.slider.sliderElement.on('slideCountChanged', $.proxy(this.onVisibleSlidesChanged, this));

    }

    SmartSliderBackgrounds.prototype.whenWithProgress = function (arrayOfPromises) {
        var cntr = 0, deferred = $.Deferred();
        for (var i = 0; i < arrayOfPromises.length; i++) {
            $.when(arrayOfPromises[i]).done(function () {
                deferred.notify(++cntr, arrayOfPromises.length);
            });
        }

        $.when.apply($, arrayOfPromises).done(function () {
            deferred.resolveWith(null, arguments);
        });

        return deferred;
    };

    /**
     *
     * @returns {N2Classes.SmartSliderSlideBackground[]}
     */
    SmartSliderBackgrounds.prototype.getBackgroundImages = function () {
        var images = [];
        for (var i = 0; i < this.slider.realSlides.length; i++) {
            images.push(this.slider.realSlides[i].background);
        }
        return images;
    };

    SmartSliderBackgrounds.prototype.onVisibleSlidesChanged = function () {

        if (this.lazyLoad == 1) {
            this.load = $.when.apply($, this.preLoadSlides(this.slider.getVisibleSlides(this.slider.currentSlide)));
        } else if (this.lazyLoad == 2) { // delayed
            this.load = $.when.apply($, this.preLoadSlides(this.slider.getVisibleSlides(this.slider.currentSlide)));
        }
    };

    SmartSliderBackgrounds.prototype.onSlideDeviceChangedFirst = function (e, device) {
        this.onSlideDeviceChanged(e, device);
        this.deviceDeferred.resolve();

        this.slider.sliderElement.on('SliderDevice', $.proxy(this.onSlideDeviceChanged, this));

        if (this.lazyLoad == 1) {
            this.preLoadSlides = this.preloadSlidesLazyNeighbor;

            this.load = this.whenWithProgress($, this.preLoadSlides(this.slider.getVisibleSlides(this.slider.currentSlide)));
        } else if (this.lazyLoad == 2) { // delayed
            this.preLoadSlides = this._preLoadSlides;
            $(window).on('load', $.proxy(this.preLoadAll, this));

            this.load = this.whenWithProgress($, this.preLoadSlides(this.slider.getVisibleSlides(this.slider.currentSlide)));
        } else {
            this.preLoadSlides = this._preLoadSlides;

            this.load = this.whenWithProgress(this.preLoadAll());
        }
    };

    SmartSliderBackgrounds.prototype.onSlideDeviceChanged = function (e, device) {
        this.device = device;
        for (var i = 0; i < this.slider.realSlides.length; i++) {
            if (this.slider.realSlides[i].background) {
                this.slider.realSlides[i].background.updateBackgroundToDevice(device);
            }
        }
    };

    SmartSliderBackgrounds.prototype.preLoadAll = function () {
        var deferreds = [];
        for (var i = 0; i < this.slider.realSlides.length; i++) {
            deferreds.push(this.slider.realSlides[i].preLoad());
        }
        return deferreds;
    };

    SmartSliderBackgrounds.prototype._preLoadSlides = function (slides) {
        var deferreds = [];
        if (Object.prototype.toString.call(slides) !== '[object Array]') {
            slides = [slides];
        }
        for (var i = 0; i < slides.length; i++) {
            deferreds.push(slides[i].preLoad());
        }

        return deferreds;
    };

    SmartSliderBackgrounds.prototype.preloadSlidesLazyNeighbor = function (slides) {
        var deferreds = this._preLoadSlides(slides);

        if (this.lazyLoadNeighbor) {
            var j = 0,
                previousSlide = slides[0].previousSlide,
                nextSlide = slides[slides.length - 1].nextSlide;
            while (j < this.lazyLoadNeighbor) {
                deferreds.push(previousSlide.preLoad());
                previousSlide = previousSlide.previousSlide;
                deferreds.push(nextSlide.preLoad());
                nextSlide = nextSlide.nextSlide;
                j++;
            }
        }

        var renderedDeferred = $.Deferred();
        if (deferreds[0].state() != 'resolved') {
            var timeout = setTimeout($.proxy(function () {
                this.slider.load.showSpinner('backgroundImage' + slides[0].index);
                timeout = null;
            }, this), 50);

            $.when.apply($, deferreds).done($.proxy(function () {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                } else {
                    this.slider.load.removeSpinner('backgroundImage' + slides[0].index);
                }
                setTimeout(function () {
                    renderedDeferred.resolve();
                }, 100);
            }, this));

        } else {
            setTimeout(function () {
                renderedDeferred.resolve();
            }, 100);
        }

        deferreds.push(renderedDeferred);

        return deferreds;
    };

    SmartSliderBackgrounds.prototype.hack = function () {
        for (var i = 0; i < this.slider.realSlides.length; i++) {
            if (this.slider.realSlides[i].background) {
                this.slider.realSlides[i].background.hack();
            }
        }
    };

    return SmartSliderBackgrounds;
});
N2D('SmartSliderLoad', function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param {N2Classes.SmartSliderAbstract} smartSlider
     * @param parameters
     * @constructor
     */
    function SmartSliderLoad(smartSlider, parameters) {

        this.parameters = $.extend({
            fade: 1,
            scroll: 0
        }, parameters);

        this.deferred = $.Deferred();

        /**
         * @type {N2Classes.SmartSliderAbstract}
         */
        this.smartSlider = smartSlider;

        this.spinnerCouner = 0;

        this.id = smartSlider.sliderElement.attr('id');
        this.$window = $(window);

        this.spinner = $('#' + this.id + '-spinner');
    }


    SmartSliderLoad.prototype.start = function () {

        if (this.parameters.scroll) {

            var $window = $(window);
            $window.on('scroll.' + this.id, $.proxy(this.onScroll, this));
            this.onScroll();

        } else if (this.parameters.fade) {
            this.loadingArea = $('#' + this.id + '-placeholder').eq(0);
            this.showSpinner('fadePlaceholder');
            n2c.log('Fade on load - start wait');


            var spinnerCounter = this.spinner.find('.n2-ss-spinner-counter');
            if (spinnerCounter.length) {
                spinnerCounter.html('0%');
                this.smartSlider.backgrounds.load
                    .progress($.proxy(function (current, total) {
                        spinnerCounter.html(Math.round(current / (total + 1) * 100) + '%');
                    }, this));
            }

            this.showSlider();

        } else {
            this.showSlider();
        }
    };

    SmartSliderLoad.prototype.onScroll = function () {
        if ((this.$window.scrollTop() + this.$window.height() > (this.smartSlider.sliderElement.offset().top + 100))) {
            n2c.log('Fade on scroll - reached');

            this.$window.off('scroll.' + this.id);

            this.showSlider();
        }
    };

    SmartSliderLoad.prototype.loadLayerImages = function () {
        var deferred = $.Deferred();
        this.smartSlider.sliderElement.find('.n2-ss-layers-container').n2imagesLoaded()
            .always(function () {
                deferred.resolve();
            });
        return deferred;
    };

    SmartSliderLoad.prototype.showSlider = function () {

        $.when(this.smartSlider.responsive.ready, this.smartSlider.backgrounds.load, this.loadLayerImages()).always($.proxy(function () {
            this._showSlider();
        }, this));
    };

    SmartSliderLoad.prototype._showSlider = function (cb) {
        n2c.log('Images loaded');

        this.smartSlider.responsive.isReadyToResize = true;

        $.when.apply($, this.smartSlider.widgetDeferreds).done($.proxy(function () {
            n2c.log('Event: BeforeVisible');
            this.smartSlider.responsive.invalidateResponsiveState = true;
            this.smartSlider.responsive.doResize();

            if (this.smartSlider.mainAnimation) this.smartSlider.mainAnimation.setToStarterSlide(this.smartSlider.starterSlide);

            this.smartSlider.starterSlide.setStarterSlide();

            this.smartSlider.sliderElement.trigger('BeforeVisible');

            this.smartSlider.responsive.alignElement.addClass('n2-ss-align-visible');

            n2c.log('Fade start');
            this.smartSlider.sliderElement
                .addClass('n2-ss-loaded')
                .removeClass('n2notransition');

            this.spinner.find('.n2-ss-spinner-counter').html('');
            this.removeSpinner('fadePlaceholder');
            $('#' + this.id + '-placeholder').remove();
            this.loadingArea = this.smartSlider.sliderElement;

            if (typeof cb === 'function') {
                cb(this.deferred);
            } else {
                this.deferred.resolve();
            }

            this.smartSlider.sliderElement.triggerHandler('Show');
        }, this));
    };

    SmartSliderLoad.prototype.loaded = function (fn) {
        this.deferred.done(fn);
    };

    SmartSliderLoad.prototype.showSpinner = function (spinnerKey) {
        if (this.spinnerCouner === 0) {
            this.spinner.appendTo(this.loadingArea).css('display', '');
        }
        this.spinnerCouner++;
    };

    SmartSliderLoad.prototype.removeSpinner = function (spinnerKey) {
        this.spinnerCouner--;
        if (this.spinnerCouner <= 0) {
            this.spinner.detach();
            this.spinnerCouner = 0;
        }
    };

    return SmartSliderLoad;
});
N2D('ScrollTracker', function ($, scope, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @constructor
     */
    function ScrollTracker() {
        this.started = false;
        this.items = [];
    }

    ScrollTracker.prototype.add = function ($el, mode, onVisible, onHide) {
        var item = {
            $el: $el,
            mode: mode,
            onVisible: onVisible,
            onHide: onHide,
            state: 'unknown'
        };
        this.items.push(item);
        this._onScroll(item, Math.max(document.documentElement.clientHeight, window.innerHeight));

        if (!this.started) {
            this.start();
        }
    };

    ScrollTracker.prototype.start = function () {
        if (!this.started) {
            $(window).on('scroll.scrollTracker', $.proxy(this.onScroll, this));
            this.started = true;
        }
    };

    ScrollTracker.prototype.onScroll = function (e) {
        var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);

        for (var i = 0; i < this.items.length; i++) {
            this._onScroll(this.items[i], viewHeight);
        }
    };

    ScrollTracker.prototype._onScroll = function (item, viewHeight) {
        var rect = item.$el[0].getBoundingClientRect(),
            isBigPlayer = rect.height > viewHeight * 0.7,
            isVisible = true;

        if (item.mode === 'partly-visible') {
            if ((isBigPlayer && (rect.bottom < 0 || rect.top >= rect.height))) {
                isVisible = false;
            } else if (!isBigPlayer && (rect.bottom - rect.height < 0 || rect.top - viewHeight + rect.height >= 0)) {
                isVisible = false;
            }
        } else if (item.mode === 'not-visible') {
            isVisible = rect.top - viewHeight < 0 && rect.top + rect.height > 0;
        }

        if (isVisible === false) {
            if (item.state !== 'hidden') {
                if (typeof item.onHide === 'function') {
                    item.onHide();
                }
                item.state = 'hidden';
            }
        } else {
            if (item.state !== 'visible') {
                if (typeof item.onVisible === 'function') {
                    item.onVisible();
                }
                item.state = 'visible';
            }
        }

    };

    return new ScrollTracker();
});
N2D('SmartSliderApi', function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @constructor
     */
    function SmartSliderApi() {
        this.sliders = {};
        this.readys = {};

    }

    SmartSliderApi.prototype.makeReady = function (id, slider) {
        this.sliders[id] = slider;
        if (typeof this.readys[id] !== 'undefined') {
            for (var i = 0; i < this.readys[id].length; i++) {
                this.readys[id][i].call(slider, slider, slider.sliderElement);
            }
        }
    };

    SmartSliderApi.prototype.ready = function (id, callback) {
        if (typeof this.sliders[id] !== 'undefined') {
            callback.call(this.sliders[id], this.sliders[id], this.sliders[id].sliderElement);
        } else {
            if (typeof this.readys[id] == 'undefined') {
                this.readys[id] = [];
            }
            this.readys[id].push(callback);
        }
    };

    SmartSliderApi.prototype.trigger = function (el, e) {
        var $el = $(el),
            parts = e.split(','),
            slide = $el.closest('.n2-ss-slide,.n2-ss-static-slide'),
            lastEvent = slide.data('ss-last-event');

        if (!$el.data('ss-reset-events')) {
            $el.data('ss-reset-events', 1);

            slide.on('layerAnimationPlayIn.resetCounter', $.proxy(function (slide) {
                slide.data('ss-last-event', '');
            }, this, slide));
        }

        var match = parts.length - 1;
        for (var i = 0; i < parts.length; i++) {

            if (parts[i] === lastEvent) {
                match = i;
            }
        }
        if (match === parts.length - 1) {
            e = parts[0];
        } else {
            e = parts[match + 1];
        }

        slide.data('ss-last-event', e);
        slide.triggerHandler('ss' + e);
    };

    SmartSliderApi.prototype.applyAction = function (e, action) {

        if (this.isClickAllowed(e)) {
            var el = e.currentTarget,
                ss = $(el).closest('.n2-ss-slider').data('ss');
            ss[action].apply(ss, Array.prototype.slice.call(arguments, 2));
        }
    };

    SmartSliderApi.prototype.applyActionWithClick = function (e) {
        if (!nextend.shouldPreventClick) {
            e.preventDefault();
            this.applyAction.apply(this, arguments);
        }
    };

    SmartSliderApi.prototype.isClickAllowed = function (e) {

        /**
         * Check for nested click events
         */
        return !$.contains(e.currentTarget, $(e.target).closest('a[href!="#"], *[onclick][onclick!=""], *[data-n2click][data-n2click!=""], *[n2-lightbox]').get(0));
    };

    SmartSliderApi.prototype.openUrl = function (e, target) {
        if (this.isClickAllowed(e)) {
            var $el = $(e.currentTarget),
                href = $el.data('href');
            if (typeof target === 'undefined') {
                target = $el.data('target');
            }

            if (target === '_blank') {
                var w = window.open();
                w.opener = null;
                w.location = href;
            } else {
                n2const.setLocation(href);
            }
        }
    };

    var scroll = {
        to: function (top) {
            $("html, body").animate({scrollTop: top}, window.n2ScrollSpeed || 400);
        },
        top: function () {
            scroll.to(0);
        },
        bottom: function () {
            scroll.to($(document).height() - $(window).height());
        },
        before: function (el) {
            scroll.to(el.offset().top - $(window).height());
        },
        after: function (el) {
            scroll.to(el.offset().top + el.height());
        },
        next: function (el, selector) {
            var els = $(selector),
                nextI = -1;
            els.each(function (i, slider) {
                if ($(el).is(slider) || $.contains(slider, el)) {
                    nextI = i + 1;
                    return false;
                }
            });
            if (nextI !== -1 && nextI <= els.length) {
                scroll.element(els.eq(nextI));
            }
        },
        previous: function (el, selector) {
            var els = $(selector),
                prevI = -1;
            els.each(function (i, slider) {
                if ($(el).is(slider) || $.contains(slider, el)) {
                    prevI = i - 1;
                    return false;
                }
            });
            if (prevI >= 0) {
                scroll.element(els.eq(prevI));
            }
        },
        element: function (selector) {
            scroll.to($(selector).offset().top);
        }
    };

    SmartSliderApi.prototype.scroll = function (e, fnName) {

        if (this.isClickAllowed(e)) {
            e.preventDefault();
            scroll[fnName].apply(window, Array.prototype.slice.call(arguments, 2));
        }
    };

    window.n2ss = new SmartSliderApi();

    return SmartSliderApi;
});

N2D('SmartSliderAbstract', function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param elementID
     * @param parameters
     * @constructor
     */
    function SmartSliderAbstract(elementID, parameters) {

        /**
         * @type {N2Classes.EditorAbstract}
         */
        this.editor = null;

        this.startedDeferred = $.Deferred();
        this.visibleDeferred = $.Deferred();

        if (elementID instanceof $) {
            elementID = '#' + elementID.attr('id');
        }

        var id = elementID.substr(1);
        this.elementID = id;

        if (window[id] && window[id] instanceof SmartSliderAbstract) {
            if (window[id].sliderElement === undefined) {
                console.error('Slider [#' + id + '] inited multiple times');
                return;
            } else if ($.contains(document.body, window[id].sliderElement.get(0))) {
                console.error('Slider [#' + id + '] embedded multiple times');
                return;
            }
        }

        this.readyDeferred = $.Deferred();

        N2D(elementID, $.proxy(function () {
            return this;
        }, this));

        this.isAdmin = !!parameters.admin;

        this.id = parseInt(id.replace('n2-ss-', ''));

        // Register our object to a global variable
        window[id] = this;

        if (parameters.isDelayed !== undefined && parameters.isDelayed) {
            $(window).ready($.proxy(function () {
                this.waitForExists(id, parameters);
            }, this));
        } else {
            this.waitForExists(id, parameters);
        }

    }

    SmartSliderAbstract.prototype.kill = function () {
        this.killed = true;
        var id = this.sliderElement.attr('id');
        var $placeholder = $('#' + id + '-placeholder');
        if ($placeholder.length) {
            $placeholder.remove();
        } else {
            N2R('documentReady', function ($) {
                $('#' + id + '-placeholder').remove();
            });
        }

        var $margin = this.sliderElement.closest('.n2-ss-margin');
        if ($margin.length) {
            $margin.remove();
        } else {
            N2R('documentReady', $.proxy(function ($) {
                this.sliderElement.closest('.n2-ss-margin').remove();
            }, this));
        }

        var $align = this.sliderElement.closest('.n2-ss-align');
        if ($align.length) {
            $align.remove();
        } else {
            N2R('documentReady', $.proxy(function ($) {
                this.sliderElement.closest('.n2-ss-align').remove();
            }, this));
        }

        /**
         * If the killed slider has a dependency we force them to show
         */
        n2ss.makeReady(this.id, this);
        this.readyDeferred.resolve();
    };

    SmartSliderAbstract.prototype.waitForExists = function (id, parameters) {
        var deferred = $.Deferred(),
            existsCheck = function () {
                var $el = $('#' + id);
                if ($el.length) {
                    deferred.resolve($el);
                } else {
                    setTimeout(existsCheck, 500);
                }
            };
        deferred.done($.proxy(this.onSliderExists, this, id, parameters));

        existsCheck();
    };

    SmartSliderAbstract.prototype.onSliderExists = function (id, parameters, $sliderElement) {

        if ($sliderElement.prop('tagName') === 'TEMPLATE') {
            var dependency = $sliderElement.data('dependency'),
                delay = $sliderElement.data('delay'),
                rocketLoad = $.proxy(function () {
                    var rocketSlider = $($sliderElement.html());
                    $sliderElement.replaceWith(rocketSlider);

                    this.waitForDimension($('#' + id), parameters);

                    $(window).triggerHandler('n2Rocket', [this.sliderElement]);
                }, this);
            if (dependency && $('#n2-ss-' + dependency).length) {
                n2ss.ready(dependency, $.proxy(function (slider) {
                    slider.ready(rocketLoad);
                }, this));
            } else if (delay) {
                setTimeout(rocketLoad, delay);
            } else {
                rocketLoad();
            }
        } else {

            this.waitForDimension($sliderElement, parameters);
        }
    };

    SmartSliderAbstract.prototype.waitForDimension = function ($sliderElement, parameters) {
        var deferred = $.Deferred(),
            startDimensionCheck = function () {
                var hasDimension = $sliderElement.is(':visible');
                if (hasDimension) {
                    deferred.resolve();
                } else {
                    setTimeout(startDimensionCheck, 200);
                }
            };
        startDimensionCheck();
        deferred
            .done($.proxy(this.onSliderHasDimension, this, $sliderElement, parameters));
    };

    SmartSliderAbstract.prototype.initCSS = function () {

        if (this.parameters.css) {
            $('<style type="text/css">' + this.parameters.css + '</style>')
                .appendTo('head');
        }
    };

    SmartSliderAbstract.prototype.onSliderHasDimension = function ($sliderElement, parameters) {
        this.killed = false;

        if (n2const.isIE) {
            $sliderElement.attr('data-ie', n2const.isIE);
        } else if (n2const.isEdge) {
            $sliderElement.attr('data-ie', n2const.isEdge);
        }

        this.slideClass = this.slideClass || 'FrontendSliderSlide';

        /**
         * @type {N2Classes.SmartSliderResponsive}
         */
        this.responsive = false;
        this.mainAnimationLastChangeTime = 0;

        /**
         * @type {N2Classes.FrontendSliderSlide}
         */
        this.currentSlide = null;
        this.currentRealSlide = null;
        this.staticSlide = false;
        this.isShuffled = false;

        /**
         * @type {N2Classes.FrontendSliderSlide[]}
         */
        this.slides = [];

        this.visibleSlides = 1;

        this.sliderElement = $sliderElement.data('ss', this);

        this.needBackgroundWrap = false;

        /**
         * Block carousel in vertical touch + revert
         * @type {boolean}
         */
        this.blockCarousel = false;

        this.parameters = $.extend({
            admin: false,
            playWhenVisible: 1,
            playWhenVisibleAt: 0.5,
            perspective: 1000,
            callbacks: '',
            autoplay: {},
            blockrightclick: false,
            maintainSession: 0,
            align: 'normal',
            controls: {
                touch: 'horizontal',
                keyboard: false,
                mousewheel: false,
                blockCarouselInteraction: 1
            },
            hardwareAcceleration: true,
            layerMode: {
                playOnce: 0,
                playFirstLayer: 1,
                mode: 'skippable',
                inAnimation: 'mainInEnd'
            },
            foreverLayerAnimation: false,
            parallax: {
                enabled: 0,
                mobile: 0,
                horizontal: 'mouse',
                vertical: 'mouse',
                origin: 'enter'
            },
            load: {},
            mainanimation: {},
            randomize: {
                randomize: 0,
                randomizeFirst: 0
            },
            responsive: {},
            lazyload: {
                enabled: 0
            },
            postBackgroundAnimations: false,
            initCallbacks: [],
            dynamicHeight: 0,
            lightbox: [],
            lightboxDeviceImages: [],
            titles: [],
            descriptions: [],
            allowBGImageAttachmentFixed: 1,
            backgroundParallax: {
                strength: 0,
                tablet: 0,
                mobile: 0
            },
            particlejs: 0
        }, parameters);

        this.disabled = {
            layerAnimations: false,
            layerSplitTextAnimations: false,
            backgroundAnimations: false,
            postBackgroundAnimations: false
        };

        if (n2const.isSamsungBrowser) {
            this.disabled.layerSplitTextAnimations = true;
            this.disabled.postBackgroundAnimations = true;
        }

        if (!this.isAdmin) {
            if (!parameters.responsive.desktop || !parameters.responsive.tablet || !parameters.responsive.mobile) {
                var md = new MobileDetect(window.navigator.userAgent, 801),
                    isTablet = !!md.tablet(),
                    isMobile = !!md.phone();

                if (!parameters.responsive.mobile && isMobile || !parameters.responsive.tablet && isTablet || !parameters.responsive.desktop && !isTablet && !isMobile) {
                    this.kill();
                    return;
                }
            }
        }

        this.initCSS();

        this.firstSlideReady = $.Deferred();

        try {
            eval(this.parameters.callbacks);
        } catch (e) {
            console.error(e);
        }

        this.startVisibilityCheck();
        n2ss.makeReady(this.id, this);


        this.widgetDeferreds = [];
        this.sliderElement.on('addWidget', $.proxy(this.addWidget, this));

        if (this.isAdmin) {
            this.changeTo = function () {
            };
        }

        this.load = new N2Classes.SmartSliderLoad(this, this.parameters.load);

        this.backgrounds = new N2Classes.SmartSliderBackgrounds(this);

        this.__initSlides();

        $.when(this.overrideFirstSlide()).done($.proxy(this.onFirstSlideInitialized, this));

        if (navigator.userAgent.match('UCBrowser')) {
            $('html').addClass('n2-ucbrowser');
        }
    };

    SmartSliderAbstract.prototype.overrideFirstSlide = function () {
        if (typeof window['ss' + this.id] !== 'undefined') {
            if (typeof window['ss' + this.id] === 'object') {
                return window['ss' + this.id].done($.proxy(function (forceActiveSlideIndex) {
                    if (forceActiveSlideIndex !== null) {
                        this.changeActiveBeforeLoad(forceActiveSlideIndex);
                    }
                }, this))
            } else {
                var forceActiveSlideIndex = typeof window['ss' + this.id] !== 'undefined' ? parseInt(window['ss' + this.id]) : null;
                if (forceActiveSlideIndex !== null) {
                    this.changeActiveBeforeLoad(forceActiveSlideIndex);
                }
            }
        } else {
            if (!this.isAdmin && this.parameters.maintainSession && typeof sessionStorage !== 'undefined') {
                var sessionIndex = sessionStorage.getItem('ss-' + this.id);
                if (sessionIndex !== null) {
                    this.changeActiveBeforeLoad(parseInt(sessionIndex));
                }
                this.sliderElement.on('mainAnimationComplete', $.proxy(function (e, animation, previous, next) {
                    sessionStorage.setItem('ss-' + this.id, next);
                }, this));
            }
        }

        return true;
    };

    SmartSliderAbstract.prototype.changeActiveBeforeLoad = function (index) {
        if (index >= 0 && index < this.realSlides.length && this.starterSlide !== this.realSlides[index]) {

            this.unsetActiveSlide(this.starterSlide);

            this.starterSlide = this.realSlides[index];

            this.setActiveSlide(this.realSlides[index]);
        }
    };

    SmartSliderAbstract.prototype.startCurrentSlideIndex = function () {

        this.currentRealSlide = this.currentSlide = this.starterSlide;

        this.setActiveSlide(this.currentSlide);

        if (!parseInt(this.parameters.carousel)) {
            this.initNotCarousel();
        } else {
            this.initCarousel();
        }
    };

    SmartSliderAbstract.prototype.onFirstSlideInitialized = function () {
        //Prepare linked list of slides
        for (var i = 0; i < this.realSlides.length; i++) {
            this.realSlides[i].setNext(this.realSlides[i + 1 > this.realSlides.length - 1 ? 0 : i + 1]);
        }

        this.startCurrentSlideIndex();
        this.firstSlideReady.resolve(this.currentSlide);

        for (var j = 0; j < this.parameters.initCallbacks.length; j++) {
            (new Function('$', this.parameters.initCallbacks[j])).call(this, $);
        }

        if (this.disableLayerAnimations === true) {
            this.disabled.layerAnimations = true;
        }

        this.widgets = new N2Classes.SmartSliderWidgets(this);

        this.sliderElement.on({
            universalenter: $.proxy(function (e) {
                if (!$(e.target).closest('.n2-full-screen-widget').length) {
                    this.sliderElement.addClass('n2-hover');
                    this.widgets.setState('hover', true);
                }
            }, this),
            universalleave: $.proxy(function (e) {
                e.stopPropagation();
                this.sliderElement.removeClass('n2-hover');
                this.widgets.setState('hover', false);
            }, this)
        });


        this.controls = {};

        if (this.parameters.blockrightclick) {
            this.sliderElement.bind("contextmenu", function (e) {
                e.preventDefault();
            });
        }

        this.initMainAnimation();
        this.initResponsiveMode();

        if (this.killed) {
            return;
        }

        try {
            var removeHoverClassCB = $.proxy(function () {
                this.sliderElement.removeClass('n2-has-hover');
                this.sliderElement[0].removeEventListener('touchstart', removeHoverClassCB, window.n2const.passiveEvents ? {passive: true} : false);
            }, this);
            this.sliderElement[0].addEventListener('touchstart', removeHoverClassCB, window.n2const.passiveEvents ? {passive: true} : false);
        } catch (e) {
        }

        this.initControls();

        this.startedDeferred.resolve(this);

        if (!this.isAdmin) {
            var event = 'click';
            if (this.hasTouch()) {
                event = 'n2click';
            }
            this.sliderElement.find('[data-n2click]').each(function (i, el) {
                var el = $(el);
                el.on(event, function (event) {
                    eval(el.data('n2click'));
                });
            });

            this.sliderElement.find('[data-click]').each(function (i, el) {
                var el = $(el).on('click', function (event) {
                    eval(el.data('click'));
                }).css('cursor', 'pointer');
            });

            this.sliderElement.find('[data-n2middleclick]').on('mousedown', function (event) {
                var el = $(this);
                if (event.which == 2 || event.which == 4) {
                    event.preventDefault();
                    eval(el.data('n2middleclick'));
                }
            });

            this.sliderElement.find('[data-mouseenter]').each(function (i, el) {
                var el = $(el).on('mouseenter', function (event) {
                    eval(el.data('mouseenter'));
                });
            });

            this.sliderElement.find('[data-mouseleave]').each(function (i, el) {
                var el = $(el).on('mouseleave', function (event) {
                    eval(el.data('mouseleave'));
                });
            });

            this.sliderElement.find('[data-play]').each(function (i, el) {
                var el = $(el).on('n2play', function (event) {
                    eval(el.data('play'));
                });
            });

            this.sliderElement.find('[data-pause]').each(function (i, el) {
                var el = $(el).on('n2pause', function (event) {
                    eval(el.data('pause'));
                });
            });

            this.sliderElement.find('[data-stop]').each(function (i, el) {
                var el = $(el).on('n2stop', function (event) {
                    eval(el.data('stop'));
                });
            });


            if (window.n2FocusAllowed === undefined) {
                window.n2FocusAllowed = false;

                $(window).on({
                    keydown: function () {
                        window.n2FocusAllowed = true;
                    },
                    keyup: function () {
                        window.n2FocusAllowed = false;
                    }
                });
            }

            this.sliderElement.find('a').on({
                focus: $.proxy(function (e) {
                    if (n2FocusAllowed) {
                        var slide = this.findSlideByElement(e.currentTarget);
                        if (slide && slide !== this.currentRealSlide) {
                            this.directionalChangeToReal(slide.index);
                        }
                    }
                }, this)
            });

        }

        this.preReadyResolve();

        this.sliderElement.find('[role="button"],[tabindex]').not('input,select,textarea')
            .keypress(function (event) {
                if (event.charCode === 32 || event.charCode === 13) {
                    event.preventDefault();
                    $(event.target)
                        .click()
                        .triggerHandler('n2Activate');
                }
            })
            .on('mouseleave', function (e) {
                $(e.currentTarget).blur();
            });
    };

    SmartSliderAbstract.prototype.__initSlides = function () {

        var $slides = this.sliderElement.find('.n2-ss-slide');
        for (var i = 0; i < $slides.length; i++) {
            this.slides.push(new N2Classes[this.slideClass](this, $slides.eq(i), i));
        }

        this.starterSlide = this.slides[0];
        for (var i = 0; i < this.slides.length; i++) {
            this.slides[i].init();
            if (this.slides[i].$element.data('first') == 1) {
                this.starterSlide = this.slides[i];
            }
        }

        /**
         * @type {N2Classes.FrontendSliderSlide[]}
         */
        this.realSlides = this.slides;

        this.afterRawSlidesReady();

        this.randomize(this.slides);

        var staticSlide = this.sliderElement.find('.n2-ss-static-slide');
        if (staticSlide.length) {
            this.staticSlide = new N2Classes.FrontendSliderStaticSlide(this, staticSlide);
        }
    };

    SmartSliderAbstract.prototype.afterRawSlidesReady = function () {

    };

    SmartSliderAbstract.prototype.setVisibleSlides = function (visibleSlides) {
        if (visibleSlides !== this.visibleSlides) {
            this.visibleSlides = visibleSlides;
            this.sliderElement.triggerHandler('visibleSlidesChanged');
        }
    };

    SmartSliderAbstract.prototype.getVisibleSlides = function (relativeSlide) {
        if (relativeSlide === undefined) relativeSlide = this.currentSlide;
        return [relativeSlide];
    };

    SmartSliderAbstract.prototype.getActiveSlidesCompat = function (relativeSlide) {

        return this.getVisibleSlides(relativeSlide);
    };

    SmartSliderAbstract.prototype.findSlideBackground = function (slide) {
        return slide.$element.find('.n2-ss-slide-background');
    };

    SmartSliderAbstract.prototype.getRealIndex = function (index) {
        return index;
    };

    SmartSliderAbstract.prototype.randomize = function (slides) {
        this.randomizeFirst();

        if (this.parameters.randomize.randomize) {
            this.shuffleSlides(slides);
        }
    };

    SmartSliderAbstract.prototype.randomizeFirst = function () {
        if (this.parameters.randomize.randomizeFirst) {
            this.unsetActiveSlide(this.starterSlide);

            this.starterSlide = this.realSlides[Math.floor(Math.random() * this.realSlides.length)];

            this.setActiveSlide(this.starterSlide);
        }
    };

    SmartSliderAbstract.prototype.shuffleSlides = function (slides) {

        slides.sort(function () {
            return 0.5 - Math.random();
        });
        var $container = slides[0].$element.parent();
        for (var i = 0; i < slides.length; i++) {
            slides[i].$element.appendTo($container);
            slides[i].setIndex(i);
        }

        this.isShuffled = true;
    };

    SmartSliderAbstract.prototype.addWidget = function (e, deferred) {
        this.widgetDeferreds.push(deferred);
    };

    SmartSliderAbstract.prototype.started = function (fn) {
        this.startedDeferred.done($.proxy(fn, this));
    };

    SmartSliderAbstract.prototype.preReadyResolve = function () {
        // Hack to allow time to widgets to register
        setTimeout($.proxy(this._preReadyResolve, this), 1);
    };

    SmartSliderAbstract.prototype._preReadyResolve = function () {

        this.load.start();
        this.load.loaded($.proxy(this.readyResolve, this));
    };

    SmartSliderAbstract.prototype.readyResolve = function () {
        n2c.log('Slider ready');
        $(window).scroll(); // To force other sliders to recalculate the scroll position

        this.readyDeferred.resolve();
    };

    SmartSliderAbstract.prototype.ready = function (fn) {
        this.readyDeferred.done($.proxy(fn, this));
    };

    SmartSliderAbstract.prototype.startVisibilityCheck = function () {

        if (!this.isAdmin && this.parameters.playWhenVisible) {
            this.ready($.proxy(function () {
                $(window).on('scroll.n2-ss-visible' + this.id + ' resize.n2-ss-visible' + this.id, $.proxy(this.checkIfVisible, this));
                this.checkIfVisible();
            }, this));
        } else {
            this.ready($.proxy(function () {
                this.visibleDeferred.resolve();
            }, this));
        }
    };

    SmartSliderAbstract.prototype.checkIfVisible = function () {
        var playWhenVisibleAt = this.parameters.playWhenVisibleAt,
            windowOffsetTop = $(window).scrollTop(),
            windowHeight = $(window).height(),
            bodyHeight = $(document).height(),
            sliderBoundingClientRect = this.sliderElement[0].getBoundingClientRect(),
            requiredVisibility = windowHeight * playWhenVisibleAt / 2,
            topLine = windowOffsetTop + requiredVisibility,
            bottomLine = windowOffsetTop + windowHeight - requiredVisibility;

        if (windowOffsetTop < requiredVisibility) {
            topLine *= (windowOffsetTop / requiredVisibility);
        }

        if (windowOffsetTop + windowHeight > bodyHeight - requiredVisibility) {
            bottomLine += windowOffsetTop + windowHeight - bodyHeight + requiredVisibility;
        }

        var sliderAbsoluteTop = windowOffsetTop + sliderBoundingClientRect.top,
            sliderAbsoluteBottom = windowOffsetTop + sliderBoundingClientRect.bottom;

        if (this.isAdmin || (sliderAbsoluteTop <= bottomLine && sliderAbsoluteTop >= topLine) || (sliderAbsoluteBottom >= topLine && sliderAbsoluteBottom <= bottomLine) || (sliderAbsoluteTop <= topLine && sliderAbsoluteBottom >= bottomLine)) {
            $(window).off('.n2-ss-visible' + this.id);
            this.visibleDeferred.resolve();
        }
    };

    SmartSliderAbstract.prototype.visible = function (fn) {
        this.visibleDeferred.done($.proxy(fn, this));
    };

    SmartSliderAbstract.prototype.isPlaying = function () {
        if (this.mainAnimation.getState() !== 'ended') {
            return true;
        }
        return false;
    };

    SmartSliderAbstract.prototype.focus = function (isSystem) {
        var needFocus = false;

        if (this.responsive.parameters.focusUser && !isSystem) {
            needFocus = true;
        }

        if (needFocus) {
            /**
             * .getBoundingClientRect() adjusted by the $(window).scrollTop()
             */
            var scrollTop = $(window).scrollTop(),
                focusOffsetTop = this.responsive.focusOffsetTop,
                focusOffsetBottom = this.responsive.focusOffsetBottom,
                windowHeight = $(window).height(),
                sliderBoundingClientRect = this.sliderElement[0].getBoundingClientRect(),
                topLine = sliderBoundingClientRect.top - focusOffsetTop,
                bottomLine = windowHeight - sliderBoundingClientRect.bottom - focusOffsetBottom;

            if (topLine <= 0 && bottomLine <= 0) {
                // Do nothing, slider is taller than the screen and the the slider on the screen
            } else if (topLine > 0 && bottomLine > 0) {
                // Do nothing, slider is shorter than the screen and the the slider on the screen
            } else {
                var targetTop = scrollTop;
                if (topLine < 0) {
                    if (-topLine <= bottomLine) {
                        // scroll to the top edge
                        targetTop = scrollTop - focusOffsetTop + sliderBoundingClientRect.top;
                    } else {
                        // scroll to the bottom edge
                        targetTop = scrollTop + focusOffsetBottom + sliderBoundingClientRect.bottom - windowHeight;
                    }
                } else if (bottomLine < 0) {
                    if (-bottomLine <= topLine) {
                        // scroll to the bottom edge
                        targetTop = scrollTop + focusOffsetBottom + sliderBoundingClientRect.bottom - windowHeight;
                    } else {
                        // scroll to the top edge
                        targetTop = scrollTop - focusOffsetTop + sliderBoundingClientRect.top;
                    }
                }

                if (targetTop !== scrollTop) {
                    return this._scrollTo(targetTop, Math.abs(scrollTop - targetTop));
                }
            }
        }

        return true;
    };

    SmartSliderAbstract.prototype._scrollTo = function (targetTop, duration) {

        var deferred = $.Deferred();
        window.nextendScrollFocus = true;

        $("html, body").animate({scrollTop: targetTop}, duration, $.proxy(function () {
            deferred.resolve();
            setTimeout(function () {
                window.nextendScrollFocus = false;
            }, 100);
        }, this));

        return deferred;
    };

    /**
     * Change is carousel if:
     * - first slide -> -1 slide not exists
     * - last slide -> +1 slide not exists
     */
    SmartSliderAbstract.prototype.isChangeCarousel = function (direction) {
        if (direction === 'next') {
            return this.currentSlide.index + 1 >= this.slides.length;
        } else if (direction === 'previous') {
            return this.currentSlide.index - 1 < 0;
        }

        return false;
    };

    SmartSliderAbstract.prototype.initNotCarousel = function () {
        this.next = function (isSystem, customAnimation) {
            var nextIndex = this.currentSlide.index + 1;
            if (nextIndex < this.slides.length) {
                return this.changeTo(nextIndex, false, isSystem, customAnimation);
            }
            return false;
        };
        this.previous = function (isSystem, customAnimation) {
            var nextIndex = this.currentSlide.index - 1;
            if (nextIndex >= 0) {
                return this.changeTo(nextIndex, true, isSystem, customAnimation);
            }
            return false;
        };
        this.isChangePossible = function (direction) {
            var nextIndex = false;
            if (direction === 'next') {
                nextIndex = this.currentSlide.index + 1;
                if (nextIndex >= this.slides.length) {
                    nextIndex = false;
                }
            } else if (direction === 'previous') {
                nextIndex = this.currentSlide.index - 1;
                if (nextIndex < 0) {
                    nextIndex = false;
                }
            }

            if (nextIndex !== false && nextIndex !== this.currentSlide.index) {
                return true;
            }
            return false;
        };

        var hideOrShowArrows = $.proxy(function (i) {
            if (i === 0) {
                this.widgets.setState('nonCarouselFirst', true);
            } else {
                this.widgets.setState('nonCarouselFirst', false);
            }
            if (i === this.slides.length - 1) {
                this.widgets.setState('nonCarouselLast', true);
            } else {
                this.widgets.setState('nonCarouselLast', false);
            }
        }, this);

        this.startedDeferred.done($.proxy(function () {
            hideOrShowArrows(this.currentSlide.index);
        }, this));

        this.sliderElement.on('sliderSwitchTo', function (e, i) {
            hideOrShowArrows(i);
        });
    };

    SmartSliderAbstract.prototype.isChangePossibleCarousel = function (direction) {
        var nextIndex = false;
        if (direction === 'next') {
            nextIndex = this.currentSlide.index + 1;
            if (nextIndex >= this.slides.length) {
                nextIndex = 0;
            }
        } else if (direction === 'previous') {
            nextIndex = this.currentSlide.index - 1;
            if (nextIndex < 0) {
                nextIndex = this.slides.length - 1;
            }
        }

        if (nextIndex !== false && nextIndex !== this.currentSlide.index) {
            return true;
        }
        return false;
    };

    SmartSliderAbstract.prototype.initCarousel = function () {

        this.next = this.nextCarousel;
        this.previous = this.previousCarousel;
        this.isChangePossible = this.isChangePossibleCarousel;
    };

    SmartSliderAbstract.prototype.nextCarousel = function (isSystem, customAnimation) {
        var nextIndex = this.currentSlide.index + 1;
        if (nextIndex >= this.slides.length) {
            nextIndex = 0;
        }
        return this.changeTo(nextIndex, false, isSystem, customAnimation);
    };

    SmartSliderAbstract.prototype.previousCarousel = function (isSystem, customAnimation) {
        var nextIndex = this.currentSlide.index - 1;
        if (nextIndex < 0) {
            nextIndex = this.slides.length - 1;
        }
        return this.changeTo(nextIndex, true, isSystem, customAnimation);
    };


    SmartSliderAbstract.prototype.directionalChangeToReal = function (nextSlideIndex) {
        this.directionalChangeTo(nextSlideIndex);
    };

    SmartSliderAbstract.prototype.directionalChangeTo = function (nextSlideIndex) {
        if (nextSlideIndex > this.currentSlide.index) {
            this.changeTo(nextSlideIndex, false);
        } else {
            this.changeTo(nextSlideIndex, true);
        }
    };

    SmartSliderAbstract.prototype.changeTo = function (nextSlideIndex, reversed, isSystem, customAnimation) {
        nextSlideIndex = parseInt(nextSlideIndex);

        if (nextSlideIndex !== this.currentSlide.index) {
            n2c.log('Event: sliderSwitchTo: ', 'targetSlideIndex');
            this.sliderElement.trigger('sliderSwitchTo', [nextSlideIndex, this.getRealIndex(nextSlideIndex)]);
            var time = $.now();
            $.when($.when.apply($, this.backgrounds.preLoadSlides(this.getVisibleSlides(this.slides[nextSlideIndex]))), this.focus(isSystem)).done($.proxy(function () {

                if (this.mainAnimationLastChangeTime <= time) {
                    this.mainAnimationLastChangeTime = time;
                    // If the current main animation haven't finished yet or the prefered next slide is the same as our current slide we have nothing to do
                    var state = this.mainAnimation.getState();
                    if (state === 'ended') {

                        if (typeof isSystem === 'undefined') {
                            isSystem = false;
                        }

                        var animation = this.mainAnimation;
                        if (typeof customAnimation !== 'undefined') {
                            animation = customAnimation;
                        }

                        this._changeTo(nextSlideIndex, reversed, isSystem, customAnimation);

                        n2c.log('Change From:', this.currentSlide.index, ' To: ', nextSlideIndex, ' Reversed: ', reversed, ' System: ', isSystem);
                        animation.changeTo(this.currentSlide, this.slides[nextSlideIndex], reversed, isSystem);

                        this._changeCurrentSlide(nextSlideIndex);

                    } else if (state === 'initAnimation' || state === 'playing') {
                        this.sliderElement.off('.fastChange').one('mainAnimationComplete.fastChange', $.proxy(function () {
                            this.changeTo.call(this, nextSlideIndex, reversed, isSystem, customAnimation);
                        }, this));
                        this.mainAnimation.timeScale(this.mainAnimation.timeScale() * 2);
                    }
                }
            }, this));
            return true;
        }
        return false;
    };

    SmartSliderAbstract.prototype._changeCurrentSlide = function (index) {
        this.currentRealSlide = this.currentSlide = this.slides[index];

        this.sliderElement.triggerHandler('sliderChangeCurrentSlide');
    };

    SmartSliderAbstract.prototype._changeTo = function (nextSlideIndex, reversed, isSystem, customAnimation) {

    };

    SmartSliderAbstract.prototype.revertTo = function (nextSlideIndex, originalNextSlideIndex) {

        this.unsetActiveSlide(this.slides[originalNextSlideIndex]);
        this.setActiveSlide(this.slides[nextSlideIndex]);

        this._changeCurrentSlide(nextSlideIndex);

        this.sliderElement.trigger('sliderSwitchTo', [nextSlideIndex, this.getRealIndex(nextSlideIndex)]);
    };

    SmartSliderAbstract.prototype.setActiveSlide = function (slide) {
        slide.$element.addClass('n2-ss-slide-active');
    };

    SmartSliderAbstract.prototype.unsetActiveSlide = function (slide) {
        slide.$element.removeClass('n2-ss-slide-active');
    };

    SmartSliderAbstract.prototype.findSlideByElement = function (element) {
        element = $(element);
        for (var i = 0; i < this.realSlides.length; i++) {
            if (this.realSlides[i].$element.has(element).length === 1) {
                return this.realSlides[i];
            }
        }
        return false;
    };

    SmartSliderAbstract.prototype.findSlideIndexByElement = function (element) {
        var slide = this.findSlideByElement(element);
        if (slide) {
            return slide;
        }
        return -1;
    };

    SmartSliderAbstract.prototype.initMainAnimation = function () {
        this.mainAnimation = false;
    };

    SmartSliderAbstract.prototype.initResponsiveMode = function () {
        this.dimensions = this.responsive.responsiveDimensions;
    };

    SmartSliderAbstract.prototype.hasTouch = function () {
        return this.parameters.controls.touch != '0' && this.slides.length > 1;
    };

    SmartSliderAbstract.prototype.initControls = function () {

        if (!this.parameters.admin) {
            if (this.hasTouch()) {
                switch (this.parameters.controls.touch) {
                    case 'vertical':
                        new N2Classes.SmartSliderControlTouchVertical(this);
                        break;
                    case 'horizontal':
                        new N2Classes.SmartSliderControlTouchHorizontal(this);
                        break;
                }
            }

            if (this.parameters.controls.keyboard) {
                if (typeof this.controls.touch !== 'undefined') {
                    new N2Classes.SmartSliderControlKeyboard(this, this.controls.touch.axis);
                } else {
                    new N2Classes.SmartSliderControlKeyboard(this, 'horizontal');
                }
            }

            if (this.parameters.controls.mousewheel) {
                new N2Classes.SmartSliderControlMouseWheel(this);
            }

            this.controlAutoplay = new N2Classes.SmartSliderControlAutoplay(this, this.parameters.autoplay);


            this.controlFullscreen = new N2Classes.SmartSliderControlFullscreen(this);

        }
    };

    SmartSliderAbstract.prototype.getSlideIndex = function (index) {
        return index;
    };

    SmartSliderAbstract.prototype.slideToID = function (id, direction) {
        for (var i = 0; i < this.realSlides.length; i++) {
            if (this.realSlides[i].id === id) {
                return this.slide(this.getSlideIndex(i), direction);
            }
        }

        var slider = $('[data-id="' + id + '"]').closest('.n2-ss-slider');

        if (slider.length && this.id === slider.data('ss').id) {
            return true;
        }

        if (slider.length) {
            $("html, body").animate({scrollTop: slider.offset().top}, 400);
            return slider.data('ss').slideToID(id, direction);
        }
    };

    SmartSliderAbstract.prototype.slide = function (index, direction) {
        if (index >= 0 && index < this.slides.length) {
            if (direction === undefined) {
                if (parseInt(this.parameters.carousel)) {
                    if (this.currentSlide.index === this.slides.length - 1 && index === 0) {
                        return this.next();
                    } else {
                        if (this.currentSlide.index > index) {
                            return this.changeTo(index, true);
                        } else {
                            return this.changeTo(index);
                        }
                    }
                } else {
                    if (this.currentSlide.index > index) {
                        return this.changeTo(index, true);
                    } else {
                        return this.changeTo(index);
                    }
                }
            } else {
                return this.changeTo(index, !direction);
            }
        }
        return false;
    };

    SmartSliderAbstract.prototype.startAutoplay = function (e) {
        if (typeof this.controlAutoplay !== 'undefined') {
            this.controlAutoplay.pauseAutoplayExtraPlayingEnded(e, 'autoplayButton');
            return true;
        }
        return false;
    };

    return SmartSliderAbstract;
});

N2D('SmartSliderWidgets', function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param slider
     * @constructor
     */
    function SmartSliderWidgets(slider) {
        this.slider = slider;
        this.sliderElement = slider.sliderElement.on('BeforeVisible', $.proxy(this.onReady, this));

        this.widgets = {};
        this.excludedSlides = {};
        this.states = {
            hover: false,
            nonCarouselFirst: false,
            nonCarouselLast: false,
            currentSlideIndex: -1,
            singleSlide: false
        };

        this.widgets = {
            previous: this.sliderElement.find('.nextend-arrow-previous'),
            next: this.sliderElement.find('.nextend-arrow-next'),
            bullet: this.sliderElement.find('.n2-ss-control-bullet'),
            autoplay: this.sliderElement.find('.nextend-autoplay'),
            indicator: this.sliderElement.find('.nextend-indicator'),
            bar: this.sliderElement.find('.nextend-bar'),
            thumbnail: this.sliderElement.find('.nextend-thumbnail'),
            shadow: this.sliderElement.find('.nextend-shadow'),
            fullscreen: this.sliderElement.find('.nextend-fullscreen'),
            html: this.sliderElement.find('.nextend-widget-html')
        };
    }

    SmartSliderWidgets.prototype.setState = function (name, value) {
        if (this.states[name] != value) {
            this.states[name] = value;

            var parts = name.split('.');
            switch (parts[0]) {
                case 'hide':
                    this.onStateChangeSingle(parts[1]);
                    break;
                case 'nonCarouselFirst':
                    this.onStateChangeSingle('previous');
                    break;
                case 'nonCarouselLast':
                    this.onStateChangeSingle('next');
                    break;
                default:
                    this.onStateChangeAll();
                    break;
            }
        }
    };

    SmartSliderWidgets.prototype.onStateChangeAll = function () {
        for (var k in this.widgets) {
            this.onStateChangeSingle(k);
        }
    };

    SmartSliderWidgets.prototype.onStateChangeSingle = function (widgetName) {
        if (this.widgets[widgetName].length) {
            var state = true;

            if (this.widgets[widgetName].hasClass('n2-ss-widget-display-hover')) {
                state = this.states.hover;
            }

            if (state) {
                if (widgetName === 'previous' && this.states.nonCarouselFirst) {
                    state = false;
                } else if (widgetName === 'next' && this.states.nonCarouselLast) {
                    state = false;
                }
            }

            if (state) {
                var key = widgetName + '-' + (this.states.currentSlideIndex + 1);
                if (this.excludedSlides[key]) {
                    state = false;
                }
            }

            if (state && this.states['hide.' + widgetName] !== undefined && this.states['hide.' + widgetName]) {
                state = false;
            }

            if (state && this.states['singleSlide']) {
                if (widgetName === 'previous' || widgetName === 'next' || widgetName === 'bullet' || widgetName === 'autoplay' || widgetName === 'indicator') {
                    state = false;
                }
            }

            this.widgets[widgetName].toggleClass('n2-ss-widget-hidden', !state);
        }
    };

    SmartSliderWidgets.prototype.onReady = function () {
        this.slider.sliderElement
            .on('slideCountChanged', $.proxy(function () {
                    this.setState('singleSlide', this.slider.slides.length <= 1);
                }, this)
            );

        this.dimensions = this.slider.dimensions;

        this.$vertical = this.sliderElement.find('[data-position="above"],[data-position="below"]').not('.nextend-shadow');

        var hasExcluded = false
        for (var k in this.widgets) {
            var exclude = this.widgets[k].attr('data-exclude-slides');
            if (exclude !== undefined) {
                var excludedSlides = exclude.split(',');
                for (var i = excludedSlides.length - 1; i >= 0; i--) {
                    var parts = excludedSlides[i].split('-');
                    if (parts.length === 2) {
                        var start = parseInt(parts[0]),
                            end = parseInt(parts[1]);
                        if (start <= end) {
                            for (var j = start; j <= end; j++) {
                                excludedSlides.push(j);
                            }
                        }
                    } else {
                        excludedSlides[i] = parseInt(excludedSlides[i]);
                    }
                }
                if (excludedSlides.length > 0) {
                    for (var i = 0; i < excludedSlides.length; i++) {
                        this.excludedSlides[k + '-' + excludedSlides[i]] = true;
                    }
                    hasExcluded = true;
                }
            }
        }
        if (hasExcluded) {

            var refreshSlideIndex = $.proxy(function (e, targetSlideIndex) {
                this.setState('currentSlideIndex', targetSlideIndex);
            }, this);

            refreshSlideIndex(null, this.slider.currentRealSlide.index);
            this.slider.sliderElement
                .on({
                    sliderSwitchTo: refreshSlideIndex
                });
        }

        this.variableElementsDimension = {
            width: this.sliderElement.find('[data-sswidth]'),
            height: this.sliderElement.find('[data-ssheight]')
        };

        this.variableElements = {
            top: this.sliderElement.find('[data-sstop]'),
            right: this.sliderElement.find('[data-ssright]'),
            bottom: this.sliderElement.find('[data-ssbottom]'),
            left: this.sliderElement.find('[data-ssleft]')
        };

        this.slider.sliderElement.on('SliderAnimatedResize', $.proxy(this.onAnimatedResize, this));
        this.slider.sliderElement.on('SliderResize', $.proxy(this.onResize, this));
        this.slider.sliderElement.one('slideCountChanged', $.proxy(function () {
            this.onResize(this.slider.responsive.lastRatios);
        }, this));

        this.onResize(this.slider.responsive.lastRatios);

        this.onStateChangeAll();
    };


    SmartSliderWidgets.prototype.onAnimatedResize = function (e, ratios, timeline, duration) {
        for (var key in this.widgets) {
            var el = this.widgets[key],
                visible = el.is(":visible");
            this.dimensions[key + 'width'] = visible ? el.outerWidth(false) : 0;
            this.dimensions[key + 'height'] = visible ? el.outerHeight(false) : 0;
        }

        // Compatibility variables for the old version
        this.dimensions['width'] = this.dimensions.slider.width;
        this.dimensions['height'] = this.dimensions.slider.height;
        this.dimensions['outerwidth'] = this.sliderElement.parent().width();
        this.dimensions['outerheight'] = this.sliderElement.parent().height();
        this.dimensions['canvaswidth'] = this.dimensions.slide.width;
        this.dimensions['canvasheight'] = this.dimensions.slide.height;
        this.dimensions['margintop'] = this.dimensions.slider.marginTop;
        this.dimensions['marginright'] = this.dimensions.slider.marginRight;
        this.dimensions['marginbottom'] = this.dimensions.slider.marginBottom;
        this.dimensions['marginleft'] = this.dimensions.slider.marginLeft;

        var variableText = '';
        for (var key in this.dimensions) {
            var value = this.dimensions[key];
            if (typeof value == "object") {
                for (var key2 in value) {
                    variableText += "var " + key + key2 + " = " + value[key2] + ";";
                }
            } else {
                variableText += "var " + key + " = " + value + ";";
            }
        }
        eval(variableText);

        for (var k in this.variableElementsDimension) {
            for (var i = 0; i < this.variableElementsDimension[k].length; i++) {
                var el = this.variableElementsDimension[k].eq(i);
                if (el.is(':visible')) {
                    var to = {};
                    try {
                        to[k] = eval(el.data('ss' + k)) + 'px';
                        for (var widget in this.widgets) {
                            if (this.widgets[widget].filter(el).length) {
                                if (k == 'width') {
                                    this.dimensions[widget + k] = el.outerWidth(false);
                                } else if (k == 'height') {
                                    this.dimensions[widget + k] = el.outerHeight(false);
                                }
                                eval(widget + k + " = " + this.dimensions[widget + k] + ";");
                            }
                        }
                    } catch (e) {
                        console.log(el, ' position variable: ' + e.message + ': ', el.data('ss' + k));
                    }
                    timeline.to(el, duration, to, 0);
                }
            }
        }

        for (var k in this.variableElements) {
            for (var i = 0; i < this.variableElements[k].length; i++) {
                var el = this.variableElements[k].eq(i);
                try {
                    var to = {};
                    to[k] = eval(el.data('ss' + k)) + 'px';
                    timeline.to(el, duration, to, 0);
                } catch (e) {
                    console.log(el, ' position variable: ' + e.message + ': ', el.data('ss' + k));
                }
            }
        }
    };


    SmartSliderWidgets.prototype.onResize = function (e, ratios, responsive, timeline) {
        if (timeline) {
            return;
        }


        for (var k in this.variableElements) {
            for (var i = 0; i < this.variableElements[k].length; i++) {
                var last = this.variableElements[k].data('n2Last' + k);
                if (last > 0) {
                    this.variableElements[k].css(k, 0);
                }
            }
        }

        for (var key in this.widgets) {
            var el = this.widgets[key],
                visible = el.length && el.is(":visible");
            if (el.length && el.is(":visible")) {
                this.dimensions[key + 'width'] = el.outerWidth(false);
                this.dimensions[key + 'height'] = el.outerHeight(false);

            } else {
                this.dimensions[key + 'width'] = 0;
                this.dimensions[key + 'height'] = 0;
            }
        }


        for (var k in this.variableElements) {
            for (var i = 0; i < this.variableElements[k].length; i++) {
                var last = this.variableElements[k].data('n2Last' + k);
                if (last > 0) {
                    this.variableElements[k].css(k, last);
                }
            }
        }

        // Compatibility variables for the old version
        this.dimensions['width'] = this.dimensions.slider.width;
        this.dimensions['height'] = this.dimensions.slider.height;
        this.dimensions['outerwidth'] = this.sliderElement.parent().width();
        this.dimensions['outerheight'] = this.sliderElement.parent().height();
        this.dimensions['canvaswidth'] = this.dimensions.slide.width;
        this.dimensions['canvasheight'] = this.dimensions.slide.height;
        this.dimensions['margintop'] = this.dimensions.slider.marginTop;
        this.dimensions['marginright'] = this.dimensions.slider.marginRight;
        this.dimensions['marginbottom'] = this.dimensions.slider.marginBottom;
        this.dimensions['marginleft'] = this.dimensions.slider.marginLeft;

        var variableText = '';
        for (var key in this.dimensions) {
            var value = this.dimensions[key];
            if (typeof value == "object") {
                for (var key2 in value) {
                    variableText += "var " + key + key2 + " = " + value[key2] + ";";
                }
            } else {
                variableText += "var " + key + " = " + value + ";";
            }
        }
        eval(variableText);

        for (var k in this.variableElementsDimension) {
            for (var i = 0; i < this.variableElementsDimension[k].length; i++) {
                var el = this.variableElementsDimension[k].eq(i);
                if (el.is(':visible')) {
                    try {
                        el.css(k, eval(el.data('ss' + k)) + 'px');
                        for (var widget in this.widgets) {
                            if (this.widgets[widget].filter(el).length) {
                                if (k == 'width') {
                                    this.dimensions[widget + k] = el.outerWidth(false);
                                } else if (k == 'height') {
                                    this.dimensions[widget + k] = el.outerHeight(false);
                                }
                                eval(widget + k + " = " + this.dimensions[widget + k] + ";");
                            }
                        }
                    } catch (e) {
                        console.log(el, ' position variable: ' + e.message + ': ', el.data('ss' + k));
                    }
                }
            }
        }

        for (var k in this.variableElements) {
            for (var i = 0; i < this.variableElements[k].length; i++) {
                var el = this.variableElements[k].eq(i);
                try {
                    var value = eval(el.data('ss' + k));
                    el.css(k, value + 'px');
                    el.data('n2Last' + k, value);
                } catch (e) {
                    console.log(el, ' position variable: ' + e.message + ': ', el.data('ss' + k));
                }
            }
        }

        this.slider.responsive.refreshStaticSizes();

    };

    return SmartSliderWidgets;
});
N2D('SmartSliderMainAnimationAbstract', function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param slider
     * @param parameters
     * @constructor
     */
    function SmartSliderMainAnimationAbstract(slider, parameters) {

        this.state = 'ended';
        this.isTouch = false;
        this.isReverseAllowed = true;
        this.isReverseEnabled = false;
        this.reverseSlideIndex = null;
        this.isNoAnimation = false;

        this.slider = slider;

        this.parameters = $.extend({
            duration: 1500,
            ease: 'easeInOutQuint'
        }, parameters);

        this.parameters.duration /= 1000;

        this.sliderElement = slider.sliderElement;

        this.timeline = new NextendTimeline({
            paused: true
        });

        this.sliderElement.on('mainAnimationStart', $.proxy(function (e, animation, currentSlideIndex, nextSlideIndex) {
            this._revertCurrentSlideIndex = currentSlideIndex;
            this._revertNextSlideIndex = nextSlideIndex;
        }, this));
    }

    SmartSliderMainAnimationAbstract.prototype.setToStarterSlide = function (slide) {

    };

    SmartSliderMainAnimationAbstract.prototype.enableReverseMode = function () {
        this.isReverseEnabled = true;

        this.reverseTimeline = new NextendTimeline({
            paused: true
        });

        this.sliderElement.triggerHandler('reverseModeEnabled', this.reverseSlideIndex);
    };

    SmartSliderMainAnimationAbstract.prototype.disableReverseMode = function () {
        this.isReverseEnabled = false;
    };

    SmartSliderMainAnimationAbstract.prototype.setTouch = function (direction) {
        this.isTouch = direction;
    };

    SmartSliderMainAnimationAbstract.prototype.setTouchProgress = function (progress) {

        if (this.state !== 'ended') {
            if (this.isReverseEnabled) {
                if (progress === 0) {
                    this.reverseTimeline.progress(0);
                    this.timeline.progress(progress, false);
                } else if (progress >= 0 && progress <= 1) {
                    this.reverseTimeline.progress(0);
                    this.timeline.progress(progress);
                } else if (progress < 0 && progress >= -1) {
                    this.timeline.progress(0);
                    this.reverseTimeline.progress(Math.abs(progress));
                }
            } else {
                if (progress <= 0) {
                    this.timeline.progress(Math.max(progress, 0.000001), false);
                } else if (progress >= 0 && progress <= 1) {
                    this.timeline.progress(progress);
                }
            }
        }
    };


    SmartSliderMainAnimationAbstract.prototype.setTouchEnd = function (hasDirection, progress, duration) {
        if (this.state != 'ended') {
            if (this.isReverseEnabled) {
                this._setTouchEndWithReverse(hasDirection, progress, duration);
            } else {
                this._setTouchEnd(hasDirection, progress, duration);
            }
        }
    };

    SmartSliderMainAnimationAbstract.prototype._setTouchEnd = function (hasDirection, progress, duration) {
        if (hasDirection && progress > 0) {
            this.fixTouchDuration(this.timeline, progress, duration);
            this.timeline.play();
        } else {
            this.revertCB(this.timeline);
            this.fixTouchDuration(this.timeline, 1 - progress, duration);
            this.timeline.reverse();

            this.willRevertTo(this._revertCurrentSlideIndex, this._revertNextSlideIndex);
        }
    };

    SmartSliderMainAnimationAbstract.prototype._setTouchEndWithReverse = function (hasDirection, progress, duration) {
        if (hasDirection) {
            if (progress < 0 && this.reverseTimeline.totalDuration() > 0) {
                this.fixTouchDuration(this.reverseTimeline, progress, duration);
                this.reverseTimeline.play();

                this.willRevertTo(this.reverseSlideIndex, this._revertNextSlideIndex);
            } else {

                this.willCleanSlideIndex(this.reverseSlideIndex);
                this.fixTouchDuration(this.timeline, progress, duration);
                this.timeline.play();
            }
        } else {
            if (progress < 0) {
                this.revertCB(this.reverseTimeline);
                this.fixTouchDuration(this.reverseTimeline, 1 - progress, duration);
                this.reverseTimeline.reverse();
            } else {
                this.revertCB(this.timeline);
                this.fixTouchDuration(this.timeline, 1 - progress, duration);
                this.timeline.reverse();
            }

            this.willCleanSlideIndex(this.reverseSlideIndex);

            this.willRevertTo(this._revertCurrentSlideIndex, this._revertNextSlideIndex);
        }
    };

    SmartSliderMainAnimationAbstract.prototype.fixTouchDuration = function (timeline, progress, duration) {
        var totalDuration = timeline.totalDuration(),
            modifiedDuration = Math.max(totalDuration / 3, Math.min(totalDuration, duration / Math.abs(progress) / 1000));
        if (modifiedDuration !== totalDuration) {
            timeline.totalDuration(modifiedDuration);
        }
    };

    SmartSliderMainAnimationAbstract.prototype.getState = function () {
        return this.state;
    };

    SmartSliderMainAnimationAbstract.prototype.timeScale = function () {
        if (arguments.length > 0) {
            this.timeline.timeScale(arguments[0]);
            return this;
        }
        return this.timeline.timeScale();
    };

    SmartSliderMainAnimationAbstract.prototype.changeTo = function (currentSlide, nextSlide, reversed, isSystem) {

        this._initAnimation(currentSlide, nextSlide, reversed);

        this.state = 'initAnimation';

        this.timeline.paused(true);
        this.timeline.eventCallback('onStart', this.onChangeToStart, [currentSlide, nextSlide, isSystem], this);
        this.timeline.eventCallback('onComplete', this.onChangeToComplete, [currentSlide, nextSlide, isSystem], this);
        this.timeline.eventCallback('onReverseComplete', null);

        this.revertCB = $.proxy(function (timeline) {
            timeline.eventCallback('onReverseComplete', this.onReverseChangeToComplete, [nextSlide, currentSlide, isSystem], this);
        }, this);

        if (this.slider.parameters.dynamicHeight) {
            var tl = new NextendTimeline();
            this.slider.responsive.doResize(null, tl, nextSlide, 0.6);
            this.timeline.add(tl);
        }
        if (!this.isTouch) {
            this.timeline.play();
        }
    
    };


    SmartSliderMainAnimationAbstract.prototype.willRevertTo = function (slideIndex, originalNextSlideIndex) {

        this.sliderElement.triggerHandler('mainAnimationWillRevertTo', [slideIndex, originalNextSlideIndex]);

        this.sliderElement.one('mainAnimationComplete', $.proxy(this.revertTo, this, slideIndex, originalNextSlideIndex));
    };


    SmartSliderMainAnimationAbstract.prototype.revertTo = function (slideIndex, originalNextSlideIndex) {
        this.slider.revertTo(slideIndex, originalNextSlideIndex);

        // Cancel the pre-initialized layer animations on the original next slide.
        this.slider.slides[originalNextSlideIndex].triggerHandler('mainAnimationStartInCancel');
    };


    SmartSliderMainAnimationAbstract.prototype.willCleanSlideIndex = function (slideIndex) {

        this.sliderElement.one('mainAnimationComplete', $.proxy(this.cleanSlideIndex, this, slideIndex));
    };

    SmartSliderMainAnimationAbstract.prototype.cleanSlideIndex = function () {

    };

    /**
     * @abstract
     * @param currentSlide
     * @param nextSlide
     * @param reversed
     * @private
     */
    SmartSliderMainAnimationAbstract.prototype._initAnimation = function (currentSlide, nextSlide, reversed) {

    };

    SmartSliderMainAnimationAbstract.prototype.onChangeToStart = function (previousSlide, currentSlide, isSystem) {

        this.state = 'playing';

        var parameters = [this, previousSlide.index, currentSlide.index, isSystem];

        n2c.log('Event: mainAnimationStart: ', parameters, '{NextendSmartSliderMainAnimationAbstract}, previousSlideIndex, currentSlideIndex, isSystem');
        this.sliderElement.trigger('mainAnimationStart', parameters);

        this.slider.slides[previousSlide.index].trigger('mainAnimationStartOut', parameters);
        this.slider.slides[currentSlide.index].trigger('mainAnimationStartIn', parameters);
    };

    SmartSliderMainAnimationAbstract.prototype.onChangeToComplete = function (previousSlide, currentSlide, isSystem) {
        var parameters = [this, previousSlide.index, currentSlide.index, isSystem];

        this.clearTimelines();

        this.disableReverseMode();

        this.slider.slides[previousSlide.index].trigger('mainAnimationCompleteOut', parameters);
        this.slider.slides[currentSlide.index].trigger('mainAnimationCompleteIn', parameters);

        this.state = 'ended';

        n2c.log('Event: mainAnimationComplete: ', parameters, '{NextendSmartSliderMainAnimationAbstract}, previousSlideIndex, currentSlideIndex, isSystem');
        this.sliderElement.trigger('mainAnimationComplete', parameters);
    };

    SmartSliderMainAnimationAbstract.prototype.onReverseChangeToComplete = function (previousSlide, currentSlide, isSystem) {
        SmartSliderMainAnimationAbstract.prototype.onChangeToComplete.apply(this, arguments);
    };

    SmartSliderMainAnimationAbstract.prototype.clearTimelines = function () {
        // When the animation done, clear the timeline
        this.revertCB = function () {
        };
        this.timeline.clear();
        this.timeline.timeScale(1);

    };

    SmartSliderMainAnimationAbstract.prototype.getEase = function () {
        if (this.isTouch) {
            return 'linear';
        }
        return this.parameters.ease;
    };

    return SmartSliderMainAnimationAbstract;
});
N2D('SmartSliderControlAutoplay', function ($, undefined) {
    "use strict";

    var preventMouseEnter = false;

    /**
     * @memberOf N2Classes
     *
     * @param slider
     * @param parameters
     * @constructor
     */
    function SmartSliderControlAutoplay(slider, parameters) {
        this._paused = true;
        this._wait = false;
        this._disabled = false;
        this._currentCount = 0;
        this._progressEnabled = false;
        this.timeline = null;

        this.hasButton = false;

        this.deferredsMediaPlaying = null;
        this.deferredMouseLeave = null;
        this.deferredMouseEnter = null;
        this.mainAnimationDeferred = true;
        this.autoplayDeferred = null;

        this.slider = slider;

        this.parameters = $.extend({
            enabled: 0,
            start: 1,
            duration: 8000,
            autoplayToSlide: 0,
            autoplayToSlideIndex: -1,
            allowReStart: 0,
            pause: {
                mouse: 'enter',
                click: true,
                mediaStarted: true
            },
            resume: {
                click: 0,
                mouse: 0,
                mediaEnded: true
            }
        }, parameters);

        if (this.parameters.enabled) {

            this.parameters.duration /= 1000;

            slider.controls.autoplay = this;

            this.deferredsExtraPlaying = {};

            this.slider.visible($.proxy(this.onReady, this));

        } else {
            this.disable();
        }

        slider.controls.autoplay = this;
    };

    SmartSliderControlAutoplay.prototype.onReady = function () {
        this.autoplayDeferred = $.Deferred();

        var obj = {
            _progress: 0
        };
        this.timeline = NextendTween.to(obj, this.getSlideDuration(this.slider.currentSlide.index), {
            _progress: 1,
            paused: true,
            onComplete: $.proxy(this.next, this)
        });

        if (this._progressEnabled) {
            this.enableProgress();
        }


        var sliderElement = this.slider.sliderElement;

        if (this.parameters.start) {
            this.continueAutoplay();
        } else {
            this.pauseAutoplayExtraPlaying(null, 'autoplayButton');
        }

        sliderElement.on('mainAnimationStart.autoplay', $.proxy(this.onMainAnimationStart, this));

        if (this.parameters.pause.mouse != '0') {
            sliderElement.on("touchend.autoplay", function () {
                preventMouseEnter = true;
                setTimeout(function () {
                    preventMouseEnter = false;
                }, 300)
            });
            switch (this.parameters.pause.mouse) {
                case 'enter':
                    sliderElement.on('mouseenter.autoplay', $.proxy(this.pauseAutoplayMouseEnter, this));
                    sliderElement.on('mouseleave.autoplay', $.proxy(this.pauseAutoplayMouseEnterEnded, this));
                    break;
                case 'leave':
                    sliderElement.on('mouseleave.autoplay', $.proxy(this.pauseAutoplayMouseLeave, this));
                    sliderElement.on('mouseenter.autoplay', $.proxy(this.pauseAutoplayMouseLeaveEnded, this));
                    break;
            }
        }
        if (this.parameters.pause.click && !this.parameters.resume.click) {
            sliderElement.on('universalclick.autoplay', $.proxy(function (e) {
                if (e.ss3HandledAutoplay === undefined) {
                    this.pauseAutoplayUniversal(e);
                }
            }, this));
        } else if (!this.parameters.pause.click && this.parameters.resume.click) {
            sliderElement.on('universalclick.autoplay', $.proxy(function (e) {
                if (e.ss3HandledAutoplay === undefined) {
                    this.pauseAutoplayExtraPlayingEnded(e, 'autoplayButton');
                }
            }, this));
        } else if (this.parameters.pause.click && this.parameters.resume.click) {
            sliderElement.on('universalclick.autoplay', $.proxy(function (e) {
                if (e.ss3HandledAutoplay === undefined) {
                    if (!this._paused) {
                        this.pauseAutoplayUniversal(e);
                    } else {
                        this.pauseAutoplayExtraPlayingEnded(e, 'autoplayButton');
                    }
                }
            }, this));
        }
        if (this.parameters.pause.mediaStarted) {
            this.deferredsMediaPlaying = {};
            sliderElement.on('mediaStarted.autoplay', $.proxy(this.pauseAutoplayMediaPlaying, this));
            sliderElement.on('mediaEnded.autoplay', $.proxy(this.pauseAutoplayMediaPlayingEnded, this));
        }

        if (this.parameters.resume.mouse != '0') {
            switch (this.parameters.resume.mouse) {
                case 'enter':
                    if (!this.hasButton || this.parameters.pause.mouse == '0') {
                        sliderElement.on('mouseenter.autoplay', $.proxy(function (e) {
                            this.pauseAutoplayExtraPlayingEnded(e, 'autoplayButton');
                        }, this));
                    } else {
                        sliderElement.on('mouseenter.autoplay', $.proxy(this.continueAutoplay, this));
                    }
                    break;
                case 'leave':
                    if (!this.hasButton || this.parameters.pause.mouse == '0') {
                        sliderElement.on('mouseleave.autoplay', $.proxy(function (e) {
                            this.pauseAutoplayExtraPlayingEnded(e, 'autoplayButton');
                        }, this));
                    } else {
                        sliderElement.on('mouseleave.autoplay', $.proxy(this.continueAutoplay, this));
                    }
                    break;
            }
        }

        if (this.parameters.resume.mediaEnded) {
            sliderElement.on('mediaEnded.autoplay', $.proxy(this.continueAutoplay, this));
        }
        sliderElement.on('autoplayExtraWait.autoplay', $.proxy(this.pauseAutoplayExtraPlaying, this));
        sliderElement.on('autoplayExtraContinue.autoplay', $.proxy(this.pauseAutoplayExtraPlayingEnded, this));


        this.slider.sliderElement.on('mainAnimationComplete.autoplay', $.proxy(this.onMainAnimationComplete, this));

    };

    SmartSliderControlAutoplay.prototype.enableProgress = function () {
        if (this.timeline) {
            this.timeline.eventCallback('onUpdate', $.proxy(this.onUpdate, this));
        }
        this._progressEnabled = true;
    };


    SmartSliderControlAutoplay.prototype.onMainAnimationStart = function (e, animation, previousSlideIndex, currentSlideIndex, isSystem) {
        this.mainAnimationDeferred = $.Deferred();
        this.deActivate(0, 'wait');
        for (var k in this.deferredsMediaPlaying) {
            this.deferredsMediaPlaying[k].resolve();
        }
    };

    SmartSliderControlAutoplay.prototype.onMainAnimationComplete = function (e, animation, previousSlideIndex, currentSlideIndex) {

        if (this.parameters.autoplayToSlideIndex >= 0 && this.parameters.autoplayToSlideIndex == this.slider.currentRealSlide.index + 1) {
            this.limitAutoplay();
        }

        this.timeline.duration(this.getSlideDuration(currentSlideIndex));

        this.mainAnimationDeferred.resolve();

        this.continueAutoplay();
    };

    SmartSliderControlAutoplay.prototype.getSlideDuration = function (index) {
        var slide = this.slider.realSlides[this.slider.getRealIndex(index)],
            duration = slide.minimumSlideDuration;

        if (duration == 0) {
            duration = this.parameters.duration;
        }
        return duration;
    };

    SmartSliderControlAutoplay.prototype.continueAutoplay = function (e) {
        if (this.autoplayDeferred.state() == 'pending') {
            this.autoplayDeferred.reject();
        }
        var deferreds = [];
        for (var k in this.deferredsExtraPlaying) {
            deferreds.push(this.deferredsExtraPlaying[k]);
        }
        for (var k in this.deferredsMediaPlaying) {
            deferreds.push(this.deferredsMediaPlaying[k]);
        }
        if (this.deferredMouseEnter) {
            deferreds.push(this.deferredMouseEnter);
        }
        if (this.deferredMouseLeave) {
            deferreds.push(this.deferredMouseLeave);
        }

        deferreds.push(this.mainAnimationDeferred);

        this.autoplayDeferred = $.Deferred();
        this.autoplayDeferred.done($.proxy(this._continueAutoplay, this));

        $.when.apply($, deferreds).done($.proxy(function () {
            if (this.autoplayDeferred.state() == 'pending') {
                this.autoplayDeferred.resolve();
            }
        }, this));
    };

    SmartSliderControlAutoplay.prototype._continueAutoplay = function () {
        if ((this._paused || this._wait) && !this._disabled) {
            this._paused = false;
            this._wait = false;
            n2c.log('Event: autoplayStarted');
            this.slider.sliderElement.triggerHandler('autoplayStarted');

            if (this.timeline.progress() == 1) {
                this.timeline.pause(0, false);
            }

            this.startTimeout(null);
        }
    };

    SmartSliderControlAutoplay.prototype.pauseAutoplayUniversal = function (e) {
        //this.autoplayDeferred.reject();
        this.pauseAutoplayExtraPlaying(e, 'autoplayButton');
        this.deActivate(null, 'pause');
    };

    SmartSliderControlAutoplay.prototype.pauseAutoplayMouseEnter = function () {
        if (!preventMouseEnter) {
            this.autoplayDeferred.reject();
            this.deferredMouseEnter = $.Deferred();
            this.deActivate(null, this.parameters.resume.mouse == 'leave' ? 'wait' : 'pause');
        }
    };

    SmartSliderControlAutoplay.prototype.pauseAutoplayMouseEnterEnded = function () {
        if (this.deferredMouseEnter) {
            this.deferredMouseEnter.resolve();
        }
    };

    SmartSliderControlAutoplay.prototype.pauseAutoplayMouseLeave = function () {
        this.autoplayDeferred.reject();
        this.deferredMouseLeave = $.Deferred();
        this.deActivate(null, this.parameters.resume.mouse == 'enter' ? 'wait' : 'pause');
    };

    SmartSliderControlAutoplay.prototype.pauseAutoplayMouseLeaveEnded = function () {
        if (this.deferredMouseLeave) {
            this.deferredMouseLeave.resolve();
        }
    };

    SmartSliderControlAutoplay.prototype.pauseAutoplayMediaPlaying = function (e, obj) {
        if (typeof this.deferredsMediaPlaying[obj] !== 'undefined') {
            this.autoplayDeferred.reject();
        }
        this.deferredsMediaPlaying[obj] = $.Deferred();
        this.deActivate(null, 'wait');
    };

    SmartSliderControlAutoplay.prototype.pauseAutoplayMediaPlayingEnded = function (e, obj) {
        if (typeof this.deferredsMediaPlaying[obj] !== 'undefined') {
            this.autoplayDeferred.reject();
            this.deferredsMediaPlaying[obj].resolve();
            delete this.deferredsMediaPlaying[obj];
        }
    };

    SmartSliderControlAutoplay.prototype.pauseAutoplayExtraPlaying = function (e, obj) {
        if (typeof this.deferredsExtraPlaying[obj] !== 'undefined') {
            this.autoplayDeferred.reject();
        }
        this.deferredsExtraPlaying[obj] = $.Deferred();
        this.deActivate(null, 'pause');
    };

    SmartSliderControlAutoplay.prototype.pauseAutoplayExtraPlayingEnded = function (e, obj) {
        if (typeof this.deferredsExtraPlaying[obj] !== 'undefined') {
            this.autoplayDeferred.reject();
            this.deferredsExtraPlaying[obj].resolve();
            delete this.deferredsExtraPlaying[obj];
        }
        this.continueAutoplay();
    };

    SmartSliderControlAutoplay.prototype.deActivate = function (seekTo, mode) {

        if (mode == 'pause') {
            if (!this._paused) {
                this._paused = true;
                if (seekTo !== 0) {
                    n2c.log('Event: autoplayPaused');
                    this.slider.sliderElement.triggerHandler('autoplayPaused');
                }
            }
        } else if (mode == 'wait') {
            if (!this._wait) {
                this._wait = true;
                if (seekTo !== 0) {
                    n2c.log('Event: autoplayWait');
                    this.slider.sliderElement.triggerHandler('autoplayWait');
                }
            }
        }

        if (this.timeline) {
            this.timeline.pause(seekTo, false);
        }
    };

    SmartSliderControlAutoplay.prototype.disable = function () {
        this.deActivate(0, 'pause');
        this.slider.sliderElement.triggerHandler('autoplayPaused');
        this.slider.sliderElement.triggerHandler('autoplayDisabled');
        this.slider.sliderElement.off('.autoplay');
        n2c.log('Autoplay: disable');
        this._disabled = true;
    };

    SmartSliderControlAutoplay.prototype.startTimeout = function (time) {
        if (!this._paused && !this._disabled) {
            this.timeline.play(time);
        }
    };

    SmartSliderControlAutoplay.prototype.next = function () {
        this.timeline.pause();
        this._currentCount++;
        /**
         * We have reached the maximum slides in the autoplay so disable it completely
         */
        if (this.parameters.autoplayToSlide > 0 && this._currentCount >= this.parameters.autoplayToSlide || this.parameters.autoplayToSlideIndex >= 0 && this.parameters.autoplayToSlideIndex == this.slider.currentRealSlide.index + 2) {
            this.limitAutoplay();
        }

        this.slider.nextCarousel(true);
    };

    SmartSliderControlAutoplay.prototype.limitAutoplay = function () {
        n2c.log('Autoplay: auto play to slide value reached');
        if (!this.parameters.allowReStart) {
            this.disable();
        } else {
            this._currentCount = 0;
            this.slider.sliderElement.triggerHandler('autoplayExtraWait', 'autoplayButton');
        }
    };

    SmartSliderControlAutoplay.prototype.onUpdate = function () {
        this.slider.sliderElement.triggerHandler('autoplay', this.timeline.progress());
    };

    return SmartSliderControlAutoplay;
});
N2D('SmartSliderControlFullscreen', function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     *
     * @param slider
     * @param direction
     * @param parameters
     * @constructor
     */
    function SmartSliderControlFullscreen(slider, direction, parameters) {

        this.slider = slider;

        this.responsive = this.slider.responsive;

        this._type = this.responsive.parameters.type;
        this._forceFull = this.responsive.parameters.forceFull;

        this.forceFullpage = this._type == 'auto' || this._type == 'fullwidth' || this._type == 'fullpage';
        if (this.forceFullpage) {
            this._upscale = this.responsive.parameters.upscale;
            this._minimumHeightRatio = $.extend({}, this.responsive.parameters.minimumHeightRatio);
            this._maximumHeightRatio = $.extend({}, this.responsive.parameters.maximumHeightRatio);
        }

        this.isFullScreen = false;

        this.fullParent = this.slider.sliderElement.closest('.n2-ss-align');


        this.browserSpecific = {};
        var elem = this.slider.sliderElement[0];
        if (elem.requestFullscreen) {
            this.browserSpecific.requestFullscreen = 'requestFullscreen';
            this.browserSpecific.event = 'fullscreenchange';
        } else if (elem.msRequestFullscreen) {
            this.browserSpecific.requestFullscreen = 'msRequestFullscreen';
            this.browserSpecific.event = 'MSFullscreenChange';
        } else if (elem.mozRequestFullScreen) {
            this.browserSpecific.requestFullscreen = 'mozRequestFullScreen';
            this.browserSpecific.event = 'mozfullscreenchange';
        } else if (elem.webkitRequestFullscreen) {
            this.browserSpecific.requestFullscreen = 'webkitRequestFullscreen';
            this.browserSpecific.event = 'webkitfullscreenchange';
        } else {
            this.browserSpecific.requestFullscreen = 'nextendRequestFullscreen';
            this.browserSpecific.event = 'nextendfullscreenchange';

            this.fullParent[0][this.browserSpecific.requestFullscreen] = $.proxy(function () {
                this.fullParent.css({
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#000',
                    zIndex: 1000000
                });

                document.fullscreenElement = this.fullParent[0];


                this.triggerEvent(document, this.browserSpecific.event);

                $(window).trigger('resize');
            }, this);
        }

        if (document.exitFullscreen) {
            this.browserSpecific.exitFullscreen = 'exitFullscreen';
        } else if (document.msExitFullscreen) {
            this.browserSpecific.exitFullscreen = 'msExitFullscreen';
        } else if (document.mozCancelFullScreen) {
            this.browserSpecific.exitFullscreen = 'mozCancelFullScreen';
        } else if (document.webkitExitFullscreen) {
            this.browserSpecific.exitFullscreen = 'webkitExitFullscreen';
        } else {
            this.browserSpecific.exitFullscreen = 'nextendExitFullscreen';
            this.fullParent[0][this.browserSpecific.exitFullscreen] = $.proxy(function () {
                this.fullParent.css({
                    position: '',
                    left: '',
                    top: '',
                    width: '',
                    height: '',
                    backgroundColor: '',
                    zIndex: ''
                });

                document.fullscreenElement = null;

                this.triggerEvent(document, this.browserSpecific.event);

            }, this);
        }
        document.addEventListener(this.browserSpecific.event, $.proxy(this.fullScreenChange, this));
    };

    SmartSliderControlFullscreen.prototype.switchState = function () {
        this.isFullScreen = !this.isFullScreen;
        if (this.isFullScreen) {
            this._fullScreen();
        } else {
            this._normalScreen();
        }
    };

    SmartSliderControlFullscreen.prototype.requestFullscreen = function () {
        if (!this.isFullScreen) {
            this.isFullScreen = true;
            this._fullScreen();
            return true;
        }
        return false;
    };

    SmartSliderControlFullscreen.prototype.exitFullscreen = function () {
        if (this.isFullScreen) {
            this.isFullScreen = false;
            this._normalScreen();
            return true;
        }
        return false;
    };

    SmartSliderControlFullscreen.prototype.triggerEvent = function (el, eventName) {
        var event;
        if (document.createEvent) {
            event = document.createEvent('HTMLEvents');
            event.initEvent(eventName, true, true);
        } else if (document.createEventObject) {// IE < 9
            event = document.createEventObject();
            event.eventType = eventName;
        }
        event.eventName = eventName;
        if (el.dispatchEvent) {
            el.dispatchEvent(event);
        } else if (el.fireEvent && htmlEvents['on' + eventName]) {// IE < 9
            el.fireEvent('on' + event.eventType, event);// can trigger only real event (e.g. 'click')
        } else if (el[eventName]) {
            el[eventName]();
        } else if (el['on' + eventName]) {
            el['on' + eventName]();
        }
    };

    SmartSliderControlFullscreen.prototype._fullScreen = function () {

        if (this.forceFullpage) {
            this.responsive.isFullScreen = true;
            this.responsive.parameters.type = 'fullpage';
            this.responsive.parameters.upscale = true;
            this.responsive.parameters.forceFull = false;
            this._marginLeft = this.responsive.containerElement[0].style.marginLeft;
            this.responsive.containerElement.css(n2const.rtl.marginLeft, 0);
        }
        this.fullParent.css({
            width: '100%',
            height: '100%',
            backgroundColor: $('body').css('background-color')
        }).addClass("n2-ss-in-fullscreen");
        this.fullParent.get(0)[this.browserSpecific.requestFullscreen]();
    };

    SmartSliderControlFullscreen.prototype._normalScreen = function () {
        if (document[this.browserSpecific.exitFullscreen]) {
            document[this.browserSpecific.exitFullscreen]();
        } else if (this.fullParent[0][this.browserSpecific.exitFullscreen]) {
            this.fullParent[0][this.browserSpecific.exitFullscreen]();
        }
    };

    SmartSliderControlFullscreen.prototype.fullScreenChange = function () {
        if (this.isDocumentInFullScreenMode()) {
            this.slider.sliderElement.triggerHandler('n2FullScreen');
            $('html').addClass('n2-in-fullscreen');
            this.isFullScreen = true;
            $(window).trigger('resize'); //needed for Safari
        } else {
            if (this.forceFullpage) {
                this.responsive.isFullScreen = false;
                this.responsive.parameters.type = this._type;
                this.responsive.parameters.upscale = this._upscale;
                this.responsive.parameters.forceFull = this._forceFull;
                this.responsive.parameters.minimumHeightRatio = this._minimumHeightRatio;
                this.responsive.parameters.maximumHeightRatio = this._maximumHeightRatio;
                this.responsive.containerElement.css(n2const.rtl.marginLeft, this._marginLeft);
                this.fullParent.css({
                    width: '',
                    height: '',
                    backgroundColor: ''
                }).removeClass("n2-ss-in-fullscreen");
                $('html').removeClass('n2-in-fullscreen');
                $(window).trigger('resize');
                this.isFullScreen = false;
                this.slider.sliderElement.triggerHandler('n2ExitFullScreen');
            }
        }
    };

    SmartSliderControlFullscreen.prototype.isDocumentInFullScreenMode = function () {
        // Note that the browser fullscreen (triggered by short keys) might
        // be considered different from content fullscreen when expecting a boolean
        return ((document.fullscreenElement && document.fullscreenElement !== null) ||    // alternative standard methods
            (document.msFullscreenElement && document.msFullscreenElement !== null) ||
            document.mozFullScreen || document.webkitIsFullScreen);                   // current working methods
    };


    return SmartSliderControlFullscreen;
});
N2D('SmartSliderControlKeyboard', function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     *
     * @param slider
     * @param direction
     * @param parameters
     * @constructor
     */
    function SmartSliderControlKeyboard(slider, direction, parameters) {

        this.slider = slider;

        this.parameters = $.extend({}, parameters);

        if (direction === 'vertical') {
            this.parseEvent = SmartSliderControlKeyboard.prototype.parseEventVertical;
        } else {
            this.parseEvent = SmartSliderControlKeyboard.prototype.parseEventHorizontal;
        }

        $(document).on('keydown', $.proxy(this.onKeyDown, this));

        slider.controls.keyboard = this;
    }

    SmartSliderControlKeyboard.prototype.isSliderOnScreen = function () {
        var offset = this.slider.sliderElement.offset(),
            scrollTop = $(window).scrollTop(),
            height = this.slider.sliderElement.height();
        if (offset.top + height * 0.5 >= scrollTop && offset.top - height * 0.5 <= scrollTop + $(window).height()) {
            return true;
        }
        return false;
    };

    SmartSliderControlKeyboard.prototype.onKeyDown = function (e) {

        if (e.target.tagName.match(/BODY|DIV|IMG/)) {
            if (this.isSliderOnScreen()) {
                e = e || window.event;
                if (this.parseEvent.call(this, e)) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                }
            }
        }
    };

    SmartSliderControlKeyboard.prototype.parseEventHorizontal = function (e) {
        switch (e.keyCode) {
            case 39: // right arrow
                this.slider[n2const.rtl.next]();
                return true;
            case 37: // left arrow
                this.slider[n2const.rtl.previous]();
                return true;
            default:
                return false;
        }
    };

    SmartSliderControlKeyboard.prototype.parseEventVertical = function (e) {
        switch (e.keyCode) {
            case 40: // down arrow

                if (!this.slider.isChangeCarousel('next') || !this.slider.parameters.controls.blockCarouselInteraction) {

                    this.slider.next();

                    return true;
                }

                return false;
            case 38: // up arrow

                if (!this.slider.isChangeCarousel('previous') || !this.slider.parameters.controls.blockCarouselInteraction) {
                    this.slider.previous();

                    return true;
                }

                return false;
            default:
                return false;
        }
    };

    return SmartSliderControlKeyboard;
});
N2D('SmartSliderControlMouseWheel', function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     *
     * @param slider
     * @constructor
     */
    function SmartSliderControlMouseWheel(slider) {

        this.preventScroll = false;
        this.preventScrollGlobal = false;

        this.slider = slider;

        slider.sliderElement.on('wheel', $.proxy(this.onMouseWheel, this));

        slider.controls.mouseWheel = this;
    }

    SmartSliderControlMouseWheel.prototype.onMouseWheel = function (e) {

        if (this.preventScroll === false) {

            var up = e.originalEvent.deltaY < 0;

            if (up) {
                if (!this.slider.isChangeCarousel('previous') || !this.slider.parameters.controls.blockCarouselInteraction) {

                    this.slider.previous();

                    e.preventDefault();

                    this.preventRepeat();
                    this.preventGlobal();
                }
            } else {
                if (!this.slider.isChangeCarousel('next') || !this.slider.parameters.controls.blockCarouselInteraction) {

                    this.slider.next();

                    e.preventDefault();

                    this.preventRepeat();
                    this.preventGlobal();
                }
            }
        } else {
            e.preventDefault();

            this.preventRepeat(e);
        }
    };

    SmartSliderControlMouseWheel.prototype.preventRepeat = function () {
        if (this.preventScroll !== false) {
            clearTimeout(this.preventScroll);
        }
        this.preventScroll = setTimeout($.proxy(function () {
            this.preventScroll = false;
            if (this.preventScrollGlobal !== false) {
                clearTimeout(this.preventScrollGlobal);
                this.preventScrollGlobal = false;
            }
        }, this), 200);
    };

    SmartSliderControlMouseWheel.prototype.preventGlobal = function () {
        if (this.preventScrollGlobal !== false) {
            clearTimeout(this.preventScrollGlobal);
        }
        this.preventScrollGlobal = setTimeout($.proxy(function () {
            if (this.preventScroll !== false) {
                clearTimeout(this.preventScroll);
            }
            this.preventScroll = false;
        }, this), 2000);
    };

    return SmartSliderControlMouseWheel;
});
N2D('SmartSliderControlTouch', function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     *
     * @param slider
     * @constructor
     * @abstract
     */
    function SmartSliderControlTouch(slider) {
        this.slider = slider;

        this.minDistance = 10;

        /**
         * true if the drag will update the progress of the animation during interaction
         * false if the drag translated into swipe at the end of the interaction
         * @type {boolean}
         */
        this.interactiveDrag = true;

        this.preventMultipleTap = false;

        this._animation = slider.mainAnimation;

        this.swipeElement = this.slider.sliderElement.find('> .n2-ss-swipe-element');

        this.$window = $(window);

        if (navigator.userAgent.toLowerCase().indexOf("android") > -1) {
            var parent = this.swipeElement.parent();
            if (parent.css('opacity') !== "1") {
                this.swipeElement.parent().one('transitionend', $.proxy(this.initTouch, this));
            } else {
                this.initTouch();
            }
        } else {
            this.initTouch();
        }

        this.slider.sliderElement.on('sliderChangeCurrentSlide', $.proxy(this.updatePanDirections, this));

        this.swipeElement.addClass('n2-grab');

        slider.controls.touch = this;
    }

    SmartSliderControlTouch.prototype.initTouch = function () {
        if (this._animation.isNoAnimation) {
            this.interactiveDrag = false;
        }

        this.eventBurrito = N2Classes.EventBurrito(this.swipeElement.get(0), {
            mouse: true,
            axis: this.axis === 'horizontal' ? 'x' : 'y',
            start: $.proxy(this._start, this),
            move: $.proxy(this._move, this),
            end: $.proxy(this._end, this)
        });

        this.updatePanDirections();

        this.cancelKineticScroll = $.proxy(function () {
            this.kineticScrollCancelled = true;
        }, this);
    };

    SmartSliderControlTouch.prototype._start = function (event) {

        this.swipeElement.addClass('n2-grabbing');

        this.currentInteraction = {
            type: event.type === 'pointerdown' ? 'pointer' : (event.type === 'touchstart' ? 'touch' : 'mouse'),
            state: $.extend({}, this.state),
            action: 'unknown',
            distance: [],
            distanceY: [],
            percent: 0,
            progress: 0,
            scrollTop: this.$window.scrollTop(),
            animationStartDirection: 'unknown',
            hadDirection: false
        };
        this.logDistance(0, 0);
    };

    SmartSliderControlTouch.prototype._move = function (event, start, diff, isRealScrolling) {
        if (!isRealScrolling || this.currentInteraction.action !== 'unknown') {

            this.currentInteraction.diection = this.measure(diff);

            var distance = this.get(diff);

            if (this.currentInteraction.hadDirection || Math.abs(distance) > this.minDistance || Math.abs(diff.y) > this.minDistance) {
                this.logDistance(distance, diff.y);
                if (this.currentInteraction.percent < 1) {
                    this.setTouchProgress(distance, diff.y);
                }

                if (this.currentInteraction.type === 'touch' && event.cancelable && this.currentInteraction.action === 'switch') {
                    this.currentInteraction.hadDirection = true;
                    return true;
                }
            }
        }

        return false;
    };

    SmartSliderControlTouch.prototype._end = function (event, start, diff, isRealScrolling) {
        if (this.currentInteraction.action === 'switch') {
            var hasDirection = isRealScrolling ? 0 : this.measureRealDirection();

            if (this.interactiveDrag) {
                var progress = this._animation.timeline.progress();
                if (progress < 1) {
                    this._animation.setTouchEnd(hasDirection, this.currentInteraction.progress, diff.time);
                }

                // Switch back the animation into the original mode when our touch is ended
                this._animation.setTouch(false);
            } else {
                if (hasDirection) {
                    this.callAction(this.currentInteraction.animationStartDirection)
                }
            }
        }

        this.onEnd();

        delete this.currentInteraction;

        if (Math.abs(diff.x) < 10 && Math.abs(diff.y) < 10) {
            this.onTap(event);
        } else {
            nextend.preventClick();
        }

        this.swipeElement.removeClass('n2-grabbing');
    };

    SmartSliderControlTouch.prototype.onEnd = function () {

        if (this.currentInteraction.action === 'scroll' && this.currentInteraction.type === 'pointer') {
            var firstDistance = this.currentInteraction.distanceY[0],
                lastDistance = this.currentInteraction.distanceY[this.currentInteraction.distanceY.length - 1];

            /**
             * Simple kinetic scroll implementation
             */
            var amplitude = (firstDistance.d - lastDistance.d) / (lastDistance.t - firstDistance.t) * 10,
                timestamp = Date.now(),
                kineticScroll = $.proxy(function () {
                    requestAnimationFrame($.proxy(function () {
                        var elapsed, delta;
                        if (!this.kineticScrollCancelled && amplitude) {
                            elapsed = Date.now() - timestamp;
                            delta = amplitude * Math.exp(-elapsed / 325);
                            if (delta > 1 || delta < -1) {
                                this.$window.scrollTop(this.$window.scrollTop() + delta);
                                kineticScroll();

                                return;
                            }
                        }

                        delete this.kineticScrollCancelled;
                        document.removeEventListener('pointerdown', this.cancelKineticScroll);
                    }, this));
                }, this);

            this.kineticScrollCancelled = false;
            kineticScroll();
            document.addEventListener('pointerdown', this.cancelKineticScroll);
        }
    };

    SmartSliderControlTouch.prototype.setTouchProgress = function (distance, distanceY) {

        this.recognizeSwitchInteraction();

        var progress,
            percent = this.getPercent(distance);
        this.currentInteraction.percent = percent;

        if (this.currentInteraction.action === 'switch') {
            if (this.interactiveDrag) {
                switch (this.currentInteraction.animationStartDirection) {
                    case 'up':
                        progress = percent * -1;
                        break;
                    case 'down':
                        progress = percent;
                        break;
                    case 'left':
                        progress = percent * -1;
                        break;
                    case 'right':
                        progress = percent;
                        break;
                }

                this.currentInteraction.progress = progress;

                this._animation.setTouchProgress(progress);
            }
        } else {
            this.startScrollInteraction(distanceY);
        }
    };

    SmartSliderControlTouch.prototype.startScrollInteraction = function (distanceY) {

        /**
         * EDGE: pan-x and pan-y does not work with Precision Touchpad, so we must use touch-action:none
         * With touch-action:none, user is not able to scroll over the slider, so we must simulate kinetic scroll
         * @see https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/20733813/
         */
        if (this.axis === 'vertical' || n2const.isEdge) {

            /**
             * Scroll is not allowed in fullscreen mode
             */
            if (!this.slider.controlFullscreen.isFullScreen) {

                this.currentInteraction.action = 'scroll';

                if (this.currentInteraction.type === 'pointer') {
                    /**
                     * Pointer events do not scroll if the touch-action CSS property defined which
                     * is required for Edge.
                     * @see https://blogs.windows.com/msedgedev/2017/12/07/better-precision-touchpad-experience-ptp-pointer-events/
                     */
                    this.$window.scrollTop(Math.max(0, this.currentInteraction.scrollTop - distanceY));
                }
            }
        }
    };

    SmartSliderControlTouch.prototype.recognizeSwitchInteraction = function () {
        if (this._animation.state === 'ended' && this.currentInteraction.action === 'unknown') {
            var direction = this.currentInteraction.diection;
            if (direction !== 'unknown') {
                /**
                 * This direction is allowed to change slides
                 */
                if (this.currentInteraction.state[direction]) {

                    this.currentInteraction.animationStartDirection = direction;

                    if (this.interactiveDrag) {
                        // Force the main animation into touch mode horizontal/vertical
                        this._animation.setTouch(this.axis);

                        var isChangePossible = this.callAction(direction, false);
                        if (!isChangePossible) {
                            // Prevent scroll enabled, but carousel not. Do not allow to scroll
                        }
                    }

                    this.currentInteraction.action = 'switch';
                }
            }
        }
    };

    SmartSliderControlTouch.prototype.logDistance = function (realDistance, realDistanceY) {
        if (this.currentInteraction.distance.length > 3) {
            this.currentInteraction.distance.shift();
            this.currentInteraction.distanceY.shift();
        }

        this.currentInteraction.distance.push({
            d: realDistance,
            t: Date.now()
        });

        this.currentInteraction.distanceY.push({
            d: realDistanceY,
            t: Date.now()
        });
    };

    SmartSliderControlTouch.prototype.measureRealDirection = function () {
        var firstDistance = this.currentInteraction.distance[0],
            lastDistance = this.currentInteraction.distance[this.currentInteraction.distance.length - 1];

        if ((lastDistance.d >= 0 && firstDistance.d > lastDistance.d) || (lastDistance.d < 0 && firstDistance.d < lastDistance.d)) {
            return 0;
        }
        return 1;
    };

    SmartSliderControlTouch.prototype.onTap = function (e) {
        if (!this.preventMultipleTap) {
            $(e.target).trigger('n2click');
            this.preventMultipleTap = true;
            setTimeout($.proxy(function () {
                this.preventMultipleTap = false;
            }, this), 500);
        }
    };

    /**
     * @abstract
     */
    SmartSliderControlTouch.prototype.updatePanDirections = function () {

    };

    SmartSliderControlTouch.prototype.setState = function (newStates, doAction) {
        if (typeof arguments[0] !== 'object') {
            newStates = {};
            newStates[arguments[0]] = arguments[1];
            doAction = arguments[2];
        }

        var isChanged = false;
        for (var k in newStates) {
            if (this.state[k] !== newStates[k]) {
                this.state[k] = newStates[k];
                isChanged = true;
            }
        }

        if (isChanged && doAction && this.eventBurrito.supportsPointerEvents) {

            this.syncTouchAction();
        }
    };

    return SmartSliderControlTouch;
});
N2D('SmartSliderControlTouchHorizontal', 'SmartSliderControlTouch', function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     *
     * @constructor
     * @augments N2Classes.SmartSliderControlTouch
     */
    function SmartSliderControlTouchHorizontal() {

        this.state = {
            left: false,
            right: false
        };

        this.axis = 'horizontal';

        N2Classes.SmartSliderControlTouch.prototype.constructor.apply(this, arguments);
    }

    SmartSliderControlTouchHorizontal.prototype = Object.create(N2Classes.SmartSliderControlTouch.prototype);
    SmartSliderControlTouchHorizontal.prototype.constructor = SmartSliderControlTouchHorizontal;

    SmartSliderControlTouchHorizontal.prototype.callAction = function (direction, isSystem) {
        switch (direction) {
            case 'left':
                return this.slider[n2const.rtl.next].call(this.slider, isSystem);
            case 'right':
                return this.slider[n2const.rtl.previous].call(this.slider, isSystem);
        }

        return false;
    };

    SmartSliderControlTouchHorizontal.prototype.measure = function (diff) {
        if ((!this.currentInteraction.hadDirection && Math.abs(diff.x) < 10) || diff.x === 0 || Math.abs(diff.x) < Math.abs(diff.y)) return 'unknown';
        return diff.x < 0 ? 'left' : 'right';
    };

    SmartSliderControlTouchHorizontal.prototype.get = function (diff) {
        return diff.x;
    };

    SmartSliderControlTouchHorizontal.prototype.getPercent = function (distance) {
        return Math.max(-0.99999, Math.min(0.99999, distance / this.slider.dimensions.slider.width))
    };

    SmartSliderControlTouchHorizontal.prototype.updatePanDirections = function () {
        var currentSlideIndex = this.slider.currentSlide.index,
            nextSlideAllowed = currentSlideIndex + 1 < this.slider.slides.length,
            previousSlideAllowed = currentSlideIndex - 1 >= 0;

        if (this.slider.parameters.carousel) {
            nextSlideAllowed = true;
            previousSlideAllowed = true;
        }

        this.setState({
            right: previousSlideAllowed,
            left: nextSlideAllowed
        }, true);
    };

    SmartSliderControlTouchHorizontal.prototype.syncTouchAction = function () {
        var touchAction = {
            'pan-y': false,
            'none': false
        };

        /**
         * EDGE: pan-y does not work with Precision Touchpad. Must use none
         * @see https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/20733813/
         */
        if (n2const.isEdge) {
            touchAction.none = true;
        } else {
            if (this.state.left) {
                touchAction['pan-y'] = true;
            }

            if (this.state.right) {
                touchAction['pan-y'] = true;
            }
        }

        var touchActions = [];
        for (var k in touchAction) {
            if (touchAction[k]) {
                touchActions.push(k);
            }
        }

        this.swipeElement.css('touch-action', touchActions.join(' '));
    };


    return SmartSliderControlTouchHorizontal;
});
N2D('SmartSliderControlTouchVertical', 'SmartSliderControlTouch', function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     *
     * @constructor
     * @augments N2Classes.SmartSliderControlTouch
     */
    function SmartSliderControlTouchVertical() {

        this.state = {
            up: false,
            down: false
        };

        this.action = {
            up: 'next',
            down: 'previous'
        };

        this.axis = 'vertical';

        N2Classes.SmartSliderControlTouch.prototype.constructor.apply(this, arguments);
    }

    SmartSliderControlTouchVertical.prototype = Object.create(N2Classes.SmartSliderControlTouch.prototype);
    SmartSliderControlTouchVertical.prototype.constructor = SmartSliderControlTouchVertical;

    SmartSliderControlTouchVertical.prototype.callAction = function (direction, isSystem) {
        switch (direction) {
            case 'up':
                return this.slider.next.call(this.slider, isSystem);
            case 'down':
                return this.slider.previous.call(this.slider, isSystem);
        }

        return false;
    };

    SmartSliderControlTouchVertical.prototype.measure = function (diff) {
        if ((!this.currentInteraction.hadDirection && Math.abs(diff.y) < 1) || diff.y == 0 || Math.abs(diff.y) < Math.abs(diff.x)) return 'unknown';
        return diff.y < 0 ? 'up' : 'down';
    };

    SmartSliderControlTouchVertical.prototype.get = function (diff) {
        return diff.y;
    };

    SmartSliderControlTouchVertical.prototype.getPercent = function (distance) {
        return Math.max(-0.99999, Math.min(0.99999, distance / this.slider.dimensions.slider.height))
    };

    SmartSliderControlTouchVertical.prototype.updatePanDirections = function () {

        var isPreviousCarousel = this.slider.isChangeCarousel('previous');

        this.setState({
            down: !this.slider.isChangeCarousel('previous') || !this.slider.parameters.controls.blockCarouselInteraction,
            up: !this.slider.isChangeCarousel('next') || !this.slider.parameters.controls.blockCarouselInteraction
        }, true);
    };

    SmartSliderControlTouchVertical.prototype.syncTouchAction = function () {
        var touchAction = {
            'pan-x': false,
            'none': false
        };

        /**
         * EDGE: pan-x does not work with Precision Touchpad. Must use none
         * @see https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/20733813/
         */
        if (n2const.isEdge) {
            touchAction.none = true;
        } else {
            if (this.state.up) {
                touchAction['pan-x'] = true;
            }

            if (this.state.down) {
                touchAction['pan-x'] = true;
            }
        }

        var touchActions = [];
        for (var k in touchAction) {
            if (touchAction[k]) {
                touchActions.push(k);
            }
        }

        this.swipeElement.css('touch-action', touchActions.join(' '));
    };

    SmartSliderControlTouchVertical.prototype._start = function (event) {

        this.slider.blockCarousel = true;

        N2Classes.SmartSliderControlTouch.prototype._start.apply(this, arguments);
    };

    SmartSliderControlTouchVertical.prototype.onEnd = function (event) {

        N2Classes.SmartSliderControlTouch.prototype.onEnd.apply(this, arguments);

        this.slider.blockCarousel = false;
    };


    return SmartSliderControlTouchVertical;
});
N2D('SmartSliderSlideBackgroundColor', function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param {N2Classes.SmartSliderSlideBackground} background
     * @param $el
     * @constructor
     */
    function SmartSliderSlideBackgroundColor(background, $el) {
        this.$el = $el;
    }

    SmartSliderSlideBackgroundColor.prototype.getLoadedDeferred = function () {
        return true;
    };

    return SmartSliderSlideBackgroundColor;
});
N2D('SmartSliderSlideBackgroundImage', function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param {N2Classes.FrontendSliderSlide} slide
     * @param {N2Classes.SmartSliderBackgrounds} manager
     * @param {N2Classes.SmartSliderSlideBackground} background
     * @param $background
     * @constructor
     */
    function SmartSliderSlideBackgroundImage(slide, manager, background, $background) {

        this.loadStarted = false;
        this.loadAllowed = false;

        this.slide = slide;
        this.manager = manager;
        this.background = background;

        this.deferred = $.Deferred();
        this.$background = $background;

        this.blur = $background.data('blur');

        if (background.mode === 'blurfit') {
            if (window.n2FilterProperty) {
                this.$background = this.$background.add(this.$background.clone()
                    .insertAfter(this.$background));
                this.$background.first().css({
                    margin: '-' + (7 * 2) + 'px',
                    padding: (7 * 2) + 'px'
                }).css(window.n2FilterProperty, 'blur(' + 7 + 'px)');
            } else {
                background.element.attr('data-mode', 'fill');
                background.mode = 'fill';
            }
        }

        if (window.n2FilterProperty) {
            if (this.blur > 0) {
                this.$background.last().css({
                    margin: '-' + (this.blur * 2) + 'px',
                    padding: (this.blur * 2) + 'px'
                }).css(window.n2FilterProperty, 'blur(' + this.blur + 'px)');
            } else {
                this.$background.last().css({
                    margin: '',
                    padding: ''
                }).css(window.n2FilterProperty, '');
            }
        }

        if (n2const.isWaybackMachine()) {
            this.mobileSrc = this.tabletSrc = this.desktopSrc = $background.data('desktop');
        } else {
            this.desktopSrc = $background.data('desktop') || '';
            this.tabletSrc = $background.data('tablet') || '';
            this.mobileSrc = $background.data('mobile') || '';

            if (n2const.isRetina) {
                var retina = $background.data('desktop-retina');
                if (retina) {
                    this.desktopSrc = retina;
                }
                retina = $background.data('tablet-retina');
                if (retina) {
                    this.tabletSrc = retina;
                }
                retina = $background.data('mobile-retina');
                if (retina) {
                    this.mobileSrc = retina;
                }
            }
        }
    }

    SmartSliderSlideBackgroundImage.prototype.getLoadedDeferred = function () {
        return this.deferred;
    };

    SmartSliderSlideBackgroundImage.prototype.preLoad = function () {
        this.loadAllowed = true;

        this.manager.deviceDeferred.done($.proxy(function () {
            this.updateBackgroundToDevice(this.manager.device);

            this.waitForImage();
        }, this));
    };

    SmartSliderSlideBackgroundImage.prototype.waitForImage = function () {
        this.$background.n2imagesLoaded({background: true}, $.proxy(function (e) {
            /**
             * The injected element must have a background image. If some other script changed it for lazy loading
             * There will be no images, so we know that we have to try again to check for load later.
             * Swift Performance does this with lazyload-background-images option.
             */
            if (e.images.length > 0) {
                var img = e.images[0].img;
                this.width = img.naturalWidth;
                this.height = img.naturalHeight;

                switch (this.background.mode) {
                    case 'tile':
                    case 'center':
                        if (n2const.devicePixelRatio > 1) {
                            this.$background.css('background-size', (this.width / n2const.devicePixelRatio) + 'px ' + (this.height / n2const.devicePixelRatio) + 'px');
                        }
                        break;
                }

                this.deferred.resolve();
            } else {
                setTimeout($.proxy(this.waitForImage, this), 100);
            }
        }, this));
    };

    SmartSliderSlideBackgroundImage.prototype.updateBackgroundToDevice = function (device) {
        var newSrc = this.desktopSrc;
        if (device.device === 'mobile') {
            if (this.mobileSrc) {
                newSrc = this.mobileSrc;
            } else if (this.tabletSrc) {
                newSrc = this.tabletSrc;
            }
        } else if (device.device === 'tablet') {
            if (this.tabletSrc) {
                newSrc = this.tabletSrc;
            }
        }
        if (newSrc) {
            this.setSrc(newSrc);
        } else {
            this.setSrc('');
        }
    }

    SmartSliderSlideBackgroundImage.prototype.setSrc = function (src) {
        if (this.loadAllowed) {
            if (src !== this.currentSrc) {
                if (src === '') {
                    this.$background.css('background-image', '');
                } else {
                    this.$background.css('background-image', 'url("' + src + '")');
                }
                this.currentSrc = src;
            }
        }
    };

    SmartSliderSlideBackgroundImage.prototype.fadeOut = function () {
        NextendTween.to(this.$background, 0.3, {
            opacity: 0
        });
    };

    return SmartSliderSlideBackgroundImage;
});
N2D('SmartSliderSlideBackground', function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param {N2Classes.FrontendSliderSlide} slide
     * @param element
     * @param {N2Classes.SmartSliderBackgrounds} manager
     * @constructor
     */
    function SmartSliderSlideBackground(slide, element, manager) {
        this.loadStarted = false;

        this.types = this.types || {
            color: 'SmartSliderSlideBackgroundColor',
            image: 'SmartSliderSlideBackgroundImage',
            video: 'SmartSliderSlideBackgroundVideo'
        };

        this.width = 0;
        this.height = 0;

        this.slide = slide;

        this.element = element;
        if (slide.slider.needBackgroundWrap) {
            var $elements = element.find('> *');
            this.$wrapElement = $('<div class="n2-ss-slide-background-wrap n2-ow" />')
                .appendTo(element)
                .append($elements);
        } else {
            this.$wrapElement = this.element;
        }
        this.manager = manager;
        this.loadDeferred = $.Deferred();

        /**
         * @type {{color: boolean|N2Classes.SmartSliderSlideBackgroundColor, image: boolean|N2Classes.SmartSliderSlideBackgroundImage, video: boolean|N2Classes.SmartSliderSlideBackgroundVideo}}
         */
        this.elements = {
            color: false,
            image: false,
            video: false
        };

        this.currentSrc = '';

        this.mode = element.data('mode');

        this.opacity = element.data('opacity');

        var $image = this.element.find('.n2-ss-slide-background-image');
        if ($image.length) {
            this.elements.image = new N2Classes[this.types.image](slide, manager, this, $image);
        }

        var $color = this.element.find('.n2-ss-slide-background-color');
        if ($color.length) {
            this.elements.color = new N2Classes[this.types.color](this, $color);
        }


        var deferreds = [];
        for (var k in this.elements) {
            if (this.elements[k]) {
                deferreds.push(this.elements[k].getLoadedDeferred());
            }
        }

        $.when.apply($, deferreds).then($.proxy(function () {
            this.loadDeferred.resolve();
        }, this));
    }

    SmartSliderSlideBackground.prototype.preLoad = function () {
        if (!this.loadStarted) {
            this.slide.$element.find('[data-lazysrc]').each(function () {
                var $this = $(this);
                $this.attr('src', $this.data('lazysrc'));
            });
            this.loadStarted = true;
        }

        if (this.loadDeferred.state() === 'pending') {

            if (this.elements.image) {
                this.elements.image.preLoad();
            }
        }
        return this.loadDeferred;
    };

    SmartSliderSlideBackground.prototype.fadeOut = function () {
        if (this.elements.image) {
            this.elements.image.fadeOut();
        }
    };

    SmartSliderSlideBackground.prototype.hack = function () {
        NextendTween.set(this.element, {
            rotation: 0.0001
        });
    };

    SmartSliderSlideBackground.prototype.hasColor = function () {
        return this.elements.color;
    };

    SmartSliderSlideBackground.prototype.hasImage = function () {
        return this.elements.image;
    };

    SmartSliderSlideBackground.prototype.hasVideo = function () {
        return this.elements.video;
    };

    SmartSliderSlideBackground.prototype.hasBackground = function () {
        return this.elements.color || this.elements.image || this.elements.video;
    };

    SmartSliderSlideBackground.prototype.updateBackgroundToDevice = function (device) {
        if (this.hasImage()) {
            this.elements.image.updateBackgroundToDevice(device);
        }
    };

    return SmartSliderSlideBackground;
});
N2D('FrontendComponent', function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param {N2Classes.FrontendComponentSlideAbstract} slide
     * @param parent
     * @param $layer
     * @param $children
     * @constructor
     */
    function FrontendComponent(slide, parent, $layer, $children) {
        this.wraps = {};
        this.isVisible = true;
        this.device = '';
        this.children = [];
        this.slide = slide;
        this.parent = parent;
        this.$layer = $layer.data('layer', this);

        this.skipSelfAnimation = false;

        this.stateCBs = [];
        this.state = {
            InComplete: false
        };

        var $mask = this.$layer.find('> .n2-ss-layer-mask');
        if ($mask.length) {
            this.wraps.mask = $mask;
        }

        var $parallax = this.$layer.find('> .n2-ss-layer-parallax');
        if ($parallax.length) {
            this.wraps.parallax = $parallax;
        }

        switch ($layer.data('pm')) {
            case 'absolute':
                this.placement = new N2Classes.FrontendPlacementAbsolute(this);
                break;
            case 'normal':
                this.placement = new N2Classes.FrontendPlacementNormal(this);
                break;
            case 'content':
                this.placement = new N2Classes.FrontendPlacementContent(this);
                break;
            default:
                this.placement = new N2Classes.FrontendPlacementDefault(this);
                break;
        }
        this.parallax = $layer.data('parallax');

        this.baseSize = this.baseSize || 100;
        this.isAdaptiveFont = this.get('adaptivefont');
        this.refreshBaseSize(this.getDevice('fontsize'));

        if ($children) {
            for (var i = 0; i < $children.length; i++) {
                switch ($children.eq(i).data('sstype')) {
                    case 'content':
                        this.children.push(new N2Classes.FrontendComponentContent(this.slide, this, $children.eq(i)));
                        break;
                    case 'row':
                        this.children.push(new N2Classes.FrontendComponentRow(this.slide, this, $children.eq(i)));
                        break;
                    case 'col':
                        this.children.push(new N2Classes.FrontendComponentCol(this.slide, this, $children.eq(i)));
                        break;
                    case 'group':
                        break;
                    default:
                        this.children.push(new N2Classes.FrontendComponentLayer(this.slide, this, $children.eq(i)));
                        break;
                }
            }
        }
    }

    FrontendComponent.prototype.setState = function (name, value) {
        this.state[name] = value;
        for (var i = 0; i < this.stateCBs.length; i++) {
            this.stateCBs[i].call(this, this.state);
        }
    };

    FrontendComponent.prototype.addStateCallback = function (cb) {
        this.stateCBs.push(cb);
        cb.call(this, this.state);
    };

    FrontendComponent.prototype.refreshBaseSize = function (fontSize) {
        if (this.isAdaptiveFont) {
            this.baseSize = (16 * fontSize / 100);
        } else {
            this.baseSize = this.parent.baseSize * fontSize / 100;
        }
    };

    FrontendComponent.prototype.start = function () {
        this.placement.start();
        for (var i = 0; i < this.children.length; i++) {
            this.children[i].start()
        }

        var rotation = this.get('rotation') || 0;
        if (rotation / 360 != 0) {
            var $el = this.addWrap('rotation', "<div class='n2-ss-layer-rotation'></div>");

            NextendTween.set($el[0], {
                rotationZ: rotation
            });
        }
    };

    FrontendComponent.prototype.onDeviceChange = function (device) {
        this.device = device;
        var wasVisible = this.isVisible;
        this.isVisible = this.getDevice('');
        if (this.isVisible === undefined) this.isVisible = 1;

        if (wasVisible && !this.isVisible) {
            this.$layer.data('shows', 0);
            this.$layer.css('display', 'none');
            this.$layer.triggerHandler('visibilityChange', [0]);
        } else if (!wasVisible && this.isVisible) {
            this.$layer.data('shows', 1);
            this.$layer.css('display', '');
            this.$layer.triggerHandler('visibilityChange', [1]);
        }

        if (this.isVisible) {
            var fontSize = this.getDevice('fontsize');
            this.refreshBaseSize(fontSize);
            if (this.isAdaptiveFont) {
                this.$layer.css('font-size', (16 * fontSize / 100) + 'px');
            } else {
                this.$layer.css('font-size', fontSize + '%');
            }

            for (var i = 0; i < this.children.length; i++) {
                this.children[i].onDeviceChange(device)
            }
            this.placement.onDeviceChange(device);

            this.onAfterDeviceChange(device);
        }
    };

    FrontendComponent.prototype.onAfterDeviceChange = function (device) {

    };

    FrontendComponent.prototype.onResize = function (ratios, dimensions, isStatic) {
        if (this.isVisible || this.placement.alwaysResize) {
            for (var i = 0; i < this.children.length; i++) {
                this.children[i].onResize(ratios, dimensions, isStatic)
            }
            this.placement.onResize(ratios, dimensions, isStatic);
        }
    };

    FrontendComponent.prototype.getDevice = function (property, def) {
        var value = this.$layer.data(this.device + property);
        if (value != undefined) {
            return value;
        }
        if (this.device != 'desktopportrait') {
            return this.$layer.data('desktopportrait' + property);
        }
        if (def !== undefined) {
            return def;
        }
        return 0;
    };

    FrontendComponent.prototype.get = function (property) {
        return this.$layer.data(property);
    };

    FrontendComponent.prototype.hasLayerAnimation = function () {
        return this.animationManager !== undefined;
    };

    FrontendComponent.prototype.getParallaxNodes = function () {
        var parallaxed = [];
        if (this.isVisible) {
            if (this.parallax) {
                parallaxed.push(this.$layer[0]);
            }
            for (var i = 0; i < this.children.length; i++) {
                parallaxed.push.apply(parallaxed, this.children[i].getParallaxNodes());
            }
        }
        return parallaxed;

    };

    FrontendComponent.prototype.addWrap = function (key, html) {
        if (this.wraps[key] === undefined) {
            var $el = $(html);
            switch (key) {
                case 'rotation':
                    if (this.wraps.mask !== undefined) {
                        $el.appendTo(this.wraps.mask);
                    } else if (this.wraps.parallax !== undefined) {
                        $el.appendTo(this.wraps.parallax);
                    } else {
                        $el.appendTo(this.$layer);
                    }
                    $el.append(this.getContents());
                    break;
            }
            this.wraps[key] = $el;
        }
        return $el;
    };

    FrontendComponent.prototype.getContents = function () {
        return false;
    };

    return FrontendComponent;
});
N2D('FrontendPlacement', function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param layer
     * @constructor
     */
    function FrontendPlacement(layer) {
        this.layer = layer;
        this.alwaysResize = false;
    }

    FrontendPlacement.prototype.start = function () {

    };

    FrontendPlacement.prototype.onDeviceChange = function (mode) {

    };

    FrontendPlacement.prototype.onResize = function (ratios, dimensions, isStatic) {

    };

    return FrontendPlacement;
});
N2D('FrontendSliderSlide', ['FrontendComponentSlideAbstract'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @constructor
     * @augments FrontendComponentSlideAbstract
     */
    function FrontendSliderSlide(slider, $element, index) {
        this.isStaticSlide = false;
        this.originalIndex = index;
        this.index = index;
        this.localIndex = index;
        this.$element = $element.data('slide', this);
        this.id = this.$element.data('id');

        /**
         *
         * @type {boolean|N2Classes.SmartSliderSlideBackground|N2Classes.SmartSliderSlideBackgroundAdmin}
         */
        this.background = false;

        this.slides = [this];

        if (!slider.parameters.admin) {
            this.minimumSlideDuration = $element.data('slide-duration');
            if (!$.isNumeric(this.minimumSlideDuration)) {
                this.minimumSlideDuration = 0;
            }
        } else {
            this.minimumSlideDuration = 0;
        }

        var $container = $element.find('.n2-ss-layers-container');

        N2Classes.FrontendComponentSlideAbstract.prototype.constructor.call(this, slider, $container);
    }

    FrontendSliderSlide.prototype = Object.create(N2Classes.FrontendComponentSlideAbstract.prototype);
    FrontendSliderSlide.prototype.constructor = FrontendSliderSlide;

    FrontendSliderSlide.prototype.init = function () {
        N2Classes.FrontendComponentSlideAbstract.prototype.init.call(this);
        var $image = this.slider.findSlideBackground(this);

        if ($image.length > 0) {
            if (this.slider.isAdmin) {
                this.background = new N2Classes.SmartSliderSlideBackgroundAdmin(this, $image, this.slider.backgrounds);
            } else {
                this.background = new N2Classes.SmartSliderSlideBackground(this, $image, this.slider.backgrounds);
            }
        }

        this.$element.data('slideBackground', this.background);
    };

    FrontendSliderSlide.prototype.setStarterSlide = function () {
        N2Classes.FrontendComponentSlideAbstract.prototype.setStarterSlide.call(this);
    };

    FrontendSliderSlide.prototype.setIndex = function (index) {
        this.localIndex = this.index = index;
    };

    FrontendSliderSlide.prototype.preLoad = function () {
        if (this.background) {
            return this.background.preLoad();
        }

        return true;
    };

    /**
     * Linked list
     * @param previousSlide
     */
    FrontendSliderSlide.prototype.setPrevious = function (previousSlide) {
        this.previousSlide = previousSlide;
    };

    /**
     * Linked list
     * @param nextSlide
     */
    FrontendSliderSlide.prototype.setNext = function (nextSlide) {
        this.nextSlide = nextSlide;
        nextSlide.setPrevious(this);
    };

    FrontendSliderSlide.prototype.hasBackgroundVideo = function () {
        return this.background.hasVideo();
    };

    FrontendSliderSlide.prototype.getTitle = function () {
        return this.$element.data('title');
    };

    FrontendSliderSlide.prototype.getDescription = function () {
        return this.$element.data('description');
    };

    FrontendSliderSlide.prototype.getThumbnail = function () {
        return this.$element.data('thumbnail');
    };

    FrontendSliderSlide.prototype.getThumbnailType = function () {
        return this.$element.data('thumbnail-type');
    };

    FrontendSliderSlide.prototype.hasLink = function () {
        return !!this.$element.data('haslink');
    };

    return FrontendSliderSlide;
});
N2D('FrontendComponentSlideAbstract', ['FrontendComponent'], function ($, undefined) {

    var SlideStatus = {
        NOT_INITIALIZED: -1,
        INITIALIZED: 0,
        READY_TO_START: 1,
        PLAYING: 2,
        ENDED: 3,
        SUSPENDED: 4
    };

    /**
     * @memberOf N2Classes
     *
     * @param {N2Classes.SmartSliderAbstract} slider
     * @param {jQuery} $el
     * @constructor
     * @augments FrontendComponent
     */
    function FrontendComponentSlideAbstract(slider, $el) {
        this.baseSize = 16;

        /**
         * @type {N2Classes.SmartSliderAbstract}
         */
        this.slider = slider;

        if (!this.isCurrentlyEdited()) {

            this.status = SlideStatus.NOT_INITIALIZED;

            N2Classes.FrontendComponent.prototype.constructor.call(this, this, this, $el, $el.find('> .n2-ss-layer, > .n2-ss-layer-group'));

            this.skipSelfAnimation = true;

            this.slider.sliderElement.on({
                SliderDeviceOrientation: $.proxy(function (e, modes) {
                    this.onDeviceChange(modes.device + modes.orientation.toLowerCase());
                }, this),
                SliderResize: $.proxy(function (e, ratios, responsive) {
                    this.onResize(ratios, responsive.responsiveDimensions);
                }, this)
            });

            N2Classes.FrontendComponent.prototype.start.call(this);
        }
    }

    FrontendComponentSlideAbstract.prototype = Object.create(N2Classes.FrontendComponent.prototype);
    FrontendComponentSlideAbstract.prototype.constructor = FrontendComponentSlideAbstract;

    FrontendComponentSlideAbstract.prototype.is = function (slideObject) {
        return this === slideObject;
    };

    FrontendComponentSlideAbstract.prototype.isCurrentlyEdited = function () {
        return this.slider.parameters.admin && this.$element.hasClass('n2-ss-currently-edited-slide');
    };

    FrontendComponentSlideAbstract.prototype.trigger = function () {
        this.$element.trigger.apply(this.$element, [].slice.call(arguments));
    };

    FrontendComponentSlideAbstract.prototype.triggerHandler = function () {
        return this.$element.triggerHandler.apply(this.$element, [].slice.call(arguments));
    };

    FrontendComponentSlideAbstract.prototype.init = function () {
    };

    FrontendComponentSlideAbstract.prototype.refreshBaseSize = function (fontSize) {

    };

    FrontendComponentSlideAbstract.prototype.onResize = function (ratios, dimensions) {
        for (var i = 0; i < this.children.length; i++) {
            this.children[i].onResize(ratios, dimensions, this.isStaticSlide)
        }
    };


    FrontendComponentSlideAbstract.prototype.hasLayers = function () {
        return this.children.length > 0;
    };

    FrontendComponentSlideAbstract.prototype.onDeviceChange = function (device) {
        this.device = device;

        for (var i = 0; i < this.children.length; i++) {
            this.children[i].onDeviceChange(device)
        }
        this.placement.onDeviceChange(device);

    };

    FrontendComponentSlideAbstract.prototype.setStarterSlide = function () {
    };

    return FrontendComponentSlideAbstract;
});
N2D('FrontendSliderStaticSlide', ['FrontendComponentSlideAbstract'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @constructor
     * @augments FrontendComponentSlideAbstract
     */
    function FrontendSliderStaticSlide(slider, $element) {
        this.isStaticSlide = true;
        this.$element = $element.data('slide', this);
        N2Classes.FrontendComponentSlideAbstract.prototype.constructor.call(this, slider, $element);

        this.init();
    }

    FrontendSliderStaticSlide.prototype = Object.create(N2Classes.FrontendComponentSlideAbstract.prototype);
    FrontendSliderStaticSlide.prototype.constructor = FrontendSliderStaticSlide;

    return FrontendSliderStaticSlide;
});
N2D('FrontendPlacementAbsolute', ['FrontendPlacement'], function ($, undefined) {

    function getPos($element) {
        return {
            left: $element.prop('offsetLeft'),
            top: $element.prop('offsetTop')
        }
    }

    /**
     * @memberOf N2Classes
     *
     * @param layer
     * @constructor
     */
    function FrontendPlacementAbsolute(layer) {
        this.linked = [];
        this.parentLayer = false;
        this.$parent = false;
        N2Classes.FrontendPlacement.prototype.constructor.apply(this, arguments);
    }

    FrontendPlacementAbsolute.prototype = Object.create(N2Classes.FrontendPlacement.prototype);
    FrontendPlacementAbsolute.prototype.constructor = FrontendPlacementAbsolute;

    FrontendPlacementAbsolute.prototype.start = function () {
        var parentID = this.layer.get('parentid');
        if (parentID) {
            this.$parent = $('#' + parentID);
            if (this.$parent.length == 0) {
                this.$parent = false;
            } else {
                this.parentLayer = this.$parent.data('layer');
                this.parentLayer.placement.addLinked(this);
                this.onResize = function () {
                };
            }
        }
    };

    FrontendPlacementAbsolute.prototype.addLinked = function (childPlacement) {
        this.linked.push(childPlacement);
        this.alwaysResize = true;
    };

    FrontendPlacementAbsolute.prototype.onResize =
        FrontendPlacementAbsolute.prototype.onResizeLinked = function (ratios, dimensions, isStatic) {
            var $layer = this.layer.$layer;
            var ratioPositionH = ratios.slideW,
                ratioSizeH = ratioPositionH,
                ratioPositionV = ratios.slideH,
                ratioSizeV = ratioPositionV;


            if (!parseInt(this.layer.get('responsivesize'))) {
                ratioSizeH = ratioSizeV = 1;
            }

            $layer.css('width', this.getWidth(ratioSizeH));
            $layer.css('height', this.getHeight(ratioSizeV));

            if (!parseInt(this.layer.get('responsiveposition'))) {
                ratioPositionH = ratioPositionV = 1;
            }


            var left = this.layer.getDevice('left') * ratioPositionH,
                top = this.layer.getDevice('top') * ratioPositionV,
                align = this.layer.getDevice('align'),
                valign = this.layer.getDevice('valign');

            var positionCSS = {
                left: 'auto',
                top: 'auto',
                right: 'auto',
                bottom: 'auto'
            };

            if (this.$parent && this.$parent.data('layer').isVisible) {
                var position = getPos(this.$parent),
                    p = {left: 0, top: 0};

                switch (this.layer.getDevice('parentalign')) {
                    case 'right':
                        p.left = position.left + this.$parent.width();
                        break;
                    case 'center':
                        p.left = position.left + this.$parent.width() / 2;
                        break;
                    default:
                        p.left = position.left;
                }

                switch (align) {
                    case 'right':
                        positionCSS.right = ($layer.parent().width() - p.left - left) + 'px';
                        break;
                    case 'center':
                        positionCSS.left = (p.left + left - $layer.width() / 2) + 'px';
                        break;
                    default:
                        positionCSS.left = (p.left + left) + 'px';
                        break;
                }


                switch (this.layer.getDevice('parentvalign')) {
                    case 'bottom':
                        p.top = position.top + this.$parent.height();
                        break;
                    case 'middle':
                        p.top = position.top + this.$parent.height() / 2;
                        break;
                    default:
                        p.top = position.top;
                }

                switch (valign) {
                    case 'bottom':
                        positionCSS.bottom = ($layer.parent().height() - p.top - top) + 'px';
                        break;
                    case 'middle':
                        positionCSS.top = (p.top + top - $layer.height() / 2) + 'px';
                        break;
                    default:
                        positionCSS.top = (p.top + top) + 'px';
                        break;
                }


            } else {
                switch (align) {
                    case 'right':
                        positionCSS.right = -left + 'px';
                        break;
                    case 'center':
                        positionCSS.left = ((isStatic ? $layer.parent().width() : dimensions.slide.width) / 2 + left - $layer.width() / 2) + 'px';
                        break;
                    default:
                        positionCSS.left = left + 'px';
                        break;
                }

                switch (valign) {
                    case 'bottom':
                        positionCSS.bottom = -top + 'px';
                        break;
                    case 'middle':
                        positionCSS.top = ((isStatic ? $layer.parent().height() : dimensions.slide.height) / 2 + top - $layer.height() / 2) + 'px';
                        break;
                    default:
                        positionCSS.top = top + 'px';
                        break;
                }
            }

            $layer.css(positionCSS);

            for (var i = 0; i < this.linked.length; i++) {
                this.linked[i].onResizeLinked(ratios, dimensions, isStatic)
            }
        };

    FrontendPlacementAbsolute.prototype.getWidth = function (ratio) {
        var width = this.layer.getDevice('width');
        if (this.isDimensionPropertyAccepted(width)) {
            return width;
        }
        return (width * ratio) + 'px'
    };

    FrontendPlacementAbsolute.prototype.getHeight = function (ratio) {
        var height = this.layer.getDevice('height');
        if (this.isDimensionPropertyAccepted(height)) {
            return height;
        }
        return (height * ratio) + 'px'
    };

    FrontendPlacementAbsolute.prototype.isDimensionPropertyAccepted = function (value) {
        if ((value + '').match(/[0-9]+%/) || value == 'auto') {
            return true;
        }
        return false;
    };

    return FrontendPlacementAbsolute;
});
N2D('FrontendPlacementContent', ['FrontendPlacement'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param layer
     * @constructor
     */
    function FrontendPlacementContent(layer) {
        N2Classes.FrontendPlacement.prototype.constructor.apply(this, arguments);
    }

    FrontendPlacementContent.prototype = Object.create(N2Classes.FrontendPlacement.prototype);
    FrontendPlacementContent.prototype.constructor = FrontendPlacementContent;

    return FrontendPlacementContent;
});
N2D('FrontendPlacementDefault', ['FrontendPlacement'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param layer
     * @constructor
     */
    function FrontendPlacementDefault(layer) {
        N2Classes.FrontendPlacement.prototype.constructor.apply(this, arguments);
    }

    FrontendPlacementDefault.prototype = Object.create(N2Classes.FrontendPlacement.prototype);
    FrontendPlacementDefault.prototype.constructor = FrontendPlacementDefault;

    return FrontendPlacementDefault;
});
N2D('FrontendPlacementNormal', ['FrontendPlacement'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param layer
     * @constructor
     */
    function FrontendPlacementNormal(layer) {
        N2Classes.FrontendPlacement.prototype.constructor.apply(this, arguments);
    }

    FrontendPlacementNormal.prototype = Object.create(N2Classes.FrontendPlacement.prototype);
    FrontendPlacementNormal.prototype.constructor = FrontendPlacementNormal;

    FrontendPlacementNormal.prototype.onDeviceChange = function () {
        this.updateMargin();
        this.updateHeight();
        this.updateMaxWidth();
        this.updateSelfAlign();

    };

    FrontendPlacementNormal.prototype.updateMargin = function () {
        var margin = this.layer.getDevice('margin').split('|*|'),
            unit = margin.pop(),
            baseSize = this.layer.baseSize;

        if (unit == 'px+' && baseSize > 0) {
            unit = 'em';
            for (var i = 0; i < margin.length; i++) {
                margin[i] = parseInt(margin[i]) / baseSize;
            }
        }
        this.layer.$layer.css('margin', margin.join(unit + ' ') + unit);
    };

    FrontendPlacementNormal.prototype.updateHeight = function () {
        var height = this.layer.getDevice('height'),
            unit = 'px';
        if (height > 0) {
            var baseSize = this.layer.baseSize;
            if (baseSize > 0) {
                unit = 'em';
                height = parseInt(height) / baseSize;
            }
            this.layer.$layer.css('height', height + unit);
        } else {
            this.layer.$layer.css('height', '');
        }
    };

    FrontendPlacementNormal.prototype.updateMaxWidth = function () {
        var value = parseInt(this.layer.getDevice('maxwidth'));
        if (value <= 0 || isNaN(value)) {
            this.layer.$layer.css('maxWidth', '')
                .attr('data-has-maxwidth', '0');
        } else {
            this.layer.$layer.css('maxWidth', value + 'px')
                .attr('data-has-maxwidth', '1');
        }
    };

    FrontendPlacementNormal.prototype.updateSelfAlign = function () {
        this.layer.$layer.attr('data-cssselfalign', this.layer.getDevice('selfalign'));
    };

    return FrontendPlacementNormal;
});
N2D('FrontendComponentCol', ['FrontendComponent'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param slide
     * @param parent
     * @param $el
     * @constructor
     */
    function FrontendComponentCol(slide, parent, $el) {

        this.$content = $el.find('.n2-ss-layer-col:first');

        N2Classes.FrontendComponent.prototype.constructor.call(this, slide, parent, $el, this.$content.find('> .n2-ss-layer'));
    }

    FrontendComponentCol.prototype = Object.create(N2Classes.FrontendComponent.prototype);
    FrontendComponentCol.prototype.constructor = FrontendComponentCol;


    FrontendComponentCol.prototype.onDeviceChange = function (device) {
        N2Classes.FrontendComponent.prototype.onDeviceChange.apply(this, arguments);

        this.updateOrder();
        this.updatePadding();
        this.updateInnerAlign();
        this.updateMaxWidth();
    };

    FrontendComponentCol.prototype.updatePadding = function () {
        var padding = this.getDevice('padding').split('|*|'),
            unit = padding.pop(),
            baseSize = this.baseSize;

        if (unit === 'px+' && baseSize > 0) {
            unit = 'em';
            for (var i = 0; i < padding.length; i++) {
                padding[i] = parseInt(padding[i]) / baseSize;
            }
        }
        this.$content.css('padding', padding.join(unit + ' ') + unit);
    };

    FrontendComponentCol.prototype.updateInnerAlign = function () {
        this.$layer.attr('data-csstextalign', this.getDevice('inneralign'));
    };

    FrontendComponentCol.prototype.updateMaxWidth = function () {
        var value = parseInt(this.getDevice('maxwidth'));
        if (value <= 0 || isNaN(value)) {
            this.$layer.css('maxWidth', '')
                .attr('data-has-maxwidth', '0');
        } else {
            this.$layer.css('maxWidth', value + 'px')
                .attr('data-has-maxwidth', '1');
        }
    };

    FrontendComponentCol.prototype.getWidthPercentage = function () {
        return parseFloat(this.$layer.data('colwidthpercent'));
    };

    FrontendComponentCol.prototype.getRealOrder = function () {
        var order = this.getDevice('order');
        if (order == 0) {
            return 10;
        }
        return order;
    };

    FrontendComponentCol.prototype.updateOrder = function () {
        var order = this.getDevice('order');

        if (order == 0) {
            this.$layer.css('order', '');
        } else {
            this.$layer.css('order', order);
        }
    };

    FrontendComponentCol.prototype.getContents = function () {
        return this.$content;
    };

    return FrontendComponentCol;
});
N2D('FrontendComponentContent', ['FrontendComponent'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param slide
     * @param parent
     * @param $el
     * @constructor
     */
    function FrontendComponentContent(slide, parent, $el) {

        this.$content = $el.find('.n2-ss-section-main-content:first');

        N2Classes.FrontendComponent.prototype.constructor.call(this, slide, parent, $el, this.$content.find('> .n2-ss-layer'));
    }

    FrontendComponentContent.prototype = Object.create(N2Classes.FrontendComponent.prototype);
    FrontendComponentContent.prototype.constructor = FrontendComponentContent;


    FrontendComponentContent.prototype.onDeviceChange = function (device) {
        N2Classes.FrontendComponent.prototype.onDeviceChange.apply(this, arguments);

        this.updatePadding();
        this.updateInnerAlign();
        this.updateMaxWidth();
        this.updateSelfAlign();
    };

    FrontendComponentContent.prototype.updatePadding = function () {
        var padding = this.getDevice('padding').split('|*|'),
            unit = padding.pop(),
            baseSize = this.baseSize;

        if (unit == 'px+' && baseSize > 0) {
            unit = 'em';
            for (var i = 0; i < padding.length; i++) {
                padding[i] = parseInt(padding[i]) / baseSize;
            }
        }
        this.$content.css('padding', padding.join(unit + ' ') + unit);
    };

    FrontendComponentContent.prototype.updateInnerAlign = function () {
        this.$layer.attr('data-csstextalign', this.getDevice('inneralign'));
    };

    FrontendComponentContent.prototype.updateMaxWidth = function () {
        var value = parseInt(this.getDevice('maxwidth'));
        if (value <= 0 || isNaN(value)) {
            this.$layer.css('maxWidth', '')
                .attr('data-has-maxwidth', '0');
        } else {
            this.$layer.css('maxWidth', value + 'px')
                .attr('data-has-maxwidth', '1');
        }
    };

    FrontendComponentContent.prototype.updateSelfAlign = function () {
        this.$layer.attr('data-cssselfalign', this.getDevice('selfalign'));
    };

    FrontendComponentContent.prototype.getContents = function () {
        return this.$content;
    };

    return FrontendComponentContent;
});
N2D('FrontendComponentLayer', ['FrontendComponent'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param slide
     * @param parent
     * @param $el
     * @constructor
     */
    function FrontendComponentLayer(slide, parent, $el) {
        N2Classes.FrontendComponent.prototype.constructor.call(this, slide, parent, $el);

        if (this.wraps.mask !== undefined) {
            this.$item = this.wraps.mask.children();
        } else if (this.wraps.parallax !== undefined) {
            this.$item = this.wraps.parallax.children();
        } else {
            this.$item = $el.children();
        }
    }

    FrontendComponentLayer.prototype = Object.create(N2Classes.FrontendComponent.prototype);
    FrontendComponentLayer.prototype.constructor = FrontendComponentLayer;

    FrontendComponentLayer.prototype.getContents = function () {
        return this.$item;
    };

    return FrontendComponentLayer;
});
N2D('FrontendComponentRow', ['FrontendComponent'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param slide
     * @param parent
     * @param $el
     * @constructor
     */
    function FrontendComponentRow(slide, parent, $el) {

        this.$row = $el.find('.n2-ss-layer-row:first');
        this.$rowInner = this.$row.find('.n2-ss-layer-row-inner:first');
        N2Classes.FrontendComponent.prototype.constructor.call(this, slide, parent, $el, this.$rowInner.find('> .n2-ss-layer'));
    }

    FrontendComponentRow.prototype = Object.create(N2Classes.FrontendComponent.prototype);
    FrontendComponentRow.prototype.constructor = FrontendComponentRow;


    FrontendComponentRow.prototype.onDeviceChange = function (device) {
        N2Classes.FrontendComponent.prototype.onDeviceChange.apply(this, arguments);

        this.updatePadding();
        this.updateGutter();
        this.updateInnerAlign();
    };

    FrontendComponentRow.prototype.onAfterDeviceChange = function (device) {
        this.updateWrapAfter();
    };

    FrontendComponentRow.prototype.updatePadding = function () {
        var padding = this.getDevice('padding').split('|*|'),
            unit = padding.pop(),
            baseSize = this.baseSize;

        if (unit === 'px+' && baseSize > 0) {
            unit = 'em';
            for (var i = 0; i < padding.length; i++) {
                padding[i] = parseInt(padding[i]) / baseSize;
            }
        }
        this.$row.css('padding', padding.join(unit + ' ') + unit);
    };

    FrontendComponentRow.prototype.updateInnerAlign = function () {
        this.$layer.attr('data-csstextalign', this.getDevice('inneralign'));
    };

    FrontendComponentRow.prototype.updateGutter = function () {
        var gutterValue = this.getDevice('gutter'),
            sideGutterValue = gutterValue / 2;
        if (this.children.length > 0) {
            for (var i = this.children.length - 1; i >= 0; i--) {
                this.children[i].$layer
                    .css('margin', sideGutterValue + 'px');
            }
        }

        this.$rowInner.css({
            width: 'calc(100% + ' + (gutterValue + 1) + 'px)',
            margin: -sideGutterValue + 'px'
        });
    };

    FrontendComponentRow.prototype.getSortedColumns = function () {
        var columns = $.extend([], this.children).sort(function (a, b) {
            return a.getRealOrder() - b.getRealOrder();
        });

        for (var i = columns.length - 1; i >= 0; i--) {

            if (!columns[i].isVisible) {
                columns.splice(i, 1);
            }
        }

        return columns;
    };

    FrontendComponentRow.prototype.updateWrapAfter = function () {
        var wrapAfter = parseInt(this.getDevice('wrapafter')),
            columns = this.getSortedColumns(),
            columnsLength = columns.length,
            isWrapped = false;

        if (columnsLength === 0) {
            return false;
        }

        if (wrapAfter > 0 && wrapAfter < columnsLength) {
            isWrapped = true;
        }

        this.$row.attr('row-wrapped', isWrapped ? 1 : 0);

        var i;
        if (isWrapped) {
            var flexLines = [];
            for (i = 0; i < columnsLength; i++) {
                var row = Math.floor(i / wrapAfter);
                if (typeof flexLines[row] === 'undefined') {
                    flexLines[row] = [];
                }
                flexLines[row].push(columns[i]);
                columns[i].$layer
                    .attr('data-r', row)
                    .toggleClass('n2-ss-last-in-row', (i + 1) % wrapAfter === 0 || i === columnsLength - 1);
            }

            var gutterValue = this.getDevice('gutter');
            for (i = 0; i < flexLines.length; i++) {
                var flexLine = flexLines[i],
                    sumWidth = 0,
                    j;
                for (j = 0; j < flexLine.length; j++) {
                    sumWidth += flexLine[j].getWidthPercentage();
                }
                for (j = 0; j < flexLine.length; j++) {
                    flexLine[j].$layer.css('width', 'calc(' + (flexLine[j].getWidthPercentage() / sumWidth * 100) + '% - ' + (n2const.isIE || n2const.isEdge ? gutterValue + 1 : gutterValue) + 'px)');
                }
            }
        } else {
            var sumWidth = 0;
            for (i = 0; i < columnsLength; i++) {
                sumWidth += columns[i].getWidthPercentage();
            }
            for (i = 0; i < columnsLength; i++) {
                columns[i].$layer
                    .css('width', (columns[i].getWidthPercentage() / sumWidth * 100) + '%')
                    .removeClass('n2-ss-last-in-row')
                    .attr('data-r', 0);
            }
            columns[columnsLength - 1].$layer.addClass('n2-ss-last-in-row');
        }
    };

    FrontendComponentRow.prototype.getContents = function () {
        return this.$row;
    };

    return FrontendComponentRow;
});
N2D('SmartSliderResponsive', function ($, undefined) {

    var isTablet = null,
        isMobile = null;

    /**
     * @memberOf N2Classes
     *
     * @param {N2Classes.SmartSliderAbstract} slider
     * @param parameters
     * @constructor
     */
    function SmartSliderResponsive(slider, parameters) {
        this.disableTransitions = false;
        this.disableTransitionsTimeout = null;
        this.lastClientHeight = 0;
        this.lastClientHeightTime = 0;
        this.lastOrientation = 0;

        this.pixelSnappingFraction = 0;

        this.focusOffsetTop = 0;

        this.focusOffsetBottom = 0;

        this.isFullScreen = false;

        this.invalidateResponsiveState = true;

        this.parameters = $.extend({
            desktop: 1,
            tablet: 1,
            mobile: 1,

            onResizeEnabled: true,
            type: 'auto',
            downscale: true,
            upscale: false,
            constrainRatio: true,
            minimumHeight: 0,
            maximumHeight: 0,
            minimumHeightRatio: 0,
            maximumHeightRatio: {
                desktopLandscape: 0,
                desktopPortrait: 0,
                mobileLandscape: 0,
                mobilePortrait: 0,
                tabletLandscape: 0,
                tabletPortrait: 0
            },
            maximumSlideWidth: 0,
            maximumSlideWidthLandscape: 0,
            maximumSlideWidthRatio: -1,
            maximumSlideWidthTablet: 0,
            maximumSlideWidthTabletLandscape: 0,
            maximumSlideWidthMobile: 0,
            maximumSlideWidthMobileLandscape: 0,
            maximumSlideWidthConstrainHeight: 0,
            forceFull: 0,
            forceFullOverflowX: 'body',
            forceFullHorizontalSelector: '',
            sliderHeightBasedOn: 'real',
            decreaseSliderHeight: 0,

            focusUser: 1,

            deviceModes: {
                desktopLandscape: 1,
                desktopPortrait: 0,
                mobileLandscape: 0,
                mobilePortrait: 0,
                tabletLandscape: 0,
                tabletPortrait: 0
            },
            normalizedDeviceModes: {
                unknownUnknown: ["unknown", "Unknown"],
                desktopPortrait: ["desktop", "Portrait"]
            },
            verticalRatioModifiers: {
                unknownUnknown: 1,
                desktopLandscape: 1,
                desktopPortrait: 1,
                mobileLandscape: 1,
                mobilePortrait: 1,
                tabletLandscape: 1,
                tabletPortrait: 1
            },
            minimumFontSizes: {
                desktopLandscape: 0,
                desktopPortrait: 0,
                mobileLandscape: 0,
                mobilePortrait: 0,
                tabletLandscape: 0,
                tabletPortrait: 0
            },
            ratioToDevice: {
                Portrait: {
                    tablet: 0,
                    mobile: 0
                },
                Landscape: {
                    tablet: 0,
                    mobile: 0
                }
            },
            sliderWidthToDevice: {
                desktopLandscape: 0,
                desktopPortrait: 0,
                mobileLandscape: 0,
                mobilePortrait: 0,
                tabletLandscape: 0,
                tabletPortrait: 0
            },

            basedOn: 'combined',
            desktopPortraitScreenWidth: 1200,
            tabletPortraitScreenWidth: 800,
            mobilePortraitScreenWidth: 440,
            tabletLandscapeScreenWidth: 1024,
            mobileLandscapeScreenWidth: 740,
            orientationMode: 'width_and_height',
            overflowHiddenPage: 0,
            focus: {
                offsetTop: '',
                offsetBottom: ''
            }
        }, parameters);

        if (slider.isAdmin) {
            this.doResize = NextendThrottle(this.doResize, 50);
        }

        this.loadDeferred = $.Deferred();

        /**
         * @type {N2Classes.SmartSliderAbstract}
         */
        this.slider = slider;
        this.sliderElement = slider.sliderElement;
    }

    SmartSliderResponsive.OrientationMode = {
        SCREEN: 0,
        ADMIN_LANDSCAPE: 1,
        ADMIN_PORTRAIT: 2,
        SCREEN_WIDTH_ONLY: 3
    };
    SmartSliderResponsive.DeviceOrientation = {
        UNKNOWN: 0,
        LANDSCAPE: 1,
        PORTRAIT: 2
    };
    SmartSliderResponsive._DeviceOrientation = {
        0: 'Unknown',
        1: 'Landscape',
        2: 'Portrait'
    };
    SmartSliderResponsive.DeviceMode = {
        UNKNOWN: 0,
        DESKTOP: 1,
        TABLET: 2,
        MOBILE: 3
    };
    SmartSliderResponsive._DeviceMode = {
        0: 'unknown',
        1: 'desktop',
        2: 'tablet',
        3: 'mobile'
    };

    SmartSliderResponsive.prototype.start = function () {

        if (nextend.fontsDeferred === undefined) {
            N2R('windowLoad', $.proxy(function () {
                this.loadDeferred.resolve();
            }, this));
        } else {
            nextend.fontsDeferred.always($.proxy(function () {
                this.loadDeferred.resolve();
            }, this));
        }


        this.normalizeTimeout = null;
        this.delayedResizeAdded = false;

        this.deviceMode = SmartSliderResponsive.DeviceMode.UNKNOWN;
        this.orientationMode = SmartSliderResponsive.OrientationMode.SCREEN;
        this.orientation = SmartSliderResponsive.DeviceOrientation.UNKNOWN;
        this.lastRatios = {
            ratio: -1
        };
        this.lastRawRatios = {
            ratio: -1
        };
        this.normalizedMode = 'unknownUnknown';

        this.widgetMargins = {
            Top: [],
            Right: [],
            Bottom: [],
            Left: []
        };
        this.staticSizes = {
            paddingTop: 0,
            paddingRight: 0,
            paddingBottom: 0,
            paddingLeft: 0
        };
        this.enabledWidgetMargins = [];


        this.alignElement = this.slider.sliderElement.closest('.n2-ss-align');
        this.$section = this.alignElement.parent();

        var ready = this.ready = $.Deferred();

        this.sliderElement.triggerHandler('SliderResponsiveStarted');

        this.sliderElement.one('SliderResize', function () {
            ready.resolve();
        });

        if (this.parameters.type === 'fullpage' && this.parameters.sliderHeightBasedOn === '100vh') {
            this.$viewportHeight = $('<div style="height:100vh;width:0;position:absolute;bottom:0;visibility:hidden;"></div>').appendTo('body');
        }


        this.containerElementPadding = this.sliderElement.parent();
        this.containerElement = this.containerElementPadding.parent();


        if (!this.slider.isAdmin && this.parameters.overflowHiddenPage) {
            $('html, body').css('overflow', 'hidden');
        }

        if (this.parameters.orientationMode == 'width') {
            this.orientationMode = SmartSliderResponsive.OrientationMode.SCREEN_WIDTH_ONLY;
        }

        nextend.smallestZoom = Math.min(Math.max(this.parameters.sliderWidthToDevice.mobilePortrait, 120), 320);

        switch (this.parameters.basedOn) {
            case 'screen':
                break;
            default:
                if (isTablet == null) {
                    var md = new MobileDetect(window.navigator.userAgent, 801);
                    isTablet = !!md.tablet();
                    isMobile = !!md.phone();
                }
        }

        n2c.log('Responsive: Store defaults');
        this.storeDefaults();

        if (this.parameters.minimumHeight > 0) {
            this.parameters.minimumHeightRatio = this.parameters.minimumHeight / this.responsiveDimensions.startHeight;
        }

        if (this.parameters.maximumHeight > 0 && this.parameters.maximumHeight >= this.parameters.minimumHeight) {
            this.parameters.maximumHeightRatio = {
                desktopPortrait: this.parameters.maximumHeight / this.responsiveDimensions.startHeight
            };
            this.parameters.maximumHeightRatio.desktopLandscape = this.parameters.maximumHeightRatio.desktopPortrait;
            this.parameters.maximumHeightRatio.tabletPortrait = this.parameters.maximumHeightRatio.desktopPortrait;
            this.parameters.maximumHeightRatio.tabletLandscape = this.parameters.maximumHeightRatio.desktopPortrait;
            this.parameters.maximumHeightRatio.mobilePortrait = this.parameters.maximumHeightRatio.desktopPortrait;
            this.parameters.maximumHeightRatio.mobileLandscape = this.parameters.maximumHeightRatio.desktopPortrait;
        }
        if (this.parameters.maximumSlideWidth > 0) {
            this.parameters.maximumSlideWidthRatio = {
                desktopPortrait: this.parameters.maximumSlideWidth / this.responsiveDimensions.startSlideWidth,
                desktopLandscape: this.parameters.maximumSlideWidthLandscape / this.responsiveDimensions.startSlideWidth,
                tabletPortrait: this.parameters.maximumSlideWidthTablet / this.responsiveDimensions.startSlideWidth,
                tabletLandscape: this.parameters.maximumSlideWidthTabletLandscape / this.responsiveDimensions.startSlideWidth,
                mobilePortrait: this.parameters.maximumSlideWidthMobile / this.responsiveDimensions.startSlideWidth,
                mobileLandscape: this.parameters.maximumSlideWidthMobileLandscape / this.responsiveDimensions.startSlideWidth
            };

            if (this.parameters.maximumSlideWidthConstrainHeight) {
                this.parameters.maximumHeightRatio = $.extend({}, this.parameters.maximumSlideWidthRatio);
                for (var k in this.parameters.maximumHeightRatio) {
                    this.parameters.maximumHeightRatio[k] *= this.parameters.verticalRatioModifiers[k];
                }
            }
        }

        n2c.log('Responsive: First resize');
        if (N2Classes.Zoom !== undefined) {
            N2Classes.Zoom.add(this);
        }

        this.onResize();

        $(window).on('SliderContentResize', $.proxy(function (e) {
            this.invalidateResponsiveState = true;
            this.onResize(e);
        }, this));

        if (this.parameters.onResizeEnabled || this.parameters.type == 'adaptive') {
            $(window).on({
                resize: $.proxy(this.onResize, this),
                orientationchange: $.proxy(this.onResize, this)
            });

            this.sliderElement.on('SliderInternalResize', $.proxy(this.onResize, this));


            if (window.ResizeObserver !== undefined) {
                var width = 0,
                    observer = new ResizeObserver($.proxy(function (entries) {
                        entries.forEach($.proxy(function (entry) {
                            if (width !== entry.contentRect.width) {
                                width = entry.contentRect.width;
                                this.sliderElement.triggerHandler('SliderInternalResize');
                            }
                        }, this));
                    }, this));
                observer.observe(this.containerElement.parent().get(0));
            } else {
                try {
                    /**
                     * We can detect every width changes with a dummy iframe.
                     */
                    var iframe = $('<iframe class="bt_skip_resize" sandbox="allow-same-origin allow-scripts" style="margin:0;padding:0;border:0;display:block;width:100%;height:0;min-height:0;max-height:0px;"/>')
                        .on('load', $.proxy(function (e) {
                            var width = 0,
                                $frame = $(e.target.contentWindow ? e.target.contentWindow : e.target.contentDocument.defaultView).on('resize', $.proxy(function (e) {
                                    var newWidth = $frame.width();
                                    if (width !== newWidth) {
                                        width = newWidth;
                                        this.sliderElement.triggerHandler('SliderInternalResize');
                                    }
                                }, this));
                            /**
                             * Proxy window lang to the iframe
                             */
                            $frame[0].document.getElementsByTagName("HTML")[0].setAttribute("lang", window.document.getElementsByTagName("HTML")[0].getAttribute('lang'));
                        }, this)).insertBefore(this.containerElement);
                } catch (e) {
                }
            }
        }
    };

    SmartSliderResponsive.prototype.getOuterWidth = function () {
        return this.responsiveDimensions.startSliderWidth + this.responsiveDimensions.startSliderMarginLeft + this.responsiveDimensions.startSliderMarginRight;
    };

    SmartSliderResponsive.prototype.storeDefaults = function () {

        // We should use outerWidth(true) as we need proper margin calculation for the ratio
        this.responsiveDimensions = {
            startWidth: this.sliderElement.outerWidth(true),
            startHeight: this.sliderElement.outerHeight(true),
            startSliderMarginhorizontal: 0,
            startSliderMarginvertical: 0
        };

        /**
         * @type {N2Classes.SmartSliderResponsiveElement[]}
         */
        this.horizontalElements = [];
        this.verticalElements = [];

        this.init();

        this.margins = {
            top: this.responsiveDimensions.startSliderMarginTop,
            right: this.responsiveDimensions.startSliderMarginRight,
            bottom: this.responsiveDimensions.startSliderMarginBottom,
            left: this.responsiveDimensions.startSliderMarginLeft
        }
    };

    SmartSliderResponsive.prototype.addHorizontalElement = function (element, cssproperties, ratioName, name) {
        ratioName = ratioName || 'ratio';

        var responsiveElement = new N2Classes.SmartSliderResponsiveElement(this, ratioName, element, cssproperties, name);
        this.horizontalElements.push(responsiveElement);
        return responsiveElement;
    };

    SmartSliderResponsive.prototype.addVerticalElement = function (element, cssproperties, ratioName, name) {
        ratioName = ratioName || 'ratio';

        var responsiveElement = new N2Classes.SmartSliderResponsiveElement(this, ratioName, element, cssproperties, name);
        this.verticalElements.push(responsiveElement);
        return responsiveElement;
    };

    SmartSliderResponsive.prototype.resizeHorizontalElements = function (ratios) {
        for (var i = 0; i < this.horizontalElements.length; i++) {
            var responsiveElement = this.horizontalElements[i];
            if (typeof ratios[responsiveElement.ratioName] === 'undefined') {
                debugger;
                console.log('error with ' + responsiveElement.ratioName);
            }
            responsiveElement.resize(this.responsiveDimensions, ratios[responsiveElement.ratioName], false, 0);
        }

        this.slider.sliderElement.triggerHandler('SliderResizeHorizontal');
    };

    SmartSliderResponsive.prototype.updateVerticalRatios = function (ratios) {

        return ratios;
    };

    SmartSliderResponsive.prototype._updateVerticalRatios = function (ratios) {

        var targetHeight = this.responsiveDimensions.startSlideHeight * ratios.slideH,
            hasMainContent = false;
        this.sliderElement.find('.n2-ss-section-main-content')
            .addClass('n2-ss-section-main-content-calc')
            .each(function (i, el) {
                var height = $(el).outerHeight();
                if (height > targetHeight) {
                    hasMainContent = true;
                    targetHeight = height;
                }
            }).removeClass('n2-ss-section-main-content-calc');
        if (hasMainContent) {
            ratios.slideH = targetHeight / this.responsiveDimensions.startSlideHeight;
            ratios.h = Math.max(ratios.h, ratios.slideH);
        }

        return ratios;
    };

    SmartSliderResponsive.prototype.resizeVerticalElements = function (ratios, timeline, duration) {

        for (var i = 0; i < this.verticalElements.length; i++) {
            var responsiveElement = this.verticalElements[i];
            if (typeof ratios[responsiveElement.ratioName] === 'undefined') {
                console.log('error with ' + responsiveElement.ratioName);
            }
            responsiveElement.resize(this.responsiveDimensions, ratios[responsiveElement.ratioName], timeline, duration);
        }
    };

    SmartSliderResponsive.prototype.getDeviceMode = function () {
        return SmartSliderResponsive._DeviceMode[this.deviceMode];
    };

    SmartSliderResponsive.prototype.getDeviceModeOrientation = function () {
        return SmartSliderResponsive._DeviceMode[this.deviceMode] + SmartSliderResponsive._DeviceOrientation[this.orientation];
    };

    SmartSliderResponsive.prototype.onResize = function (e) {
        if (!this.slider.mainAnimation || this.slider.mainAnimation.getState() != 'playing') {
            this._onResize(e);
        } else if (!this.delayedResizeAdded) {
            this.delayedResizeAdded = true;
            this.sliderElement.on('mainAnimationComplete.responsive', $.proxy(this._onResize, this, e));
        }
    };

    SmartSliderResponsive.prototype._onResize = function (e) {
        this.doResize(e);
        this.delayedResizeAdded = false;
    };


    SmartSliderResponsive.prototype.doNormalizedResize = function () {
        if (this.normalizeTimeout) {
            clearTimeout(this.normalizeTimeout);
        }

        this.normalizeTimeout = setTimeout($.proxy(this.doResize, this), 10);
    };

    SmartSliderResponsive.prototype._getOrientation = function () {
        if (this.orientationMode == SmartSliderResponsive.OrientationMode.SCREEN) {
            if (window.innerHeight <= window.innerWidth) {
                return SmartSliderResponsive.DeviceOrientation.LANDSCAPE;
            } else {
                return SmartSliderResponsive.DeviceOrientation.PORTRAIT;
            }
        } else if (this.orientationMode == SmartSliderResponsive.OrientationMode.ADMIN_PORTRAIT) {
            return SmartSliderResponsive.DeviceOrientation.PORTRAIT;
        } else if (this.orientationMode == SmartSliderResponsive.OrientationMode.ADMIN_LANDSCAPE) {
            return SmartSliderResponsive.DeviceOrientation.LANDSCAPE;
        }
    };

    SmartSliderResponsive.prototype._getDevice = function () {
        switch (this.parameters.basedOn) {
            case 'combined':
                return this._getDeviceDevice(this._getDeviceScreenWidth());
            case 'device':
                return this._getDeviceDevice(SmartSliderResponsive.DeviceMode.DESKTOP);
            case 'screen':
                return this._getDeviceScreenWidth();
        }
    };

    SmartSliderResponsive.prototype._getDeviceScreenWidth = function () {
        var viewportWidth = window.innerWidth;
        if (this.orientation == SmartSliderResponsive.DeviceOrientation.PORTRAIT) {
            if (viewportWidth < this.parameters.mobilePortraitScreenWidth) {
                return SmartSliderResponsive.DeviceMode.MOBILE;
            } else if (viewportWidth < this.parameters.tabletPortraitScreenWidth) {
                return SmartSliderResponsive.DeviceMode.TABLET;
            }
        } else {
            if (viewportWidth < this.parameters.mobileLandscapeScreenWidth) {
                return SmartSliderResponsive.DeviceMode.MOBILE;
            } else if (viewportWidth < this.parameters.tabletLandscapeScreenWidth) {
                return SmartSliderResponsive.DeviceMode.TABLET;
            }
        }
        return SmartSliderResponsive.DeviceMode.DESKTOP;
    };

    SmartSliderResponsive.prototype._getDeviceAndOrientationByScreenWidth = function () {
        var viewportWidth = window.innerWidth;
        if (viewportWidth < this.parameters.mobilePortraitScreenWidth) {
            return [SmartSliderResponsive.DeviceMode.MOBILE, SmartSliderResponsive.DeviceOrientation.PORTRAIT];
        } else if (viewportWidth < this.parameters.mobileLandscapeScreenWidth) {
            return [SmartSliderResponsive.DeviceMode.MOBILE, SmartSliderResponsive.DeviceOrientation.LANDSCAPE];
        } else if (viewportWidth < this.parameters.tabletPortraitScreenWidth) {
            return [SmartSliderResponsive.DeviceMode.TABLET, SmartSliderResponsive.DeviceOrientation.PORTRAIT];
        } else if (viewportWidth < this.parameters.tabletLandscapeScreenWidth) {
            return [SmartSliderResponsive.DeviceMode.TABLET, SmartSliderResponsive.DeviceOrientation.LANDSCAPE];
        } else if (viewportWidth < this.parameters.desktopPortraitScreenWidth) {
            return [SmartSliderResponsive.DeviceMode.DESKTOP, SmartSliderResponsive.DeviceOrientation.PORTRAIT];
        }
        return [SmartSliderResponsive.DeviceMode.DESKTOP, SmartSliderResponsive.DeviceOrientation.LANDSCAPE];
    };

    SmartSliderResponsive.prototype._getDeviceDevice = function (device) {
        if (isMobile === true) {
            return SmartSliderResponsive.DeviceMode.MOBILE;
        } else if (isTablet && device != SmartSliderResponsive.DeviceMode.MOBILE) {
            return SmartSliderResponsive.DeviceMode.TABLET;
        }
        return device;
    };

    SmartSliderResponsive.prototype._getDeviceZoom = function (ratio) {
        var orientation;
        if (this.orientationMode == SmartSliderResponsive.OrientationMode.ADMIN_PORTRAIT) {
            orientation = SmartSliderResponsive.DeviceOrientation.PORTRAIT;
        } else if (this.orientationMode == SmartSliderResponsive.OrientationMode.ADMIN_LANDSCAPE) {
            orientation = SmartSliderResponsive.DeviceOrientation.LANDSCAPE;
        }
        var targetMode = SmartSliderResponsive.DeviceMode.DESKTOP;

        if (ratio - this.parameters.ratioToDevice[SmartSliderResponsive._DeviceOrientation[orientation]].mobile < 0.001) {
            targetMode = SmartSliderResponsive.DeviceMode.MOBILE;
        } else if (ratio - this.parameters.ratioToDevice[SmartSliderResponsive._DeviceOrientation[orientation]].tablet < 0.001) {
            targetMode = SmartSliderResponsive.DeviceMode.TABLET;
        }
        return targetMode;
    };

    SmartSliderResponsive.prototype.updateOffsets = function () {
        this.focusOffsetTop = 0;
        if (this.parameters.focus.offsetTop !== '') {
            var $offsetTopElements = $(this.parameters.focus.offsetTop);
            for (var i = 0; i < $offsetTopElements.length; i++) {
                this.focusOffsetTop += $offsetTopElements.eq(i).outerHeight();
            }
        }

        this.focusOffsetBottom = 0;
        if (this.parameters.focus.offsetBottom !== '') {
            var $offsetBottomElements = $(this.parameters.focus.offsetBottom);
            for (var i = 0; i < $offsetBottomElements.length; i++) {
                this.focusOffsetBottom += $offsetBottomElements.eq(i).outerHeight();
            }
        }
    };

    /**
     * Snapping the slider to rounded pixel to fix issues related to a Chrome rendering bug
     * @see https://bugs.chromium.org/p/chromium/issues/detail?id=936006#c6
     */
    SmartSliderResponsive.prototype.doPixelSnapping = function () {
        var left = this.containerElementPadding[0].getBoundingClientRect().left + this.pixelSnappingFraction,
            fraction = Math.max(0, left % 1);

        if (fraction !== this.pixelSnappingFraction) {
            this.containerElementPadding.css({
                'marginLeft': (-fraction) + 'px',
                'marginRight': (-fraction) + 'px'
            });

            this.pixelSnappingFraction = fraction;
        }
    };

    SmartSliderResponsive.prototype.doResize = function (e, timeline, nextSlide, duration) {

        this.doPixelSnapping();

        this.updateOffsets();

        if (!this.disableTransitions) {
            this.disableTransitions = true;
            this.sliderElement.addClass('n2notransition');
            if (this.disableTransitionsTimeout) {
                clearTimeout(this.disableTransitionsTimeout);
            }
            this.disableTransitionsTimeout = setTimeout($.proxy(function () {
                this.sliderElement.removeClass('n2notransition');
                this.disableTransitions = false;
            }, this), 500);
        }

        if (!this.containerElementPadding.is(':visible')) {
            /**
             * The slider is not visible, so there is nothing to resize.
             */
            return false;
        }

        // required to force recalculate if the thumbnails widget get hidden.
        this.refreshMargin();

        var maxWidth;

        if (this.slider.parameters.align === 'center') {
            if (this.parameters.type === 'fullpage') {
                this.alignElement.css('maxWidth', 'none');
            } else {
                maxWidth = this.responsiveDimensions.startWidth;
                if (this.staticSizes) {
                    maxWidth += this.staticSizes.paddingLeft + this.staticSizes.paddingRight;
                }
                this.alignElement.css('maxWidth', maxWidth);
            }
        }

        if (!this.slider.isAdmin) {
            if (this.parameters.forceFull) {
                if (this.parameters.forceFullOverflowX !== 'none') {
                    $(this.parameters.forceFullOverflowX).css('overflow-x', 'hidden');
                }
                var customWidth = 0,
                    adjustLeftOffset = 0;

                if (this.parameters.forceFullHorizontalSelector !== '') {
                    var $fullWidthTo = this.sliderElement.closest(this.parameters.forceFullHorizontalSelector);
                    if ($fullWidthTo && $fullWidthTo.length > 0) {
                        customWidth = $fullWidthTo.width();
                        adjustLeftOffset = $fullWidthTo.offset().left;
                    }
                }

                var windowWidth = customWidth > 0 ? customWidth : (document.body.clientWidth || document.documentElement.clientWidth),
                    outerEl = this.containerElement.parent(),
                    outerElLeft = outerEl.offset().left,
                    outerElOffset;
                if (n2const.rtl.isRtl) {
                    outerElOffset = windowWidth - (outerElLeft + outerEl.outerWidth());
                } else {
                    outerElOffset = outerElLeft;
                }
                this.containerElement.css(n2const.rtl.marginLeft, -outerElOffset - parseInt(outerEl.css('paddingLeft')) - parseInt(outerEl.css('borderLeftWidth')) + adjustLeftOffset)
                    .width(windowWidth);
            }
        }

        var ratio = this.containerElementPadding.width() / this.getOuterWidth();

        var hasOrientationOrDeviceChange = false,
            lastOrientation = this.orientation,
            lastDevice = this.deviceMode,
            targetOrientation = null,
            targetMode = null;

        if (this.orientationMode === SmartSliderResponsive.OrientationMode.SCREEN_WIDTH_ONLY) {
            var deviceOrientation = this._getDeviceAndOrientationByScreenWidth();
            targetMode = deviceOrientation[0];
            targetOrientation = deviceOrientation[1];
        } else {
            targetOrientation = this._getOrientation()
        }

        if (this.orientation !== targetOrientation) {
            this.orientation = targetOrientation;
            hasOrientationOrDeviceChange = true;
            n2c.log('Event: SliderOrientation', {
                lastOrientation: SmartSliderResponsive._DeviceOrientation[lastOrientation],
                orientation: SmartSliderResponsive._DeviceOrientation[targetOrientation]
            });
            this.sliderElement.trigger('SliderOrientation', {
                lastOrientation: SmartSliderResponsive._DeviceOrientation[lastOrientation],
                orientation: SmartSliderResponsive._DeviceOrientation[targetOrientation]
            });
        }

        if (this.orientationMode !== SmartSliderResponsive.OrientationMode.SCREEN_WIDTH_ONLY) {
            targetMode = this._getDevice(ratio);
        }

        if (this.deviceMode !== targetMode) {
            this.deviceMode = targetMode;
            this.sliderElement.removeClass('n2-ss-' + SmartSliderResponsive._DeviceMode[lastDevice])
                .addClass('n2-ss-' + SmartSliderResponsive._DeviceMode[targetMode]);
            n2c.log('Event: SliderDevice', {
                lastDevice: SmartSliderResponsive._DeviceMode[lastDevice],
                device: SmartSliderResponsive._DeviceMode[targetMode]
            });
            this.sliderElement.trigger('SliderDevice', {
                lastDevice: SmartSliderResponsive._DeviceMode[lastDevice],
                device: SmartSliderResponsive._DeviceMode[targetMode]
            });
            hasOrientationOrDeviceChange = true;
        }

        if (!this.slider.isAdmin) {
            if (this.parameters.type === 'fullpage') {
                var clientHeight = 0;
                if (this.parameters.sliderHeightBasedOn === '100vh') {
                    clientHeight = this.$viewportHeight.height();
                } else {
                    if (window.matchMedia && (/Android|iPhone|iPad|iPod|BlackBerry/i).test(navigator.userAgent || navigator.vendor || window.opera)) {
                        var innerHeight,
                            isOrientationChanged = false;

                        if (e && e.type === 'orientationchange') {
                            isOrientationChanged = true;
                        }

                        if (n2const.isIOS) {
                            innerHeight = document.documentElement.clientHeight;
                        } else {
                            innerHeight = window.innerHeight;
                        }

                        if (window.matchMedia("(orientation: landscape)").matches) {
                            // landscape
                            clientHeight = Math.min(screen.width, innerHeight);
                            if (this.lastOrientation != 90) {
                                isOrientationChanged = true;
                                this.lastOrientation = 90;
                            }
                        } else {
                            clientHeight = Math.min(screen.height, innerHeight);
                            if (this.lastOrientation != 0) {
                                isOrientationChanged = true;
                                this.lastOrientation = 0;
                            }
                        }

                        clientHeight = window.n2ClientHeight || clientHeight;

                        var time = $.now();
                        /**
                         * If screen height change smaller than this value, then we will skip that resize.
                         * @type {number}
                         */
                        var dismissDeltaChange = 100;
                        if ((/SamsungBrowser/i).test(navigator.userAgent)) {
                            dismissDeltaChange = 150;
                        }
                        if (!isOrientationChanged && Math.abs(clientHeight - this.lastClientHeight) < dismissDeltaChange && time - this.lastClientHeightTime > 400) {
                            clientHeight = this.lastClientHeight;
                        } else {
                            this.lastClientHeight = clientHeight;
                            this.lastClientHeightTime = time;
                        }
                    } else {
                        clientHeight = window.n2ClientHeight || document.documentElement.clientHeight || document.body.clientHeight;
                    }
                }

                if (n2const.isBot) {
                    clientHeight = Math.min(clientHeight, (document.documentElement.clientWidth || document.body.clientWidth));
                }

                this.parameters.maximumHeightRatio[this.getDeviceModeOrientation()] = this.parameters.minimumHeightRatio = (clientHeight - this.getVerticalOffsetHeight()) / this.responsiveDimensions.startHeight;
            }
        }

        if (hasOrientationOrDeviceChange) {
            this.invalidateResponsiveState = true;
            var lastNormalized = this._normalizeMode(SmartSliderResponsive._DeviceMode[lastDevice], SmartSliderResponsive._DeviceOrientation[lastOrientation]),
                normalized = this._normalizeMode(SmartSliderResponsive._DeviceMode[this.deviceMode], SmartSliderResponsive._DeviceOrientation[this.orientation]);

            if (lastNormalized[0] !== normalized[0] || lastNormalized[1] !== normalized[1]) {
                this.normalizedMode = normalized[0] + normalized[1];
                n2c.log('Event: SliderDeviceOrientation', {
                    lastDevice: lastNormalized[0],
                    lastOrientation: lastNormalized[1],
                    device: normalized[0],
                    orientation: normalized[1]
                });
                this.sliderElement.trigger('SliderDeviceOrientation', {
                    lastDevice: lastNormalized[0],
                    lastOrientation: lastNormalized[1],
                    device: normalized[0],
                    orientation: normalized[1]
                });
            }
        }

        var zeroRatio = this.parameters.sliderWidthToDevice[this.normalizedMode] / this.parameters.sliderWidthToDevice.desktopPortrait;
        if (!this.parameters.downscale && ratio < zeroRatio) {
            ratio = zeroRatio;
        } else if (!this.parameters.upscale && ratio > zeroRatio) {
            ratio = zeroRatio;
        }
        this._doResize(ratio, timeline, nextSlide, duration);

        if (this.slider.parameters.align === 'center') {
            maxWidth = this.responsiveDimensions.slider.width;
            if (this.staticSizes) {
                maxWidth += this.staticSizes.paddingLeft + this.staticSizes.paddingRight;
            }
            if (this.responsiveDimensions) {
                maxWidth += this.responsiveDimensions['startSliderMarginhorizontal'];
            }
            this.alignElement.css('maxWidth', maxWidth);
        }
    };

    SmartSliderResponsive.prototype._normalizeMode = function (device, orientation) {
        return this.parameters.normalizedDeviceModes[device + orientation];
    };

    SmartSliderResponsive.prototype.getNormalizedModeString = function () {
        var normalized = this._normalizeMode(SmartSliderResponsive._DeviceMode[this.deviceMode], SmartSliderResponsive._DeviceOrientation[this.orientation]);
        return normalized.join('');
    };

    SmartSliderResponsive.prototype.getModeString = function () {
        return SmartSliderResponsive._DeviceMode[this.deviceMode] + SmartSliderResponsive._DeviceOrientation[this.orientation];
    };

    SmartSliderResponsive.prototype.enabled = function (device, orientation) {
        return this.parameters.deviceModes[device + orientation];
    };

    SmartSliderResponsive.prototype._doResize = function (ratio, timeline, nextSlide, duration) {
        var ratios = {
            ratio: ratio,
            w: ratio,
            h: ratio,
            slideW: ratio,
            slideH: ratio,
            fontRatio: 1
        };

        this._buildRatios(ratios, this.slider.parameters.dynamicHeight, nextSlide);

        ratios.fontRatio = ratios.slideW;


        var isChanged = false;
        for (var k in ratios) {
            if (ratios[k] != this.lastRawRatios[k]) {
                isChanged = true;
                break;
            }
        }
        if (this.invalidateResponsiveState || isChanged) {
            this.lastRawRatios = $.extend({}, ratios);

            this.resizeHorizontalElements(ratios);

            this.finishResize(ratios, timeline, duration);
        }
    };

    SmartSliderResponsive.prototype.finishResize = function (ratios, timeline, duration) {
        this.loadDeferred.done($.proxy(function () {
            var cb = $.proxy(function () {
                this.finishResize = this._finishResize;
                this.finishResize(ratios, timeline, duration);
            }, this);
            if ((/OS X.*Version\/10\..*Safari/.exec(window.navigator.userAgent) && /Apple/.exec(window.navigator.vendor)) || /CriOS/.exec(window.navigator.userAgent)) {
                setTimeout(cb, 200);
            } else {
                cb();
            }


        }, this));

        this.invalidateResponsiveState = false;
    };

    SmartSliderResponsive.prototype._finishResize = function (ratios, timeline, duration) {
        this.invalidateResponsiveState = false;

        ratios = this.updateVerticalRatios(ratios);

        this.resizeVerticalElements(ratios, timeline, duration);


        this.lastRatios = ratios;

        if (timeline) {
            this.sliderElement.trigger('SliderAnimatedResize', [ratios, timeline, duration]);
            timeline.eventCallback("onComplete", function () {
                this.triggerResize(ratios, timeline);
            }, [], this);
        } else {
            this.triggerResize(ratios, false);
        }

    };

    /**
     * Admin only
     */
    SmartSliderResponsive.prototype.doVerticalResize = function () {

        var ratios = this.updateVerticalRatios($.extend({}, this.lastRawRatios)),
            isChanged = false;
        for (var k in ratios) {
            if (ratios[k] != this.lastRatios[k]) {
                isChanged = true;
                break;
            }
        }

        if (isChanged) {
            this.finishVerticalResize(ratios);
        }
    };

    SmartSliderResponsive.prototype.finishVerticalResize = function (ratios) {
        this.loadDeferred.done($.proxy(function () {
            this.finishVerticalResize = this._finishVerticalResize;
            this.finishVerticalResize(ratios);
        }, this));
    };

    SmartSliderResponsive.prototype._finishVerticalResize = function (ratios) {
        this.resizeVerticalElements(ratios, false, 0);

        this.lastRatios = ratios;
        this.triggerResize(ratios, false);

    };

    SmartSliderResponsive.prototype.triggerResize = function (ratios, timeline) {
        n2c.log('Event: SliderResize', ratios);
        this.sliderElement.trigger('SliderResize', [ratios, this, timeline]);
    };

    SmartSliderResponsive.prototype._buildRatios = function (ratios, dynamicHeight, nextSlide) {

        var deviceModeOrientation = this.getDeviceModeOrientation();

        if (this.parameters.maximumSlideWidthRatio[deviceModeOrientation] > 0 && ratios.slideW > this.parameters.maximumSlideWidthRatio[deviceModeOrientation]) {
            ratios.slideW = this.parameters.maximumSlideWidthRatio[deviceModeOrientation];
        }

        ratios.slideW = ratios.slideH = Math.min(ratios.slideW, ratios.slideH);

        var verticalRatioModifier = this.parameters.verticalRatioModifiers[deviceModeOrientation];
        ratios.slideH *= verticalRatioModifier;

        if (this.parameters.type === 'fullpage') {
            ratios.h *= verticalRatioModifier;

            if (this.parameters.minimumHeightRatio > 0) {
                ratios.h = Math.max(ratios.h, this.parameters.minimumHeightRatio);
            }

            if (this.parameters.maximumHeightRatio[deviceModeOrientation] > 0) {
                ratios.h = Math.min(ratios.h, this.parameters.maximumHeightRatio[deviceModeOrientation]);
            }

            if (this.slider.isAdmin) {
                if (!this.parameters.constrainRatio) {
                    ratios.w = ratios.slideW;
                    ratios.h = ratios.slideH;
                } else {
                    ratios.slideH = Math.min(ratios.slideH, ratios.h);
                    ratios.slideH = ratios.slideW = Math.min(ratios.slideW, ratios.slideH);
                }
            } else {
                if (!this.parameters.constrainRatio) {
                    ratios.slideW = ratios.w;
                    if (this.parameters.maximumSlideWidthRatio[deviceModeOrientation] > 0 && ratios.slideW > this.parameters.maximumSlideWidthRatio[deviceModeOrientation]) {
                        ratios.slideW = this.parameters.maximumSlideWidthRatio[deviceModeOrientation];
                    }
                    ratios.slideH = ratios.h;
                } else {
                    ratios.slideH = Math.min(ratios.slideH, ratios.h);
                    ratios.slideH = ratios.slideW = Math.min(ratios.slideW, ratios.slideH);
                }
            }
        } else {
            ratios.h *= verticalRatioModifier;

            if (this.parameters.minimumHeightRatio > 0) {
                ratios.h = Math.max(ratios.h, this.parameters.minimumHeightRatio);
            }

            if (this.parameters.maximumHeightRatio[deviceModeOrientation] > 0) {
                ratios.h = Math.min(ratios.h, this.parameters.maximumHeightRatio[deviceModeOrientation]);
            }

            ratios.slideH = Math.min(ratios.slideH, ratios.h);
            ratios.slideW = ratios.slideH / verticalRatioModifier;

            if (this.slider.type === "showcase") {
                ratios.slideW = Math.min(ratios.slideW, ratios.w);
                ratios.slideH = Math.min(ratios.slideW, ratios.slideH);
            }

            if (dynamicHeight) {

                /** @type {N2Classes.SmartSliderSlideBackground} */
                var backgroundImage;
                if (nextSlide !== undefined && nextSlide.background.elements.image !== undefined) {
                    backgroundImage = nextSlide.background.elements.image;
                } else if (this.slider.currentSlide.background.elements.image !== undefined) {
                    backgroundImage = this.slider.currentSlide.background.elements.image;
                }

                if (backgroundImage !== undefined && backgroundImage.width > 0 && backgroundImage.height > 0) {
                    var backgroundRatioModifier = (this.responsiveDimensions.startSlideWidth / backgroundImage.width) * (backgroundImage.height / this.responsiveDimensions.startSlideHeight);
                    if (backgroundRatioModifier > 0) {
                        ratios.slideH *= backgroundRatioModifier;
                        ratios.h *= backgroundRatioModifier;
                    }
                }
            }
        }

        this.sliderElement.triggerHandler('responsiveBuildRatios', [ratios]);
    };

    SmartSliderResponsive.prototype.getVerticalOffsetHeight = function () {
        if (this.isFullScreen) {
            return 0;
        }
        var h = this.focusOffsetTop + this.focusOffsetBottom;

        if (this.slider.widgets.$vertical) {
            for (var i = 0; i < this.slider.widgets.$vertical.length; i++) {
                h += this.slider.widgets.$vertical.eq(i).outerHeight();
            }
        }

        return h + this.parameters.decreaseSliderHeight;
    };

    SmartSliderResponsive.prototype.addMargin = function (side, widget) {
        this.widgetMargins[side].push(widget);
        if (widget.isVisible()) {
            this._addMarginSize(side, widget.getSize());
            this.enabledWidgetMargins.push(widget);
        }
        this.doNormalizedResize();
    };

    SmartSliderResponsive.prototype.addStaticMargin = function (side, widget) {
        if (side == 'Bottom' || side == 'Top') return;

        if (!this.widgetStaticMargins) {
            this.widgetStaticMargins = {
                Top: [],
                Right: [],
                Bottom: [],
                Left: []
            };
        }
        this.widgetStaticMargins[side].push(widget);
        this.doNormalizedResize();
    };

    SmartSliderResponsive.prototype.refreshMargin = function () {
        for (var side in this.widgetMargins) {
            var widgets = this.widgetMargins[side];
            for (var i = widgets.length - 1; i >= 0; i--) {
                var widget = widgets[i];
                if (widget.isVisible()) {
                    if ($.inArray(widget, this.enabledWidgetMargins) == -1) {
                        this._addMarginSize(side, widget.getSize());
                        this.enabledWidgetMargins.push(widget);
                    }
                } else {
                    var index = $.inArray(widget, this.enabledWidgetMargins);
                    if (index != -1) {
                        this._addMarginSize(side, -widget.getSize());
                        this.enabledWidgetMargins.splice(index, 1);
                    }
                }
            }
        }
        this.refreshStaticSizes();
    };

    SmartSliderResponsive.prototype.refreshStaticSizes = function () {
        if (this.widgetStaticMargins) {
            var staticSizes = {
                paddingTop: 0,
                paddingRight: 0,
                paddingBottom: 0,
                paddingLeft: 0
            };
            for (var side in this.widgetStaticMargins) {
                var widgets = this.widgetStaticMargins[side];
                for (var i = widgets.length - 1; i >= 0; i--) {
                    var widget = widgets[i];
                    if (widget.isVisible()) {
                        staticSizes['padding' + side] += widget.getSize();
                    }
                }
            }
            for (var k in staticSizes) {
                this.containerElementPadding.css(staticSizes);
            }
            this.staticSizes = staticSizes;
        }
    };

    SmartSliderResponsive.prototype._addMarginSize = function (side, size) {
        var axis = null;
        switch (side) {
            case 'Top':
            case 'Bottom':
                axis = this._sliderVertical;
                break;
            default:
                axis = this._sliderHorizontal;
        }
        axis.data['margin' + side] += size;
        this.responsiveDimensions['startSliderMargin' + side] += size;
    };

    return SmartSliderResponsive;
});
N2D('SmartSliderResponsiveElement', function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @constructor
     * @param responsive {SmartSliderResponsive} caller object
     * @param ratioName {String}
     * @param element {jQuery}
     * @param cssProperties {Array} Array of properties which will be responsive
     * @param name {String} we will register the changed values for this namespace in the global NextendSmartSliderResponsive objects' responsiveDimensions property
     */
    function SmartSliderResponsiveElement(responsive, ratioName, element, cssProperties, name) {
        this._lastRatio = 1;
        this.responsive = responsive;

        this.ratioName = ratioName;

        this.element = element;

        this._readyDeferred = $.Deferred();

        if (typeof name !== 'undefined') {
            this.name = name;
        } else {
            this.name = null;
        }

        this.data = {};

        this.helper = {
            /**
             * Holds the current element's parent element, which is required for the centered mode
             */
            parent: null,
            /**
             * Holds the current element's parent original width and height for images
             */
            parentProps: null,
            /**
             * If font size is enabled for the current element, this will hold the different font sized for the different devices
             */
            fontSize: false,
            /**
             * If this is enabled, the responsive mode will try to position the actual element into the center of the parent element
             */
            centered: false
        };

        this._lateInit(cssProperties);
    };

    SmartSliderResponsiveElement.prototype._lateInit = function (cssProperties) {

        this._cssProperties = cssProperties;

        this.reloadDefault();

        /**
         * If font-size is responsive on the element, we init this feature on the element.
         */
        if ($.inArray('fontSize', cssProperties) != -1) {

            this.data['fontSize'] = this.element.data('fontsize');

            this.helper.fontSize = {
                fontSize: this.element.data('fontsize'),
                desktopPortrait: this.element.data('minfontsizedesktopportrait'),
                desktopLandscape: this.element.data('minfontsizedesktoplandscape'),
                tabletPortrait: this.element.data('minfontsizetabletportrait'),
                tabletLandscape: this.element.data('minfontsizetabletlandscape'),
                mobilePortrait: this.element.data('minfontsizemobileportrait'),
                mobileLandscape: this.element.data('minfontsizemobilelandscape')
            };

            // Sets the proper font size for the current mode
            //this.setFontSizeByMode(this.responsive.mode.mode);

            // When the mode changes we have to adjust the original font size value in the data
            this.responsive.sliderElement.on('SliderDeviceOrientation', $.proxy(this.onModeChange, this));
        }

        // Our resource is finished with the loading, so we can enable the normal resize method.
        this.resize = this._resize;

        // We are ready
        this._readyDeferred.resolve();
    };

    SmartSliderResponsiveElement.prototype.reloadDefault = function () {

        for (var i = 0; i < this._cssProperties.length; i++) {
            var propName = this._cssProperties[i];
            this.data[propName] = parseInt(this.element.css(propName));
        }
        if (this.name) {
            var d = this.responsive.responsiveDimensions;
            for (var k in this.data) {
                d['start' + N2Classes.StringHelper.capitalize(this.name) + N2Classes.StringHelper.capitalize(k)] = this.data[k];
            }
        }
    };

    /**
     * You can use it as the normal jQuery ready, except it check for the current element list
     * @param {function} fn
     */
    SmartSliderResponsiveElement.prototype.ready = function (fn) {
        this._readyDeferred.done(fn);
    };

    /**
     * When the element list is not loaded yet, we have to add the current resize call to the ready event.
     * @example You have an image which is not loaded yet, but a resize happens on the browser. We have to make the resize later when the image is ready!
     * @param responsiveDimensions
     * @param ratio
     */
    SmartSliderResponsiveElement.prototype.resize = function (responsiveDimensions, ratio) {
        this.ready($.proxy(this.resize, this, responsiveDimensions, ratio));
        this._lastRatio = ratio;
    };

    SmartSliderResponsiveElement.prototype._resize = function (responsiveDimensions, ratio, timeline, duration) {
        if (this.name && typeof responsiveDimensions[this.name] === 'undefined') {
            responsiveDimensions[this.name] = {};
        }

        var to = {};
        for (var propName in this.data) {
            var value = this.data[propName] * ratio;
            if (typeof this[propName + 'Prepare'] == 'function') {
                value = this[propName + 'Prepare'](value);
            }

            if (this.name) {
                responsiveDimensions[this.name][propName] = value;
            }
            to[propName] = value;
        }
        if (timeline) {
            timeline.to(this.element, duration, to, 0);
        } else {
            this.element.css(to);

            if (this.helper.centered) {
                var verticalMargin = this.getVerticalMargin(parseInt((this.helper.parent.height() - this.element.height()) / 2)),
                    horizontalMargin = this.getHorizontalMargin(parseInt((this.helper.parent.width() - this.element.width()) / 2));
                this.element.css({
                    marginLeft: horizontalMargin,
                    marginRight: horizontalMargin,
                    marginTop: verticalMargin,
                    marginBottom: verticalMargin
                });
            }
        }
        this._lastRatio = ratio;
    };

    SmartSliderResponsiveElement.prototype.getHorizontalMargin = function (left) {
        return left;
    };

    SmartSliderResponsiveElement.prototype.getVerticalMargin = function (top) {
        return top;
    };

    SmartSliderResponsiveElement.prototype._refreshResize = function () {
        this.responsive.ready.done($.proxy(function () {
            this._resize(this.responsive.responsiveDimensions, this.responsive.lastRatios[this.ratioName]);
        }, this));
    };

    SmartSliderResponsiveElement.prototype.widthPrepare = function (value) {
        return Math.round(value);
    };

    SmartSliderResponsiveElement.prototype.heightPrepare = function (value) {
        return Math.round(value);
    };

    SmartSliderResponsiveElement.prototype.marginLeftPrepare = function (value) {
        return parseInt(value);
    };

    SmartSliderResponsiveElement.prototype.marginRightPrepare = function (value) {
        return parseInt(value);
    };

    SmartSliderResponsiveElement.prototype.lineHeightPrepare = function (value) {
        return value + 'px';
    };

    SmartSliderResponsiveElement.prototype.borderLeftWidthPrepare = function (value) {
        return parseInt(value);
    };

    SmartSliderResponsiveElement.prototype.borderRightWidthPrepare = function (value) {
        return parseInt(value);
    };

    SmartSliderResponsiveElement.prototype.borderTopWidthPrepare = function (value) {
        return parseInt(value);
    };

    SmartSliderResponsiveElement.prototype.borderBottomWidthPrepare = function (value) {
        return parseInt(value);
    };

    SmartSliderResponsiveElement.prototype.fontSizePrepare = function (value) {
        var mode = this.responsive.getNormalizedModeString();
        if (value < this.helper.fontSize[mode]) {
            return this.helper.fontSize[mode];
        }
        return value;
    };

    /**
     * Enables the centered feature on the current element.
     */
    SmartSliderResponsiveElement.prototype.setCentered = function () {
        this.helper.parent = this.element.parent();
        this.helper.centered = true;
    };

    SmartSliderResponsiveElement.prototype.unsetCentered = function () {
        this.helper.centered = false;
    };

    SmartSliderResponsiveElement.prototype.onModeChange = function () {
        this.setFontSizeByMode();
    };

    /**
     * Changes the original font size based on the current mode and also updates the current value on the element.
     * @param mode
     */
    SmartSliderResponsiveElement.prototype.setFontSizeByMode = function () {
        this.element.css('fontSize', this.fontSizePrepare(this.data['fontSize'] * this._lastRatio));
    };

    return SmartSliderResponsiveElement;
});


N2D('FrontendItemVimeo', function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param slider
     * @param id
     * @param sliderid
     * @param parameters
     * @param hasImage
     * @param start
     * @constructor
     */
    function FrontendItemVimeo(slider, id, sliderid, parameters, hasImage, start) {
        this.state = {
            scroll: false,
            slide: false,
            play: false,
            continuePlay: false
        };
        this.readyDeferred = $.Deferred();

        this.slider = slider;
        this.playerId = id;
        this.$playerElement = $("#" + this.playerId);
        this.$cover = this.$playerElement.find('.n2-ss-layer-player-cover');

        this.start = start;

        this.parameters = $.extend({
            vimeourl: "//vimeo.com/144598279",
            autoplay: "0",
            reset: "0",
            title: "1",
            byline: "1",
            portrait: "0",
            loop: "0",
            color: "00adef",
            volume: "-1"
        }, parameters);

        if (navigator.userAgent.toLowerCase().indexOf("android") > -1) {
            this.parameters.autoplay = 0;
        }

        if (parseInt(this.parameters.autoplay) === 1 || !hasImage || n2const.isMobile) {
            this.ready($.proxy(this.initVimeoPlayer, this));
        } else {
            this.ready($.proxy(function () {
                this.$playerElement.on('click.vimeo n2click.vimeo', $.proxy(function (e) {
                    this.$playerElement.off('.vimeo');
                    e.preventDefault();
                    e.stopPropagation();

                    this.initVimeoPlayer();
                    this.safePlay();
                }, this));
            }, this));
        }
    }

    FrontendItemVimeo.vimeoDeferred = null;

    FrontendItemVimeo.prototype.ready = function (callback) {
        if (FrontendItemVimeo.vimeoDeferred === null) {
            FrontendItemVimeo.vimeoDeferred = $.getScript('https://player.vimeo.com/api/player.js');
        }
        FrontendItemVimeo.vimeoDeferred.done(callback);
    };

    FrontendItemVimeo.prototype.initVimeoPlayer = function () {
        var playerElement = $('<iframe allow="autoplay; encrypted-media" id="' + this.playerId + '-frame" src="https://player.vimeo.com/video/' + this.parameters.vimeocode + '?autoplay=0&' +
            '_video&title=' + this.parameters.title + '&byline=' + this.parameters.byline + "&background=" + this.parameters.background + '&portrait=' + this.parameters.portrait + '&color=' + this.parameters.color +
            '&loop=' + this.parameters.loop + (this.parameters.quality == '-1' ? '' : '&quality=' + this.parameters.quality) + '" style="position: absolute; top:0; left: 0; width: 100%; height: 100%;" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>');
        this.$playerElement.prepend(playerElement);

        this.isStatic = playerElement.closest('.n2-ss-static-slide').length;

        this.player = new Vimeo.Player(playerElement[0], {autoplay: true});
        this.promise = this.player.ready();
        this.promise.then($.proxy(this.onReady, this));
    };

    FrontendItemVimeo.prototype.onReady = function () {
        var volume = parseFloat(this.parameters.volume);
        if (volume >= 0) {
            this.setVolume(volume);
        }

        this.slide = this.slider.findSlideByElement(this.$playerElement);

        var layer = this.$playerElement.closest(".n2-ss-layer");

        if (this.$cover.length) {
            if (n2const.isMobile) {
                this.$cover.css('pointer-events', 'none');
            }
            layer.one('n2play', $.proxy(function () {
                NextendTween.to(this.$cover, 0.3, {
                    opacity: 0,
                    onComplete: $.proxy(function () {
                        this.$cover.remove();
                    }, this)
                });
            }, this));
        }

        this.player.on('play', $.proxy(function () {
            if (!this.isStatic) {
                this.slider.sliderElement.trigger('mediaStarted', this.playerId);
            }
            layer.triggerHandler('n2play');
        }, this));

        this.player.on('pause', $.proxy(function () {
            layer.triggerHandler('n2pause');
            if (this.state.continuePlay) {
                this.setState('continuePlay', false);
                this.setState('play', true);
            } else {
                this.setState('play', false);
            }
        }, this));

        this.player.on('ended', $.proxy(function () {
            if (!this.isStatic) {
                this.slider.sliderElement.trigger('mediaEnded', this.playerId);
            }
            layer.triggerHandler('n2stop');
            this.setState('play', false);
        }, this));

        if (!this.isStatic) {
            //pause video when slide changed
            this.slider.sliderElement.on("mainAnimationStart", $.proxy(function (e, mainAnimation, previousSlideIndex, currentSlideIndex, isSystem) {
                if ($.inArray(this.slide, this.slider.getActiveSlidesCompat(this.slider.slides[currentSlideIndex])) == -1) {
                    if (parseInt(this.parameters.reset)) {
                        this.reset();
                    }
                    this.setState('slide', false, true);
                } else {
                    this.setState('slide', true, true);
                }
            }, this));
        }

        if (this.parameters['scroll-pause'] !== '') {
            N2Classes.ScrollTracker.add(this.$playerElement, this.parameters['scroll-pause'], $.proxy(function () {
                this.setState('scroll', true, true);
            }, this), $.proxy(function () {
                this.setState('continuePlay', true);
                this.setState('scroll', false, true);
            }, this));
        } else {
            this.setState('scroll', true, true);
        }

        if (this.isStatic || $.inArray(this.slide, this.slider.getActiveSlidesCompat(this.slider.currentSlide)) !== -1) {
            this.setState('slide', true, true);
        }

        if (parseInt(this.parameters.autoplay) === 1) {
            this.slider.visible($.proxy(this.initAutoplay, this));
        }

        this.readyDeferred.resolve();
    };

    FrontendItemVimeo.prototype.initAutoplay = function () {

        if (!this.isStatic) {
            //change slide
            this.slider.sliderElement.on("mainAnimationComplete", $.proxy(function (e, mainAnimation, previousSlideIndex, currentSlideIndex, isSystem) {
                if ($.inArray(this.slide, this.slider.getActiveSlidesCompat(this.slider.slides[currentSlideIndex])) >= 0) {
                    this.setState('play', true);
                    this.setState('slide', true, true);
                } else {
                    this.setState('slide', false, true);
                }
            }, this));

            if ($.inArray(this.slide, this.slider.getActiveSlidesCompat()) >= 0) {
                this.setState('play', true);
                this.setState('slide', true, true);
            }
        } else {
            this.setState('play', true);
            this.setState('slide', true, true);
        }
    };

    FrontendItemVimeo.prototype.setState = function (name, value, doAction) {
        doAction = doAction || false;

        this.state[name] = value;

        if (doAction) {
            if (this.state.play && this.state.slide && this.state.scroll) {
                this.play();
            } else {
                this.pause();
            }
        }
    };

    FrontendItemVimeo.prototype.play = function () {
        this.slider.sliderElement.trigger('mediaStarted', this.playerId);

        if (this.start != 0) {
            this.safeSetCurrentTime(this.start);
        }
        this.safePlay();

        this.player.getCurrentTime().then($.proxy(function (seconds) {
            if (seconds < this.start && this.start != 0) {
                this.safeSetCurrentTime(this.start);
            }
            this.safePlay();
        }, this)).catch($.proxy(function (error) {
            this.safePlay();
        }, this));
    };

    FrontendItemVimeo.prototype.pause = function () {
        this.safePause();
    };

    FrontendItemVimeo.prototype.reset = function () {
        this.safeSetCurrentTime(this.start);
    };

    FrontendItemVimeo.prototype.setVolume = function (volume) {
        this.safeCallback($.proxy(function () {
            this.promise = this.player.setVolume(volume);
        }, this));
    };

    FrontendItemVimeo.prototype.safeSetCurrentTime = function (time) {
        this.safeCallback($.proxy(function () {
            this.promise = this.player.setCurrentTime(time);
        }, this));
    };

    FrontendItemVimeo.prototype.safePlay = function () {
        this.safeCallback($.proxy(function () {
            this.promise = this.player.getPaused();

            this.safeCallback($.proxy(function (paused) {
                if (paused) {
                    this.promise = this.player.play();
                }
            }, this));
        }, this));
    };

    FrontendItemVimeo.prototype.safePause = function () {
        this.safeCallback($.proxy(function () {
            this.promise = this.player.getPaused();

            this.safeCallback($.proxy(function (paused) {
                if (!paused) {
                    this.promise = this.player.pause();
                }
            }, this));

        }, this));
    };

    FrontendItemVimeo.prototype.safeCallback = function (callback) {
        if (this.promise && Promise !== undefined) {
            this.promise
                .then(callback)
                .catch(callback);
        } else {
            callback();
        }
    };

    return FrontendItemVimeo;
});
N2D('FrontendItemYouTube', function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param slider
     * @param id
     * @param parameters
     * @param hasImage
     * @constructor
     */
    function FrontendItemYouTube(slider, id, parameters, hasImage) {
        this.state = {
            scroll: false,
            slide: false,
            InComplete: false,
            play: false,
            continuePlay: false
        };
        this.readyDeferred = $.Deferred();
        this.slider = slider;
        this.playerId = id;
        this.$playerElement = $("#" + this.playerId);
        this.$cover = this.$playerElement.find('.n2-ss-layer-player-cover');

        this.parameters = $.extend({
            youtubeurl: "//www.youtube.com/watch?v=MKmIwHAFjSU",
            youtubecode: "MKmIwHAFjSU",
            center: 0,
            autoplay: "1",
            related: "1",
            volume: "-1",
            loop: 0,
            modestbranding: 1,
            reset: 0,
            query: [],
            playsinline: 0
        }, parameters);

        if (parseInt(this.parameters.autoplay) === 1 || !hasImage || n2const.isMobile) {
            this.ready($.proxy(this.initYoutubePlayer, this));
        } else {
            this.$playerElement.on('click.youtube n2click.youtube', $.proxy(function (e) {
                this.$playerElement.off('.youtube');
                e.preventDefault();
                e.stopPropagation();
                this.ready($.proxy(function () {
                    this.readyDeferred.done($.proxy(function () {
                        this.play();
                    }, this));
                    this.initYoutubePlayer();
                }, this));
            }, this));
        }
    }

    FrontendItemYouTube.YTDeferred = null;

    FrontendItemYouTube.prototype.ready = function (callback) {
        if (FrontendItemYouTube.YTDeferred === null) {
            FrontendItemYouTube.YTDeferred = $.Deferred();
            if (window.YT === undefined) {
                $.getScript("https://www.youtube.com/iframe_api");
            }
            (function (deferred) {
                var check = function () {
                    if (window.YT !== undefined && window.YT.loaded) {
                        deferred.resolve();
                    } else {
                        setTimeout(check, 100);
                    }
                };
                check();
            })(FrontendItemYouTube.YTDeferred);
        }
        FrontendItemYouTube.YTDeferred.done(callback);
    };

    FrontendItemYouTube.prototype.fadeOutCover = function () {
        if (this.coverFadedOut === undefined && this.$cover.length) {
            this.coverFadedOut = true;
            NextendTween.to(this.$cover, 0.3, {
                opacity: 0,
                onComplete: $.proxy(function () {
                    this.$cover.remove();
                }, this)
            });
        }
    };

    FrontendItemYouTube.prototype.initYoutubePlayer = function () {
        var $layer = this.$playerElement.closest(".n2-ss-layer");
        this.layer = $layer.data('layer');

        if (this.$cover.length) {
            if (n2const.isMobile) {
                this.$cover.css('pointer-events', 'none');
            }
            $layer.one('n2play', $.proxy(this.fadeOutCover, this));
        }

        this.isStatic = this.$playerElement.closest('.n2-ss-static-slide').length;

        var vars = {
            enablejsapi: 1,
            origin: window.location.protocol + "//" + window.location.host,
            wmode: "opaque",
            rel: 1 - this.parameters.related,
            start: this.parameters.start,
            end: this.parameters.end,
            modestbranding: this.parameters.modestbranding,
            playsinline: this.parameters.playsinline
        };

        if (parseInt(this.parameters.autoplay) === 1) {
            if (navigator.userAgent.toLowerCase().indexOf("android") > -1) {
                this.parameters.volume = 0;
            } else if (n2const.isIOS) {
                this.parameters.autoplay = 0;
                try {
                    if ('playsInline' in document.createElement('video')) {
                        this.parameters.autoplay = 1;
                        this.parameters.volume = 0;

                        vars.playsinline = 1;
                    }
                } catch (e) {
                }
            }
        }

        if (n2const.isIOS && this.parameters.controls) {
            vars.use_native_controls = 1;
        }

        if (this.parameters.center == 1) {
            vars.controls = 0;
        }
        if (this.parameters.controls != 1) {
            vars.autohide = 1;
            vars.controls = 0;
        }

        if (+(navigator.platform.toUpperCase().indexOf('MAC') >= 0 && navigator.userAgent.search("Firefox") > -1)) {
            vars.html5 = 1;
        }

        for (var k in this.parameters.query) {
            if (this.parameters.query.hasOwnProperty(k)) {
                vars[k] = this.parameters.query[k];
            }
        }

        var data = {
            videoId: this.parameters.youtubecode,
            wmode: 'opaque',
            playerVars: vars,
            events: {
                onReady: $.proxy(this.onReady, this),
                onStateChange: $.proxy(function (state) {
                    switch (state.data) {
                        case YT.PlayerState.PLAYING:
                            if (!this.isStatic) {
                                this.slider.sliderElement.trigger('mediaStarted', this.playerId);
                            }
                            $layer.triggerHandler('n2play');
                            break;
                        case YT.PlayerState.PAUSED:
                            $layer.triggerHandler('n2pause');
                            if (this.state.continuePlay) {
                                this.setState('continuePlay', false);
                                this.setState('play', true);
                            } else {
                                this.setState('play', false);
                            }
                            break;
                        case YT.PlayerState.ENDED:
                            if (this.parameters.loop == 1) {
                                this.player.seekTo(this.parameters.start);
                                this.player.playVideo();
                            } else {
                                if (!this.isStatic) {
                                    this.slider.sliderElement.trigger('mediaEnded', this.playerId);
                                }
                                $layer.triggerHandler('n2stop');
                                this.setState('play', false);
                            }
                            break;

                    }
                }, this)
            }
        };

        if (this.parameters['privacy-enhanced']) {
            data.host = 'https://www.youtube-nocookie.com';
        }

        this.player = new YT.Player(this.playerId + '-frame', data);

        this.slide = this.slider.findSlideByElement(this.$playerElement);
        if (this.parameters.center == 1) {
            this.$playerElement.parent().css('overflow', 'hidden');

            this.onResize();

            this.slider.sliderElement.on('SliderResize', $.proxy(this.onResize, this))
        }
    };

    FrontendItemYouTube.prototype.onReady = function () {

        var volume = parseFloat(this.parameters.volume);
        if (volume > 0) {
            this.setVolume(volume);
        } else if (volume !== -1) {
            this.player.mute();
        }

        if (this.isStatic || $.inArray(this.slide, this.slider.getActiveSlidesCompat(this.slider.currentSlide)) !== -1) {
            this.setState('slide', true, true);
        }

        if (this.parameters.autoplay == 1) {
            this.slider.visible($.proxy(this.initAutoplay, this));
        }

        if (!this.isStatic) {
            //pause video when slide changed
            this.slider.sliderElement.on("mainAnimationStart", $.proxy(function (e, mainAnimation, previousSlideIndex, currentSlideIndex) {
                if ($.inArray(this.slide, this.slider.getActiveSlidesCompat(this.slider.slides[currentSlideIndex])) == -1) {
                    this.setState('slide', false, true);
                } else {
                    this.setState('slide', true, true);
                }
            }, this));
            if (parseInt(this.parameters.reset)) {
                this.slider.sliderElement.on("mainAnimationComplete", $.proxy(function (e, mainAnimation, previousSlideIndex, currentSlideIndex) {
                    if ($.inArray(this.slide, this.slider.getVisibleSlides(this.slider.slides[currentSlideIndex])) == -1) {
                        this.player.seekTo(this.parameters.start);
                    }
                }, this));
            }
        }
        this.readyDeferred.resolve();

        if (this.parameters['scroll-pause'] !== '') {
            N2Classes.ScrollTracker.add(this.$playerElement, this.parameters['scroll-pause'], $.proxy(function () {
                this.setState('scroll', true, true);
            }, this), $.proxy(function () {
                this.setState('continuePlay', true);
                this.setState('scroll', false, true);
            }, this));
        } else {
            this.setState('scroll', true, true);
        }
    };

    FrontendItemYouTube.prototype.onResize = function () {
        var controls = 100,
            parent = this.$playerElement.parent(),
            width = parent.width(),
            height = parent.height() + controls,
            aspectRatio = 16 / 9,
            css = {
                width: width,
                height: height,
                marginTop: 0
            };
        css[n2const.rtl.marginLeft] = 0;
        if (width / height > aspectRatio) {
            css.height = width * aspectRatio;
            css.marginTop = (height - css.height) / 2;
        } else {
            css.width = height * aspectRatio;
            css[n2const.rtl.marginLeft] = (width - css.width) / 2;
        }
        this.$playerElement.css(css);
    };

    FrontendItemYouTube.prototype.initAutoplay = function () {
        this.setState('InComplete', true, true);
    

        if (!this.isStatic) {
            //change slide
            this.slider.sliderElement.on("mainAnimationComplete", $.proxy(function (e, mainAnimation, previousSlideIndex, currentSlideIndex) {
                if ($.inArray(this.slide, this.slider.getActiveSlidesCompat(this.slider.slides[currentSlideIndex])) >= 0) {
                    this.setState('play', true);
                    this.setState('slide', true, true);
                } else {
                    this.setState('slide', false, true);
                }
            }, this));

            if ($.inArray(this.slide, this.slider.getActiveSlidesCompat()) >= 0) {
                this.setState('play', true);
                this.setState('slide', true, true);
            }
        } else {
            this.setState('play', true);
            this.setState('slide', true, true);
        }
    };

    FrontendItemYouTube.prototype.setState = function (name, value, doAction) {
        doAction = doAction || false;

        this.state[name] = value;

        if (doAction) {
            if (this.state.play && this.state.slide && this.state.InComplete && this.state.scroll) {
                this.play();
            } else {
                this.pause();
            }
        }
    };

    FrontendItemYouTube.prototype.play = function () {
        if (this.isStopped()) {
            if (this.coverFadedOut === undefined) {
                setTimeout($.proxy(this.fadeOutCover, this), 200);
            }
            this.slider.sliderElement.trigger('mediaStarted', this.playerId);
            this.player.playVideo();
        }
    };

    FrontendItemYouTube.prototype.pause = function () {
        if (!this.isStopped()) {
            this.player.pauseVideo();
        }
    };

    FrontendItemYouTube.prototype.stop = function () {
        this.player.stopVideo();
    };

    FrontendItemYouTube.prototype.isStopped = function () {
        var state = this.player.getPlayerState();
        switch (state) {
            case -1:
            case 0:
            case 2:
            case 5:
                return true;
                break;
            default:
                return false;
                break;
        }
    };

    FrontendItemYouTube.prototype.setVolume = function (volume) {
        this.player.setVolume(volume * 100);
    };

    return FrontendItemYouTube;
});
N2D('smartslider-frontend')