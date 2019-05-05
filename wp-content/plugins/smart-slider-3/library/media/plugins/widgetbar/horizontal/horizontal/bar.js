N2D('SmartSliderWidgetBarHorizontal', function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     *
     * @param slider
     * @param parameters
     * @constructor
     */
    function SmartSliderWidgetBarHorizontal(slider, parameters) {

        this.slider = slider;

        this.slider.started($.proxy(this.start, this, parameters));
    }

    SmartSliderWidgetBarHorizontal.prototype.start = function (parameters) {

        if (this.slider.sliderElement.data('bar')) {
            return false;
        }

        this.slider.sliderElement.data('bar', this);

        this.parameters = parameters;

        this.offset = 0;
        this.tween = null;

        this.bar = this.slider.sliderElement.find('.nextend-bar');
        this.innerBar = this.bar.find('> div');

        this.slider.firstSlideReady.done($.proxy(this.onFirstSlideSet, this));

        if (parameters.animate) {
            this.slider.sliderElement.on('mainAnimationStart', $.proxy(this.onSliderSwitchToAnimateStart, this));
        } else {
            this.slider.sliderElement.on('sliderSwitchTo', $.proxy(this.onSliderSwitchTo, this));
        }

        if (!parameters.overlay) {
            var side = false;
            switch (parameters.area) {
                case 1:
                    side = 'Top';
                    break;
                case 12:
                    side = 'Bottom';
                    break;
            }
            if (side) {
                this.offset = parseFloat(this.bar.data('offset'));
                this.slider.responsive.addStaticMargin(side, this);
            }
        }

        var event = 'click';
        if (this.slider.hasTouch()) {
            event = 'n2click';
        }

        this.bar.on('click', $.proxy(function (e) {
            this.slider.sliderElement.find('.n2-ss-slide-active .n2-ss-layers-container').trigger(event);
        }, this));
    };

    SmartSliderWidgetBarHorizontal.prototype.onFirstSlideSet = function (slide) {

        this.onSliderSwitchTo(null, slide.index);
    };

    SmartSliderWidgetBarHorizontal.prototype.renderBarContent = function (slide) {
        var html = '';
        if (this.parameters.showTitle && (slide.getTitle() !== undefined || this.parameters.slideCount)) {
            if (this.parameters.slideCount) {
                var title = slide.index + 1;
            } else {
                var title = slide.getTitle();
            }
            html += '<span class="' + this.parameters.fontTitle + ' n2-ow">' + title + '</span>';
        }
        if (this.parameters.showDescription && (slide.getDescription() !== undefined || this.parameters.slideCount)) {
            if (this.parameters.slideCount) {
                var description = slide.slider.slides.length;
            } else {
                var description = slide.getDescription();
            }
            html += '<span class="' + this.parameters.fontDescription + ' n2-ow">' + (html === '' ? '' : this.parameters.separator) + description + '</span>';
        }

        return html;
    };

    SmartSliderWidgetBarHorizontal.prototype.onSliderSwitchTo = function (e, targetSlideIndex) {
        var targetSlide = this.slider.slides[targetSlideIndex],
            html = this.renderBarContent(targetSlide);

        this.innerBar.html(html);
        this.setCursor(targetSlide.hasLink());

        this.slider.widgets.setState('hide.bar', html === '');
    };

    SmartSliderWidgetBarHorizontal.prototype.onSliderSwitchToAnimateStart = function () {
        var deferred = $.Deferred();
        this.slider.sliderElement.on('mainAnimationComplete.n2Bar', $.proxy(this.onSliderSwitchToAnimateEnd, this, deferred));
        if (this.tween) {
            this.tween.pause();
        }
        NextendTween.to(this.innerBar, 0.3, {
            opacity: 0,
            onComplete: function () {
                deferred.resolve();
            }
        });
    };

    SmartSliderWidgetBarHorizontal.prototype.onSliderSwitchToAnimateEnd = function (deferred, e, animation, currentSlideIndex, targetSlideIndex) {
        this.slider.sliderElement.off('.n2Bar');

        var targetSlide = this.slider.slides[targetSlideIndex];

        deferred.done($.proxy(function () {
            var innerBar = this.innerBar.clone();
            this.innerBar.remove();
            this.innerBar = innerBar.css('opacity', 0)
                .html(this.renderBarContent(targetSlide))
                .appendTo(this.bar);

            this.setCursor(targetSlide.hasLink());

            this.tween = NextendTween.to(this.innerBar, 0.3, {
                opacity: 1
            });
        }, this));
    };

    SmartSliderWidgetBarHorizontal.prototype.setCursor = function (hasLink) {
        this.innerBar.css('cursor', hasLink ? 'pointer' : 'inherit');
    };

    SmartSliderWidgetBarHorizontal.prototype.isVisible = function () {
        return this.bar.is(':visible');
    };

    SmartSliderWidgetBarHorizontal.prototype.getSize = function () {
        return this.bar.height() + this.offset;
    };

    return SmartSliderWidgetBarHorizontal;
});