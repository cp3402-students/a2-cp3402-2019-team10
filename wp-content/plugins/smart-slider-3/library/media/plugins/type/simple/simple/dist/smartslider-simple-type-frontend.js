(function(){var N=this;N.N2_=N.N2_||{r:[],d:[]},N.N2R=N.N2R||function(){N.N2_.r.push(arguments)},N.N2D=N.N2D||function(){N.N2_.d.push(arguments)}}).call(window);
N2D('SmartSliderMainAnimationSimple', ['SmartSliderMainAnimationAbstract'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     * @param slider
     * @param parameters
     * @constructor
     */
    function SmartSliderMainAnimationSimple(slider, parameters) {

        this.postBackgroundAnimation = false;
        this._currentBackgroundAnimation = false;
        this.reverseSlideIndex = null;

        parameters = $.extend({
            delay: 0,
            parallax: 0,
            type: 'horizontal',
            shiftedBackgroundAnimation: 'auto'
        }, parameters);
        parameters.delay /= 1000;

        N2Classes.SmartSliderMainAnimationAbstract.prototype.constructor.apply(this, arguments);

        switch (this.parameters.type) {
            case 'no':
                this.animation = this._mainAnimationNo;
                this.isNoAnimation = true;
                break;
            case 'fade':
                this.animation = this._mainAnimationFade;
                break;
            case 'crossfade':
                this.animation = this._mainAnimationCrossFade;
                break;
            case 'vertical':
                if (slider.backgrounds.hasFixed) {
                    this.animation = this._mainAnimationFade;
                } else {
                    if (this.parameters.parallax === 0) {
                        this.animation = this._mainAnimationVertical;
                    } else {
                        this.animation = this._mainAnimationVerticalParallax;
                    }
                }
                break;
            case 'vertical-reversed':
                if (slider.backgrounds.hasFixed) {
                    this.animation = this._mainAnimationFade;
                } else {
                    if (this.parameters.parallax === 0) {
                        this.animation = this._mainAnimationVerticalReversed;
                    } else {
                        this.animation = this._mainAnimationVerticalReversedParallax;
                    }
                }
                break;
            case 'horizontal-reversed':
                if (this.parameters.parallax === 0) {
                    this.animation = this._mainAnimationHorizontalReversed;
                } else {
                    this.animation = this._mainAnimationHorizontalReversedParallax;
                }
                break;
            default:
                if (this.parameters.parallax === 0) {
                    this.animation = this._mainAnimationHorizontal;
                } else {
                    this.animation = this._mainAnimationHorizontalParallax;
                }
        }
    }

    SmartSliderMainAnimationSimple.prototype = Object.create(N2Classes.SmartSliderMainAnimationAbstract.prototype);
    SmartSliderMainAnimationSimple.prototype.constructor = SmartSliderMainAnimationSimple;

    SmartSliderMainAnimationSimple.prototype.setToStarterSlide = function (slide) {
        this.setActiveSlide(slide);
    };

    SmartSliderMainAnimationSimple.prototype.changeTo = function (currentSlide, nextSlide, reversed, isSystem) {
        if (this.postBackgroundAnimation) {
            this.postBackgroundAnimation.prepareToSwitchSlide(currentSlide, nextSlide);
        }

        N2Classes.SmartSliderMainAnimationAbstract.prototype.changeTo.apply(this, arguments);
    };

    /**
     * Used to hide non active slides
     * @param slide
     */
    SmartSliderMainAnimationSimple.prototype.setActiveSlide = function (slide) {
        for (var i = 0; i < this.slider.slides.length; i++) {
            if (this.slider.slides[i] !== slide) {
                this._hideSlide(this.slider.slides[i]);
            }
        }
    };

    /**
     * Hides the slide, but not the usual way. Simply positions them outside of the slider area.
     * If we use the visibility or display property to hide we would end up corrupted YouTube api.
     * If opacity 0 might also work, but that might need additional resource from the browser
     * @param slide
     * @private
     */
    SmartSliderMainAnimationSimple.prototype._hideSlide = function (slide) {
        NextendTween.set(slide.$element, {
            x: -100000 * n2const.rtl.modifier
        });
        if (slide.background) {
            NextendTween.set(slide.background.element, {
                x: -100000 * n2const.rtl.modifier
            });
        }
    };

    SmartSliderMainAnimationSimple.prototype._showSlide = function (slide) {
        NextendTween.set(slide.$element.get(0), {
            x: 0
        });
        if (slide.background) {
            NextendTween.set(slide.background.element, {
                x: 0
            });
        }
    };

    SmartSliderMainAnimationSimple.prototype.cleanSlideIndex = function (slideIndex) {
        this._hideSlide(this.slider.slides[slideIndex]);
    };


    SmartSliderMainAnimationSimple.prototype.revertTo = function (slideIndex, originalNextSlideIndex) {

        this.slider.slides[originalNextSlideIndex].$element.css('zIndex', '');
        this._hideSlide(this.slider.slides[originalNextSlideIndex]);

        N2Classes.SmartSliderMainAnimationAbstract.prototype.revertTo.apply(this, arguments);
    };

    SmartSliderMainAnimationSimple.prototype._initAnimation = function (currentSlide, nextSlide, reversed) {

        this.animation(currentSlide, nextSlide, reversed);
    };

    SmartSliderMainAnimationSimple.prototype.onBackwardChangeToComplete = function (previousSlide, currentSlide, isSystem) {
        this.reverseSlideIndex = null;
        this.onChangeToComplete(previousSlide, currentSlide, isSystem);
    };

    SmartSliderMainAnimationSimple.prototype.onChangeToComplete = function (previousSlide, currentSlide, isSystem) {
        if (this.reverseSlideIndex !== null) {
            this.slider.slides[this.reverseSlideIndex].triggerHandler('mainAnimationStartInCancel');
            this.reverseSlideIndex = null;
        }
        this._hideSlide(previousSlide);

        N2Classes.SmartSliderMainAnimationAbstract.prototype.onChangeToComplete.apply(this, arguments);
    };

    SmartSliderMainAnimationSimple.prototype.onReverseChangeToComplete = function (previousSlide, currentSlide, isSystem) {

        this._hideSlide(previousSlide);

        N2Classes.SmartSliderMainAnimationAbstract.prototype.onReverseChangeToComplete.apply(this, arguments);
    };

    SmartSliderMainAnimationSimple.prototype._mainAnimationNo = function (currentSlide, nextSlide) {

        this._showSlide(nextSlide);

        this.slider.unsetActiveSlide(currentSlide);

        nextSlide.$element.css('opacity', 0);
        if (nextSlide.background) {
            nextSlide.background.element.css('opacity', 0);
        }

        this.slider.setActiveSlide(nextSlide);

        var totalDuration = this.timeline.totalDuration(),
            extraDelay = this.getExtraDelay();

        if (this._currentBackgroundAnimation && this.parameters.shiftedBackgroundAnimation) {
            if (this._currentBackgroundAnimation.shiftedPreSetup) {
                this._currentBackgroundAnimation._preSetup();
            }
        }

        if (totalDuration === 0) {
            totalDuration = 0.00001;
            extraDelay += totalDuration;
        }

        this.timeline.set(currentSlide.$element, {
            opacity: 0
        }, extraDelay);
        if (!this._currentBackgroundAnimation && currentSlide.background) {
            this.timeline.set(currentSlide.background.element, {
                opacity: 0
            }, extraDelay);
        }

        this.timeline.set(nextSlide.$element, {
            opacity: 1
        }, totalDuration);
        if (!this._currentBackgroundAnimation && nextSlide.background) {
            this.timeline.set(nextSlide.background.element, {
                opacity: 1
            }, totalDuration);
        }

        this.sliderElement.on('mainAnimationComplete.n2-simple-no', $.proxy(function (e, animation, currentSlideIndex, nextSlideIndex) {
            this.sliderElement.off('mainAnimationComplete.n2-simple-no');

            var currentSlide = this.slider.slides[currentSlideIndex],
                nextSlide = this.slider.slides[nextSlideIndex];

            currentSlide.$element.css('opacity', '');
            if (!this._currentBackgroundAnimation && currentSlide.background) {
                currentSlide.background.element.css('opacity', '');
            }

            nextSlide.$element.css('opacity', '');
            if (!this._currentBackgroundAnimation && nextSlide.background) {
                nextSlide.background.element.css('opacity', '');
            }
        }, this));
    };

    SmartSliderMainAnimationSimple.prototype._mainAnimationFade = function (currentSlide, nextSlide) {
        currentSlide.$element.css('zIndex', 23);
        if (currentSlide.background) {
            currentSlide.background.element.css('zIndex', 23);
        }

        nextSlide.$element.css('opacity', 0);

        this._showSlide(nextSlide);

        this.slider.unsetActiveSlide(currentSlide);
        this.slider.setActiveSlide(nextSlide);

        var adjustedTiming = this.adjustMainAnimation();

        if (this.parameters.shiftedBackgroundAnimation != 0) {
            var needShift = false,
                resetShift = false;
            if (this.parameters.shiftedBackgroundAnimation == 'auto') {
                if (currentSlide.hasLayers()) {
                    needShift = true;
                } else {
                    resetShift = true;
                }
            } else {
                needShift = true;
            }

            if (this._currentBackgroundAnimation && needShift) {
                var shift = adjustedTiming.outDuration - adjustedTiming.extraDelay;
                if (shift > 0) {
                    this.timeline.shiftChildren(shift);
                }
                if (this._currentBackgroundAnimation.shiftedPreSetup) {
                    this._currentBackgroundAnimation._preSetup();
                }
            } else if (resetShift) {
                if (adjustedTiming.extraDelay > 0) {
                    this.timeline.shiftChildren(adjustedTiming.extraDelay);
                }
                if (this._currentBackgroundAnimation.shiftedPreSetup) {
                    this._currentBackgroundAnimation._preSetup();
                }
            }
        }

        this.timeline.to(currentSlide.$element.get(0), adjustedTiming.outDuration, {
            opacity: 0,
            ease: this.getEase()
        }, adjustedTiming.outDelay);
        if (!this._currentBackgroundAnimation && currentSlide.background) {
            this.timeline.to(currentSlide.background.element, adjustedTiming.outDuration, {
                opacity: 0,
                ease: this.getEase()
            }, adjustedTiming.outDelay);
        }

        this.timeline.to(nextSlide.$element.get(0), adjustedTiming.inDuration, {
            opacity: 1,
            ease: this.getEase()
        }, adjustedTiming.inDelay);

        if (!this._currentBackgroundAnimation && nextSlide.background) {
            nextSlide.background.element.css('opacity', 1);
        }

        this.sliderElement.on('mainAnimationComplete.n2-simple-fade', $.proxy(function (e, animation, currentSlideIndex, nextSlideIndex) {
            this.sliderElement.off('mainAnimationComplete.n2-simple-fade');
            var currentSlide = this.slider.slides[currentSlideIndex],
                nextSlide = this.slider.slides[nextSlideIndex];

            currentSlide.$element
                .css({
                    zIndex: '',
                    opacity: ''
                });

            if (!this._currentBackgroundAnimation && currentSlide.background) {
                currentSlide.background.element
                    .css({
                        zIndex: '',
                        opacity: ''
                    });
            }

            nextSlide.$element.css('opacity', '');
            if (!this._currentBackgroundAnimation && nextSlide.background) {
                nextSlide.background.element.css('opacity', '');
            }
        }, this));
    };

    SmartSliderMainAnimationSimple.prototype._mainAnimationCrossFade = function (currentSlide, nextSlide) {
        currentSlide.$element.css('zIndex', 23);
        if (currentSlide.background) {
            currentSlide.background.element.css('zIndex', 23);
        }

        nextSlide.$element.css('opacity', 0);
        if (nextSlide.background) {
            nextSlide.background.element.css('opacity', 0);
        }
        this._showSlide(nextSlide);

        this.slider.unsetActiveSlide(currentSlide);
        this.slider.setActiveSlide(nextSlide);

        var adjustedTiming = this.adjustMainAnimation();

        if (this.parameters.shiftedBackgroundAnimation != 0) {
            var needShift = false,
                resetShift = false;
            if (this.parameters.shiftedBackgroundAnimation == 'auto') {
                if (currentSlide.hasLayers()) {
                    needShift = true;
                } else {
                    resetShift = true;
                }
            } else {
                needShift = true;
            }

            if (this._currentBackgroundAnimation && needShift) {
                var shift = adjustedTiming.outDuration - adjustedTiming.extraDelay;
                if (shift > 0) {
                    this.timeline.shiftChildren(shift);
                }
                if (this._currentBackgroundAnimation.shiftedPreSetup) {
                    this._currentBackgroundAnimation._preSetup();
                }
            } else if (resetShift) {
                if (adjustedTiming.extraDelay > 0) {
                    this.timeline.shiftChildren(adjustedTiming.extraDelay);
                }
                if (this._currentBackgroundAnimation.shiftedPreSetup) {
                    this._currentBackgroundAnimation._preSetup();
                }
            }
        }

        this.timeline.to(currentSlide.$element.get(0), adjustedTiming.outDuration, {
            opacity: 0,
            ease: this.getEase()
        }, adjustedTiming.outDelay);
        if (!this._currentBackgroundAnimation && currentSlide.background) {
            this.timeline.to(currentSlide.background.element.get(0), adjustedTiming.outDuration, {
                opacity: 0,
                ease: this.getEase()
            }, adjustedTiming.outDelay);
        }

        this.timeline.to(nextSlide.$element.get(0), adjustedTiming.inDuration, {
            opacity: 1,
            ease: this.getEase()
        }, adjustedTiming.inDelay);
        if (!this._currentBackgroundAnimation && nextSlide.background) {
            this.timeline.to(nextSlide.background.element.get(0), adjustedTiming.inDuration, {
                opacity: 1,
                ease: this.getEase()
            }, adjustedTiming.inDelay);
        }

        this.sliderElement.on('mainAnimationComplete.n2-simple-fade', $.proxy(function (e, animation, currentSlideIndex, nextSlideIndex) {
            this.sliderElement.off('mainAnimationComplete.n2-simple-fade');
            var currentSlide = this.slider.slides[currentSlideIndex],
                nextSlide = this.slider.slides[nextSlideIndex];

            currentSlide.$element
                .css({
                    zIndex: '',
                    opacity: ''
                });

            if (!this._currentBackgroundAnimation && currentSlide.background) {
                currentSlide.background.element
                    .css({
                        zIndex: '',
                        opacity: ''
                    });
            }

            nextSlide.$element.css('opacity', '');
            if (!this._currentBackgroundAnimation && nextSlide.background) {
                nextSlide.background.element.css('opacity', '');
            }
        }, this));
    };

    SmartSliderMainAnimationSimple.prototype._mainAnimationHorizontal = function (currentSlide, nextSlide, reversed) {
        this.__mainAnimationDirection(currentSlide, nextSlide, 'horizontal', 0, reversed);
    };

    SmartSliderMainAnimationSimple.prototype._mainAnimationVertical = function (currentSlide, nextSlide, reversed) {
        this._showSlide(nextSlide);
        this.__mainAnimationDirection(currentSlide, nextSlide, 'vertical', 0, reversed);
    };

    SmartSliderMainAnimationSimple.prototype._mainAnimationHorizontalParallax = function (currentSlide, nextSlide, reversed) {
        this.__mainAnimationDirection(currentSlide, nextSlide, 'horizontal', this.parameters.parallax, reversed);
    };

    SmartSliderMainAnimationSimple.prototype._mainAnimationVerticalParallax = function (currentSlide, nextSlide, reversed) {
        this._showSlide(nextSlide);
        this.__mainAnimationDirection(currentSlide, nextSlide, 'vertical', this.parameters.parallax, reversed);
    };

    SmartSliderMainAnimationSimple.prototype._mainAnimationHorizontalReversed = function (currentSlide, nextSlide, reversed) {
        this.__mainAnimationDirection(currentSlide, nextSlide, 'horizontal', 0, !reversed);
    };

    SmartSliderMainAnimationSimple.prototype._mainAnimationVerticalReversed = function (currentSlide, nextSlide, reversed) {
        this._showSlide(nextSlide);
        this.__mainAnimationDirection(currentSlide, nextSlide, 'vertical', 0, !reversed);
    };

    SmartSliderMainAnimationSimple.prototype._mainAnimationHorizontalReversedParallax = function (currentSlide, nextSlide, reversed) {
        this.__mainAnimationDirection(currentSlide, nextSlide, 'horizontal', this.parameters.parallax, !reversed);
    };

    SmartSliderMainAnimationSimple.prototype._mainAnimationVerticalReversedParallax = function (currentSlide, nextSlide, reversed) {
        this._showSlide(nextSlide);
        this.__mainAnimationDirection(currentSlide, nextSlide, 'vertical', this.parameters.parallax, !reversed);
    };

    SmartSliderMainAnimationSimple.prototype.__mainAnimationDirection = function (currentSlide, nextSlide, direction, parallaxOverlap, reversed) {
        var property = '',
            propertyValue = 0,
            originalPropertyValue = 0,
            parallaxProperty = '',
            parallaxNormalized = 1 - parallaxOverlap / 100;

        if (direction === 'horizontal') {
            property = 'x';
            parallaxProperty = 'width';
            originalPropertyValue = propertyValue = this.slider.dimensions.slideouter.width;

            if (n2const.rtl.isRtl) {
                reversed = !reversed;
            }
        } else if (direction === 'vertical') {
            property = 'y';
            parallaxProperty = 'height';
            originalPropertyValue = propertyValue = this.slider.dimensions.slideouter.height;
        }

        if (reversed) {
            propertyValue *= -1;
        }

        var nextSlideFrom = {},
            nextSlideTo = {
                ease: this.getEase()
            },
            nextSlideFromImage = {},
            nextSlideToImage = {
                ease: this.getEase()
            },
            currentSlideTo = {
                ease: this.getEase()
            },
            currentSlideToImage = {
                ease: this.getEase()
            };

        var prevZIndex = 23,
            nextZIndex = 22;

        if (parallaxOverlap !== 0) {
            if (!reversed) {
                //forward

                propertyValue *= parallaxNormalized;

                var o1 = {};
                o1[property] = propertyValue;
                NextendTween.set(nextSlide.$element, o1);
                if (nextSlide.background) {
                    var o2 = {};
                    o2[property] = propertyValue;
                    NextendTween.set(nextSlide.background.element, o2);
                }

                nextSlide.$element.addClass('n2-ss-parallax-clip');
                nextSlideFrom[property] = originalPropertyValue;
                nextSlideFrom[parallaxProperty] = propertyValue;
                nextSlideTo[parallaxProperty] = originalPropertyValue;

                nextSlideFromImage[property] = propertyValue;

                currentSlideTo[parallaxProperty] = propertyValue;
                currentSlideToImage[parallaxProperty] = propertyValue;

                currentSlideTo[property] = -propertyValue;
                currentSlideToImage[property] = -propertyValue;
            } else {
                //backward
                currentSlide.$element.addClass('n2-ss-parallax-clip');
                prevZIndex = 22;
                nextZIndex = 23;

                nextSlideTo[parallaxProperty] = -propertyValue;
                nextSlideToImage[parallaxProperty] = -propertyValue;
                propertyValue *= parallaxNormalized;

                nextSlideFrom[property] = propertyValue;
                nextSlideFrom[parallaxProperty] = -propertyValue;

                nextSlideFromImage[property] = propertyValue;
                nextSlideFromImage[parallaxProperty] = -propertyValue;


                currentSlideTo[parallaxProperty] = -propertyValue;
                currentSlideTo[property] = originalPropertyValue;

                currentSlideToImage[property] = -propertyValue;
            }
        } else {
            var o3 = {};
            o3[property] = propertyValue;
            NextendTween.set(nextSlide.$element, o3);
            if (nextSlide.background) {
                var o4 = {};
                o4[property] = propertyValue;
                NextendTween.set(nextSlide.background.element, o4);
            }

            nextSlideFrom[property] = propertyValue;
            nextSlideFromImage[property] = propertyValue;

            currentSlideTo[property] = -propertyValue;
            currentSlideToImage[property] = -propertyValue;

        }

        currentSlide.$element.css('zIndex', prevZIndex);
        if (currentSlide.background) {
            currentSlide.background.element.css('zIndex', prevZIndex);
        }

        nextSlide.$element.css('zIndex', nextZIndex);
        if (nextSlide.background) {
            nextSlide.background.element.css('zIndex', nextZIndex);
        }

        this.slider.unsetActiveSlide(currentSlide);
        this.slider.setActiveSlide(nextSlide);

        var adjustedTiming = this.adjustMainAnimation();

        nextSlideTo[property] = 0;
        nextSlideTo.roundProps = 'x,y';
        nextSlideToImage[property] = 0;
        nextSlideToImage.roundProps = 'x,y';

        this.timeline.fromTo(nextSlide.$element.get(0), adjustedTiming.inDuration, nextSlideFrom, nextSlideTo, adjustedTiming.inDelay);
        if (nextSlide.background) {
            this.timeline.fromTo(nextSlide.background.element, adjustedTiming.inDuration, nextSlideFromImage, nextSlideToImage, adjustedTiming.inDelay);
        }

        if (this.parameters.shiftedBackgroundAnimation != 0) {
            var needShift = false,
                resetShift = false;
            if (this.parameters.shiftedBackgroundAnimation === 'auto') {
                if (currentSlide.hasLayers()) {
                    needShift = true;
                } else {
                    resetShift = true;
                }
            } else {
                needShift = true;
            }

            if (this._currentBackgroundAnimation && needShift) {
                var shift = adjustedTiming.outDuration - adjustedTiming.extraDelay;
                if (shift > 0) {
                    this.timeline.shiftChildren(shift);
                }
                if (this._currentBackgroundAnimation.shiftedPreSetup) {
                    this._currentBackgroundAnimation._preSetup();
                }
            } else if (resetShift) {
                if (adjustedTiming.extraDelay > 0) {
                    this.timeline.shiftChildren(adjustedTiming.extraDelay);
                }
                if (this._currentBackgroundAnimation.shiftedPreSetup) {
                    this._currentBackgroundAnimation._preSetup();
                }
            }
        }

        currentSlideTo.roundProps = 'x,y';
        currentSlideToImage.roundProps = 'x,y';

        this.timeline.to(currentSlide.$element.get(0), adjustedTiming.outDuration, currentSlideTo, adjustedTiming.outDelay);
        if (currentSlide.background) {
            this.timeline.to(currentSlide.background.element, adjustedTiming.outDuration, currentSlideToImage, adjustedTiming.outDelay);
        }

        if (this.isTouch && this.isReverseAllowed && parallaxOverlap === 0) {
            var reverseSlideIndex = reversed ? currentSlide.index + 1 : currentSlide.index - 1;
            if (reverseSlideIndex < 0) {
                if (this.slider.parameters.carousel && !this.slider.blockCarousel) {
                    reverseSlideIndex = this.slider.slides.length - 1;
                } else {
                    reverseSlideIndex = currentSlide.index;
                }
            } else if (reverseSlideIndex >= this.slider.slides.length) {
                if (this.slider.parameters.carousel && !this.slider.blockCarousel) {
                    reverseSlideIndex = 0;
                } else {
                    reverseSlideIndex = currentSlide.index;
                }
            }

            if (reverseSlideIndex !== nextSlide.index) {

                if (reverseSlideIndex !== currentSlide.index) {
                    this.reverseSlideIndex = reverseSlideIndex;
                    this.enableReverseMode();

                    var reverseSlide = this.slider.slides[reverseSlideIndex];
                    if (direction === 'vertical') {
                        this._showSlide(reverseSlide);
                    }
                    reverseSlide.$element.css(property, propertyValue);
                    var reversedInFrom = {},
                        reversedInProperties = {
                            ease: this.getEase()
                        },
                        reversedOutFrom = {},
                        reversedOutProperties = {
                            ease: this.getEase()
                        };

                    reversedInProperties[property] = 0;
                    reversedInFrom[property] = -propertyValue;
                    reversedOutProperties[property] = propertyValue;
                    reversedOutFrom[property] = 0;

                    reverseSlide.$element.trigger('mainAnimationStartIn', [this, currentSlide.index, reverseSlide.index, false]);

                    this.reverseTimeline.paused(true);
                    this.reverseTimeline.eventCallback('onComplete', this.onBackwardChangeToComplete, [currentSlide, reverseSlide, false], this);


                    reversedInProperties.roundProps = 'x,y';
                    this.reverseTimeline.fromTo(reverseSlide.$element.get(0), adjustedTiming.inDuration, reversedInFrom, reversedInProperties, adjustedTiming.inDelay);
                    if (reverseSlide.background) {
                        this.reverseTimeline.fromTo(reverseSlide.background.element, adjustedTiming.inDuration, reversedInFrom, reversedInProperties, adjustedTiming.inDelay);
                    }
                    reversedOutProperties.roundProps = 'x,y';
                    this.reverseTimeline.fromTo(currentSlide.$element.get(0), adjustedTiming.inDuration, reversedOutFrom, reversedOutProperties, adjustedTiming.inDelay);
                    if (currentSlide.background) {
                        this.reverseTimeline.fromTo(currentSlide.background.element, adjustedTiming.inDuration, reversedOutFrom, reversedOutProperties, adjustedTiming.inDelay);
                    }
                }
            } else {
                this.reverseSlideIndex = null;
            }
        }


        this.sliderElement.on('mainAnimationComplete.n2-simple-fade', $.proxy(function (e, animation, currentSlideIndex, nextSlideIndex) {
            this.sliderElement.off('mainAnimationComplete.n2-simple-fade');
            var currentSlide = this.slider.slides[currentSlideIndex],
                nextSlide = this.slider.slides[nextSlideIndex];

            nextSlide.$element
                .css('zIndex', '')
                .css(property, '')
                .removeClass('n2-ss-parallax-clip');

            if (nextSlide.background) {
                nextSlide.background.element
                    .css('zIndex', '')
                    .css(property, '');
            }

            currentSlide.$element
                .css('zIndex', '')
                .css(parallaxProperty, '')
                .removeClass('n2-ss-parallax-clip');
            if (currentSlide.background) {
                currentSlide.background.element
                    .css('zIndex', '')
                    .css(parallaxProperty, '');
            }
        }, this));
    };

    SmartSliderMainAnimationSimple.prototype.getExtraDelay = function () {
        return 0;
    };

    SmartSliderMainAnimationSimple.prototype.adjustMainAnimation = function () {
        var duration = this.parameters.duration,
            delay = this.parameters.delay,
            backgroundAnimationDuration = this.timeline.totalDuration(),
            extraDelay = this.getExtraDelay();
        if (backgroundAnimationDuration > 0) {
            var totalMainAnimationDuration = duration + delay;
            if (totalMainAnimationDuration > backgroundAnimationDuration) {
                duration = duration * backgroundAnimationDuration / totalMainAnimationDuration;
                delay = delay * backgroundAnimationDuration / totalMainAnimationDuration;
                if (delay < extraDelay) {
                    duration -= (extraDelay - delay);
                    delay = extraDelay;
                }
            } else {
                return {
                    inDuration: duration,
                    outDuration: duration,
                    inDelay: backgroundAnimationDuration - duration,
                    outDelay: extraDelay,
                    extraDelay: extraDelay
                }
            }
        } else {
            delay += extraDelay;
        }
        return {
            inDuration: duration,
            outDuration: duration,
            inDelay: delay,
            outDelay: delay,
            extraDelay: extraDelay
        }
    };

    SmartSliderMainAnimationSimple.prototype.hasBackgroundAnimation = function () {
        return false;
    };

    return SmartSliderMainAnimationSimple;
});
N2D('SmartSliderResponsiveSimple', ['SmartSliderResponsive'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @augments SmartSliderResponsive
     * @constructor
     */
    function SmartSliderResponsiveSimple() {
        this.round = 1;
        N2Classes.SmartSliderResponsive.prototype.constructor.apply(this, arguments);
    }

    SmartSliderResponsiveSimple.prototype = Object.create(N2Classes.SmartSliderResponsive.prototype);
    SmartSliderResponsiveSimple.prototype.constructor = SmartSliderResponsiveSimple;

    SmartSliderResponsiveSimple.prototype.init = function () {

        if (this.sliderElement.find('.n2-ss-section-main-content').length) {
            this.updateVerticalRatios = this._updateVerticalRatios;
        }

        this._sliderHorizontal = this.addHorizontalElement(this.sliderElement, ['width', 'marginLeft', 'marginRight'], 'w', 'slider');
        this.addHorizontalElement(this.sliderElement.find('.n2-ss-slider-1'), ['width', 'paddingLeft', 'paddingRight', 'borderLeftWidth', 'borderRightWidth'], 'w');

        this._sliderVertical = this.addVerticalElement(this.sliderElement, ['marginTop', 'marginBottom'], 'h');
        this.addHorizontalElement(this.sliderElement, ['fontSize'], 'fontRatio', 'slider');
        this.addVerticalElement(this.sliderElement.find('.n2-ss-slider-1'), ['height', 'paddingTop', 'paddingBottom', 'borderTopWidth', 'borderBottomWidth'], 'h', 'slider1');

        this.addHorizontalElement(this.sliderElement.find('.n2-ss-slide'), ['width'], 'w', 'slideouter');

        this.addVerticalElement(this.sliderElement.find('.n2-ss-slide'), ['height'], 'h', 'slideouter');

        var layerContainers = this.sliderElement.find('.n2-ss-layers-container');
        this.addHorizontalElement(layerContainers, ['width'], 'slideW', 'slide');
        this.addVerticalElement(layerContainers, ['height'], 'slideH', 'slide').setCentered();

        var parallax = this.slider.parameters.mainanimation.parallax;
        var backgroundImages = this.slider.backgrounds.getBackgroundImages();
        for (var i = 0; i < backgroundImages.length; i++) {
            if (parallax !== 0) {

                /** We need to use fixed height and width on the background if the current animation has parallax overlap **/
                this.addHorizontalElement(backgroundImages[i].element, ['width'], 'w');
                this.addVerticalElement(backgroundImages[i].element, ['height'], 'h');

                if (this.slider.needBackgroundWrap) {
                    this.addHorizontalElement(backgroundImages[i].$wrapElement, ['width'], 'w');
                    this.addVerticalElement(backgroundImages[i].$wrapElement, ['height'], 'h');
                }
            }
        }


        var video = this.sliderElement.find('.n2-ss-slider-background-video');
        if (video.length) {
            if (n2const.isVideoAutoplayAllowed()) {

                this._videoPlayerReady = $.proxy(this.videoPlayerReady, this, video);

                if (video[0].videoWidth > 0) {
                    this._videoPlayerReady();
                } else {
                    video[0].addEventListener('error', $.proxy(this.videoPlayerError, this, video), true);
                    video[0].addEventListener('canplay', this._videoPlayerReady);
                }
                video[0].load();
                video[0].play();
            } else {
                this.videoPlayerError(video);
            }
        }
    };

    SmartSliderResponsiveSimple.prototype.resizeVerticalElements = function (ratios, timeline, duration) {
        N2Classes.SmartSliderResponsive.prototype.resizeVerticalElements.apply(this, arguments);

        /**
         * Proper slider height needed for widgets to calculate vertical positions
         */
        this.responsiveDimensions.slider.height = this.responsiveDimensions.slider1.height + this.responsiveDimensions.slider1.paddingTop + this.responsiveDimensions.slider1.paddingBottom;
    };

    SmartSliderResponsiveSimple.prototype.videoPlayerError = function (video) {
        video.remove();
    };

    SmartSliderResponsiveSimple.prototype.videoPlayerReady = function (video) {
        video[0].removeEventListener('canplay', this._videoPlayerReady);

        video.data('ratio', video[0].videoWidth / video[0].videoHeight);
        video.addClass('n2-active');

        this.slider.ready($.proxy(function () {
            this.slider.sliderElement.on('SliderResize', $.proxy(this.resizeVideo, this, video));
            this.resizeVideo(video);
        }, this));
    };

    SmartSliderResponsiveSimple.prototype.resizeVideo = function ($video) {

        var mode = $video.data('mode'),
            ratio = $video.data('ratio'),
            slideOuter = this.slider.dimensions.slideouter || this.slider.dimensions.slide,
            slideOuterRatio = slideOuter.width / slideOuter.height;

        if (mode === 'fill') {
            if (slideOuterRatio > ratio) {
                $video.css({
                    width: '100%',
                    height: 'auto'
                });
            } else {
                $video.css({
                    width: 'auto',
                    height: '100%'
                });
            }
        } else if (mode === 'fit') {
            if (slideOuterRatio < ratio) {
                $video.css({
                    width: '100%',
                    height: 'auto'
                });
            } else {
                $video.css({
                    width: 'auto',
                    height: '100%'
                });
            }
        }

        $video.css({
            marginTop: 0,
            marginLeft: 0
        });
        this.center($video);
    };

    SmartSliderResponsiveSimple.prototype.center = function ($video) {
        var parent = $video.parent();

        $video.css({
            marginTop: Math.round((parent.height() - $video.height()) / 2),
            marginLeft: Math.round((parent.width() - $video.width()) / 2)
        });
    };

    return SmartSliderResponsiveSimple;
});
N2D('SmartSliderSimple', ['SmartSliderAbstract'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param elementID
     * @param parameters
     * @augments SmartSliderAbstract
     * @constructor
     */
    function SmartSliderSimple(elementID, parameters) {

        this.type = 'simple';

        N2Classes.SmartSliderAbstract.prototype.constructor.call(this, elementID, $.extend({
            bgAnimations: 0,
            carousel: 1
        }, parameters));
    }

    SmartSliderSimple.prototype = Object.create(N2Classes.SmartSliderAbstract.prototype);
    SmartSliderSimple.prototype.constructor = SmartSliderSimple;

    SmartSliderSimple.prototype.__initSlides = function () {

        if (this.parameters.mainanimation.parallax !== 1) {
            this.needBackgroundWrap = true;
        }
        N2Classes.SmartSliderAbstract.prototype.__initSlides.apply(this, arguments);
    };

    SmartSliderSimple.prototype.initResponsiveMode = function () {

        this.responsive = new N2Classes.SmartSliderResponsiveSimple(this, this.parameters.responsive);
        this.responsive.start();

        N2Classes.SmartSliderAbstract.prototype.initResponsiveMode.call(this);

        this.$backgroundsContainer = this.sliderElement.find('.n2-ss-slide-backgrounds');
    };

    SmartSliderSimple.prototype.initMainAnimation = function () {

        if (!this.disabled.backgroundAnimations && nModernizr.csstransforms3d && nModernizr.csstransformspreserve3d && this.parameters.bgAnimations) {
            this.mainAnimation = new N2Classes.SmartSliderFrontendBackgroundAnimation(this, this.parameters.mainanimation, this.parameters.bgAnimations);
        } else {
            this.mainAnimation = new N2Classes.SmartSliderMainAnimationSimple(this, this.parameters.mainanimation);
        }
    };

    SmartSliderSimple.prototype.afterRawSlidesReady = function () {
        if (this.parameters.postBackgroundAnimations && this.parameters.postBackgroundAnimations.slides) {
            for (var i = 0; i < this.slides.length; i++) {
                this.slides[i].postBackgroundAnimation = this.parameters.postBackgroundAnimations.slides[i];
            }
            delete this.parameters.postBackgroundAnimations.slides;
        }

        if (this.parameters.bgAnimations && this.parameters.bgAnimations.slides) {
            for (var j = 0; j < this.slides.length; j++) {
                this.slides[j].backgroundAnimation = this.parameters.bgAnimations.slides[j];
            }
            delete this.parameters.bgAnimations.slides;
        }
    };

    SmartSliderSimple.prototype.findSlideBackground = function (slide) {
        var $background = N2Classes.SmartSliderAbstract.prototype.findSlideBackground.call(this, slide);
        $background.appendTo(this.sliderElement.find('.n2-ss-slide-backgrounds'));
        return $background;
    };

    return SmartSliderSimple;

});
N2D('smartslider-simple-type-frontend')