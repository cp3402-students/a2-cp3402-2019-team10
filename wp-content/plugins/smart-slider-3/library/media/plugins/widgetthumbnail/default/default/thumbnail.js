N2D('SmartSliderWidgetThumbnailDefault', function ($, undefined) {
    "use strict";

    var preventMultipleTap = false,
        thumbnailTypes = {
            videoDark: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">' +
                '<circle cx="24" cy="24" r="24" fill="#000" opacity=".6"/>' +
                '<path fill="#FFF" d="M19.8 32c-.124 0-.247-.028-.36-.08-.264-.116-.436-.375-.44-.664V16.744c.005-.29.176-.55.44-.666.273-.126.592-.1.84.07l10.4 7.257c.2.132.32.355.32.595s-.12.463-.32.595l-10.4 7.256c-.14.1-.31.15-.48.15z"/>' +
                '</svg>'
        };

    /**
     * @memberOf N2Classes
     *
     * @param slider
     * @param parameters
     * @constructor
     */
    function SmartSliderWidgetThumbnailDefault(slider, parameters) {

        this.slider = slider;

        this.slider.started($.proxy(this.start, this, parameters));
    }


    SmartSliderWidgetThumbnailDefault.prototype.start = function (parameters) {

        if (this.slider.sliderElement.data('thumbnail')) {
            return false;
        }
        this.slider.sliderElement.data('thumbnail', this);

        this.parameters = $.extend({captionSize: 0, minimumThumbnailCount: 1.5, invertGroupDirection: 0}, parameters);

        this.ratio = 1;
        this.hidden = false;
        this.forceHidden = false;
        this.forceHiddenCB = null;
        this.itemPerPane = 1;
        this.currentI = 0;
        this.offset = 0;
        this.horizontal = {
            prop: 'width',
            Prop: 'Width',
            sideProp: n2const.rtl.left,
            invProp: 'height',
            axis: 'x',
            outerProp: 'outerWidth'
        };
        this.vertical = {
            prop: 'height',
            Prop: 'Height',
            sideProp: 'top',
            invProp: 'width',
            axis: 'y',
            outerProp: 'outerHeight'
        };

        this.group = parseInt(parameters.group);
        this.orientation = parameters.orientation;
        if (this.orientation === 'vertical') {
            this.goToDot = this._goToDot;
        }

        this.outerBar = this.slider.sliderElement.find('.nextend-thumbnail-default');
        this.bar = this.outerBar.find('.nextend-thumbnail-inner');
        this.scroller = this.bar.find('.nextend-thumbnail-scroller');

        this.$groups = $();
        for (var i = 0; i < this.group; i++) {
            this.$groups = this.$groups.add($('<div class="nextend-thumbnail-scroller-group"></div>').appendTo(this.scroller));
        }

        var event = 'universalclick';
        if (parameters.action === 'mouseenter') {
            event = 'universalenter';
        } else if (this.slider.hasTouch()) {
            event = 'n2click';
        }

        this.renderThumbnails();


        this.dots = this.scroller.find('.nextend-thumbnail-scroller-group > div')
            .on(event, $.proxy(this.onDotClick, this));


        this.images = this.dots.find('.n2-ss-thumb-image');

        if (!n2const.rtl.isRtl) {
            this.previous = this.outerBar.find('.nextend-thumbnail-previous').on('click', $.proxy(this.previousPane, this));
            this.next = this.outerBar.find('.nextend-thumbnail-next').on('click', $.proxy(this.nextPane, this));
        } else {
            this.previous = this.outerBar.find('.nextend-thumbnail-next').on('click', $.proxy(this.previousPane, this));
            this.next = this.outerBar.find('.nextend-thumbnail-previous').on('click', $.proxy(this.nextPane, this));
        }

        if (this.slider.hasTouch()) {
            N2Classes.EventBurrito(this.outerBar.get(0), {
                mouse: this.slider.parameters.controls.drag,
                axis: this.orientation === 'vertical' ? 'y' : 'x',
                start: $.proxy(function () {
                    this._touch = {
                        start: parseInt(this.scroller.css(this[this.orientation].sideProp)),
                        max: this.bar[this[this.orientation].prop]() - this.scroller[this[this.orientation].outerProp](true)
                    };
                    this._touch.current = this._touch.start;
                }, this),
                move: $.proxy(function (event, start, diff, speed, isRealScrolling) {

                    this._touch.current = Math.max(this._touch.max, Math.min(0, this._touch.start + diff[this[this.orientation].axis]));

                    this.scroller.css(this[this.orientation].sideProp, this._touch.current);

                    if (Math.abs(diff[this[this.orientation].axis]) > 5) {
                        return true;
                    }
                    return false;
                }, this),
                end: $.proxy(function (event, start, diff, speed, isRealScrolling) {

                    if (40 > Math.abs(this._touch.start - this._touch.current)) {
                        this.resetPane();
                    } else if (this._touch.current > this._touch.start) {
                        this.previousPane();
                    } else {
                        this.nextPane()
                    }

                    if (10 > Math.abs(diff.x) && 10 > Math.abs(diff.y)) {
                        this.onTap(event);
                    } else {
                        nextend.preventClick();
                    }

                    delete this._touch;
                }, this)
            });

            if (!this.slider.parameters.controls.drag) {
                this.outerBar.on('click', $.proxy(this.onTap, this));
            }
        }

        this.thumbnailDimension = {
            widthLocal: this.dots.width(),
            width: this.dots.outerWidth(true),
            height: this.dots.outerHeight(true),
            widthBorder: parseInt(this.dots.css('borderLeftWidth')) + parseInt(this.dots.css('borderRightWidth')),
            heightBorder: parseInt(this.dots.css('borderTopWidth')) + parseInt(this.dots.css('borderBottomWidth'))

        };

        this.thumbnailDimension.widthMargin = this.thumbnailDimension.width - this.dots.outerWidth();
        this.thumbnailDimension.heightMargin = this.thumbnailDimension.height - this.dots.outerHeight();

        this.imageDimension = {
            width: this.images.outerWidth(true),
            height: this.images.outerHeight(true)
        };

        this.sideDimension = this.thumbnailDimension[this[this.orientation].prop] * 0.25;

        if (this.orientation === 'horizontal') {
            this.scroller.height(this.thumbnailDimension.height * this.group);
            this.bar.height(this.scroller.outerHeight(true));
        } else {
            this.scroller.width(this.thumbnailDimension.width * this.group);
            this.bar.width(this.scroller.outerWidth(true));
        }

        this.slider.sliderElement.on({
            BeforeVisible: $.proxy(this.onReady, this),
            sliderSwitchTo: $.proxy(this.onSlideSwitch, this)
        });
        this.slider.firstSlideReady.done($.proxy(this.onFirstSlideSet, this));

        if (parameters.overlay == 0) {
            var side = false;
            switch (parameters.area) {
                case 1:
                    side = 'Top';
                    break;
                case 12:
                    side = 'Bottom';
                    break;
                case 5:
                    side = 'Left';
                    break;
                case 8:
                    side = 'Right';
                    break;
            }
            if (side) {
                this.offset = parseFloat(this.outerBar.data('offset'));
                this.slider.responsive.addStaticMargin(side, this);
            }
        }
    };

    SmartSliderWidgetThumbnailDefault.prototype.renderThumbnails = function () {
        var itemPerGroup;
        if (this.parameters.invertGroupDirection) {
            itemPerGroup = Math.ceil(this.slider.realSlides.length / this.group);
        }

        for (var i = 0; i < this.slider.realSlides.length; i++) {
            var slide = this.slider.realSlides[i],
                $thumbnail = $('<div class="' + this.parameters.slideStyle + ' n2-ow" style="' + this.parameters.containerStyle + '"></div>');

            if (this.parameters.invertGroupDirection) {
                $thumbnail.appendTo(this.$groups.eq(Math.floor(i / itemPerGroup)));
            } else {
                $thumbnail.appendTo(this.$groups.eq(i % this.group));
            }

            $thumbnail.data('slide', slide);
            slide.$thumbnail = $thumbnail;
            if (this.parameters.thumbnail !== undefined) {
                var thumbnailType = slide.getThumbnailType(),
                    thumbnailSVG = thumbnailTypes[thumbnailType] !== undefined ? thumbnailTypes[thumbnailType] : '';

                $('<div class="n2-ss-thumb-image n2-ow" style="width:' + this.parameters.thumbnail.width + 'px; height:' + this.parameters.thumbnail.height + 'px;' + this.parameters.thumbnail.code + '">' + thumbnailSVG + '</div>')
                    .css('background-image', 'url(\'' + slide.getThumbnail() + '\')')
                    .appendTo($thumbnail);
            }

            if (this.parameters.caption !== undefined) {
                var $caption = $('<div class="' + this.parameters.caption.styleClass + 'n2-ss-caption n2-ow n2-caption-' + this.parameters.caption.placement + '" style="' + this.parameters.caption.style + '"></div>');
                switch (this.parameters.caption.placement) {
                    case 'before':
                        $caption.prependTo($thumbnail);
                        break;
                    default:
                        $caption.appendTo($thumbnail);
                        break;
                }
                if (this.parameters.title !== undefined) {
                    $caption.append('<div class="n2-ow ' + this.parameters.title.font + '">' + slide.getTitle() + '</div>');
                }

                if (this.parameters.description !== undefined) {
                    var description = slide.getDescription();
                    if (description) {
                        $caption.append('<div class="n2-ow ' + this.parameters.description.font + '">' + description + '</div>');
                    }
                }
            }
        }
    };

    SmartSliderWidgetThumbnailDefault.prototype.onTap = function (e) {
        if (!preventMultipleTap) {
            $(e.target).trigger('n2click');
            preventMultipleTap = true;
            setTimeout(function () {
                preventMultipleTap = false;
            }, 500);
        }
    };

    SmartSliderWidgetThumbnailDefault.prototype.onFirstSlideSet = function (slide) {

        this.activateDots(slide.index);
        this.goToDot(slide.index);
    };

    SmartSliderWidgetThumbnailDefault.prototype.onReady = function () {
        this.slider.sliderElement.on('SliderResize', $.proxy(this.onSliderResize, this));
        this.onSliderResize();
    };


    SmartSliderWidgetThumbnailDefault.prototype.onSliderResize = function () {
        if (this.forceHiddenCB !== null) {
            this.forceHiddenCB.call(this);
        }
        this.adjustScrollerSize();

        var currentSlideIndex = this.slider.currentSlide.index;

        this.activateDots(currentSlideIndex);

        this.goToDot(currentSlideIndex);
    };

    SmartSliderWidgetThumbnailDefault.prototype.adjustScrollerSize = function () {
        var prop = this[this.orientation].prop,
            size = Math.ceil(this.dots.length / this.group) * this.thumbnailDimension[prop] * this.ratio,
            diff = this.scroller['outer' + this[this.orientation].Prop]() - this.scroller[prop](),
            barDimension = this.slider.dimensions['thumbnail' + prop];
        if (barDimension >= size + diff) {
            this.scroller[prop](barDimension - diff);
        } else {
            this.scroller[prop](size);
        }


        if (this.orientation === 'horizontal') {
            this.scroller.height(this.dots.outerHeight(true) * this.group);
        } else {
            this.scroller.width(this.dots.outerWidth(true) * this.group);
        }

    };

    var isFired = false;
    SmartSliderWidgetThumbnailDefault.prototype.onDotClick = function (e) {
        if (!isFired) {
            this.slider.directionalChangeToReal($(e.currentTarget).data('slide').index);
            isFired = true;
        }
        setTimeout($.proxy(function () {
            isFired = false;
        }, this), 400);
    };

    SmartSliderWidgetThumbnailDefault.prototype.onSlideSwitch = function (e, targetSlideIndex, realTargetSlideIndex) {

        this.activateDots(targetSlideIndex);

        this.goToDot(realTargetSlideIndex);

    };

    SmartSliderWidgetThumbnailDefault.prototype.activateDots = function (currentSlideIndex) {
        this.dots.removeClass('n2-active');

        var slides = this.slider.slides[currentSlideIndex].slides;
        for (var i = 0; slides.length > i; i++) {
            slides[i].$thumbnail.addClass('n2-active');
        }
    };

    SmartSliderWidgetThumbnailDefault.prototype.resetPane = function () {
        this.goToDot(this.currentI);
    };

    SmartSliderWidgetThumbnailDefault.prototype.previousPane = function () {
        this.goToDot(this.currentI - this.itemPerPane * this.group);
    };

    SmartSliderWidgetThumbnailDefault.prototype.nextPane = function () {
        this.goToDot(this.currentI + this.itemPerPane * this.group);
    };

    SmartSliderWidgetThumbnailDefault.prototype.goToDot = function (i) {
        if (this.tween && this.tween.progress() < 1) {
            this.tween.pause();
        }

        var variables = this[this.orientation],
            ratio = 1,
            barDimension = this.slider.dimensions['thumbnail' + variables.prop],
            sideDimension = this.sideDimension,
            availableBarDimension = barDimension - sideDimension * 2,
            itemPerPane = availableBarDimension / this.thumbnailDimension[variables.prop];
        if (this.parameters.minimumThumbnailCount >= itemPerPane) {
            sideDimension = barDimension * 0.1;
            availableBarDimension = barDimension - sideDimension * 2;
            ratio = availableBarDimension / (this.parameters.minimumThumbnailCount * this.thumbnailDimension[variables.prop]);
            itemPerPane = availableBarDimension / (this.thumbnailDimension[variables.prop] * ratio);
        }

        if (this.ratio !== ratio) {
            var css = {};
            css[variables.prop] = parseInt(this.thumbnailDimension[variables.prop] * ratio - this.thumbnailDimension[variables.prop + 'Margin'] - this.thumbnailDimension[variables.prop + 'Border']);
            css[variables.invProp] = parseInt((this.thumbnailDimension[variables.invProp] - this.parameters['captionSize']) * ratio - this.thumbnailDimension[variables.prop + 'Margin'] + this.parameters['captionSize'] - this.thumbnailDimension[variables.invProp + 'Border']);
            this.dots.css(css);

            var localRatio = this.dots.width() / this.thumbnailDimension.widthLocal;

            css = {};
            css[variables.prop] = Math.ceil(this.imageDimension[variables.prop] * localRatio);
            css[variables.invProp] = Math.ceil(this.imageDimension[variables.invProp] * localRatio);
            this.images.css(css);

            this.bar.css(variables.invProp, 'auto');
            this.ratio = ratio;
            this.slider.responsive.doNormalizedResize();
            this.adjustScrollerSize();
        }

        itemPerPane = Math.floor(itemPerPane);
        i = Math.max(0, Math.min(this.dots.length - 1, i));
        var currentPane,
            to = {};

        if (this.parameters.invertGroupDirection) {
            currentPane = Math.floor((i % Math.ceil(this.dots.length / this.group)) / itemPerPane);
        } else {
            currentPane = Math.floor(i / this.group / itemPerPane);
        }


        var min = -(this.scroller['outer' + variables.Prop]() - barDimension);

        if (currentPane === Math.floor((this.dots.length - 1) / this.group / itemPerPane)) {
            to[variables.sideProp] = -(currentPane * itemPerPane * this.thumbnailDimension[variables.prop] * ratio);
            if (currentPane === 0) {
                this.previous.removeClass('n2-active');
            } else {
                this.previous.addClass('n2-active');
            }
            this.next.removeClass('n2-active');
        } else if (currentPane > 0) {
            to[variables.sideProp] = -(currentPane * itemPerPane * this.thumbnailDimension[variables.prop] * ratio - sideDimension);
            this.previous.addClass('n2-active');
            this.next.addClass('n2-active');
        } else {
            to[variables.sideProp] = 0;
            this.previous.removeClass('n2-active');
            this.next.addClass('n2-active');
        }
        if (min >= to[variables.sideProp]) {
            to[variables.sideProp] = min;
            this.next.removeClass('n2-active');
        }
        this.tween = NextendTween.to(this.scroller, 0.5, to);


        this.currentI = i;
        this.itemPerPane = itemPerPane;

    };

    SmartSliderWidgetThumbnailDefault.prototype._goToDot = function (i) {
        if (this.forceHidden) {
            return;
        }
        if (this.tween && this.tween.progress() < 1) {
            this.tween.pause();
        }

        var variables = this[this.orientation];
        var barDimension = this.slider.dimensions['thumbnail' + variables.prop];


        var itemPerPane = (barDimension - this.sideDimension * 2) / this.thumbnailDimension[variables.prop];
        if (barDimension === 0 || barDimension !== 0 && this.parameters.minimumThumbnailCount - 0.5 > itemPerPane) {
            if (!this.hidden) {
                if (this.orientation === 'horizontal') {
                    this.outerBar.css('height', 0);
                } else {
                    this.outerBar.css('width', 0);
                }
                this.hidden = true;
                this.forceHidden = true;
                setTimeout($.proxy(function () {
                    this.forceHiddenCB = function () {
                        this.forceHiddenCB = null;
                        this.forceHidden = false;
                    };
                }, this), 300);
                this.slider.responsive.doNormalizedResize();
            }
        } else if (this.hidden) {
            if (itemPerPane >= this.parameters.minimumThumbnailCount + 0.5) {
                this.hidden = false;
                if (this.orientation === 'horizontal') {
                    this.outerBar.css('height', '');
                } else {
                    this.outerBar.css('width', '');
                }
                this.slider.responsive.doNormalizedResize();
            }
        }

        if (!this.hidden) {
            itemPerPane = Math.floor(itemPerPane);
            i = Math.max(0, Math.min(this.dots.length - 1, i));

            var currentPane,
                to = {};

            if (this.parameters.invertGroupDirection) {
                currentPane = Math.floor((i % Math.ceil(this.dots.length / this.group)) / itemPerPane);
            } else {
                currentPane = Math.floor(i / this.group / itemPerPane);
            }

            var min = -(this.scroller['outer' + variables.Prop]() - barDimension);

            if (currentPane === Math.floor((this.dots.length - 1) / this.group / itemPerPane)) {
                to[variables.sideProp] = -(currentPane * itemPerPane * this.thumbnailDimension[variables.prop]);
                if (currentPane === 0) {
                    this.previous.removeClass('n2-active');
                } else {
                    this.previous.addClass('n2-active');
                }
                this.next.removeClass('n2-active');
            } else if (currentPane > 0) {
                to[variables.sideProp] = -(currentPane * itemPerPane * this.thumbnailDimension[variables.prop] - this.sideDimension);
                this.previous.addClass('n2-active');
                this.next.addClass('n2-active');
            } else {
                to[variables.sideProp] = 0;
                this.previous.removeClass('n2-active');
                this.next.addClass('n2-active');
            }
            if (min >= to[variables.sideProp]) {
                to[variables.sideProp] = min;
                this.next.removeClass('n2-active');
            }
            this.tween = NextendTween.to(this.scroller, 0.5, to);
        }


        this.currentI = i;
        this.itemPerPane = itemPerPane;
    };

    SmartSliderWidgetThumbnailDefault.prototype.isVisible = function () {
        return this.outerBar.is(':visible');
    };

    SmartSliderWidgetThumbnailDefault.prototype.getSize = function () {
        if (this.orientation === 'horizontal') {
            return this.outerBar.height() + this.offset;
        }
        return this.outerBar.width() + this.offset;
    };

    return SmartSliderWidgetThumbnailDefault;
});