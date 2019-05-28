N2D('SmartSliderWidgetAutoplayImage', function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     *
     * @param slider
     * @param desktopRatio
     * @param tabletRatio
     * @param mobileRatio
     * @constructor
     */
    function SmartSliderWidgetAutoplayImage(slider, desktopRatio, tabletRatio, mobileRatio) {

        this.slider = slider;

        this.slider.started($.proxy(this.start, this, desktopRatio, tabletRatio, mobileRatio));
    }

    SmartSliderWidgetAutoplayImage.prototype.start = function (desktopRatio, tabletRatio, mobileRatio) {

        if (this.slider.sliderElement.data('autoplay')) {
            return false;
        }
        this.slider.sliderElement.data('autoplay', this);

        this.paused = false;

        this.button = this.slider.sliderElement.find('.nextend-autoplay');
        this.slider.controls.autoplay.hasButton = !!this.button.length;

        // Autoplay not enabled, so just destroy the widget
        if (this.slider.controls.autoplay._disabled) {
            this.destroy();
        } else {
            if (!this.slider.controls.autoplay.parameters.start) {
                this.paused = true;
                this.setPaused();
            }
            this.deferred = $.Deferred();
            this.slider.sliderElement
                .on({
                    'SliderDevice.n2-widget-autoplay': $.proxy(this.onDevice, this),
                    'autoplayStarted.n2-widget-autoplay': $.proxy(this.setPlaying, this),
                    'autoplayPaused.n2-widget-autoplay': $.proxy(this.setPaused, this),
                    'autoplayDisabled.n2-widget-autoplay': $.proxy(this.destroy, this)
                })
                .trigger('addWidget', this.deferred);

            this.button.on({
                n2Activate: $.proxy(this.switchState, this),
                universalclick: $.proxy(this.switchState, this)
            });

            this.desktopRatio = desktopRatio;
            this.tabletRatio = tabletRatio;
            this.mobileRatio = mobileRatio;

            this.button.n2imagesLoaded().always($.proxy(this.loaded, this));
        }
    };

    SmartSliderWidgetAutoplayImage.prototype.loaded = function () {

        this.button.css('display', 'inline-block');
        this.width = this.button.width();
        this.height = this.button.height();
        this.button.css('display', '');

        this.onDevice(null, {device: this.slider.responsive.getDeviceMode()});

        this.deferred.resolve();
    };

    SmartSliderWidgetAutoplayImage.prototype.onDevice = function (e, device) {
        var ratio = 1;
        switch (device.device) {
            case 'tablet':
                ratio = this.tabletRatio;
                break;
            case 'mobile':
                ratio = this.mobileRatio;
                break;
            default:
                ratio = this.desktopRatio;
        }
        this.button.width(this.width * ratio);
        this.button.height(this.height * ratio);
    };

    SmartSliderWidgetAutoplayImage.prototype.switchState = function (e) {

        /**
         * Mark the event notify parents that the event already handled for Autoplay interaction
         * @type {boolean}
         */
        e.ss3HandledAutoplay = true;

        if (!this.paused) {
            this.setPaused();
            this.slider.sliderElement.triggerHandler('autoplayExtraWait', 'autoplayButton');
        } else {
            this.setPlaying();
            this.slider.sliderElement.triggerHandler('autoplayExtraContinue', 'autoplayButton');
            this.slider.next();
        }
    };

    SmartSliderWidgetAutoplayImage.prototype.setPaused = function () {
        this.paused = true;
        this.button.addClass('n2-autoplay-paused');
    };

    SmartSliderWidgetAutoplayImage.prototype.setPlaying = function () {
        this.paused = false;
        this.button.removeClass('n2-autoplay-paused');
    };

    SmartSliderWidgetAutoplayImage.prototype.destroy = function () {
        this.slider.sliderElement.off('.n2-widget-autoplay');
        this.button.remove();
    };

    return SmartSliderWidgetAutoplayImage;
});