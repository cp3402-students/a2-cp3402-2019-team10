N2D('SmartSliderWidgetBulletTransition', function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param slider
     * @param parameters
     * @constructor
     */
    function SmartSliderWidgetBulletTransition(slider, parameters) {
        this.slider = slider;

        this.slider.started($.proxy(this.start, this, parameters));
    }

    SmartSliderWidgetBulletTransition.prototype.start = function (parameters) {

        if (this.slider.sliderElement.data('bullet')) {
            return false;
        }
        this.slider.sliderElement.data('bullet', this);

        this.axis = 'horizontal';
        this.offset = 0;
        this.parameters = parameters;

        this.bar = this.slider.sliderElement.find('.nextend-bullet-bar');

        this.event = 'universalclick';
        if (this.parameters.action === 'mouseenter') {
            this.event = 'universalenter';
        }

        this.slider.sliderElement.on({
            slideCountChanged: $.proxy(this.onSlideCountChanged, this),
            sliderSwitchTo: $.proxy(this.onSlideSwitch, this)
        });

        this.slider.firstSlideReady.done($.proxy(this.onFirstSlideSet, this));

        if (parameters.overlay === 0) {
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
                    this.axis = 'vertical';
                    break;
                case 8:
                    side = 'Right';
                    this.axis = 'vertical';
                    break;
            }
            if (side) {
                this.offset = parseFloat(this.bar.data('offset'));
                this.slider.responsive.addStaticMargin(side, this);
            }
        }
    };

    SmartSliderWidgetBulletTransition.prototype.onFirstSlideSet = function (slide) {

        this.onSlideCountChanged();
        this.$dots.eq(slide.index).addClass('n2-active').attr('aria-current', 'true');
    };

    SmartSliderWidgetBulletTransition.prototype.onDotClick = function (i, e) {
        this.slider.directionalChangeTo(i);
        $(e.target).blur();
    };

    SmartSliderWidgetBulletTransition.prototype.onSlideSwitch = function (e, targetSlideIndex) {
        this.$dots.filter('.n2-active').removeClass('n2-active').removeAttr('aria-current');
        this.$dots.eq(targetSlideIndex).addClass('n2-active').attr('aria-current', 'true');
    };

    SmartSliderWidgetBulletTransition.prototype.isVisible = function () {
        return this.bar.is(':visible');
    };

    SmartSliderWidgetBulletTransition.prototype.getSize = function () {
        if (this.axis === 'horizontal') {
            return this.bar.height() + this.offset;
        }
        return this.bar.width() + this.offset;
    };

    SmartSliderWidgetBulletTransition.prototype.showThumbnail = function (i, e) {
        var thumbnail = this.getThumbnail(i);

        NextendTween.to(thumbnail, 0.3, {
            opacity: 1
        });

        this.$dots.eq(i).one('universalleave.thumbnailleave', $.proxy(this.hideThumbnail, this, i, thumbnail));
    };

    SmartSliderWidgetBulletTransition.prototype.hideThumbnail = function (i, thumbnail, e) {
        e.stopPropagation();

        NextendTween.to(thumbnail, 0.3, {
            opacity: 0,
            onComplete: function () {
                thumbnail.remove();
            }
        });
    };

    SmartSliderWidgetBulletTransition.prototype.getThumbnail = function (i) {
        var target = this.$dots.eq(i),
            sliderOffset = this.slider.sliderElement.offset(),
            targetOffset = target.offset(),
            targetW = target.outerWidth(),
            targetH = target.outerHeight();

        var thumbnail = $('<div/>')
            .append($('<div/>')
                .css({
                    width: this.parameters.thumbnailWidth,
                    height: this.parameters.thumbnailHeight,
                    backgroundImage: 'url("' + this.slider.slides[i].getThumbnail() + '")'
                })
                .addClass('n2-ss-bullet-thumbnail'))
            .addClass(this.parameters.thumbnailStyle)
            .addClass('n2-ss-bullet-thumbnail-container')
            .appendTo(this.slider.sliderElement);

        switch (this.parameters.thumbnailPosition) {
            case 'right':
                thumbnail.css({
                    left: (targetOffset.left - sliderOffset.left) + targetW,
                    top: (targetOffset.top - sliderOffset.top) + targetH / 2 - thumbnail.outerHeight(true) / 2
                });
                break;
            case 'left':
                thumbnail.css({
                    left: (targetOffset.left - sliderOffset.left) - thumbnail.outerWidth(true),
                    top: (targetOffset.top - sliderOffset.top) + targetH / 2 - thumbnail.outerHeight(true) / 2
                });
                break;
            case 'top':
                thumbnail.css({
                    left: (targetOffset.left - sliderOffset.left) + targetW / 2 - thumbnail.outerWidth(true) / 2,
                    top: (targetOffset.top - sliderOffset.top) - thumbnail.outerHeight(true)
                });
                break;
            case 'bottom':
                thumbnail.css({
                    left: (targetOffset.left - sliderOffset.left) + targetW / 2 - thumbnail.outerWidth(true) / 2,
                    top: (targetOffset.top - sliderOffset.top) + targetH
                });
                break;
        }

        target.data('thumbnail', thumbnail);
        return thumbnail;
    };

    SmartSliderWidgetBulletTransition.prototype.onSlideCountChanged = function () {

        this.bar.html('');

        for (var i = 0; i < this.slider.slides.length; i++) {
            var slide = this.slider.slides[i],
                $dot = $('<div class="n2-ow n2-bullet ' + this.parameters.dotClasses + '" tabindex="0"></div>')
                    .attr('role', 'button')
                    .attr('aria-label', slide.getTitle())
                    .appendTo(this.bar);

            /**
             * @see https://bugs.webkit.org/show_bug.cgi?id=197190
             */
            $dot.wrap($('<div class="n2-ow"></div>')
                .on(this.event, $.proxy(this.onDotClick, this, i)))
                .on('n2Activate', $.proxy(this.onDotClick, this, i));

            switch (this.parameters.mode) {
                case 'numeric':
                    $dot.html(i + 1);
                    break;
                case 'title':
                    $dot.html(slide.getTitle());
                    break;
            }

            if (this.parameters.thumbnail === 1) {
                var thumbnail = slide.getThumbnail();
                if (thumbnail) {
                    $dot.on({
                        universalenter: $.proxy(this.showThumbnail, this, i)
                    }, {
                        leaveOnSecond: true
                    })
                }
            }
        }

        this.$dots = this.bar.find('>div>*');
    };

    return SmartSliderWidgetBulletTransition;
});